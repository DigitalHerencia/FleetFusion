# FleetFusion Agents Directory

This directory contains AI agent configurations for the FleetFusion project's DevOps automation.

## 🤖 Available Agents

### FleetFusion DevOps Agent (`fleetfusion-agent.json`)

**Purpose**: AI-powered code review and pattern enforcement specialist for FleetFusion's multi-tenant SaaS architecture.

**Responsibilities**:
- 🏗️ **Architecture Enforcement**: Validates Next.js 15 App Router + React 19 Server Components patterns
- 🔒 **Security Validation**: Ensures multi-tenant isolation with organizationId validation
- 📋 **Code Standards**: Enforces TypeScript strict mode and organizational patterns
- 🛡️ **Compliance**: Validates Zod schemas, error handling, and audit logging

**Integration Points**:
- **Workflow**: `fleetfusion-conventions.yml` - Automatic PR analysis and pattern validation
- **Interactive**: `fleetfusion-agent-commands.yml` - Responds to `@fleetfusion-agent` commands in PR comments
- **Deployment**: `scripts/deploy-fleetfusion-agent.ps1` - Deployment automation script

**Core Patterns Enforced**:

1. **Server Actions** (`lib/actions/*.ts`):
   ```typescript
   'use server';
   export async function actionName(orgId: string, data: InputType) {
     const { userId } = await auth();
     if (!userId) throw new Error('Unauthorized');
     
     const user = await getCurrentUser();
     if (user?.organizationId !== orgId) throw new Error('Forbidden');
     
     const validated = schema.parse(data);
     
     return await prisma.model.create({
       data: { ...validated, organizationId: orgId }
     });
   }
   ```

2. **Data Fetchers** (`lib/fetchers/*.ts`):
   ```typescript
   export async function getModelsByOrg(orgId: string) {
     const { userId } = await auth();
     if (!userId) throw new Error('Unauthorized');
     
     return await prisma.model.findMany({
       where: { organizationId: orgId }
     });
   }
   ```

3. **Component Architecture**:
   - Server components for data fetching
   - Client components for interactivity
   - Proper `'use client'` / `'use server'` directives

**Security Requirements**:
- ✅ Every server action MUST include `organizationId` validation
- ✅ Database queries MUST filter by `organizationId`
- ✅ Authentication: `await auth()` + user context validation
- ✅ RBAC: Check permissions before data access

**Usage in Pull Requests**:

The agent automatically:
1. **Analyzes** all changed files for FleetFusion patterns
2. **Validates** multi-tenant security requirements
3. **Comments** with specific feedback and fix suggestions
4. **Labels** PRs based on compliance status
5. **Provides** interactive help via `@fleetfusion-agent` commands

**Interactive Commands**:
- `@fleetfusion-agent review` - Full FleetFusion pattern review
- `@fleetfusion-agent security` - Security analysis and patterns
- `@fleetfusion-agent patterns` - Architecture pattern guidance
- `@fleetfusion-agent fix` - Auto-fix suggestions
- `@fleetfusion-agent test` - Testing recommendations

## 🔧 Configuration Management

### Adding New Agents

1. Create agent configuration file: `{agent-name}.json`
2. Update relevant workflows to reference the new agent
3. Add documentation section in this README
4. Test agent functionality with sample PRs

### Agent Configuration Schema

```json
{
  "name": "Agent Display Name",
  "description": "Brief description of agent purpose",
  "system_prompt": "Detailed instructions for the AI agent...",
  "patterns": {
    "pattern_name": "code example or template"
  }
}
```

### Deployment

Use the deployment script to set up or update agent configurations:

```powershell
# From FleetFusion repository root
.\scripts\deploy-fleetfusion-agent.ps1
```

The deployment script will:
1. Verify all required files exist
2. Validate agent configurations
3. Commit and push changes to GitHub

### Validation

Validate agent configurations manually:

```bash
# Run validation script
node .github/agents/validate-agents.js
```

The validator checks:
- Required fields are present
- Referenced workflows exist
- Deployment scripts are accessible
- JSON syntax is valid

## 🔍 Troubleshooting

**Agent Not Responding**:
1. Check workflow triggers in `.github/workflows/`
2. Verify agent configuration syntax
3. Review GitHub Actions logs
4. Ensure proper repository permissions

**Pattern Validation Issues**:
1. Review agent system prompt for accuracy
2. Update patterns in agent configuration
3. Test with sample code changes
4. Check for workflow conflicts

## 📚 Related Documentation

- [FleetFusion Architecture Guide](../../docs/Developer-Documentation.md)
- [Multi-Tenant Security Patterns](../../docs/User-Documentation.md)
- [GitHub Workflows](../workflows/)
- [Branch Protection Rules](../branch-protection-rules.json)

---

**Last Updated**: June 17, 2025  
**Maintained By**: FleetFusion Development Team