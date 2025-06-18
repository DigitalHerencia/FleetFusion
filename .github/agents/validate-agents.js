#!/usr/bin/env node
/**
 * Agent Configuration Validator
 * Validates FleetFusion agent configurations for consistency and completeness
 * Usage: node .github/agents/validate-agents.js
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname);
const REQUIRED_FIELDS = ['name', 'description', 'version', 'system_prompt', 'patterns', 'metadata'];
const REQUIRED_PATTERNS = ['server_action', 'data_fetcher', 'error_handling', 'component_pattern'];

function validateAgentConfig(agentPath) {
    console.log(`🔍 Validating ${path.basename(agentPath)}...`);
    
    try {
        const config = JSON.parse(fs.readFileSync(agentPath, 'utf8'));
        const errors = [];
        const warnings = [];

        // Check required fields
        REQUIRED_FIELDS.forEach(field => {
            if (!config[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // Check required patterns
        if (config.patterns) {
            REQUIRED_PATTERNS.forEach(pattern => {
                if (!config.patterns[pattern]) {
                    warnings.push(`Missing recommended pattern: ${pattern}`);
                }
            });
        }

        // Validate metadata
        if (config.metadata) {
            if (!config.metadata.workflows || !Array.isArray(config.metadata.workflows)) {
                warnings.push('metadata.workflows should be an array of workflow filenames');
            }
            
            if (!config.metadata.created || !config.metadata.last_updated) {
                warnings.push('metadata should include created and last_updated dates');
            }
        }

        // Check if referenced workflows exist
        if (config.metadata && config.metadata.workflows) {
            config.metadata.workflows.forEach(workflow => {
                const workflowPath = path.join(__dirname, '..', 'workflows', workflow);
                if (!fs.existsSync(workflowPath)) {
                    errors.push(`Referenced workflow not found: ${workflow}`);
                }
            });
        }

        // Check deployment script
        if (config.metadata && config.metadata.deployment_script) {
            const scriptPath = path.join(__dirname, '..', '..', config.metadata.deployment_script);
            if (!fs.existsSync(scriptPath)) {
                errors.push(`Referenced deployment script not found: ${config.metadata.deployment_script}`);
            }
        }

        // Report results
        if (errors.length > 0) {
            console.log(`❌ ${errors.length} error(s) found:`);
            errors.forEach(error => console.log(`   - ${error}`));
        }

        if (warnings.length > 0) {
            console.log(`⚠️  ${warnings.length} warning(s):`);
            warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        if (errors.length === 0 && warnings.length === 0) {
            console.log(`✅ Configuration is valid`);
        }

        return errors.length === 0;

    } catch (error) {
        console.log(`❌ Failed to parse JSON: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('🚛 FleetFusion Agent Configuration Validator\n');

    const agentFiles = fs.readdirSync(AGENTS_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(AGENTS_DIR, file));

    if (agentFiles.length === 0) {
        console.log('❌ No agent configuration files found');
        process.exit(1);
    }

    let allValid = true;
    agentFiles.forEach(agentFile => {
        const isValid = validateAgentConfig(agentFile);
        allValid = allValid && isValid;
        console.log('');
    });

    if (allValid) {
        console.log('🎉 All agent configurations are valid!');
        process.exit(0);
    } else {
        console.log('💥 Some agent configurations have issues. Please fix them before deployment.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateAgentConfig };