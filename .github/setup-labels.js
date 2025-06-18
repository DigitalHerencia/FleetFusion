/**
 * GitHub Labels Setup Script for FleetFusion
 * Run with: node .github/setup-labels.js
 * Requires: GitHub CLI (gh) to be installed and authenticated
 *
 * @format
 */

const { execSync } = require("child_process")

const labels = [
    // Type Labels
    { name: "Bug", color: "d73a49", description: "Something isn't working" },
    { name: "Feature", color: "a2eeef", description: "New feature or request" },
    { name: "enhancement", color: "84b6eb", description: "Improvement to existing feature" },
    { name: "question", color: "cc317c", description: "Further information is requested" },
    {
        name: "Documentation",
        color: "0075ca",
        description: "Improvements or additions to documentation",
    },
    {
        name: "Testing",
        color: "fbca04",
        description: "Related to testing infrastructure or test cases",
    },
    {
        name: "Code-Quality",
        color: "7057ff",
        description: "Code refactoring, improvements, or maintainability",
    },
    {
        name: "Configuration",
        color: "e4e669",
        description: "Changes to configuration files or setup",
    },

    // Priority Labels
    {
        name: "Priority-High",
        color: "b60205",
        description: "High priority - needs immediate attention",
    },
    {
        name: "Priority-Medium",
        color: "fbca04",
        description: "Medium priority - important but not urgent",
    },
    {
        name: "Priority-Low",
        color: "0e8a16",
        description: "Low priority - nice to have",
    },

    // Status Labels
    {
        name: "Blocked",
        color: "d93f0b",
        description: "Blocked by external dependency or other issue",
    },
    {
        name: "Has-PR",
        color: "0e8a16",
        description: "Issue has an associated pull request",
    },
    {
        name: "Blocks-PR",
        color: "d93f0b",
        description: "This issue blocks a pull request",
    },
    {
        name: "Has-Dependent",
        color: "bfd4f2",
        description: "Other issues depend on this one",
    },
    {
        name: "Has-Dependencies",
        color: "fef2c0",
        description: "This issue depends on other issues",
    },
    {
        name: "conflict",
        color: "e11d21",
        description: "Pull request has merge conflicts",
    },
    {
        name: "needs-fixes",
        color: "fbca04",
        description: "Needs fixes before merge (used by FleetFusion agent)",
    },
]

console.log("🏷️  Setting up GitHub labels for FleetFusion...\n")

// Check if gh CLI is available
try {
    execSync("gh --version", { stdio: "ignore" })
} catch (error) {
    console.error("❌ GitHub CLI (gh) is not installed or not in PATH.")
    console.error("Please install it from: https://cli.github.com/")
    process.exit(1)
}

// Check if authenticated
try {
    execSync("gh auth status", { stdio: "ignore" })
} catch (error) {
    console.error("❌ GitHub CLI is not authenticated.")
    console.error("Please run: gh auth login")
    process.exit(1)
}

let successCount = 0
let errorCount = 0

labels.forEach(label => {
    try {
        // Create or update label
        const command = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`
        execSync(command, { stdio: "ignore" })
        console.log(`✅ ${label.name}`)
        successCount++
    } catch (error) {
        console.log(`❌ ${label.name} - ${error.message}`)
        errorCount++
    }
})

console.log(`\n📊 Results:`)
console.log(`✅ Successfully created/updated: ${successCount} labels`)
console.log(`❌ Errors: ${errorCount} labels`)

if (errorCount === 0) {
    console.log("\n🎉 All labels have been successfully set up!")
    console.log("\n📋 Next steps:")
    console.log(
        "1. Create milestones: MVP Launch, Q3 2025 Release, Testing & Automation Hardening, Post-Launch Enhancements"
    )
    console.log(
        "2. Set up project board with columns: To Do, In Progress, Review, Done"
    )
    console.log(
        "3. Update column IDs in .github/workflows/project-automation.yml"
    )
    console.log("4. Test the automation by creating a test issue")
} else {
    console.log(
        "\n⚠️  Some labels could not be created. Check the errors above."
    )
}

module.exports = labels
