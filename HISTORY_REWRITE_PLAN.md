History rewrite plan (DRAFT)
=================================

Purpose
-------
This document describes a safe, reviewable plan to remove large files (for example accidental MongoDB data directories) from the repository history. This is destructive to commit history and will require a forced push and contributor coordination. Do NOT execute these steps until you explicitly approve them.

Summary of steps
----------------
1. Identify large files/paths to remove (example: `mongo-data/`).
2. Create a full mirror backup of the repository (bare clone) and push to a temporary remote for safekeeping.
3. Use `git filter-repo` (preferred) to remove the paths from history.
4. Verify repository integrity and run tests against rewritten repo locally.
5. Force-push rewritten branches to origin and inform contributors with instructions to rebase or re-clone.

Detailed commands (tested locally)
----------------------------------

1) Create local backups

```bash
# From repository root
git clone --mirror git@github.com:${GITHUB_OWNER}/${REPO}.git repo-backup.git
tar czf repo-backup-$(date +%Y%m%d).tar.gz repo-backup.git
```

2) Install `git-filter-repo` if needed (pip)

```bash
python3 -m pip install --user git-filter-repo
```

3) Perform the rewrite (example removing `mongo-data/`)

```bash
# Make a fresh clone to rewrite
git clone --no-local --no-hardlinks . repo-rewrite
cd repo-rewrite
git filter-repo --path mongo-data --invert-paths
```

Notes:
- `--invert-paths` will remove the specified path from history. Replace `mongo-data` with the exact path(s) you want removed.
- You can pass multiple `--path` arguments.

4) Validate

```bash
# run tests
cd repo-rewrite
# install and run your test suite (example for this repo):
cd app
npm ci
npm run test:ci
```

5) Force-push and communicate

```bash
git remote add backup git@github.com:${GITHUB_OWNER}/${REPO}-pre-filter-backup.git
git push backup --all
git push --force origin main
# Also force-push any long-lived branches you control
```

6) Post-rewrite steps for contributors

- Notify contributors that history was rewritten.
- Instruct them to either rebase their branches on the new main or to re-clone the repository.

Rollback plan
-------------
If the rewrite causes problems, restore from the mirror backup created in step (1) and push it back as `origin` (requires coordination):

```bash
# restore backup (dangerous: will replace current repo on remote)
git clone --mirror repo-backup.git repo-restore.git
cd repo-restore.git
git push --force origin --all
```

Permissions & policy
--------------------
- Only run this operation with repository admin rights.
- Communicate widely before and after — this is disruptive to PRs and forks.

Approval
--------
If you approve, reply with: "APPROVE REWRITE: remove paths: <comma-separated paths>" and I will prepare and run the steps (I will still wait one more confirmation before force-pushing).
