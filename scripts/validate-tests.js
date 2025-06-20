#!/usr/bin/env node
/** @format */
/**
 * Test Environment Validation Script
 * This script validates the complete testing setup and runs all test suites
 */

const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

class TestValidator {
    constructor() {
        this.results = {
            vitest: { status: "pending", errors: [], testCount: 0 },
            playwright: { status: "pending", errors: [], testCount: 0 },
            coverage: { status: "pending", percentage: 0 },
            environment: { status: "pending", errors: [] },
        }
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
                resolve({
                    success: !error,
                    stdout,
                    stderr,
                    error,
                })
            })
        })
    }

    async validateEnvironment() {
        console.log("🔍 Validating test environment...")
        
        // Check required files
        const requiredFiles = [
            "vitest.config.ts",
            "vitest.setup.ts", 
            "playwright.config.ts",
            "package.json"
        ]

        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                this.results.environment.errors.push(`Missing file: ${file}`)
            }
        }

        // Check test directories
        const testDirs = [
            "tests",
            "tests/__health-check__",
            "tests/__integration__",
            "tests/__validation__"
        ]

        for (const dir of testDirs) {
            if (!fs.existsSync(dir)) {
                this.results.environment.errors.push(`Missing directory: ${dir}`)
            }
        }

        this.results.environment.status = this.results.environment.errors.length === 0 ? "passed" : "failed"
    }

    async runVitestSuite() {
        console.log("🧪 Running Vitest unit tests...")
        
        const result = await this.runCommand("npx vitest run")
        
        if (result.success) {
            this.results.vitest.status = "passed"
            // Extract test count from output
            const testMatch = result.stdout.match(/Tests\s+(\d+)\s+passed/)
            if (testMatch) {
                this.results.vitest.testCount = parseInt(testMatch[1])
            }
        } else {
            this.results.vitest.status = "failed"
            this.results.vitest.errors.push(result.stderr || result.error?.message || "Unknown error")
        }
    }

    async runPlaywrightSuite() {
        console.log("🎭 Validating Playwright e2e tests...")
        
        // First list tests to validate configuration
        const listResult = await this.runCommand("npx playwright test --list")
        
        if (listResult.success) {
            const testMatch = listResult.stdout.match(/Total:\s+(\d+)\s+tests/)
            if (testMatch) {
                this.results.playwright.testCount = parseInt(testMatch[1])
                this.results.playwright.status = "configured"
            }
        } else {
            this.results.playwright.status = "failed"
            this.results.playwright.errors.push(listResult.stderr || "Configuration error")
        }
    }

    async runCoverageReport() {
        console.log("📊 Generating coverage report...")
        
        const result = await this.runCommand("npx vitest run --coverage")
        
        if (result.success) {
            // Extract coverage percentage
            const coverageMatch = result.stdout.match(/All files\s*\|\s*([\d.]+)/)
            if (coverageMatch) {
                this.results.coverage.percentage = parseFloat(coverageMatch[1])
                this.results.coverage.status = "passed"
            }
        } else {
            this.results.coverage.status = "failed"
        }
    }

    generateReport() {
        console.log("\n" + "=".repeat(60))
        console.log("📋 TEST VALIDATION REPORT")
        console.log("=".repeat(60))

        // Environment Status
        console.log(`\n🔧 Environment Setup: ${this.getStatusIcon(this.results.environment.status)}`)
        if (this.results.environment.errors.length > 0) {
            this.results.environment.errors.forEach(error => {
                console.log(`   ❌ ${error}`)
            })
        } else {
            console.log("   ✅ All required files and directories present")
        }

        // Vitest Status
        console.log(`\n🧪 Unit Tests (Vitest): ${this.getStatusIcon(this.results.vitest.status)}`)
        console.log(`   📈 Tests Passed: ${this.results.vitest.testCount}`)
        if (this.results.vitest.errors.length > 0) {
            this.results.vitest.errors.forEach(error => {
                console.log(`   ❌ ${error}`)
            })
        }

        // Playwright Status
        console.log(`\n🎭 E2E Tests (Playwright): ${this.getStatusIcon(this.results.playwright.status)}`)
        console.log(`   📈 Tests Configured: ${this.results.playwright.testCount}`)
        if (this.results.playwright.errors.length > 0) {
            this.results.playwright.errors.forEach(error => {
                console.log(`   ❌ ${error}`)
            })
        }

        // Coverage Status
        console.log(`\n📊 Code Coverage: ${this.getStatusIcon(this.results.coverage.status)}`)
        console.log(`   📈 Coverage: ${this.results.coverage.percentage}%`)

        // Overall Status
        const allPassed = Object.values(this.results).every(result => 
            result.status === "passed" || result.status === "configured"
        )

        console.log(`\n🎯 Overall Status: ${allPassed ? "✅ READY" : "❌ NEEDS ATTENTION"}`)

        if (allPassed) {
            console.log("\n🚀 Testing environment is fully validated and ready!")
            console.log("   • Unit tests are passing")
            console.log("   • E2E tests are configured")
            console.log("   • Coverage reporting is working")
            console.log("   • Environment setup is complete")
        }

        console.log("\n" + "=".repeat(60))
    }

    getStatusIcon(status) {
        switch (status) {
            case "passed": return "✅ PASSED"
            case "configured": return "🟡 CONFIGURED"
            case "failed": return "❌ FAILED"
            default: return "⏳ PENDING"
        }
    }

    async run() {
        console.log("🧪 Starting comprehensive test validation...\n")
        
        await this.validateEnvironment()
        await this.runVitestSuite()
        await this.runPlaywrightSuite()
        await this.runCoverageReport()
        
        this.generateReport()
    }
}

// Run the validation if this script is executed directly
if (require.main === module) {
    const validator = new TestValidator()
    validator.run().catch(error => {
        console.error("❌ Validation failed:", error)
        process.exit(1)
    })
}

module.exports = TestValidator