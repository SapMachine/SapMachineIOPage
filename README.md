[![REUSE status](https://api.reuse.software/badge/github.com/SapMachine/sapmachineiopage)](https://api.reuse.software/info/github.com/SapMachine/sapmachineiopage)

# SapMachineIOPage

## About this project

Infrastructure workflow for building and publishing the https://sapmachine.io website.

## Requirements and Setup

This project is a [Docusaurus](https://docusaurus.io/) site that generates the static https://sapmachine.io website.

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (the CI build runs on Node 24)
- npm (bundled with Node.js)

### Local development

Install the dependencies and start a local dev server with hot reload at http://localhost:3000:

```bash
npm ci
npm start
```

### Production build

Generate the static site into the `build/` directory and preview it locally before deploying:

```bash
npm run build
npm run serve
```

Pushing to the `main` branch triggers the [publish workflow](.github/workflows/publish-page.yml), which builds the site and deploys it to GitHub Pages.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SapMachine/sapmachineiopage/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure
If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/SapMachine/sapmachineiopage/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2026 SAP SE or an SAP affiliate company and sapmachineiopage contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SapMachine/sapmachineiopage).
