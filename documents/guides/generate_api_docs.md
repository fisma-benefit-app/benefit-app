# How to Generate API Documentation

## Prerequisites

- Your Spring Boot project is running (see [Getting Started](../../README.md#getting-started))
- Node.js installed on your system

## Step 1: Download the OpenAPI Spec

1. Open your browser at http://localhost:8080/v3/api-docs.yaml
2. Save the file as `documents/references/api-docs.yaml` (overwrite it if it already exists)

## Step 2: Install Widdershins (one-time)

```bash
npm install -g widdershins
```

## Step 3: Generate Markdown Docs

From the `documents/references/` folder, run:

```bash
widdershins api-docs.yaml -o api.md --summary --expandBody
```

This creates `documents/references/api.md` with:

- [x] Summary at the top
- [x] Expanded request/response bodies

## Troubleshooting

- `401 Unauthorized`: Ensure `/v3/api-docs.yaml` is not blocked in the `SecurityFilterChain` method in `backend/security/SecurityConfig.java`.
- `widdershins: command not found`: Re-install with `npm install -g widdershins`.
