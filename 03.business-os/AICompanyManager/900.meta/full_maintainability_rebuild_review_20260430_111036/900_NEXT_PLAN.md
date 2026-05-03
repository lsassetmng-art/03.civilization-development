# Next plan

Do not run more patch fixes.

After reviewing this report, next step should be:

1. Build clean aicm-production-core.js without touching current index.
2. Build clean server v2 route section or separate server module.
3. Create preview index copy only if needed.
4. Switch production index only after clean core passes static checks.

Recommended next phase:
ANE-ANH create clean production core candidate.

Scope:
- create new files only
- do not change index.html yet
- do not delete old files
- no DB write
