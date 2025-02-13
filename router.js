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
                // Wait for Firebase to initialize and load facts
                this.waitForFacts(factId);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            const factId = this.getFactIdFromUrl();
            if (factId) {
                this.loadSpecificFact(factId);
            } else {
                // If no factId in URL, show the first fact
                if (window.facts && window.facts.length > 0) {
                    window.showFact(0);
                }
            }
        });
    }

    waitForFacts(factId) {
        const maxAttempts = 10;
        let attempts = 0;

        const checkFacts = () => {
            if (window.facts && window.facts.length > 0) {
                this.loadSpecificFact(factId);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkFacts, 500);
            }
        };

        checkFacts();
    }

    getFactIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/fact\/([A-Z0-9]+)/i);
        return match ? match[1].toUpperCase() : null;
    }

    loadSpecificFact(factId) {
        // Try to find the fact in the loaded facts array
        const facts = window.facts;
        if (facts && facts.length > 0) {
            const factIndex = facts.findIndex(fact => fact.id === factId);
            if (factIndex !== -1) {
                window.showFact(factIndex);
                return;
            }
        }

        // If fact not found, show notification
        if (window.showNotification) {
            window.showNotification('Fact not found. Please check the FactID and try again.');
        }
    }

    updateUrl(factId) {
        if (!factId) return;
        const newUrl = `/fact/${factId}`;
        const currentPath = window.location.pathname;
        if (currentPath !== newUrl) {
            window.history.pushState({ factId }, '', newUrl);
        }
    }
}

// Initialize router
const factRouter = new FactRouter();

// Make router available globally
window.factRouter = factRouter;
