#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -n "Checking if backend is running... "
if curl -s -I http://localhost:8080/v3/api-docs.yaml > /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please start the Spring Boot application first"
    exit 1
fi

# Check if Node.js is installed
echo -n "Checking Node.js installation... "
if command -v node > /dev/null; then
    echo -e "${GREEN}✓ ($(node --version))${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Create references directory if it doesn't exist
REFERENCES_DIR="."
echo -n "Checking references directory... "
if [ ! -d "$REFERENCES_DIR" ]; then
    mkdir -p "$REFERENCES_DIR"
    echo -e "${GREEN}✓ (created)${NC}"
else
    echo -e "${GREEN}✓${NC}"
fi

# Download OpenAPI spec
echo -n "Downloading OpenAPI spec... "
if curl -s http://localhost:8080/v3/api-docs.yaml -o "$REFERENCES_DIR/api-docs.yaml"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Failed to download OpenAPI spec"
    exit 1
fi

# Install global npm packages if needed
for package in widdershins doctoc; do
    echo -n "Checking $package installation... "
    if command -v $package > /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}installing...${NC}"
        npm install -g $package
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
            echo "Failed to install $package"
            exit 1
        fi
    fi
done

# Generate markdown documentation
cd "$REFERENCES_DIR" || exit 1
echo "Generating API documentation..."
if widdershins api-docs.yaml -o api.md --summary true --expandBody true --code true --omitHeader true; then
    echo -e "${GREEN}✓ Generated API documentation${NC}"
else
    echo -e "${RED}✗ Failed to generate API documentation${NC}"
    exit 1
fi

# Add table of contents
echo "Adding table of contents..."
if doctoc api.md --maxlevel 2; then
    echo -e "${GREEN}✓ Added table of contents${NC}"
else
    echo -e "${RED}✗ Failed to add table of contents${NC}"
    exit 1
fi

echo -e "\n${GREEN}API documentation generated successfully!${NC}"
echo "Output file: $(pwd)/api.md"