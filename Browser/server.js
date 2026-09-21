const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 🌐 WEBSHARE PROXIES CONFIGURATION
const proxyUsername = 'jwcmtnyz';
const proxyPassword = '98niktp7dq3g';
const auth = `${proxyUsername}:${proxyPassword}`;

const allProxies = {
    'UK1': `http://${auth}@31.59.20.176:6754`,
    'UK2': `http://${auth}@45.38.107.97:6014`,
    'UK3': `http://${auth}@198.105.121.200:6462`,
    'ES1': `http://${auth}@64.137.96.74:6641`,
    'US1': `http://${auth}@198.23.243.226:6361`,
    'US2': `http://${auth}@38.154.185.97:6370`,
    'PL1': `http://${auth}@84.247.60.125:6095`,
    'JP1': `http://${auth}@142.111.67.146:5611`,
    'US3': `http://${auth}@191.96.254.138:6185`,
    'DE1': `http://${auth}@31.58.9.4:6077`
};

const countryProxies = {
    'US': [allProxies['US1'], allProxies['US2'], allProxies['US3']],
    'UK': [allProxies['UK1'], allProxies['UK2'], allProxies['UK3']],
    'ES': [allProxies['ES1']],
    'PL': [allProxies['PL1']],
    'JP': [allProxies['JP1']],
    'DE': [allProxies['DE1']]
};

app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    const requestedCountry = req.query.country || 'AUTO';

    if (!targetUrl) return res.status(400).send('URL is missing');

    let selectedProxyUrl = null;

    if (requestedCountry === 'AUTO') {
        const proxyKeys = Object.keys(allProxies);
        const randomKey = proxyKeys[Math.floor(Math.random() * proxyKeys.length)];
        selectedProxyUrl = allProxies[randomKey];
    } else if (countryProxies[requestedCountry]) {
        const arr = countryProxies[requestedCountry];
        selectedProxyUrl = arr[Math.floor(Math.random() * arr.length)];
    } else if (allProxies[requestedCountry]) {
        selectedProxyUrl = allProxies[requestedCountry];
    } else {
        selectedProxyUrl = allProxies['US1'];
    }

    const proxyAgent = new HttpsProxyAgent(selectedProxyUrl);

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,
        agent: proxyAgent, 
        pathRewrite: { '^/proxy': '' },
        onProxyRes: function (proxyRes, req, res) {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-xss-protection'];

            if (proxyRes.headers['location']) {
                let redirectUrl = proxyRes.headers['location'];
                if (redirectUrl.startsWith('/')) {
                    const urlObj = new URL(targetUrl);
                    redirectUrl = urlObj.origin + redirectUrl;
                }
                proxyRes.headers['location'] = `/proxy?url=${encodeURIComponent(redirectUrl)}&country=${requestedCountry}`;
            }
        },
        onError: function(err, req, res) {
            console.error('Proxy Error:', err.message);
            res.status(500).send(`Error from Proxy: ${err.message}`);
        }
    })(req, res, next);
});

// 🛡️ FIX 404: Catch-all route to serve index.html for any unhandled path
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Pro Proxy Server running on port ${PORT}`);
});
