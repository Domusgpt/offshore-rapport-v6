/**
 * Content Loader for Offshore Rapport Public Site
 * Loads and displays published content from the API
 */

class ContentLoader {
    constructor() {
        this.articlesContainer = document.getElementById('articles-container');
        this.contentModal = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.activeCategory = null;
        this.articlesPerPage = 6;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the content loader
     */
    init() {
        // Create category filter if it doesn't exist
        if (!document.getElementById('category-filter')) {
            this.createCategoryFilter();
        }
        
        // Create content modal if it doesn't exist
        if (!document.getElementById('content-modal')) {
            this.createContentModal();
        }
        
        // Load initial content
        this.loadContent();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Create the category filter UI
     */
    createCategoryFilter() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'category-filter';
        filterContainer.innerHTML = `
            <div class="container">
                <h3>Explore by Category</h3>
                <div class="category-buttons">
                    <button class="category-btn active" data-category="all">All</button>
                    <button class="category-btn" data-category="maritime">Maritime</button>
                    <button class="category-btn" data-category="technology">Technology</button>
                    <button class="category-btn" data-category="offshore">Offshore</button>
                    <button class="category-btn" data-category="environment">Environment</button>
                </div>
            </div>
        `;
        
        // Insert after the hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection && heroSection.parentNode) {
            heroSection.parentNode.insertBefore(filterContainer, heroSection.nextSibling);
        }
    }
    
