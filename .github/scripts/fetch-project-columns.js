#!/usr/bin/env node
/**
 * GitHub Project Column ID Fetcher
 * Fetches project board column IDs for FleetFusion automation workflows
 * 
 * Usage: 
 *   node .github/scripts/fetch-project-columns.js
 * 
 * Requirements:
 *   - GitHub CLI (gh) installed and authenticated
 *   - Repository access to FleetFusion project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'DigitalHerencia';
const REPO_NAME = 'FleetFusion';
const WORKFLOW_FILE = path.join(__dirname, '..', 'workflows', 'project-automation.yml');

// GraphQL query to fetch project board columns
const PROJECT_QUERY = `
query {
  repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
    projectsV2(first: 5) {
      nodes {
        id
        title
        number
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
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
}`;

function checkGHCLI() {
    try {
        execSync('gh --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        console.log('❌ GitHub CLI (gh) is not installed or not available.');
        console.log('Please install it from: https://cli.github.com/');
        return false;
    }
}

function checkAuth() {
    try {
        execSync('gh auth status', { stdio: 'ignore' });
        return true;
    } catch (error) {
        console.log('❌ GitHub CLI is not authenticated.');
        console.log('Please run: gh auth login');
        return false;
    }
}

function fetchProjectData() {
    try {
        console.log('🔍 Fetching project board data...');
        const result = execSync(`gh api graphql -f query='${PROJECT_QUERY}'`, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return JSON.parse(result);
    } catch (error) {
        console.log('❌ Failed to fetch project data:', error.message);
        throw error;
    }
}

function extractColumnIDs(projectData) {
    const projects = projectData.data?.repository?.projectsV2?.nodes || [];
    
    if (projects.length === 0) {
        console.log('❌ No projects found in repository');
        return null;
    }

    console.log(`\n📋 Found ${projects.length} project(s):`);
    
    const columns = {};
    
    projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.title} (#${project.number})`);
        
        const statusField = project.fields.nodes.find(field => 
            field.name && field.name.toLowerCase().includes('status')
        );
        
        if (statusField && statusField.options) {
            console.log('   Status Column Options:');
            statusField.options.forEach(option => {
                console.log(`   - ${option.name}: ${option.id}`);
                
                // Map common column names to our workflow keys
                const name = option.name.toLowerCase();
                if (name.includes('to do') || name === 'todo' || name === 'backlog') {
                    columns.todo = option.id;
                } else if (name.includes('in progress') || name === 'doing' || name === 'active') {
                    columns.inProgress = option.id;
                } else if (name.includes('review') || name === 'reviewing') {
                    columns.review = option.id;
                } else if (name.includes('done') || name === 'completed' || name === 'closed') {
                    columns.done = option.id;
                } else if (name.includes('blocked') || name === 'on hold') {
                    columns.blocked = option.id;
                }
            });
        }
    });
    
    return columns;
}

function generateWorkflowUpdate(columns) {
    console.log('\n🔧 Workflow Configuration Update:');
    console.log('\nReplace the columns object in project-automation.yml with:');
    console.log('\n```yaml');
    console.log('const columns = {');
    
    Object.entries(columns).forEach(([key, value]) => {
        const comment = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        if (value) {
            console.log(`  ${key}: "${value}", // ${comment}`);
        } else {
            console.log(`  ${key}: null, // ${comment} - not found`);
        }
    });
    
    console.log('};');
    console.log('```');
    
    return columns;
}

function updateWorkflowFile(columns) {
    if (!fs.existsSync(WORKFLOW_FILE)) {
        console.log(`❌ Workflow file not found: ${WORKFLOW_FILE}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(WORKFLOW_FILE, 'utf8');
        
        // Find and replace the columns object
        const columnsRegex = /const columns = \{[^}]+\};/s;
        
        let newColumnsObject = 'const columns = {\n';
        Object.entries(columns).forEach(([key, value]) => {
            const comment = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            if (value) {
                newColumnsObject += `                        ${key}: "${value}", // ${comment}\n`;
            } else {
                newColumnsObject += `                        ${key}: null, // ${comment} - not found\n`;
            }
        });
        newColumnsObject += '                      };';
        
        if (columnsRegex.test(content)) {
            content = content.replace(columnsRegex, newColumnsObject);
            fs.writeFileSync(WORKFLOW_FILE, content, 'utf8');
            console.log('\n✅ Workflow file updated successfully!');
            return true;
        } else {
            console.log('\n⚠️  Could not find columns object in workflow file.');
            console.log('Please update manually using the configuration above.');
            return false;
        }
    } catch (error) {
        console.log(`❌ Failed to update workflow file: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('🚛 FleetFusion Project Column ID Fetcher\n');
    
    if (!checkGHCLI() || !checkAuth()) {
        process.exit(1);
    }
    
    try {
        const projectData = fetchProjectData();
        const columns = extractColumnIDs(projectData);
        
        if (!columns || Object.keys(columns).length === 0) {
            console.log('❌ No column mappings could be determined');
            process.exit(1);
        }
        
        generateWorkflowUpdate(columns);
        
        console.log('\n🤔 Would you like to update the workflow file automatically? (y/N)');
        
        // For now, just show the instructions since we can't easily get user input
        console.log('\nTo update automatically, you can modify this script or update manually.');
        console.log(`Workflow file location: ${WORKFLOW_FILE}`);
        
    } catch (error) {
        console.log('💥 Script failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fetchProjectData, extractColumnIDs };