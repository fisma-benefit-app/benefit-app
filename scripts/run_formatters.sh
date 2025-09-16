#!/bin/bash

# This script runs code formatters for both frontend and backend

# Start from project root
cd "$(git rev-parse --show-toplevel)"

# Check if frontend is formatted according to Prettier, and format if not
cd frontend
if ! npx prettier . --check; then
    echo "Frontend files are not formatted. Running Prettier formatter..."
    npx prettier . --write
    echo "Frontend files formatted! Please review changes."
# else
#     no need for an extra message here, Prettier generates one automatically
fi
cd ..

# Check if backend is formatted according to Google Java Format, and format if not
cd backend
if ! ./gradlew spotlessCheck; then
    echo "Backend files are not formatted. Running Spotless formatter..."
    ./gradlew spotlessApply
    echo "Backend files formatted! Please review changes."
else
    echo "All backend files use Google Java Format style!"
fi
cd ..