    /**
     * Create the content modal for article viewing
     */
    createContentModal() {
        const modal = document.createElement('div');
        modal.id = 'content-modal';
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="content-modal-container">
                <div class="content-modal-header">
                    <h2 class="content-modal-title"></h2>
                    <button class="content-modal-close">&times;</button>
                </div>
                <div class="content-modal-content">
                    <div class="content-modal-meta">
                        <span class="content-category"></span>
                        <span class="content-date"></span>
                        <span class="content-reading-time"></span>
                    </div>
                    <div class="content-modal-body markdown-content"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close event
        modal.querySelector('.content-modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
        
        this.contentModal = modal;
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Category filter buttons
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Update active category
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.activeCategory = button.dataset.category === 'all' ? null : button.dataset.category;
                this.currentPage = 1;
                this.loadContent();
            });
        });
        
        // Content card click event delegation
        if (this.articlesContainer) {
            this.articlesContainer.addEventListener('click', (e) => {
                const articleCard = e.target.closest('.article-card');
                if (articleCard && articleCard.dataset.id) {
                    this.viewArticle(articleCard.dataset.id);
                }
            });
        }
    }
    
    /**
     * Load content from the API
     */
    async loadContent() {
        if (!this.articlesContainer) return;
        
        // Show loading state
        this.articlesContainer.innerHTML = `
            <div class="loading">
                <div class="wave-loading">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p>Loading latest articles...</p>
            </div>
        `;
        
        try {
            // Construct query parameters
            const params = new URLSearchParams();
            params.append('page', this.currentPage);
            params.append('limit', this.articlesPerPage);
            
            if (this.activeCategory) {
                params.append('category', this.activeCategory);
            }
            
            // Fetch content from API
            const response = await fetch(`/api/content?${params.toString()}`);
            const data = await response.json();
            
            if (!data || !data.content || data.content.length === 0) {
                this.articlesContainer.innerHTML = `
                    <div class="empty-content">
                        <p>No articles found. Check back soon for new content!</p>
                    </div>
                `;
                return;
            }
            
            // Update pagination info
            if (data.pagination) {
                this.totalPages = data.pagination.pages;
            }
            
            // Render content
            this.renderArticles(data.content);
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.articlesContainer.innerHTML = `
                <div class="error-content">
                    <p>Sorry, we couldn't load the latest articles. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Render articles in the container
     */
    renderArticles(articles) {
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            this.articlesContainer.innerHTML = `
                <div class="empty-content">
                    <p>No articles found. Check back soon for new content!</p>
                </div>
            `;
            return;
        }

        const articlesHTML = articles.map(article => this.createArticleCard(article)).join('');

        this.articlesContainer.innerHTML = `
            <div class="articles">
                ${articlesHTML}
            </div>
        `;
    }
    
    /**
     * Create HTML for an article card
     */
    createArticleCard(article) {
        if (!article || !article.id) {
            console.error('Invalid article data:', article);
            return '';
        }

        // Create excerpt from content (handle null content)
        const excerpt = this.createExcerpt(article.content || article.excerpt, 150);

        // Format date (handle missing dates)
        const formattedDate = this.formatDate(article.publishedAt || article.createdAt);

        // Calculate reading time (handle missing content)
        const readingTime = article.readingTime ||
            this.calculateReadingTime(article.content || '');

        // Handle missing category
        const category = article.category || 'Uncategorized';

        // Handle missing title
        const title = article.title || 'Untitled Article';

        return `
            <div class="article-card" data-id="${article.id}">
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-category">${category}</span>
                        <span class="article-date">${formattedDate}</span>
                    </div>
                    <h3 class="article-title">${title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-footer">
                        <span class="reading-time">${readingTime} min read</span>
                        <button class="btn btn-primary">Read More</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render pagination controls
     */
    renderPagination() {
        if (this.totalPages <= 1) return;
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn prev ${this.currentPage === 1 ? 'disabled' : ''}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                &laquo; Previous
            </button>
        `;
        
        // Page buttons
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn page ${i === this.currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn next ${this.currentPage === this.totalPages ? 'disabled' : ''}"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Next &raquo;
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners
        paginationContainer.querySelectorAll('.pagination-btn.page').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.dataset.page);
                this.loadContent();
            });
        });
        
        paginationContainer.querySelector('.pagination-btn.prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadContent();
            }
        });
        
        paginationContainer.querySelector('.pagination-btn.next').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadContent();
            }
        });
        
        // Append to container
        this.articlesContainer.appendChild(paginationContainer);
    }
    
    /**
     * View a single article
     */
    async viewArticle(articleId) {
        if (!articleId) {
            console.error('No article ID provided');
            return;
        }

        try {
            const response = await fetch(`/api/content/${articleId}`);

            // Check for HTTP errors
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API error (${response.status}):`, errorText);
                alert(`Sorry, we couldn't load the article (${response.status}).`);
                return;
            }

            const data = await response.json();

            if (!data || !data.content) {
                console.error('Invalid response format:', data);
                alert('Sorry, the article could not be found.');
                return;
            }

            const article = data.content;

            // Populate modal with fallbacks for missing data
            const titleElement = this.contentModal.querySelector('.content-modal-title');
            titleElement.textContent = article.title || 'Untitled Article';

            const categoryElement = this.contentModal.querySelector('.content-category');
            categoryElement.textContent = article.category || 'Uncategorized';

            const dateElement = this.contentModal.querySelector('.content-date');
            dateElement.textContent = this.formatDate(article.publishedAt || article.createdAt);

            const readingTimeElement = this.contentModal.querySelector('.content-reading-time');
            const readingTime = article.readingTime || this.calculateReadingTime(article.content || '');
            readingTimeElement.textContent = `${readingTime} min read`;

            // Render markdown content with fallback
            const contentElement = this.contentModal.querySelector('.content-modal-body');
            contentElement.innerHTML = article.content
                ? this.renderMarkdown(article.content)
                : '<p>No content available for this article.</p>';

            // Show modal
            this.contentModal.classList.add('active');
            document.body.classList.add('modal-open');
            
            // Record interaction (note: view is already recorded by the server)
            this.recordInteraction(articleId, 'readMore');
            
            // Set up scroll tracking for engagement
            this.setupScrollTracking(articleId, contentElement);

        } catch (error) {
            console.error('Error loading article:', error);
            alert('Sorry, we couldn\'t load the article. Please try again later.');
        }
    }
    
    /**
     * Record content interaction
     */
    async recordInteraction(contentId, interactionType, data = {}) {
        if (!contentId || !interactionType) {
            return;
        }
        
        try {
            // Get or create session ID
            const sessionId = this.getSessionId();
            
            // Prepare interaction data
            const interactionData = {
                sessionId,
                deviceType: this.getDeviceType(),
                timestamp: new Date().toISOString(),
                ...data
            };
            
            // Send interaction to analytics API
            fetch(`/api/analytics/interaction/${contentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: interactionType,
                    data: interactionData
                })
            }).catch(err => {
                console.error(`Error recording interaction: ${err.message}`);
            });
        } catch (error) {
            console.error('Error recording interaction:', error);
        }
    }
    
    /**
     * Get or create a session ID
     */
    getSessionId() {
        // Get existing session ID from localStorage
        let sessionId = localStorage.getItem('session_id');
        
        // If no session ID exists, create one
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('session_id', sessionId);
        }
        
        return sessionId;
    }
    
    /**
     * Get device type based on screen size
     */
    getDeviceType() {
        const width = window.innerWidth;
        
        if (width < 768) {
            return 'mobile';
        } else if (width < 1024) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    /**
     * Set up scroll tracking for content engagement
     */
    setupScrollTracking(contentId, contentElement) {
        if (!contentId || !contentElement) return;
        
        // Get content height
        const contentHeight = contentElement.scrollHeight;
        
        // Track read milestones (25%, 50%, 75%, 100%)
        const milestones = [0.25, 0.5, 0.75, 1.0];
        const reachedMilestones = new Set();
        
        // Track start time
        const startTime = Date.now();
        
        // Add scroll listener to modal
        const modalContainer = this.contentModal.querySelector('.content-modal-container');
        
        const scrollHandler = () => {
            // Calculate scroll percentage
            const scrollPosition = modalContainer.scrollTop + modalContainer.clientHeight;
            const scrollPercentage = Math.min(scrollPosition / contentHeight, 1);
            
            // Check milestones
            milestones.forEach(milestone => {
                if (scrollPercentage >= milestone && !reachedMilestones.has(milestone)) {
                    reachedMilestones.add(milestone);
                    
                    // Record milestone reached
                    this.recordInteraction(contentId, 'scroll', {
                        milestone: milestone * 100,
                        readTime: Math.round((Date.now() - startTime) / 1000),
                        scrollPercentage: Math.round(scrollPercentage * 100)
                    });
                }
            });
        };
        
        // Debounce scroll events
        let scrollTimeout;
        modalContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(scrollHandler, 200);
        });
        
        // Track leaving the article
        const closeHandler = () => {
            // Calculate total read time in seconds
            const readTime = Math.round((Date.now() - startTime) / 1000);
            
            // Record read time if article was open for at least 5 seconds
            if (readTime >= 5) {
                this.recordInteraction(contentId, 'read', {
                    readTime,
                    milestoneReached: Math.max(...Array.from(reachedMilestones), 0) * 100
                });
            }
            
            // Clean up event listeners
            this.contentModal.querySelector('.content-modal-close').removeEventListener('click', closeHandler);
            modalContainer.removeEventListener('scroll', scrollHandler);
        };
        
        // Add event listener for article close
        this.contentModal.querySelector('.content-modal-close').addEventListener('click', closeHandler);
    }
    
    /**
     * Create an excerpt from content
     */
    createExcerpt(content, maxLength = 150) {
        // Handle null or undefined content
        if (!content) {
            return 'No content available';
        }

        // Remove markdown formatting
        let plainText = content
            .replace(/#+\s+(.*)/g, '$1') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
            .replace(/!\[(.*?)\]\(.*?\)/g, '') // Remove images
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/>\s+(.*)/g, '$1') // Remove blockquotes
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

        // Create excerpt
        if (plainText.length > maxLength) {
            plainText = plainText.substring(0, maxLength) + '...';
        }

        return plainText;
    }
    
    /**
     * Format a date
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
    
    /**
     * Calculate reading time for content
     */
    calculateReadingTime(content) {
        // Handle null or empty content
        if (!content) {
            return 1; // Default to 1 minute for empty content
        }

        // Average reading speed: 200 words per minute
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.ceil(wordCount / 200);
        return minutes < 1 ? 1 : minutes;
    }
    
    /**
     * Basic markdown renderer
     * For a production site, use a proper markdown library like marked.js
     */
    renderMarkdown(markdownText) {
        // This is a basic implementation; for production, use a proper library
        return markdownText
            // Headers
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
            
            // Bold and italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Lists
            .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
            .replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>')
            
            // Links and images
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
            
            // Blockquotes
            .replace(/^>\s+(.*$)/gm, '<blockquote>$1</blockquote>')
            
            // Paragraphs (after other replacements)
            .replace(/^(?!<[hou][1-6l]|<blockquote)(.*$)/gm, function(match) {
                return match.trim() ? '<p>' + match + '</p>' : '';
            })
            
            // Line breaks
            .replace(/\n/g, '<br>');
    }
}

// Initialize the content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
});