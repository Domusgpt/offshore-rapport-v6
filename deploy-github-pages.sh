#!/bin/bash
#
# Offshore Rapport v6 GitHub Pages Deployment Script
# 
# This script automates the GitHub Pages deployment process for Offshore Rapport

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration variables
REPO_NAME=${1:-"offshore-rapport-v6"}
GITHUB_USER=${2:-"Domusgpt"}
DEPLOY_DIR="$(pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Color variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Function to print success message
print_success() {
  print_message "${GREEN}" "✅ $1"
}

# Function to print error message
print_error() {
  print_message "${RED}" "❌ $1"
}

# Function to print info message
print_info() {
  print_message "${BLUE}" "ℹ️ $1"
}

# Function to print warning message
print_warning() {
  print_message "${YELLOW}" "⚠️ $1"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
  print_info "Checking prerequisites..."
  
  if ! command_exists gh; then
    print_error "GitHub CLI (gh) is required but not installed."
    print_info "Install it from: https://cli.github.com/"
    exit 1
  fi
  
  if ! command_exists git; then
    print_error "git is required but not installed."
    exit 1
  fi
  
  # Check if logged in to GitHub CLI
  if ! gh auth status &>/dev/null; then
    print_error "You are not logged in to GitHub CLI."
    print_info "Please run 'gh auth login' first."
    exit 1
  fi
  
  print_success "Prerequisites check passed!"
}

# Create GitHub repository if it doesn't exist
create_or_update_repo() {
  print_info "Checking if repository exists..."
  
  if ! gh repo view "${GITHUB_USER}/${REPO_NAME}" &>/dev/null; then
    print_info "Repository doesn't exist. Creating it..."
    
    gh repo create "${GITHUB_USER}/${REPO_NAME}" --public --description "Offshore Rapport v6 - Maritime Industry Content Management Platform" --homepage "https://${GITHUB_USER}.github.io/${REPO_NAME}/"
    
    print_success "Repository created successfully!"
  else
    print_info "Repository already exists: ${GITHUB_USER}/${REPO_NAME}"
  fi
}

# Create or update GitHub workflow file for Pages
setup_github_workflow() {
  print_info "Setting up GitHub Pages workflow..."
  
  # Create .github/workflows directory if it doesn't exist
  mkdir -p "${DEPLOY_DIR}/.github/workflows"
  
  # Create GitHub Pages workflow file
  cat > "${DEPLOY_DIR}/.github/workflows/pages.yml" << EOF
name: GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
EOF
  
  print_success "GitHub Pages workflow created!"
}

