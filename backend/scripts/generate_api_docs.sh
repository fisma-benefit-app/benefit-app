#!/bin/bash
set -euo pipefail

# api.md is maintained by hand; refresh only its machine-readable companion.
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REFERENCES_DIR="$SCRIPTS_DIR/../../documents/references"
mkdir -p "$REFERENCES_DIR"

# Download beside the destination so a failed export never replaces the saved spec.
SPEC_FILE="$(mktemp "$REFERENCES_DIR/api-docs.yaml.XXXXXX")"
trap 'rm -f "$SPEC_FILE"' EXIT

curl --fail --silent --show-error --max-time 30 \
    http://localhost:8080/v3/api-docs.yaml -o "$SPEC_FILE"
mv "$SPEC_FILE" "$REFERENCES_DIR/api-docs.yaml"

echo "Updated $REFERENCES_DIR/api-docs.yaml"
echo "Review documents/references/api.md for matching endpoint, example, and field changes."
