# Offshore Rapport v6 Deployment

This directory contains the deployment files for Offshore Rapport v6, a maritime industry content management platform powered by headless Claude.

## GitHub Pages Deployment

The simplest way to deploy the showcase version of Offshore Rapport v6 is using GitHub Pages:

```bash
# Make the deployment script executable
chmod +x ./deploy-github-pages.sh

# Run the deployment script (uses default repo name and GitHub username)
./deploy-github-pages.sh

# Or specify custom repo name and GitHub username
./deploy-github-pages.sh your-repo-name your-github-username
```

The deployment script will:
1. Check if the GitHub CLI is installed and you're logged in
2. Create or update the GitHub repository
3. Set up the GitHub Pages workflow
4. Push the content to GitHub
5. Enable GitHub Pages for the repository

After deployment, your site will be available at:
`https://your-github-username.github.io/your-repo-name/`

## Deployment Structure

This deployment includes:

- `index.html` - Main landing page
- `instructions.html` - Documentation and instructions
- `workflow.html` - Workflow documentation
- `sample-content.html` - Sample content showcase
- `EMAIL_CONTENT_WORKFLOW.md` - Email-based content generation documentation
- `chatgpt-content-prompt.md` - Prompts for ChatGPT-based content generation
- CSS and JavaScript assets

## Content Workflow

Offshore Rapport v6 offers multiple content generation workflows:

1. **Headless Claude Integration** - Autonomous AI-powered content generation
2. **Email-based Content Pipeline** - Generate content via email + ChatGPT
3. **Manual Content Management** - Traditional content creation and editing

See the `workflow.html` and `EMAIL_CONTENT_WORKFLOW.md` files for detailed workflow documentation.

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