# Setup performance optimizations for GitHub Pages
setup_optimizations() {
  print_info "Setting up performance optimizations..."
  
  # Create .nojekyll file to prevent GitHub Pages from running Jekyll
  touch "${DEPLOY_DIR}/.nojekyll"
  
  # Create a robots.txt file
  cat > "${DEPLOY_DIR}/robots.txt" << EOF
User-agent: *
Allow: /

Sitemap: https://${GITHUB_USER}.github.io/${REPO_NAME}/sitemap.xml
EOF
  
  # Create a basic sitemap.xml
  cat > "${DEPLOY_DIR}/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${GITHUB_USER}.github.io/${REPO_NAME}/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://${GITHUB_USER}.github.io/${REPO_NAME}/instructions.html</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${GITHUB_USER}.github.io/${REPO_NAME}/workflow.html</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${GITHUB_USER}.github.io/${REPO_NAME}/sample-content.html</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
EOF
  
  # Create a 404 page if it doesn't exist
  if [ ! -f "${DEPLOY_DIR}/404.html" ]; then
    cat > "${DEPLOY_DIR}/404.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Offshore Rapport</title>
  <link rel="stylesheet" href="css/content-styles.css">
  <style>
    .error-container {
      text-align: center;
      padding: 50px 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .error-code {
      font-size: 120px;
      margin: 0;
      color: #1a5276;
    }
    .error-message {
      font-size: 24px;
      margin: 20px 0;
    }
    .error-description {
      margin-bottom: 30px;
    }
    .error-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #1a5276;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .error-button:hover {
      background-color: #2980b9;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1 class="error-code">404</h1>
    <h2 class="error-message">Page Not Found</h2>
    <p class="error-description">The requested page could not be found. It might have been removed, renamed, or did not exist in the first place.</p>
    <a href="index.html" class="error-button">Return to Home</a>
  </div>
</body>
</html>
EOF
    print_success "Created 404 page"
  fi
  
  print_success "Performance optimizations completed!"
}

# Update or create README.md with deployment instructions
update_readme() {
  print_info "Updating README.md..."
  
  cat > "${DEPLOY_DIR}/README.md" << EOF
# Offshore Rapport v6 Deployment

This directory contains the deployment files for Offshore Rapport v6, a maritime industry content management platform powered by headless Claude.

## GitHub Pages Deployment

The simplest way to deploy the showcase version of Offshore Rapport v6 is using GitHub Pages:

\`\`\`bash
# Make the deployment script executable
chmod +x ./deploy-github-pages.sh

# Run the deployment script (uses default repo name and GitHub username)
./deploy-github-pages.sh

# Or specify custom repo name and GitHub username
./deploy-github-pages.sh your-repo-name your-github-username
\`\`\`

The deployment script will:
1. Check if the GitHub CLI is installed and you're logged in
2. Create or update the GitHub repository
3. Set up the GitHub Pages workflow
4. Push the content to GitHub
5. Enable GitHub Pages for the repository

After deployment, your site will be available at:
\`https://your-github-username.github.io/your-repo-name/\`

## Deployment Structure

This deployment includes:

- \`index.html\` - Main landing page
- \`instructions.html\` - Documentation and instructions
- \`workflow.html\` - Workflow documentation
- \`sample-content.html\` - Sample content showcase
- \`EMAIL_CONTENT_WORKFLOW.md\` - Email-based content generation documentation
- \`chatgpt-content-prompt.md\` - Prompts for ChatGPT-based content generation
- CSS and JavaScript assets

## Content Workflow

Offshore Rapport v6 offers multiple content generation workflows:

1. **Headless Claude Integration** - Autonomous AI-powered content generation
2. **Email-based Content Pipeline** - Generate content via email + ChatGPT
3. **Manual Content Management** - Traditional content creation and editing

See the \`workflow.html\` and \`EMAIL_CONTENT_WORKFLOW.md\` files for detailed workflow documentation.

## Key Features

- Specialized content generation for offshore economics and fisheries
- Automatic scheduled content generation
- Email integration workflow
- ChatGPT-compatible content templates
- Responsive design for all devices
- Accessibility compliance (WCAG 2.1 AA)

## Browser Compatibility

This deployment supports:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)
- iOS Safari and Chrome (latest versions)
- Android Chrome (latest version)

## Performance Optimizations

The deployment includes several performance optimizations:
- Minified CSS and JavaScript
- Optimized images
- Lazy loading for images
- Deferred non-critical JavaScript
- Appropriate caching headers

## Support

For questions or support, please open an issue in the GitHub repository or contact the project maintainer.

---

Made with Headless Claude 🔷
EOF
  
  print_success "README.md updated!"
}

# Push changes to GitHub
push_to_github() {
  print_info "Pushing changes to GitHub..."
  
  # Initialize git repository if needed
  if [ ! -d "${DEPLOY_DIR}/.git" ]; then
    git init
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  fi
  
  # Configure git if needed
  if ! git config user.name > /dev/null; then
    git config user.name "${GITHUB_USER}"
  fi
  
  if ! git config user.email > /dev/null; then
    git config user.email "phillips.paul.email@gmail.com"
  fi
  
  # Add all files
  git add .
  
  # Commit changes
  git commit -m "Deploy to GitHub Pages - ${TIMESTAMP}"
  
  # Push to GitHub
  git push -u origin main --force
  
  print_success "Changes pushed to GitHub!"
}

# Enable GitHub Pages
enable_github_pages() {
  print_info "Enabling GitHub Pages..."
  
  # Check if GitHub Pages is already enabled
  local pages_info
  pages_info=$(gh api "/repos/${GITHUB_USER}/${REPO_NAME}/pages" 2>/dev/null || echo "")
  
  if [ -z "$pages_info" ]; then
    # Enable GitHub Pages using GitHub CLI
    gh api \
      --method POST \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "/repos/${GITHUB_USER}/${REPO_NAME}/pages" \
      -f source='{"branch":"main","path":"/"}'
  fi
  
  # Configure GitHub Pages to use GitHub Actions
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/${GITHUB_USER}/${REPO_NAME}/pages" \
    -f build_type="workflow" || true
  
  print_success "GitHub Pages enabled successfully!"
  print_info "GitHub Pages will be available at: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
}

# Wait for GitHub Pages to be built
wait_for_pages_build() {
  print_info "Waiting for GitHub Pages to build (this might take a few minutes)..."
  
  local retries=0
  local max_retries=12
  local built=false
  
  while [ $retries -lt $max_retries ]; do
    local build_status
    build_status=$(gh api "/repos/${GITHUB_USER}/${REPO_NAME}/pages/builds/latest" 2>/dev/null || echo '{"status":"not_built"}')
    
    if echo "$build_status" | grep -q '"status":"built"'; then
      built=true
      break
    fi
    
    print_info "Still building... (attempt $((retries+1))/$max_retries)"
    retries=$((retries+1))
    sleep 30
  done
  
  if [ "$built" = true ]; then
    print_success "GitHub Pages site is built and available!"
    print_info "Visit: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
  else
    print_warning "GitHub Pages build is taking longer than expected."
    print_info "Check the status manually at: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
    print_info "Once built, your site will be available at: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
  fi
}

# Main deployment process
main() {
  print_info "Starting Offshore Rapport v6 GitHub Pages deployment...\n"
  
  check_prerequisites
  create_or_update_repo
  setup_github_workflow
  setup_optimizations
  update_readme
  push_to_github
  enable_github_pages
  wait_for_pages_build
  
  print_success "\n==== GitHub Pages Deployment Complete! ====\n"
  print_info "Your site is available at: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
  print_info "Repository: https://github.com/${GITHUB_USER}/${REPO_NAME}"
}

# Run the deployment
main "$@"