import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urlparse, unquote
import requests

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from azure.storage.blob import BlobServiceClient, ContentSettings

from video.models import Lesson


class Command(BaseCommand):
    help = "Optimize a lesson MP4 for seeking (faststart) and upload back to Azure Blob."

    def add_arguments(self, parser):
        parser.add_argument("lesson_id", type=int, help="Lesson ID to optimize")
        parser.add_argument(
            "--reencode",
            action="store_true",
            help="Re-encode to H.264/AAC with frequent keyframes for better seeking",
        )
        parser.add_argument(
            "--keep-backup",
            action="store_true",
            help="Keep a local backup copy of the original downloaded file",
        )

    def handle(self, *args, **options):
        lesson_id = options["lesson_id"]
        keep_backup = options["keep_backup"]
        reencode = options["reencode"]

        lesson = Lesson.objects.filter(pk=lesson_id).first()
        if not lesson:
            raise CommandError(f"Lesson {lesson_id} not found")

        video_url = (lesson.video_url or "").strip()
        if not video_url:
            raise CommandError("Lesson has no video_url")

        parsed = urlparse(video_url)
        hostname = (parsed.hostname or "").lower()
        if not hostname.endswith(".blob.core.windows.net"):
            raise CommandError("Lesson video_url is not an Azure Blob URL")

        path_parts = parsed.path.lstrip("/").split("/", 1)
        if len(path_parts) != 2:
            raise CommandError("Unable to parse container/blob from video_url")

        container_name, blob_name = path_parts[0], unquote(path_parts[1])

        ffmpeg_path = shutil.which("ffmpeg")
        if not ffmpeg_path:
            raise CommandError("ffmpeg is required but not found on PATH")

        blob_service = self._build_blob_service_client()
        blob_client = blob_service.get_blob_client(container=container_name, blob=blob_name)

        self.stdout.write(self.style.NOTICE(f"Optimizing lesson {lesson_id}: {lesson.title}"))
        self.stdout.write(self.style.NOTICE(f"Blob: {container_name}/{blob_name}"))

        with tempfile.TemporaryDirectory(prefix="video-faststart-") as temp_dir:
            temp_dir_path = Path(temp_dir)
            original_path = temp_dir_path / "original.mp4"
            optimized_path = temp_dir_path / "optimized.mp4"

            self.stdout.write("Downloading original video from Azure URL...")
            self._download_video_with_retries(video_url, original_path)

            if keep_backup:
                backup_name = f"lesson_{lesson_id}_original.mp4"
                backup_path = Path.cwd() / backup_name
                shutil.copy2(original_path, backup_path)
                self.stdout.write(self.style.WARNING(f"Backup saved to {backup_path}"))

            if reencode:
                self.stdout.write("Running ffmpeg re-encode optimization (H.264/AAC + faststart + 2s keyframes)...")
                cmd = [
                    ffmpeg_path,
                    "-y",
                    "-i",
                    str(original_path),
                    "-c:v",
                    "libx264",
                    "-preset",
                    "medium",
                    "-crf",
                    "22",
                    "-pix_fmt",
                    "yuv420p",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                    "-movflags",
                    "+faststart",
                    "-force_key_frames",
                    "expr:gte(t,n_forced*2)",
                    str(optimized_path),
                ]
            else:
                self.stdout.write("Running ffmpeg faststart optimization...")
                cmd = [
                    ffmpeg_path,
                    "-y",
                    "-i",
                    str(original_path),
                    "-c",
                    "copy",
                    "-movflags",
                    "+faststart",
                    str(optimized_path),
                ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise CommandError(f"ffmpeg failed: {result.stderr.strip() or result.stdout.strip()}")

            old_size = original_path.stat().st_size
            new_size = optimized_path.stat().st_size
            self.stdout.write(
                self.style.NOTICE(
                    f"Optimized file ready (old: {old_size} bytes, new: {new_size} bytes). Uploading..."
                )
            )

            with open(optimized_path, "rb") as optimized_file:
                blob_client.upload_blob(
                    optimized_file,
                    overwrite=True,
                    content_settings=ContentSettings(content_type="video/mp4"),
                    max_concurrency=4,
                )

        if reencode:
            self.stdout.write(self.style.SUCCESS("Re-encode optimization complete. Video blob overwritten."))
        else:
            self.stdout.write(self.style.SUCCESS("Faststart optimization complete. Video blob overwritten."))
        self.stdout.write(self.style.SUCCESS("Retest seeking in browser after hard refresh."))

    def _build_blob_service_client(self) -> BlobServiceClient:
        connection_string = (getattr(settings, "AZURE_STORAGE_CONNECTION_STRING", "") or "").strip()
        if connection_string:
            return BlobServiceClient.from_connection_string(connection_string)

        account_name = (getattr(settings, "AZURE_ACCOUNT_NAME", "") or "").strip()
        account_key = (getattr(settings, "AZURE_ACCOUNT_KEY", "") or "").strip()
        if account_name and account_key:
            account_url = f"https://{account_name}.blob.core.windows.net"
            return BlobServiceClient(account_url=account_url, credential=account_key)

        env_connection = (os.getenv("AZURE_STORAGE_CONNECTION_STRING") or "").strip()
        if env_connection:
            return BlobServiceClient.from_connection_string(env_connection)

        raise CommandError(
            "Azure credentials not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE account name/key."
        )

    def _download_video_with_retries(self, video_url: str, destination: Path) -> None:
        session = requests.Session()
        try:
            head = session.head(video_url, timeout=(10, 30), allow_redirects=True)
            head.raise_for_status()
        except requests.RequestException as exc:
            raise CommandError(f"Failed to fetch source metadata: {exc}")

        total_size_header = head.headers.get("Content-Length")
        if not total_size_header:
            raise CommandError("Source video did not return Content-Length; cannot perform reliable ranged download")

        try:
            total_size = int(total_size_header)
        except ValueError as exc:
            raise CommandError(f"Invalid Content-Length returned by source: {total_size_header}") from exc

        chunk_size = 8 * 1024 * 1024
        bytes_written = 0

        with open(destination, "wb") as output_file:
            for start in range(0, total_size, chunk_size):
                end = min(start + chunk_size - 1, total_size - 1)
                range_header = {"Range": f"bytes={start}-{end}"}
                chunk_written = False

                for attempt in range(1, 4):
                    try:
                        resp = session.get(video_url, headers=range_header, timeout=(10, 60))
                        resp.raise_for_status()

                        if resp.status_code == 200 and start == 0:
                            output_file.write(resp.content)
                            bytes_written = len(resp.content)
                            chunk_written = True
                            break

                        if resp.status_code != 206:
                            raise CommandError(
                                f"Expected 206 for range request {start}-{end}, got {resp.status_code}"
                            )

                        output_file.write(resp.content)
                        bytes_written += len(resp.content)
                        chunk_written = True
                        break
                    except requests.RequestException as exc:
                        if attempt == 3:
                            raise CommandError(
                                f"Failed downloading range {start}-{end} after retries: {exc}"
                            )
                        self.stdout.write(
                            self.style.WARNING(
                                f"Range {start}-{end} attempt {attempt}/3 failed: {exc}"
                            )
                        )
                        time.sleep(1)

                if not chunk_written:
                    raise CommandError(f"Failed writing range {start}-{end}")

                if bytes_written % (40 * 1024 * 1024) < chunk_size or bytes_written == total_size:
                    self.stdout.write(
                        self.style.NOTICE(
                            f"Downloaded {bytes_written // (1024 * 1024)} MB / {total_size // (1024 * 1024)} MB"
                        )
                    )

                if bytes_written >= total_size:
                    break

        self.stdout.write(
            self.style.NOTICE(
                f"Download complete ({bytes_written // (1024 * 1024)} MB)."
            )
        )
