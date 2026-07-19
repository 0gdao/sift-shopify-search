# Testing

## Commands

```bash
npm run test
npm run typecheck
npm run build
```

## Layers

- **Unit:** request schemas, currency minor-unit conversion, endpoint policy, normalization, and rate limiting.
- **Contract:** mocked Shopify authentication, token reuse, JSON-RPC request shape, and malformed upstream responses.
- **Build:** strict TypeScript and a production Next.js build.
- **Browser QA:** use mock mode to verify initial, loading, result, empty, error, drawer, option, shortlist, comparison, pagination, and responsive states.

External dependencies are mocked in automated tests. Live catalog contract checks call Shopify's keyless endpoint and should remain separate from the unit suite.
