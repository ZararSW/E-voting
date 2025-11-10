# GitHub Actions Troubleshooting

## Issue: Workflow Not Running (No Jobs Executed)

### Symptom
- Workflow runs show status "completed" with conclusion "failure"
- No jobs are listed or executed in the workflow run
- Workflow appears in the Actions tab but shows 0 jobs

### Root Cause
The workflow file contained invalid syntax that prevented GitHub Actions from parsing the workflow configuration. Specifically, the `secrets` context was used incorrectly in step-level `if` conditions.

**Invalid syntax:**
```yaml
steps:
  - name: Some step
    if: ${{ secrets.MY_SECRET != '' }}
    run: echo "conditional step"
```

The `secrets` context is **not available** in step-level `if` conditions. According to [GitHub's context availability documentation](https://docs.github.com/en/actions/learn-github-actions/contexts#context-availability), the `secrets` context can only be used in:
- `jobs.<job_id>.if` (job-level conditionals)
- `jobs.<job_id>.steps[*].with` (action inputs)
- `jobs.<job_id>.steps[*].env` (environment variables)

### Solution
To conditionally run steps based on secret availability, use one of these patterns:

#### Pattern 1: Environment Variable (Recommended)
Set a job-level environment variable and check it in step conditions:

```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    env:
      HAS_MY_SECRET: ${{ secrets.MY_SECRET != '' }}
    
    steps:
      - name: Conditional step
        if: env.HAS_MY_SECRET == 'true'
        run: echo "secret is available"
```

#### Pattern 2: Separate Jobs
Split optional functionality into separate jobs with job-level conditions:

```yaml
jobs:
  always-run:
    runs-on: ubuntu-latest
    steps:
      - name: Required step
        run: echo "always runs"
  
  optional-with-secret:
    runs-on: ubuntu-latest
    if: secrets.MY_SECRET != ''
    needs: always-run
    steps:
      - name: Step using secret
        run: echo "only runs if secret exists"
```

### Verification
After fixing the workflow syntax, you can validate it using [actionlint](https://github.com/rhysd/actionlint):

```bash
# Install actionlint
wget https://github.com/rhysd/actionlint/releases/latest/download/actionlint_linux_amd64.tar.gz
tar -xzf actionlint_linux_amd64.tar.gz

# Validate workflow
./actionlint .github/workflows/your-workflow.yml
```

### Resolution Timeline
- **Issue detected:** Workflow runs showed 0 jobs executed
- **Root cause identified:** Invalid use of `secrets` context in step-level `if` conditions
- **Fix applied:** Introduced `HAS_AZURE_CREDENTIALS` environment variable at job level
- **Status:** Resolved - workflow can now parse and execute successfully

### Related Resources
- [GitHub Actions Context Availability](https://docs.github.com/en/actions/learn-github-actions/contexts#context-availability)
- [Workflow Syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [actionlint - GitHub Actions Workflow Linter](https://github.com/rhysd/actionlint)
