# Public Interface (public) - CLAUDE.md

This document provides detailed guidance for the Offshore Rapport v5 Public Interface.

## Component Purpose

The Public Interface serves as the front-facing website for Offshore Rapport, presenting maritime industry content to readers in an engaging, accessible format. It focuses on content discovery, readability, and user experience while maintaining optimal performance across devices.

## Key Subsystems

1. **Content Display**: Renders articles, news, and reports
2. **Navigation**: Category browsing and content discovery
3. **Search**: Content search and filtering
4. **Responsiveness**: Adaptive layout for all devices
5. **Performance**: Optimized loading and rendering
6. **Accessibility**: WCAG-compliant accessible interface

## Integration Points

The Public Interface connects with:

- **Public API**: Retrieves content and category data
- **Content Loader**: Dynamically loads and renders content
- **Markdown Renderer**: Formats content for display
- **Image Optimization**: Handles responsive images
- **Search System**: Enables content discovery
- **Analytics**: Tracks user engagement and content performance
- **CSS System**: Provides responsive styling and theming

## Error Handling & Logging

The Public Interface should implement comprehensive error handling to ensure a smooth user experience:

1. **Content Loading Errors**:
   - Handle API failures gracefully with fallback content
   - Implement retry mechanisms for transient failures
   - Display user-friendly error messages
   - Log format: `CONTENT_ERROR: {timestamp} | {content_id} | {error_type} | {error_details}`

2. **Rendering Errors**:
   - Detect and handle malformed content
   - Provide fallbacks for unsupported content types
   - Manage template rendering exceptions
   - Log format: `RENDER_ERROR: {timestamp} | {content_id} | {template} | {error_details}`

3. **Navigation Errors**:
   - Handle invalid routes and URLs
   - Implement 404 pages for missing content
   - Redirect legacy URLs appropriately
   - Log format: `NAVIGATION_ERROR: {timestamp} | {requested_path} | {referrer} | {error_details}`

4. **Resource Loading Errors**:
   - Track failed asset loading (images, scripts, styles)
   - Implement fallbacks for critical resources
   - Monitor performance bottlenecks
   - Log format: `RESOURCE_ERROR: {timestamp} | {resource_url} | {resource_type} | {error_details}`

5. **Client-Side Exceptions**:
   - Catch and log JavaScript runtime errors
   - Report browser compatibility issues
   - Monitor for DOM manipulation failures
   - Log format: `CLIENT_ERROR: {timestamp} | {error_message} | {stack_trace} | {browser_info}`

## Design Principles

1. **Content First**: Prioritize readable, accessible content
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Mobile First**: Design for mobile, then enhance for larger screens
4. **Performance Focus**: Fast loading, minimal JavaScript, optimized assets
5. **Accessibility**: WCAG 2.1 AA compliance throughout
6. **Brand Consistency**: Align with maritime industry aesthetics

## Implementation Details

### Directory Structure

```
/public
├── index.html             # Main entry point
├── assets/                # Static assets
│   ├── icons/             # SVG icons and favicons
│   ├── images/            # Site images and graphics
│   └── fonts/             # Web fonts
├── css/                   # Stylesheets
│   ├── content-styles.css # Content styling
│   ├── layout.css         # Page layout
│   ├── navigation.css     # Navigation components
│   └── responsive.css     # Responsive breakpoints
└── js/                    # JavaScript modules
    ├── content-loader.js  # Content loading and display
    ├── search.js          # Search functionality
    ├── navigation.js      # Navigation behavior
    └── utils/             # Shared utilities
        ├── markdown.js    # Markdown rendering
        ├── analytics.js   # Usage tracking
        ├── error-handler.js # Error handling
        └── accessibility.js # Accessibility enhancements
```

### Content Loader Implementation

The content loader handles fetching and rendering content:

