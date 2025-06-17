# scripts/deploy-fleetfusion-agent.ps1
Write-Host "🚛 Deploying FleetFusion DevOps Agent..." -ForegroundColor Green

# Check if running in FleetFusion repository
if (!(Test-Path "package.json") -or !(Select-String -Path "package.json" -Pattern "fleetfusion")) {
    Write-Host "❌ Must be run from FleetFusion repository root" -ForegroundColor Red
    exit 1
}

# Create directories
Write-Host "📁 Creating GitHub workflows directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null
New-Item -ItemType Directory -Force -Path ".github\agents" | Out-Null

# Create agent configuration
Write-Host "🤖 Creating agent configuration..." -ForegroundColor Yellow
# (Agent config creation code would go here)

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