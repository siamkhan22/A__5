// Emergency Services App Functionality
class EmergencyApp {
    constructor() {
        this.callHistory = JSON.parse(localStorage.getItem('callHistory')) || [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.heartCount = parseInt(localStorage.getItem('heartCount')) || 0;
        this.copyCount = parseInt(localStorage.getItem('copyCount')) || 2;
        this.coinCount = parseInt(localStorage.getItem('coinCount')) || 100;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCallHistory();
        this.updateFavorites();
        this.updateNavbarCounts();
    }

    bindEvents() {
        // Call buttons
        document.querySelectorAll('button:contains("Call")').forEach(btn => {
            if (btn.textContent.includes('Call')) {
                btn.addEventListener('click', (e) => this.handleCall(e));
            }
        });

        // Copy buttons
        document.querySelectorAll('button:contains("Copy")').forEach(btn => {
            if (btn.textContent.includes('Copy')) {
                btn.addEventListener('click', (e) => this.handleCopy(e));
            }
        });

        // Favorite buttons
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('♡')) {
                btn.addEventListener('click', (e) => this.toggleFavorite(e));
            }
        });

        // Clear history button
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Clear')) {
                btn.addEventListener('click', () => this.clearHistory());
            }
        });
    }

    handleCall(e) {
        const card = e.target.closest('.bg-white');
        const number = card.querySelector('.text-2xl').textContent.trim();
        const serviceName = card.querySelector('h3').textContent.trim();
        
        // Check if enough coins
        if (this.coinCount < 20) {
            alert('Insufficient coins! You need at least 20 coins to make a call.');
            return;
        }
        
        // Show call confirmation
        if (confirm(`Call ${serviceName} at ${number}?\nThis will cost 20 coins.`)) {
            // Deduct coins
            this.coinCount -= 20;
            localStorage.setItem('coinCount', this.coinCount.toString());
            
            // Add to call history
            this.addToHistory(serviceName, number);
            
            // Update navbar
            this.updateNavbarCounts();
            
            // Show success alert
            alert(`Calling ${serviceName} at ${number}...`);
        }
    }

    handleCopy(e) {
        const card = e.target.closest('.bg-white');
        const number = card.querySelector('.text-2xl').textContent.trim();
        const serviceName = card.querySelector('h3').textContent.trim();
        
        navigator.clipboard.writeText(number).then(() => {
            this.copyCount++;
            localStorage.setItem('copyCount', this.copyCount.toString());
            this.updateNavbarCounts();
            alert(`${serviceName} number ${number} copied to clipboard!`);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = number;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.copyCount++;
            localStorage.setItem('copyCount', this.copyCount.toString());
            this.updateNavbarCounts();
            alert(`${serviceName} number ${number} copied to clipboard!`);
        });
    }

    toggleFavorite(e) {
        const card = e.target.closest('.bg-white');
        const serviceName = card.querySelector('h3').textContent.trim();
        const number = card.querySelector('.text-2xl').textContent.trim();
        
        const favoriteIndex = this.favorites.findIndex(fav => fav.number === number);
        
        if (favoriteIndex > -1) {
            this.favorites.splice(favoriteIndex, 1);
            e.target.textContent = '♡';
            e.target.classList.remove('text-red-500');
            e.target.classList.add('text-gray-400');
            this.heartCount = Math.max(0, this.heartCount - 1);
        } else {
            this.favorites.push({ serviceName, number });
            e.target.textContent = '♥';
            e.target.classList.remove('text-gray-400');
            e.target.classList.add('text-red-500');
            this.heartCount++;
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        localStorage.setItem('heartCount', this.heartCount.toString());
        this.updateNavbarCounts();
    }

    addToHistory(serviceName, number) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const historyItem = {
            serviceName,
            number,
            time: timeString,
            timestamp: now.getTime()
        };
        
        // Add to beginning of array
        this.callHistory.unshift(historyItem);
        
        // Keep only last 10 calls
        this.callHistory = this.callHistory.slice(0, 10);
        
        localStorage.setItem('callHistory', JSON.stringify(this.callHistory));
        this.renderCallHistory();
        this.showNewIndicator();
    }

    renderCallHistory() {
        const historyList = document.getElementById('callHistoryList');
        if (!historyList) return;
        
        if (this.callHistory.length === 0) {
            historyList.innerHTML = '<div class="p-4 text-center text-gray-500">No call history</div>';
            return;
        }
        
        const historyHTML = this.callHistory.map(item => `
            <div class="call-history-item p-3 border-b flex items-center justify-between hover:bg-gray-50">
                <div>
                    <div class="font-semibold">${item.serviceName}</div>
                    <div class="text-sm text-gray-500">${item.number}</div>
                </div>
                <div class="text-sm text-gray-500">${item.time}</div>
            </div>
        `).join('');
        
        historyList.innerHTML = historyHTML;
    }

    clearHistory() {
        if (confirm('Clear all call history?')) {
            this.callHistory = [];
            localStorage.removeItem('callHistory');
            this.renderCallHistory();
            this.showToast('Call history cleared!');
        }
    }

    updateFavorites() {
        document.querySelectorAll('.bg-white.rounded-lg.p-4.shadow-sm').forEach(card => {
            const number = card.querySelector('.text-2xl')?.textContent.trim();
            const favoriteBtn = card.querySelector('button[class*="text-gray-400"]');
            
            if (number && favoriteBtn && this.favorites.some(fav => fav.number === number)) {
                favoriteBtn.textContent = '♥';
                favoriteBtn.classList.remove('text-gray-400');
                favoriteBtn.classList.add('text-red-500');
            }
        });
    }

    updateNavbarCounts() {
        const heartCountEl = document.getElementById('heartCount');
        const copyCountEl = document.getElementById('copyCount');
        const coinCountEl = document.getElementById('coinCount');
        
        if (heartCountEl) heartCountEl.textContent = this.heartCount;
        if (copyCountEl) copyCountEl.textContent = `${this.copyCount} Copy`;
        if (coinCountEl) coinCountEl.textContent = this.coinCount;
    }

    showNewIndicator() {
        const newIndicator = document.getElementById('newIndicator');
        if (newIndicator) {
            newIndicator.style.display = 'inline-block';
            setTimeout(() => {
                newIndicator.style.display = 'none';
            }, 3000);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Helper function to select elements by text content
HTMLElement.prototype.querySelector = function(selector) {
    if (selector.includes(':contains(')) {
        const text = selector.match(/contains\("([^"]+)"\)/)[1];
        return Array.from(this.querySelectorAll('button')).find(el => 
            el.textContent.includes(text)
        );
    }
    return Element.prototype.querySelector.call(this, selector);
};

document.querySelectorAll = function(selector) {
    if (selector.includes(':contains(')) {
        const text = selector.match(/contains\("([^"]+)"\)/)[1];
        return Array.from(document.querySelectorAll('button')).filter(el => 
            el.textContent.includes(text)
        );
    }
    return Document.prototype.querySelectorAll.call(this, selector);
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmergencyApp();
});