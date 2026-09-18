#!/bin/bash

# NOTE: widdershins and doctoc are intentionally not installed as dependencies
# (they cause npm audit problems), so this script runs them via npx instead.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
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
REFERENCES_DIR="../../documents/references"
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

# Check Node.js/npm can reach the registry for npx (no global install needed)
echo -n "Checking npx... "
if command -v npx > /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "npx not found (should ship with Node.js/npm)"
    exit 1
fi

# Generate markdown documentation (widdershins/doctoc run via npx, not installed globally)
cd "$REFERENCES_DIR" || exit 1
echo "Generating API documentation..."
if npx --yes widdershins api-docs.yaml -o api.md --summary true --expandBody true --code true --omitHeader true; then
    echo -e "${GREEN}✓ Generated API documentation${NC}"
else
    echo -e "${RED}✗ Failed to generate API documentation${NC}"
    exit 1
fi

# Add table of contents
echo "Adding table of contents..."
if npx --yes doctoc api.md --maxlevel 2; then
    echo -e "${GREEN}✓ Added table of contents${NC}"
else
    echo -e "${RED}✗ Failed to add table of contents${NC}"
    exit 1
fi

echo -e "\n${GREEN}API documentation generated successfully!${NC}"
echo "Output file: $(pwd)/api.md"
