# R22 cloud development foundation — isolated Codespaces scaffold

Status: cloud-development scaffold only, R21-derived, no AWS CodeBuild creation and no production changes.

## Responsibilities
- Android / Termux: browser terminal, approvals, source migration after audit. Preserve original local files and uncommitted work.
- GitHub Codespaces: editor, Git, Node 22, read-only source preflight; no automatic dependency installation or database access.
- GitHub Actions: independent source tests and local browser simulations. Not a substitute for AWS-hosted UI acceptance.
- AWS CodeBuild (future, gated): persistent project definition but *ephemeral* test jobs for AWS-hosted Chromium UI, API integration, security/regression, and isolated DB tests. Currently not provisioned.
- CivilizationOS: canonical auth. Portal: navigation. Gateway: routing. Each OS: its own menu and APIs. No ownership transfer.

## Startup contract
- Source base: R21 commit `8cf84fa2dc38b942f55b9348a0ae2783e2527e32`, not dirty local Termux main.
- Codespaces: select *2-core* manually. This devcontainer uses the prebuilt Microsoft JavaScript/Node 22 image, without `postCreateCommand` or `npm install`. Container image pulls have their own storage/time cost; monitor Codespaces quotas.
- Run `bash tools/r22_cloud_preflight.sh` inside Codespaces after the container is ready. Node contract tests need no npm installation. TypeScript is explicitly `NOT_RUN` until dependencies are separately installed and verified.
- For new development create a separate branch; never commit secrets to this repository. Stop idle Codespaces, and delete only after changes are pushed.

## Mandatory preservation gate
Termux audit found approx 5934 dirty main entries, 4.8 GiB worktrees and 621 MiB .tmp. These items are **not** included in the GitHub branch and must be inventoried and backed up before any deletion. On-device node_modules and worktrees are not removed by this scaffold.

## AWS financial and UI gates
- At 2026-11-18 reported AWS credits $91.90 and month-to-date usage $9.30, but current CodeBuild/Budgets/Cost Explorer reads denied under `r68a10-readonly`. Do not assume unused CodeBuild quota or create resources on the basis of billing screenshot alone.
- AWS CodeBuild design and deployment require fresh permission/price/usage validation, least-privilege jobs, timeout/concurrency caps, artifact retention, and explicit rollback.
- R21 AWS route first-response 307 PASS; browser flash test NOT_RUN; AWS runtime SHA unverified; verifier 404. R21 production switch not authorized.
- No use of AWS root login for routine builds or test operations. Dedicated limited roles only.

## Rollback
All cloud-dev setup is in an isolated R22 Git branch. To avoid using it, return to the earlier R21 branch; do not merge into main. No running AWS/DB resources are changed.
