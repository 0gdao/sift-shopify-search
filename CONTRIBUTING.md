# Contributing to Sift

Thanks for helping improve Sift.

## Development workflow

1. Fork the repository and create a focused branch.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Make a small, documented change.
5. Run `npm test`, `npm run typecheck`, and `npm run build`.
6. Open a pull request using the repository template.

## Contribution guidelines

- Keep changes focused on Shopify product discovery and comparison.
- Preserve the server-side normalization boundary around upstream catalog data.
- Never cache Shopify catalog results or download catalog images.
- Do not commit credentials, access tokens, customer data, or `.env.local`.
- Add tests for changed validation, normalization, or request behavior.
- Explain user impact and validation steps in the pull request.

For larger product or architecture changes, open an issue before implementation.
