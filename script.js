let coins = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Start app
getCoins();
setInterval(getCoins, 30000);

document.getElementById('search').addEventListener('input', function() {
    showCoins(this.value);
});

document.getElementById('refresh').addEventListener('click', getCoins);

function getCoins() {
    document.getElementById('coins').innerHTML = '<div class="loading">Loading...</div>';
    
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1')
    .then(res => res.json())
    .then(data => {
        coins = data;
        showCoins('');
        updatePortfolio();
    })
    .catch(() => showError('Cannot load coins'));
}

function showCoins(search) {
    let html = '';
    coins.forEach(coin => {
        if (coin.name.toLowerCase().includes(search.toLowerCase()) || 
            coin.symbol.toLowerCase().includes(search.toLowerCase())) {
            
            const isInWatchlist = watchlist.includes(coin.id);
            const changeClass = coin.price_change_percentage_24h >= 0 ? 'up' : 'down';
            
            html += `
                <div class="coin" onclick="toggleWatchlist('${coin.id}')">
                    <div class="name">${coin.name}</div>
                    <div class="symbol">${coin.symbol.toUpperCase()}</div>
                    <div class="price">$${coin.current_price.toLocaleString()}</div>
                    <div class="change ${changeClass}">
                        ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) + '%' : '0.00%'}
                    </div>
                    ${isInWatchlist ? '<div style="color:#00ff88;">In Watchlist</div>' : ''}
                </div>
            `;
        }
    });
    document.getElementById('coins').innerHTML = html || '<p>No coins found</p>';
}

function toggleWatchlist(id) {
    const index = watchlist.indexOf(id);
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(id);
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    showWatchlist();
    updatePortfolio();
    showCoins(document.getElementById('search').value);
}

function showWatchlist() {
    document.getElementById('count').textContent = watchlist.length;
    
    let html = '';
    const watchCoins = coins.filter(c => watchlist.includes(c.id));
    
    watchCoins.forEach(coin => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'up' : 'down';
        html += `
            <div class="coin" onclick="toggleWatchlist('${coin.id}')">
                <div class="name">${coin.name}</div>
                <div class="symbol">${coin.symbol.toUpperCase()}</div>
                <div class="price">$${coin.current_price.toLocaleString()}</div>
                <div class="change ${changeClass}">
                    ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) + '%' : '0.00%'}
                </div>
            </div>
        `;
    });
    
    document.getElementById('watchlist').innerHTML = html || '<p>Add coins to watchlist</p>';
}

function updatePortfolio() {
    const watchCoins = coins.filter(c => watchlist.includes(c.id));
    const total = watchCoins.reduce((sum, c) => sum + c.current_price, 0);
    const avgChange = watchCoins.length ? 
        watchCoins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / watchCoins.length : 0;
    
    document.getElementById('total').textContent = total.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('change').textContent = avgChange.toFixed(2) + '%';
}

function showError(msg) {
    document.getElementById('error').textContent = msg;
    document.getElementById('error').style.display = 'block';
    setTimeout(() => {
        document.getElementById('error').style.display = 'none';
    }, 3000);
}