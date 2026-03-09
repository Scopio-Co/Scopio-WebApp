import io
import os

from PIL import Image, UnidentifiedImageError
from django.apps import apps
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import models


class Command(BaseCommand):
    help = (
        "Convert all non-WebP images stored in model ImageFields to WebP and update "
        "database references."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--quality",
            type=int,
            default=78,
            help="WebP quality (0-100). Recommended 75-80.",
        )
        parser.add_argument(
            "--delete-original",
            action="store_true",
            help="Delete original source files after successful WebP conversion.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview changes without writing files or updating database records.",
        )
        parser.add_argument(
            "--report",
            action="store_true",
            help="Print a detailed per-file report (converted, deleted, skipped, errors).",
        )

    def handle(self, *args, **options):
        quality = max(0, min(100, options["quality"]))
        delete_original = options["delete_original"]
        dry_run = options["dry_run"]
        report = options["report"]

        image_fields = self._collect_image_fields()
        if not image_fields:
            self.stdout.write(self.style.WARNING("No ImageField found in installed models."))
            return

        self.stdout.write(
            f"Discovered {len(image_fields)} ImageField(s). Starting conversion..."
        )

        stats = {
            "models_scanned": 0,
            "records_scanned": 0,
            "converted": 0,
            "deleted_originals": 0,
            "already_webp": 0,
            "missing_file": 0,
            "errors": 0,
            "skipped_empty": 0,
        }
        details = {
            "converted": [],
            "deleted": [],
            "already_webp": [],
            "missing": [],
            "errors": [],
        }

        for model, field in image_fields:
            stats["models_scanned"] += 1
            queryset = model.objects.exclude(**{field.name: ""}).exclude(**{field.name: None})
            model_label = f"{model._meta.app_label}.{model.__name__}.{field.name}"
            self.stdout.write(f"Scanning {model_label} ({queryset.count()} records)...")

            for instance in queryset.iterator():
                stats["records_scanned"] += 1
                field_file = getattr(instance, field.name)

                if not field_file or not field_file.name:
                    stats["skipped_empty"] += 1
                    continue

                original_name = field_file.name
                ext = os.path.splitext(original_name)[1].lower()
                if ext == ".webp":
                    stats["already_webp"] += 1
                    if report:
                        details["already_webp"].append(
                            f"{model_label} pk={instance.pk} file={original_name}"
                        )
                    continue

                storage = field_file.storage
                if not storage.exists(original_name):
                    stats["missing_file"] += 1
                    missing_msg = (
                        f"Missing file, skipping: {model_label} pk={instance.pk} file={original_name}"
                    )
                    if report:
                        details["missing"].append(missing_msg)
                    self.stderr.write(
                        self.style.WARNING(
                            missing_msg
                        )
                    )
                    continue

                try:
                    with storage.open(original_name, "rb") as source_fp:
                        with Image.open(source_fp) as img:
                            if img.mode != "RGB":
                                img = img.convert("RGB")

                            output = io.BytesIO()
                            img.save(
                                output,
                                format="WEBP",
                                quality=quality,
                                optimize=True,
                                method=6,
                            )
                            output.seek(0)

                    base_root = os.path.splitext(original_name)[0]
                    target_name = f"{base_root}.webp"

                    if dry_run:
                        stats["converted"] += 1
                        dry_run_msg = (
                            f"[DRY-RUN] {model_label} pk={instance.pk}: {original_name} -> {target_name}"
                        )
                        if report:
                            details["converted"].append(dry_run_msg)
                        self.stdout.write(
                            dry_run_msg
                        )
                        continue

                    if storage.exists(target_name):
                        storage.delete(target_name)

                    saved_name = storage.save(target_name, ContentFile(output.read()))
                    setattr(instance, field.name, saved_name)
                    instance.save(update_fields=[field.name])

                    converted_msg = (
                        f"Converted {model_label} pk={instance.pk}: {original_name} -> {saved_name}"
                    )
                    if report:
                        details["converted"].append(converted_msg)

                    if delete_original and original_name != saved_name and storage.exists(original_name):
                        storage.delete(original_name)
                        stats["deleted_originals"] += 1
                        if report:
                            details["deleted"].append(
                                f"Deleted original: {model_label} pk={instance.pk} file={original_name}"
                            )

                    stats["converted"] += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            converted_msg
                        )
                    )
                except (UnidentifiedImageError, OSError, ValueError) as exc:
                    stats["errors"] += 1
                    err_msg = f"Failed {model_label} pk={instance.pk} file={original_name}: {exc}"
                    if report:
                        details["errors"].append(err_msg)
                    self.stderr.write(
                        self.style.ERROR(
                            err_msg
                        )
                    )
                except Exception as exc:  # Keep batch resilient for unexpected issues.
                    stats["errors"] += 1
                    err_msg = (
                        f"Unexpected error {model_label} pk={instance.pk} file={original_name}: {exc}"
                    )
                    if report:
                        details["errors"].append(err_msg)
                    self.stderr.write(
                        self.style.ERROR(
                            err_msg
                        )
                    )

        summary = (
            "\nWebP conversion completed\n"
            f"  Models scanned   : {stats['models_scanned']}\n"
            f"  Records scanned  : {stats['records_scanned']}\n"
            f"  Converted        : {stats['converted']}\n"
            f"  Deleted originals: {stats['deleted_originals']}\n"
            f"  Already WebP     : {stats['already_webp']}\n"
            f"  Missing files    : {stats['missing_file']}\n"
            f"  Empty references : {stats['skipped_empty']}\n"
            f"  Errors           : {stats['errors']}"
        )

        if stats["errors"]:
            self.stdout.write(self.style.WARNING(summary))
        else:
            self.stdout.write(self.style.SUCCESS(summary))

        if report:
            self.stdout.write("\nDetailed report:")
            self._print_report_section("Converted", details["converted"])
            self._print_report_section("Deleted originals", details["deleted"])
            self._print_report_section("Already WebP", details["already_webp"])
            self._print_report_section("Missing files", details["missing"])
            self._print_report_section("Errors", details["errors"])

    def _collect_image_fields(self):
        image_fields = []
        for model in apps.get_models():
            for field in model._meta.get_fields():
                if isinstance(field, models.ImageField):
                    image_fields.append((model, field))
        return image_fields

    def _print_report_section(self, title, rows):
        self.stdout.write(f"\n{title}: {len(rows)}")
        for row in rows:
            self.stdout.write(f"  - {row}")