```javascript
/**
 * Content Loader for Offshore Rapport Public Interface
 * Handles fetching and rendering content from the API
 */
const contentLoader = (function() {
  // Configuration
  const API_BASE = '/api/public';
  const CONTENT_CONTAINER = '#content-container';
  const CONTENT_TEMPLATE = '#content-template';
  const ERROR_TEMPLATE = '#error-template';
  const LOADING_CLASS = 'is-loading';
  
  // State
  let currentContentId = null;
  let currentCategory = null;
  let isLoading = false;
  
  // DOM Elements
  const contentContainer = document.querySelector(CONTENT_CONTAINER);
  const contentTemplate = document.querySelector(CONTENT_TEMPLATE);
  
  /**
   * Initialize the content loader
   */
  function init() {
    // Set up error handling
    window.addEventListener('error', handleGlobalError);
    
    // Set up navigation event listeners
    document.addEventListener('click', handleNavigation);
    
    // Check for initial content ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const category = urlParams.get('category');
    
    if (contentId) {
      loadContent(contentId);
    } else if (category) {
      loadCategory(category);
    } else {
      loadLatestContent();
    }
  }
  
  /**
   * Handle global JavaScript errors
   */
  function handleGlobalError(event) {
    // Log error to console
    console.error('Unhandled error:', event.error || event.message);
    
    // Log to server if possible
    try {
      const errorData = {
        type: 'client_error',
        message: event.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      fetch('/api/public/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(e => console.error('Error logging failed:', e));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
    
    return true; // Allow default error handler to run
  }
  
  /**
   * Handle navigation clicks
   */
  function handleNavigation(event) {
    // Find closest link element
    const link = event.target.closest('a');
    
    // Ignore if not a link or if modifier key pressed
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    
    // Check if it's a content link
    const contentId = link.dataset.contentId;
    const category = link.dataset.category;
    
    if (contentId) {
      event.preventDefault();
      loadContent(contentId);
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('id', contentId);
      url.searchParams.delete('category');
      window.history.pushState({}, '', url);
    } else if (category) {
      event.preventDefault();
      loadCategory(category);
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('category', category);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url);
    }
  }
  
  /**
   * Load content by ID
   */
  async function loadContent(contentId) {
    if (isLoading || contentId === currentContentId) return;
    
    try {
      setLoading(true);
      currentContentId = contentId;
      
      // Fetch content from API
      const response = await fetch(`${API_BASE}/content/${contentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to load content');
      }
      
      renderContent(data.data);
      
      // Track page view
      if (window.analytics) {
        window.analytics.trackPageView(data.data.title, contentId);
      }
    } catch (error) {
      console.error('Content loading error:', error);
      renderError(error.message);
      logError('CONTENT_ERROR', {
        content_id: contentId,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Load content by category
   */
  async function loadCategory(category) {
    if (isLoading || category === currentCategory) return;
    
    try {
      setLoading(true);
      currentCategory = category;
      currentContentId = null;
      
      // Fetch content from API
      const response = await fetch(`${API_BASE}/content?category=${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load category: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to load category');
      }
      
      renderCategoryList(data.data, category);
      
      // Update active category in navigation
      document.querySelectorAll('.category-link').forEach(el => {
        el.classList.toggle('active', el.dataset.category === category);
      });
      
      // Track category view
      if (window.analytics) {
        window.analytics.trackCategoryView(category);
      }
    } catch (error) {
      console.error('Category loading error:', error);
      renderError(error.message);
      logError('CATEGORY_ERROR', {
        category: category,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Load latest content
   */
  async function loadLatestContent() {
    try {
      setLoading(true);
      currentContentId = null;
      currentCategory = null;
      
      // Fetch latest content from API
      const response = await fetch(`${API_BASE}/content?latest=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to load latest content: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to load latest content');
      }
      
      renderLatestContent(data.data);
      
      // Track homepage view
      if (window.analytics) {
        window.analytics.trackPageView('Homepage', 'homepage');
      }
    } catch (error) {
      console.error('Latest content loading error:', error);
      renderError(error.message);
      logError('LATEST_CONTENT_ERROR', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Render a single content item
   */
  function renderContent(content) {
    if (!contentContainer || !contentTemplate) {
      console.error('Missing content container or template');
      return;
    }
    
    // Create a clone of the template
    const template = document.importNode(contentTemplate.content, true);
    
    // Fill in the template
    template.querySelector('.content-title').textContent = content.title;
    template.querySelector('.content-category').textContent = content.category;
    template.querySelector('.content-date').textContent = formatDate(content.publishedAt);
    
    // Render markdown content
    const contentBody = template.querySelector('.content-body');
    if (window.markdownRenderer) {
      contentBody.innerHTML = window.markdownRenderer.render(content.content);
    } else {
      contentBody.textContent = content.content;
    }
    
    // Set heading for SEO
    document.title = `${content.title} - Offshore Rapport`;
    
    // Clear and append
    contentContainer.innerHTML = '';
    contentContainer.appendChild(template);
    
    // Enhance with syntax highlighting if available
    if (window.highlightCode && contentBody.querySelectorAll('pre code').length > 0) {
      window.highlightCode();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  /**
   * Render a list of content for a category
   */
  function renderCategoryList(contentList, category) {
    if (!contentContainer) {
      console.error('Missing content container');
      return;
    }
    
    // Capitalize category name
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Create category header
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `<h1>${categoryTitle}</h1>`;
    
    // Create content list
    const list = document.createElement('div');
    list.className = 'content-list';
    
    // Populate list
    if (contentList && contentList.length > 0) {
      contentList.forEach(item => {
        const card = document.createElement('article');
        card.className = 'content-card';
        card.innerHTML = `
          <h2 class="card-title">
            <a href="?id=${item.id}" data-content-id="${item.id}">${item.title}</a>
          </h2>
          <div class="card-meta">
            <span class="card-date">${formatDate(item.publishedAt)}</span>
          </div>
          <div class="card-excerpt">${getExcerpt(item.content, 150)}</div>
          <a href="?id=${item.id}" class="card-read-more" data-content-id="${item.id}">Read more</a>
        `;
        list.appendChild(card);
      });
    } else {
      list.innerHTML = '<div class="empty-state">No content available for this category.</div>';
    }
    
    // Set page title
    document.title = `${categoryTitle} - Offshore Rapport`;
    
    // Clear and append
    contentContainer.innerHTML = '';
    contentContainer.appendChild(header);
    contentContainer.appendChild(list);
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  /**
   * Render the latest content (homepage)
   */
  function renderLatestContent(contentList) {
    if (!contentContainer) {
      console.error('Missing content container');
      return;
    }
    
    // Create feature section for first item if available
    const container = document.createElement('div');
    container.className = 'homepage-content';
    
    if (contentList && contentList.length > 0) {
      // Featured article (first item)
      const featured = contentList[0];
      const featuredSection = document.createElement('section');
      featuredSection.className = 'featured-content';
      featuredSection.innerHTML = `
        <article class="featured-article">
          <h2 class="featured-title">
            <a href="?id=${featured.id}" data-content-id="${featured.id}">${featured.title}</a>
          </h2>
          <div class="featured-meta">
            <span class="featured-category">${featured.category}</span>
            <span class="featured-date">${formatDate(featured.publishedAt)}</span>
          </div>
          <div class="featured-excerpt">${getExcerpt(featured.content, 250)}</div>
          <a href="?id=${featured.id}" class="featured-read-more" data-content-id="${featured.id}">Read full article</a>
        </article>
      `;
      container.appendChild(featuredSection);
      
      // Recent articles (rest of items)
      if (contentList.length > 1) {
        const recentSection = document.createElement('section');
        recentSection.className = 'recent-content';
        recentSection.innerHTML = '<h2>Recent Updates</h2>';
        
        const recentList = document.createElement('div');
        recentList.className = 'recent-list';
        
        contentList.slice(1).forEach(item => {
          const card = document.createElement('article');
          card.className = 'recent-card';
          card.innerHTML = `
            <h3 class="recent-title">
              <a href="?id=${item.id}" data-content-id="${item.id}">${item.title}</a>
            </h3>
            <div class="recent-meta">
              <span class="recent-category">${item.category}</span>
              <span class="recent-date">${formatDate(item.publishedAt)}</span>
            </div>
            <div class="recent-excerpt">${getExcerpt(item.content, 100)}</div>
          `;
          recentList.appendChild(card);
        });
        
        recentSection.appendChild(recentList);
        container.appendChild(recentSection);
      }
    } else {
      container.innerHTML = '<div class="empty-state">No content available at this time.</div>';
    }
    
    // Set page title
    document.title = 'Offshore Rapport - Maritime Intelligence';
    
    // Clear and append
    contentContainer.innerHTML = '';
    contentContainer.appendChild(container);
  }
  
  /**
   * Render an error message
   */
  function renderError(message) {
    if (!contentContainer) return;
    
    const errorTemplate = document.querySelector(ERROR_TEMPLATE);
    
    if (errorTemplate) {
      const template = document.importNode(errorTemplate.content, true);
      template.querySelector('.error-message').textContent = message || 'An error occurred while loading content.';
      
      contentContainer.innerHTML = '';
      contentContainer.appendChild(template);
    } else {
      contentContainer.innerHTML = `
        <div class="error-container">
          <h2>Something went wrong</h2>
          <p class="error-message">${message || 'An error occurred while loading content.'}</p>
          <button class="error-retry" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }
  
  /**
   * Set loading state
   */
  function setLoading(loading) {
    isLoading = loading;
    
    if (contentContainer) {
      contentContainer.classList.toggle(LOADING_CLASS, loading);
    }
    
    // Show loading indicator if loading takes more than 300ms
    if (loading) {
      const loadingIndicator = document.querySelector('.loading-indicator');
      if (loadingIndicator) {
        setTimeout(() => {
          if (isLoading) {
            loadingIndicator.classList.add('visible');
          }
        }, 300);
      }
    } else {
      const loadingIndicator = document.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.classList.remove('visible');
      }
    }
  }
  
  /**
   * Get an excerpt from content
   */
  function getExcerpt(content, maxLength) {
    if (!content) return '';
    
    // Strip markdown formatting
    let excerpt = content
      .replace(/#+\s+/g, '') // Remove headings
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just the text
      .replace(/!\[([^\]]+)\]\([^)]+\)/g, '') // Remove images
      .replace(/`{1,3}[^`]+`{1,3}/g, '') // Remove code blocks
      .replace(/^\s*>\s*(.*)$/gm, '$1') // Remove blockquotes
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/\n{2,}/g, ' '); // Replace multiple newlines with space
    
    // Truncate to maxLength and add ellipsis if needed
    if (excerpt.length > maxLength) {
      excerpt = excerpt.substring(0, maxLength).trim() + '...';
    }
    
    return excerpt;
  }
  
  /**
   * Format a date string
   */
  function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  }
  
  /**
   * Log an error to the server
   */
  function logError(type, details) {
    console.error(`${type}:`, details);
    
    try {
      fetch('/api/public/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          details,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.error('Error logging failed:', e));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }
  
  // Public API
  return {
    init,
    loadContent,
    loadCategory,
    loadLatestContent
  };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', contentLoader.init);
```

## Rendering Systems

### Markdown Renderer

A lightweight Markdown renderer converts stored content to HTML:

```javascript
/**
 * Simple Markdown renderer for Offshore Rapport
 * Handles basic markdown syntax for content display
 */
const markdownRenderer = (function() {
  // Convert markdown to HTML
  function render(markdown) {
    if (!markdown) return '';
    
    try {
      let html = markdown;
      
      // Paragraphs
      html = html.replace(/\n\s*\n/g, '</p><p>');
      html = '<p>' + html + '</p>';
      
      // Headings
      html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
      html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
      html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
      html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');
      
      // Bold
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
      
      // Italic
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      html = html.replace(/_(.+?)_/g, '<em>$1</em>');
      
      // Links
      html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      
      // Images
      html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" loading="lazy">');
      
      // Lists
      html = html.replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
      
      // Numbered lists
      html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/gms, '<ol>$1</ol>');
      
      // Code blocks
      html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Blockquotes
      html = html.replace(/^\s*>\s*(.*)$/gm, '<blockquote>$1</blockquote>');
      
      // Horizontal rules
      html = html.replace(/^-{3,}$/gm, '<hr>');
      
      // Fix nested elements
      html = html.replace(/<\/p><p><h([1-6])>/g, '</p><h$1>');
      html = html.replace(/<\/h([1-6])><p>/g, '</h$1><p>');
      
      return html;
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return `<p>${markdown}</p>`;
    }
  }
  
  // Public API
  return {
    render
  };
})();

// Expose to window
window.markdownRenderer = markdownRenderer;
```

## Performance Optimizations

1. **Lazy Loading**:
   - Implement intersection observer for lazy loading images
   - Defer non-critical JavaScript
   - Load content on demand

2. **Resource Optimization**:
   - Minify CSS and JavaScript
   - Optimize and compress images
   - Use appropriate image formats (WebP with fallbacks)
   - Implement responsive images with srcset

3. **Critical Path Rendering**:
   - Inline critical CSS
   - Defer non-critical CSS
   - Minimize render-blocking resources

4. **Caching Strategy**:
   - Cache API responses in localStorage or sessionStorage
   - Implement service worker for offline support
   - Set appropriate caching headers

## Accessibility Requirements

1. **Semantic HTML**:
   - Use proper heading structure (h1-h6)
   - Use appropriate ARIA roles
   - Ensure form elements have labels

2. **Keyboard Navigation**:
   - All interactive elements must be keyboard accessible
   - Implement focus management
   - Provide skip links

3. **Screen Readers**:
   - Add alt text for all images
   - Use ARIA attributes where needed
   - Test with screen readers

4. **Color and Contrast**:
   - Maintain 4.5:1 contrast ratio for text
   - Don't rely solely on color for conveying information
   - Test with color blindness simulators

## Browser Compatibility

Ensure support for:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)
- iOS Safari and Chrome (latest versions)
- Android Chrome (latest version)

## Common Development Tasks

### Adding a New Content Type

1. Ensure the API can filter by the new content type
2. Update the navigation to include the new category
3. Consider if custom rendering is needed for the new type
4. Update search to support the new content type

### Implementing Analytics

```javascript
/**
 * Analytics module for Offshore Rapport public site
 */
const analytics = (function() {
  // Configuration
  const TRACKING_ENDPOINT = '/api/public/analytics';
  
  // Track page view
  function trackPageView(title, contentId) {
    sendEvent('pageview', {
      title,
      contentId,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer
    });
  }
  
  // Track category view
  function trackCategoryView(category) {
    sendEvent('categoryview', {
      category,
      path: window.location.pathname + window.location.search
    });
  }
  
  // Track search
  function trackSearch(query, resultCount) {
    sendEvent('search', {
      query,
      resultCount
    });
  }
  
  // Track outbound link click
  function trackOutboundLink(url) {
    sendEvent('outbound', {
      url
    });
  }
  
  // Send event to server
  function sendEvent(eventType, data) {
    try {
      // Add common data
      const eventData = {
        ...data,
        eventType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        language: navigator.language
      };
      
      // Use sendBeacon if available for reliable sending even on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACKING_ENDPOINT, JSON.stringify(eventData));
      } else {
        // Fallback to fetch
        fetch(TRACKING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
          keepalive: true
        }).catch(error => console.error('Analytics error:', error));
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
  
  // Initialize analytics
  function init() {
    // Track initial page load
    trackPageView(document.title, new URLSearchParams(window.location.search).get('id'));
    
    // Track outbound links
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        trackOutboundLink(link.href);
      }
    });
  }
  
  // Public API
  return {
    init,
    trackPageView,
    trackCategoryView,
    trackSearch,
    trackOutboundLink
  };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', analytics.init);

// Expose to window
window.analytics = analytics;
```

## Security Considerations

1. **Content Security Policy**: Implement strict CSP to prevent XSS
2. **Sanitize Content**: Sanitize markdown output to prevent XSS
3. **HTTPS**: Ensure all resources are loaded over HTTPS
4. **Third-Party Scripts**: Minimize and audit third-party dependencies
5. **Client-Side Storage**: Be careful what is stored in localStorage/sessionStorage
6. **Data Validation**: Validate all data before rendering
7. **Resource Integrity**: Use subresource integrity for external scripts

## Monitoring and Error Tracking

1. **Client-Side Logging**: Send important errors to server
2. **Performance Monitoring**: Track loading and rendering times
3. **User Engagement Metrics**: Track scroll depth, time on page
4. **Feature Usage**: Monitor which features are used most
5. **Error Rates**: Track error frequency and types

## Future Enhancements

1. Progressive Web App (PWA) functionality for offline access
2. Enhanced search with filters and suggestions
3. Content recommendation engine based on reading history
4. Reading history and bookmarks for returning users
5. Dark mode and additional theme options
6. Social sharing integration
7. Comments and user feedback system

---

This document serves as a comprehensive guide for working with the Public Interface in Offshore Rapport v5. Refer to it when implementing new features, troubleshooting issues, or enhancing the user experience.