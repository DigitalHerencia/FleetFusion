# scripts/deploy-fleetfusion-agent.ps1
# Purpose: Deploys FleetFusion DevOps Agent configuration and workflows
# Usage: Run from FleetFusion repository root

Write-Host "🚛 Deploying FleetFusion DevOps Agent..." -ForegroundColor Green

# Check if running in FleetFusion repository
if (!(Test-Path "package.json") -or !(Select-String -Path "package.json" -Pattern "fleetfusion")) {
    Write-Host "❌ Must be run from FleetFusion repository root" -ForegroundColor Red
    exit 1
}

# Verify agent configuration exists
if (!(Test-Path ".github\agents\fleetfusion-agent.json")) {
    Write-Host "❌ Agent configuration not found. Ensure .github/agents/fleetfusion-agent.json exists" -ForegroundColor Red
    exit 1
}

# Verify workflows exist
$requiredWorkflows = @(
    ".github\workflows\fleetfusion-conventions.yml",
    ".github\workflows\fleetfusion-agent-commands.yml"
)

foreach ($workflow in $requiredWorkflows) {
    if (!(Test-Path $workflow)) {
        Write-Host "❌ Required workflow not found: $workflow" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All agent files verified" -ForegroundColor Green

# Validate agent configurations
Write-Host "🔍 Validating agent configurations..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $validationResult = node ".github\agents\validate-agents.js"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Agent configuration validation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Agent configurations validated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node.js not found. Skipping agent validation" -ForegroundColor Yellow
}

# Commit and push
Write-Host "📤 Deploying to GitHub..." -ForegroundColor Yellow
git add .github/
git commit -m "feat: deploy FleetFusion DevOps Agent automation"
git push origin main

Write-Host "✅ FleetFusion DevOps Agent deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your agent is now active and will:" -ForegroundColor Cyan
Write-Host "   - Enforce FleetFusion architectural patterns" -ForegroundColor White
Write-Host "   - Validate multi-tenant security requirements" -ForegroundColor White  
Write-Host "   - Review PRs for organizationId isolation" -ForegroundColor White
Write-Host "   - Respond to @fleetfusion-agent commands" -ForegroundColor White
Write-Host "   - Auto-label and manage PR workflow" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Try it: Open a PR and the agent will automatically review it!" -ForegroundColor Green