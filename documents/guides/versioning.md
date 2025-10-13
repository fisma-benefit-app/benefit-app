# Versioning

Versioning in Benefit-app follows **[semantic versioning](https://semver.org/)**: MAJOR.MINOR.PATCH

Tags on GitHub will be prefixed with a "v": `v1.1.0`

## Version update workflow

When you want to release a new version and bump version numbers (e.g. from 1.1.0 to 1.2.0), follow this 4-step process:

### 1. Run the version update script

In project root, run this script:

```bash
# Run the version update
./update_version.sh X.Y.Z # example: 1.2.0
```

This script will:
- Check that you're on the `main` branch with a clean working directory (i.e. no edited, added or deleted files that are not commited or stashed)
- Pull the latest changes from remote `main` branch
- Create a new local branch named `chore/update-version-to-X.Y.Z`
- Update version numbers in `build.gradle` (backend) and `package.json` + `package-lock.json` (frontend)
- Commit the version changes to the new branch
- Push the new branch to remote

**Note:** The script does NOT create Git tags - this happens automatically in step 3.

### 2. Create and merge pull request

After running the script:
1. Create a pull request manually on GitHub to merge changes from `chore/update-version-to-X.Y.Z` to `main`
2. Review the version changes in the PR (check `build.gradle` and `package.json` + `package-lock.json`)
3. Merge the pull request to integrate version changes into `main`

### 3. Automatic tag creation

When the PR is merged, a GitHub Actions workflow automatically:
- Detects the version number from the merged branch name
- Creates a Git tag `vX.Y.Z` from the merged commit on `main`
- Pushes the tag to the remote repository

This ensures the tag always points to the exact merged version on the `main` branch.

### 4. Create GitHub release

After the automated tag is created:
1. Go to the **Releases** section in your GitHub repository
2. Click **"Create a new release"**
3. Select the automatically created tag (e.g., `v1.2.0`)
4. Write meaningful release notes describing the changes
5. Publish the release

## Benefits of this workflow

- **Code Review:** All version changes are reviewed before merging
- **Automation:** Tag creation is automated
- **Consistency:** Tags always point to merged commits on `main`
- **Safety:** Prevents manual errors in version updating and tagging

## Troubleshooting

Script and workflow give you good error messages if something fails. Here are a couple of troubleshooting cases that could help you: 

### Version update script fails to run
1. Ensure you're on the `main` branch: `git switch main`
2. Ensure working directory is clean: `git status`
3. Make script executable: `chmod +x update_version.sh`
4. Run the script again

### Branch already exists
If the version update branch already exists remotely:
1. Delete the remote branch: `git push origin --delete chore/update-version-to-X.Y.Z`
2. Run the script again

### Tag already exists
If the GitHub Actions workflow fails because a tag already exists, you can:
1. Delete the existing tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
    - Delete the existing tag as it might point to an incorrect commit
2. Create the tag manually: DO NOT RUN THE SCRIPT AGAIN as this triggers a new pull request to merge changes that are already merged
    - `git switch main`
    - `git pull origin main`
    - `git tag -a "vX.Y.Z" -m "Release version vX.Y.Z. See Releases section for more details."`
    - `git push origin "vX.Y.Z"`

By following this workflow, we ensure all required steps are completed correctly and automatically for updating the app to a new version.