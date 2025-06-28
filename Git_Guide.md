# 🚀 Scopio Git Guide
This guide is for all teammates so we can contribute smoothly using Git and GitHub.  
Follow this every time you work on the project.
---

##  1. Cloning the Project (Only Once)

To copy the full project to your PC:

```bash
git clone https://github.com/Vishal-46/Scopio.git
cd Scopio
```
## 2. Keep your project Sync (When someone updated the project you can update your local workspace too, using -> )

```bash
git checkout main          # Switch to main branch
git pull origin main       # Pull latest code from GitHub
```

## 3. Create New Branch for your work (Main is the default branch of repo in which we will merge after testing the code)

```bash
git checkout -b feature/your-task-name
git checkout -b feature/homepage-ui # Example
```
## 4. Save or commit your changes

```bash
git add .                          # Add all modified files
git commit -m "Short message"      # Save with a message
git push -u origin feature/your-task-name # Pull request have made
```
## 5. Again do the 2nd step to make your local workspace updated
> Before doing this make sure your pull request have merged
## 6. After merging your temp branch yu can delete is locally

```bash
git branch -d feature/your-task-name       # Local delete
```

## 7. Check Branches Exists in your local space and in main 

```bash
git branch        # Show local branches
git branch -r     # Show remote branches
```

## 8. Can switch to other branches

```bash
git checkout branch-name
```

