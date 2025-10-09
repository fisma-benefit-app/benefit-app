#!/bin/bash

# Exit on any error
set -e

# Set variables
VERSION="$1"
CURRENT_BRANCH=$(git branch --show-current)

# Check if version parameter is provided
if [ -z "$1" ]; then
    echo -e "\nError: Version number is required"
    echo "Usage: ./update_version.sh <version>"
    echo "Example: ./update_version.sh 1.2.0"
    exit 1
fi

# Check if version number follows semantic versioning
if [[ ! $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "\nError: Invalid version format."
    echo "Expected version format: X.Y.Z"
    echo "Example version format: 1.2.0"
    exit 1
fi

# Check if version tag already exists locally
if git tag -l | grep -q "^v$1$"; then
    echo -e "\nError: Tag v$1 already exists locally."
    echo "Please choose a different version number."
    exit 1
fi

# Check if version tag already exists in remote
if git ls-remote --tags origin | grep -q "refs/tags/v$1$"; then
    echo -e "\nError: Tag v$1 already exists on remote."
    echo "Please choose a different version number."
    exit 1
fi

# Check that we are on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "\nError: Not on main branch. Please switch to main branch first."
    echo "Current branch is $CURRENT_BRANCH"
    echo "Use 'git switch main' to switch to main branch."
    exit 1
fi

# Check that working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "\nError: Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Pull latest changes from remote main branch
echo -e "\n--- Pulling latest changes from main branch ---"
if ! git pull origin main; then
    echo -e "\nError: Git pull failed"
    echo "Possible reasons:"
    echo "- Network issues"
    echo "- Remote repository is unreachable"
    echo "- Local changes conflict with remote changes"
    echo "Please resolve the issue and try again."
    exit 1
fi

# Check for merge conflicts after pull
# UU = both modified
# AA = both added
# DD = both deleted
# AU = added by us
# UA = added by them
# DU = deleted by us
# UD = deleted by them
if git status --porcelain | grep -q "^UU\|^AA\|^DD\|^AU\|^UA\|^DU\|^UD"; then
    echo -e "\nError: Merge conflicts detected"
    echo "Please resolve conflicts manually:"
    git status --porcelain | grep "^UU\|^AA\|^DD\|^AU\|^UA\|^DU\|^UD"
    exit 1
fi

# Update version in build.gradle (backend)
echo -e "\n--- Updating backend version ---"
cd backend
if ! grep -q "version = '[0-9]\+\.[0-9]\+\.[0-9]\+-SNAPSHOT'" build.gradle; then
    echo -e "\nError: Current version in build.gradle does not match expected format."
    echo "Expected format: version = 'X.Y.Z-SNAPSHOT'"
    echo "Example format: version = '1.2.0-SNAPSHOT'"
    exit 1
fi
sed -i "s/version = '[0-9]\+\.[0-9]\+\.[0-9]\+-SNAPSHOT'/version = '$VERSION-SNAPSHOT'/g" build.gradle
git add build.gradle
cd ..

# Update version in package.json and package-lock.json (frontend)
echo -e "\n--- Updating frontend version ---"
cd frontend 
npm version "$VERSION" --no-git-tag-version
git add package.json package-lock.json
cd ..

# Commit and push version changes
echo -e "\n--- Committing and pushing version changes ---"
git commit -m "Bump to version v$VERSION"
git push origin main

# Create and push Git tag
echo -e "\n--- Creating and pushing git tag v$VERSION ---"
git tag -a "v$VERSION" -m "Release version v$VERSION. See Releases section for more details."
git push origin "v$VERSION"

echo -e "\n--- Version update complete ---"
echo "Version updated to $VERSION and tagged as v$VERSION successfully."