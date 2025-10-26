# How to Generate API Documentation

## Prerequisites

- Your Spring Boot project is running (see [Getting Started](../../README.md#getting-started))
- Node.js installed on your system

## Generate api.md using script

- From the `documents/references/` folder, make `generate_api_docs.sh` executable:

```bash
cd ./documents/references
chmod +x generate_api_docs.sh
```

- Run the script:

```bash
./generate_api_docs.sh
```

- This
  - Checks if backend is running and Node.js is installed
  - Creates a `references` directory if it doesn't exist
  - Downloads `api-docs.yaml`
  - Installs Widdershins and Doctoc
  - Creates markdown documentation using Widdershins
  - Creates table of contents using Doctoc

## Generate api.md manually

### Step 1: Download the OpenAPI Spec

1. Open your browser at http://localhost:8080/v3/api-docs.yaml
2. Save the file as `documents/references/api-docs.yaml` (overwrite it if it already exists)

### Step 2: Install Widdershins and Doctoc (one-time)

```bash
npm install -g widdershins doctoc
```

### Step 3: Generate Markdown Docs

From the `documents/references/` folder, run:

```bash
widdershins api-docs.yaml -o api.md --summary true --expandBody true --code true --omitHeader true
```

This creates `documents/references/api.md` with:

- [x] Operation summaries as section titles
- [x] Expanded request/response bodies
- [x] No code samples or header

### Step 4: Add or Update the Table of Contents

From the `documents/references/` folder, run:

```bash
doctoc api.md --maxlevel 2
```

This command scans all headings in `api.md` and inserts (or updates) a clickable Table of Contents at the top of the file. Level 3 headings are not included for readability.

## Troubleshooting

- `401 Unauthorized`: Ensure `/v3/api-docs.yaml` is not blocked in the `SecurityFilterChain` method in `backend/security/SecurityConfig.java`.
- `widdershins: command not found`: Re-install with `npm install -g widdershins`.
- `doctoc: command not found`: Re-install with `npm install -g doctoc`.
