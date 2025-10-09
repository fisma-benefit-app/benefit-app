#!/bin/bash

# Exit on any error
set -e

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

# Set variables
VERSION="$1"
CURRENT_BRANCH=$(git branch --show-current)

# Check that we are on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: Not on main branch. Please switch to main branch first."
    echo "Current branch is $CURRENT_BRANCH"
    echo "Use 'git switch main' to switch to main branch."
    exit 1
fi

# Pull latest changes from remote main branch
echo -e "\n--- Pulling latest changes from main branch ---"
git pull origin main

# Update version in build.gradle (backend)
echo -e "\n--- Updating backend version ---"
cd backend
sed -i "s/version = '[0-9]*\.[0-9]*\.[0-9]*-SNAPSHOT'/version = '$VERSION-SNAPSHOT'/g" build.gradle
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
git tag "v$VERSION"
git push origin "v$VERSION"

echo -e "\n--- Version update complete ---"
echo "Version updated to $VERSION and tagged as v$VERSION successfully."