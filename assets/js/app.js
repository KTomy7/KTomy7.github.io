class SPAComponentLoader {
    static pageConfig = {
        'home': { title: 'KTomy7 - Home', content: 'pages/home-content.html' },
        'about': { title: 'KTomy7 - About Me', content: 'pages/about-content.html' },
        'projects': { title: 'KTomy7 - Projects', content: 'pages/projects-content.html' }
    };

    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`Failed to load ${componentPath}: ${response.status}`);
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                console.error(`Element with ID ${elementId} not found`);
            }
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }

    static async loadPage(pageName) {
        const config = this.pageConfig[pageName];
        if (config) {
            // Update page title
            document.title = config.title;
            
            // Update URL without page reload
            const newUrl = pageName === 'home' ? 'index.html' : `index.html#${pageName}`;
            window.history.pushState({ page: pageName }, config.title, newUrl);
            
            // Load page-specific content
            await this.loadComponent('main-content', config.content);
            
            // Update active nav link
            this.setActiveNavLink(pageName);
        } else {
            console.error(`Page config not found for: ${pageName}`);
        }
    }

    static setActiveNavLink(currentPage = null) {
        if (!currentPage) {
            // Get current page from URL hash or default to 'home'
            currentPage = window.location.hash.replace('#', '') || 'home';
        }

        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPage = link.getAttribute('data-page');
                if (linkPage === currentPage) {
                    link.classList.add('active');
                }
            });
        }, 100);
    }

    static setupNavigation() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink && navLink.hasAttribute('data-page')) {
                e.preventDefault();
                const page = navLink.getAttribute('data-page');
                this.loadPage(page);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state ? e.state.page : (window.location.hash.replace('#', '') || 'home');
            this.loadPageContent(page);
        });
    }

    static async loadPageContent(pageName) {
        const config = this.pageConfig[pageName];
        if (config) {
            // Update page title
            document.title = config.title;
            
            // Load page-specific content
            await this.loadComponent('main-content', config.content);
            
            // Update active nav link
            this.setActiveNavLink(pageName);
        }
    }

    static getCurrentPage() {
        // Get current page from URL hash or default to 'home'
        return window.location.hash.replace('#', '') || 'home';
    }

    static async init() {
        // Load navbar and footer first
        await Promise.all([
            this.loadComponent('navbar-placeholder', 'components/navbar.html'),
            this.loadComponent('footer-placeholder', 'components/footer.html')
        ]);
        
        // Setup navigation event handlers
        this.setupNavigation();
        
        // Load initial page content
        const currentPage = this.getCurrentPage();
        await this.loadPageContent(currentPage);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SPAComponentLoader.init();
});