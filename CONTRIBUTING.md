Thank you for contributing to multi-container-app! This document explains contribution workflow and the repository's automation.

1. Code style and pre-commit hooks
  - The `app/` package uses `husky` + `lint-staged` to run formatters and linters before commits. To enable hooks locally:

    ```bash
    cd app
    npm install
    npx husky install .husky
    ```

  - If you prefer not to run hooks locally, you can bypass them with `--no-verify` when committing — but CI will still run the checks.

2. Tests
  - Unit tests are in `app/tests`. Run them with:

    ```bash
    cd app
    npm ci
    npm test
    ```

3. Auto-merge workflow
  - This repository supports an `automerge` label. When a PR is labeled `automerge` and all CI checks are green, the repository's auto-merge workflow will attempt to merge the PR automatically (squash-merge by default).
  - Requirements for auto-merge to succeed:
    - All status checks must complete and pass.
    - Branch protection and review policies (if configured) must be satisfied. If protected branches require reviews, make sure the PR has the required approvals before adding `automerge`.
    - The GitHub Actions runner must have permission to merge (the default `GITHUB_TOKEN` typically suffices).

4. Labels
  - `automerge` — instructs CI/action to merge when checks pass. Use responsibly; ensure reviewers have approved changes.

5. Rewriting history (removing large files)
  - If you need to remove accidentally committed large files (for example local DB data), see `HISTORY_REWRITE_PLAN.md` for a careful, reviewable plan. This operation is destructive and requires admin rights and explicit approval.

6. Contact
  - For questions about this repository, open an issue or ping @dreadwitdastacc-IFA.
Thank you for contributing!

Quick guidelines for this minimal tutorial repo:

- Open an issue for any bug or feature request.
- Keep changes small and focused — add tests when adding behavior.
- For changes that affect Docker or Compose, update `README.md` and `.github/workflows/ci.yml` as appropriate.
- Do not commit secrets or private keys. Use `.env` and add it to `.gitignore` (a `.env.example` is provided).

If you're submitting a PR, include a short description and testing steps.

Husky & Pre-commit hooks (developer setup)
-----------------------------------------

This repository uses Husky and lint-staged to run linters/formatters on staged files.
Because the Node app lives under `app/` (a subpackage), the git hooks are installed at the repository root in the `.husky/` directory.

To set up hooks locally (one-time):

1. From the repository root, install dependencies for the app:

```bash
cd app
npm install
```

2. Install Husky hooks into the repo-level `.husky` directory (run from the repository root):

```bash
npx husky install .husky
```

After that, pre-commit hooks will run automatically on `git commit` and will format and lint staged files.

If you prefer not to install hooks, CI will still run lint/format checks and fail the build if code is not formatted or contains lint errors.
