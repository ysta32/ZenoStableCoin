# Contributing

Zeno is a front-end prototype; issues and pull requests are welcome.

1. Fork and clone, then `npm install` and `npm run dev`.
2. Make your change on a branch. Keep it focused.
3. Run `npm run check` (typecheck, lint, unit tests) and `npm run build`. Run `npm run e2e` if you touched UI flows.
4. Format with `npm run format`.
5. Open a pull request describing what changed and why. CI runs the same checks.

Conventions: commit messages follow `type(scope): summary` (for example `fix(payroll): ...`). UI work should follow the [design system](docs/DESIGN.md): use the existing tokens and primitives rather than ad-hoc colors. Nothing in this repo may move real money or call a chain; keep it a prototype.

By contributing you agree your work is released under the [MIT License](LICENSE).
