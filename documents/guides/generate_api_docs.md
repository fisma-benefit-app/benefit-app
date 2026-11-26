# Maintaining the API documentation

The API documentation has two parts:

- [`api.md`](../references/api.md) is the maintained, human-readable reference: quickstart, concepts, endpoint examples, permissions, and error recovery.
- [`api-docs.yaml`](../references/api-docs.yaml) is the generated OpenAPI contract, exported from the running backend's annotations and DTOs.

Refresh both when an endpoint or its behavior changes. The export script updates only the OpenAPI file; it deliberately does not overwrite the reference with generated prose.

## Export the current OpenAPI contract

Start the backend built from the revision you want to document, using the [development setup](../../README.md#setting-up-development-environment). The `dev` profile reseeds its database, so use a disposable local database when verifying examples.

Run from the repository root:

```bash
bash backend/scripts/generate_api_docs.sh
```

The script downloads `http://localhost:8080/v3/api-docs.yaml`. An HTTP or network failure leaves the existing specification intact. It does not need Node.js, Widdershins, or DocToc.

To inspect the contract interactively while the backend is running, open [Swagger UI](http://localhost:8080/swagger-ui/index.html).

## Update the reference

Compare the exported paths and schemas with `api.md`, and update every affected endpoint and shared object definition. Use this order for each endpoint:

1. Purpose and HTTP method/path.
2. Authentication and permissions.
3. Parameters, with operation-specific requirements and a link to shared fields.
4. A complete cURL request with a valid, representative body.
5. The successful status, headers where relevant, and response body. Explicitly identify excerpts; never show a body for `204`.
6. Errors and what the caller should do next.

Keep explanations of `lockNumber`, `session_version`, version history, membership, and component links in **Concepts and conventions**, then link to them from endpoints. Distinguish client-supplied fields from backend-managed JWT claims. Document replacement behavior and data-preservation requirements next to update operations.

Keep the endpoint order in the same groups as the current reference. Put reusable object definitions under **Field reference** instead of flattening their nested fields into every endpoint. A readable successful example is more useful than a large generated object full of placeholders. Use a placeholder for a JWT rather than publishing a usable token.

## Verify examples and navigation

Exercise changed examples against a disposable local backend. Check the actual successful status, body, and headers, and test the relevant permission, validation, and conflict cases. For session changes, check renewal, logout, and password-change invalidation. Do not use a shared or deployed database for destructive examples.

Check that every OpenAPI operation has a matching method/path in the reference and that documented fields match its schema. Review Markdown links and the rendered document.

The table of contents includes section headings through level 2. Update it after changing headings:

```bash
npx --yes doctoc documents/references/api.md --maxlevel 2
```

DocToc is run on demand, not added as a project dependency.

## Troubleshooting

- **Connection refused:** start the backend on local port 8080 before exporting.
- **HTTP error from the export:** inspect the backend logs and verify that `/v3/api-docs.yaml` is accessible. The export script leaves the previous specification in place.
- **The reference disagrees with the contract:** inspect the controller, service, DTO validation, and exception handler. Fix annotations if necessary, export again, and revise the human explanation. Generated schemas do not replace verification of runtime behavior.
