# How to Generate API Documentation

Widdershins and Doctoc are **not** installed as npm dependencies (a global/local install of Widdershins causes `npm audit` problems), so both are always run through `npx`, which fetches and runs them on demand without adding them to the project.

## Prerequisites

- Your Spring Boot project is running (see [Setting up Development Environment](../../README.md#setting-up-development-environment))
- Node.js (and therefore `npx`) installed on your system

## Generate api.md using script

The script lives in `backend/scripts/generate_api_docs.sh`. Make it executable and run it:

```bash
cd backend/scripts
chmod +x generate_api_docs.sh
./generate_api_docs.sh
```

- This
  - Checks if the backend is running and Node.js is installed
  - Creates the `documents/references/` directory if it doesn't exist
  - Downloads `api-docs.yaml` from the running backend
  - Generates `api.md` with `npx widdershins`
  - Adds a table of contents with `npx doctoc`

## Generate api.md manually

### Step 1: Download the OpenAPI Spec

1. Open your browser at http://localhost:8080/v3/api-docs.yaml
2. Save the file as `documents/references/api-docs.yaml` (overwrite it if it already exists)

### Step 2: Generate Markdown Docs

From the `documents/references/` folder, run:

```bash
npx --yes widdershins api-docs.yaml -o api.md --summary true --expandBody true --code true --omitHeader true
```

This creates `documents/references/api.md` with:

- [x] Operation summaries as section titles
- [x] Expanded request/response bodies
- [x] No code samples or header

### Step 3: Add or Update the Table of Contents

From the `documents/references/` folder, run:

```bash
npx --yes doctoc api.md --maxlevel 2
```

This command scans all headings in `api.md` and inserts (or updates) a clickable Table of Contents at the top of the file. Level 3 headings are not included for readability.

## Troubleshooting

- `401 Unauthorized`: Ensure `/v3/api-docs.yaml` is not blocked in the `SecurityFilterChain` method in `backend/security/SecurityConfig.java`.
- `npx: command not found`: Install/reinstall Node.js — `npx` ships with `npm`.
- Slightly different heading anchors/TOC layout after regenerating: this is normal — newer Widdershins/Doctoc releases (fetched fresh by `npx` each run) can tweak anchor slugs and nesting slightly. Re-run `npx --yes doctoc api.md --maxlevel 2` after any manual edits to `api.md` to keep the TOC in sync.
