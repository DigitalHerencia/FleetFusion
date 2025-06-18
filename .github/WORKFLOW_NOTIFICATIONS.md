<!-- @format -->

# Workflow Failure Notifications

This document describes the failure notification system implemented in FleetFusion's GitHub workflows.

## Current Implementation

All workflows now include failure notification steps that:

-   Post detailed error messages as issue/PR comments when workflows fail
-   Include direct links to workflow run logs
-   Provide context about what functionality may be affected
-   Suggest troubleshooting steps

## Workflows with Failure Notifications

### 1. **FleetFusion Agent Commands** (`fleetfusion-agent-commands.yml`)

-   **Trigger**: @fleetfusion-agent command processing failure
-   **Notification**: Comment on the PR where the command was issued
-   **Context**: Links to workflow logs and shows the failed command

### 2. **FleetFusion Conventions** (`fleetfusion-conventions.yml`)

-   **Trigger**: Pattern validation or analysis failure
-   **Notification**: Comment on the PR being analyzed
-   **Context**: Indicates potential workflow configuration or GitHub API issues

### 3. **Label Merge Conflicts** (`label-merge-conflicts.yml`)

-   **Trigger**: Merge conflict detection failure
-   **Notification**: Comment on the affected PR
-   **Context**: Suggests manual conflict checking and labeling

### 4. **PR Automation** (`pr-automation.yml`)

-   **Trigger**: PR processing automation failure
-   **Notification**: Comments on both PR automation and dependency tracking job failures
-   **Context**: Lists affected functionality (labeling, reviewer assignment, priority assignment)

### 5. **Project Board Automation** (`project-automation.yml`)

-   **Trigger**: Project board or milestone management failure
-   **Notification**: Comment on the issue/PR being processed
-   **Context**: Includes troubleshooting for column ID configuration issues

## Slack Integration (Optional)

For teams wanting Slack notifications, you can extend the failure notifications using the `slackapi/slack-github-action`:

### Setup Steps:

1. **Create Slack App**: Create a Slack app with bot token permissions
2. **Add Repository Secret**: Add `SLACK_BOT_TOKEN` to repository secrets
3. **Update Workflow**: Replace or supplement the GitHub comment notification

### Example Slack Notification Step:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@70cd7be8e40a46e8b0eced40b0de447bdb42f68e # v1.26.0
  with:
      channel-id: "C1234567890" # Your channel ID
      payload: |
          {
            "text": "🚨 FleetFusion Workflow Failed",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*🚨 Workflow Failure Alert*\n\n*Repository:* ${{ github.repository }}\n*Workflow:* ${{ github.workflow }}\n*Branch:* ${{ github.ref_name }}\n*Run:* <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>"
                }
              }
            ]
          }
  env:
      SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### Microsoft Teams Integration:

For Teams notifications, use the `skitionek/notify-microsoft-teams` action:

```yaml
- name: Notify Teams on failure
  if: failure()
  uses: skitionek/notify-microsoft-teams@master
  with:
      webhook_url: ${{ secrets.MSTEAMS_WEBHOOK }}
      job: ${{ toJson(job) }}
      steps: ${{ toJson(steps) }}
```

## Notification Message Format

All failure notifications follow this structure:

```markdown
## 🚨 [Workflow Name] Failed

Brief description of what failed.

**Workflow Run:** [View Logs](direct-link-to-run)
**PR/Issue:** #number
**Additional Context:** Relevant details

This failure may affect:

-   Functionality item 1
-   Functionality item 2
-   Functionality item 3

**Possible causes:**

-   Cause 1
-   Cause 2

Troubleshooting suggestions.

---

_This is an automated notification from FleetFusion DevOps_ 🚛⚠️
```

## Best Practices

1. **Keep notifications actionable** - Include specific troubleshooting steps
2. **Provide context** - Explain what functionality is affected
3. **Link to logs** - Always include direct links to workflow runs
4. **Use consistent formatting** - Maintain the same message structure
5. **Avoid notification spam** - Only notify on actual failures, not expected outcomes

## Customization

Teams can customize notifications by:

-   Changing notification targets (Slack, Teams, email)
-   Modifying message content and formatting
-   Adding additional context or metadata
-   Implementing different notification rules for different workflows

## Monitoring and Alerts

Consider implementing additional monitoring:

-   **Workflow failure rate tracking** - Monitor how often workflows fail
-   **Response time metrics** - Track how quickly failures are addressed
-   **Failure pattern analysis** - Identify recurring issues
-   **Escalation procedures** - Define when to escalate persistent failures

---

**Last Updated**: June 17, 2025  
**Maintained By**: FleetFusion Development Team
