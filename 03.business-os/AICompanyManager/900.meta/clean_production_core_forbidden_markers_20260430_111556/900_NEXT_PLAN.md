# Next plan

If this phase passes:

Next phase:
ANI-ANL server clean v2 API consolidation candidate, or if server API already exists but is patch-stacked:
- create clean server copy or clean route module candidate
- do not switch production yet
- no DB write by script
- node --check only
- verify route contract

After server clean candidate:
- switch index to clean core in one controlled phase
- stop loading old 36-script stack
- verify manual UI from production
