// Save this as router.js
class FactRouter {
    constructor() {
        this.init();
    }

    init() {
        // Check URL when page loads
        window.addEventListener('DOMContentLoaded', () => {
            const factId = this.getFactIdFromUrl();
            if (factId) {
                // Wait a bit for Firebase to initialize and load facts
                setTimeout(() => {
                    this.loadSpecificFact(factId);
                }, 1000);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.factId) {
                this.loadSpecificFact(event.state.factId);
            } else {
                const factId = this.getFactIdFromUrl();
                if (factId) {
                    this.loadSpecificFact(factId);
                }
            }
        });
    }

    getFactIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/fact\/([A-Z0-9]+)/i);
        return match ? match[1].toUpperCase() : null;
    }

    loadSpecificFact(factId) {
        // Try to find the fact in the loaded facts array
        const facts = window.facts; // Access the facts array from main.js
        if (facts && facts.length > 0) {
            const factIndex = facts.findIndex(fact => fact.id === factId);
            if (factIndex !== -1) {
                window.showFact(factIndex); // Call the showFact function from main.js
                return;
            }
        }

        // If we couldn't find the fact, try using the search functionality
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-btn');
        
        if (searchInput && searchButton) {
            searchInput.value = factId;
            searchButton.click();
        }
    }

    updateUrl(factId) {
        if (!factId) return;
        const newUrl = `/fact/${factId}`;
        window.history.pushState({ factId }, '', newUrl);
    }
}

// Initialize router
const factRouter = new FactRouter();

// Make router available globally
window.factRouter = factRouter;