# GitHub Scripts Directory

This directory contains utility scripts for managing FleetFusion's GitHub automation and project board configuration.

## 📋 Available Scripts

### Project Column ID Fetcher (`fetch-project-columns.js`)

**Purpose**: Automatically fetches GitHub project board column IDs for workflow automation.

**Usage**:
```bash
# From repository root
node .github/scripts/fetch-project-columns.js
```

**Requirements**:
- GitHub CLI (`gh`) installed and authenticated
- Repository access to FleetFusion project

**Features**:
- Fetches current project board structure via GitHub GraphQL API
- Maps column names to workflow configuration keys
- Generates ready-to-use workflow configuration
- Validates existing workflow files

**What it does**:
1. Connects to GitHub API using CLI authentication
2. Fetches all project boards in the repository
3. Extracts status field column options
4. Maps common column names (To Do, In Progress, Review, Done) to IDs
5. Generates workflow configuration update instructions

**Output Example**:
```javascript
const columns = {
  todo: "Y3Vyc29yOnYyOpLOC9kG5qRUb2Rv", // To Do
  inProgress: "Y3Vyc29yOnYyOpLOC9kG5qtJbiBQcm9ncmVzcw==", // In Progress
  review: "Y3Vyc29yOnYyOpLOC9kG5qZSZXZpZXc=", // Review
  done: "Y3Vyc29yOnYyOpLOC9kG5qREb25l", // Done
  blocked: null, // Blocked - not found
};
```

## 🔧 Manual Column ID Updates

If the automated script doesn't work, you can manually fetch column IDs using GitHub's GraphQL Explorer:

### GraphQL Query:
```graphql
query {
  repository(owner: "DigitalHerencia", name: "FleetFusion") {
    projectsV2(first: 1) {
      nodes {
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  }
}
```

### Steps:
1. Visit [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)
2. Authenticate with your GitHub account
3. Run the query above
4. Look for the field with `name: "Status"` (or similar)
5. Copy the `id` values for each status option
6. Update the `columns` object in `project-automation.yml`

## 🛠️ Troubleshooting

### Script Issues:

**"GitHub CLI not found"**:
- Install GitHub CLI from: https://cli.github.com/
- Ensure it's in your system PATH

**"Not authenticated"**:
- Run: `gh auth login`
- Follow the authentication flow

**"No projects found"**:
- Verify repository has GitHub Projects (v2) enabled
- Check repository access permissions
- Ensure you're running from correct repository

**"No column mappings"**:
- Project board may use non-standard column names
- Check project board manually and update script mappings
- Use manual GraphQL query method

### Workflow Issues:

**"Missing column IDs"**:
- Check workflow logs for validation warnings
- Run fetch script to get current IDs
- Verify project board structure hasn't changed

**"Project automation not working"**:
- Ensure workflow has proper repository permissions
- Check that column IDs are current and valid
- Verify project board is linked to repository

## 📚 Related Files

- **Workflow**: `.github/workflows/project-automation.yml`
- **Agent Config**: `.github/agents/fleetfusion-agent.json`
- **Documentation**: Project automation section in README

## 🔄 Maintenance

**When to update column IDs**:
- Project board structure changes
- Column names are modified
- New status columns are added
- Automation stops working

**Best practices**:
- Run fetch script after any project board changes
- Test automation with new issues/PRs after updates
- Keep backup of working column IDs
- Document any custom column mappings

---

**Last Updated**: June 17, 2025  
**Maintained By**: FleetFusion Development Team