class FactRouter {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('DOMContentLoaded', () => {
            const factId = this.getFactIdFromUrl();
            if (factId) {
                this.loadSpecificFact(factId);
            }
        });

        window.addEventListener('popstate', () => {
            const factId = this.getFactIdFromUrl();
            if (factId) {
                this.loadSpecificFact(factId);
            }
        });
    }

    getFactIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/fact\/([A-Z0-9]+)/i);
        return match ? match[1].toUpperCase() : null;
    }

    loadSpecificFact(factId) {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-btn');
        
        if (searchInput && searchButton) {
            searchInput.value = factId;
            searchButton.click();
        }
    }

    updateUrl(factId) {
        const newUrl = `/fact/${factId}`;
        window.history.pushState({ factId }, '', newUrl);
    }
}

const factRouter = new FactRouter();

window.factRouter = factRouter;