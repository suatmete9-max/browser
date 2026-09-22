const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');
const path = require('path');
const zlib = require('zlib');

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

// 📱 DETAILED DEVICE PROFILES (Matching DeviceInfo.me specifications)
const deviceProfiles = {
    'iphone15promax': {
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        mobile: true,
        model: 'iPhone 15 Pro Max',
        osVersion: '17.1.0',
        ram: 8,
        cores: 6,
        gpu: 'Apple GPU',
        screenWidth: 430,
        screenHeight: 932
    },
    'iphone13': {
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        mobile: true,
        model: 'iPhone 13',
        osVersion: '15.0.0',
        ram: 4,
        cores: 6,
        gpu: 'Apple GPU',
        screenWidth: 390,
        screenHeight: 844
    },
    'samsunggalaxys24ultra': {
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        mobile: true,
        model: 'SM-S928B',
        osVersion: '14.0.0',
        ram: 12,
        cores: 8,
        gpu: 'Adreno (TM) 750',
        screenWidth: 412,
        screenHeight: 915
    },
    'realmec3': {
        ua: 'Mozilla/5.0 (Linux; Android 10; RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        mobile: true,
        model: 'RMX2020',
        osVersion: '10.0.0',
        ram: 3,
        cores: 8,
        gpu: 'Mali-G52',
        screenWidth: 360,
        screenHeight: 780
    },
    'macbookairm2': {
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
        platform: 'MacIntel',
        mobile: false,
        model: 'MacBook Air',
        osVersion: '13.4.0',
        ram: 16,
        cores: 8,
        gpu: 'Apple M2',
        screenWidth: 1440,
        screenHeight: 900
    },
    'windowschrome': {
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        platform: 'Win32',
        mobile: false,
        model: 'Windows PC',
        osVersion: '10.0',
        ram: 16,
        cores: 12,
        gpu: 'NVIDIA GeForce RTX 3060',
        screenWidth: 1920,
        screenHeight: 1080
    },
    'pixel8pro': {
        ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        mobile: true,
        model: 'Pixel 8 Pro',
        osVersion: '14.0.0',
        ram: 12,
        cores: 9,
        gpu: 'Mali-G715',
        screenWidth: 412,
        screenHeight: 915
    }
};

app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    const requestedCountry = req.query.country || 'AUTO';
    const requestedDevice = req.query.device || 'AUTO';

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

    const deviceKeys = Object.keys(deviceProfiles);
    let selectedProfile = deviceProfiles['iphone13'];
    if (requestedDevice === 'AUTO') {
        const randomKey = deviceKeys[Math.floor(Math.random() * deviceKeys.length)];
        selectedProfile = deviceProfiles[randomKey];
    } else if (deviceProfiles[requestedDevice]) {
        selectedProfile = deviceProfiles[requestedDevice];
    }

    const proxyAgent = new HttpsProxyAgent(selectedProxyUrl);

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,
        agent: proxyAgent,
        selfHandleResponse: true,
        pathRewrite: { '^/proxy': '' },
        onProxyRes: function (proxyRes, req, res) {
            let body = [];

            proxyRes.on('data', function(chunk) {
                body.push(chunk);
            });

            proxyRes.on('end', function() {
                let buffer = Buffer.concat(body);
                const encoding = proxyRes.headers['content-encoding'];
                const contentType = proxyRes.headers['content-type'] || '';

                try {
                    if (encoding === 'gzip') {
                        buffer = zlib.gunzipSync(buffer);
                    } else if (encoding === 'deflate') {
                        buffer = zlib.inflateSync(buffer);
                    } else if (encoding === 'br') {
                        buffer = zlib.brotliDecompressSync(buffer);
                    }
                } catch(e) {}

                if (contentType.includes('text/html')) {
                    let htmlStr = buffer.toString('utf8');
                    
                    const spoofScript = `
                    <script>
                    (function() {
                        const profile = {
                            ua: "${selectedProfile.ua}",
                            platform: "${selectedProfile.platform}",
                            model: "${selectedProfile.model}",
                            mobile: ${selectedProfile.mobile},
                            ram: ${selectedProfile.ram},
                            cores: ${selectedProfile.cores},
                            width: ${selectedProfile.screenWidth},
                            height: ${selectedProfile.screenHeight}
                        };

                        Object.defineProperty(navigator, 'userAgent', { get: () => profile.ua });
                        Object.defineProperty(navigator, 'platform', { get: () => profile.platform });
                        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => profile.mobile ? 5 : 0 });
                        Object.defineProperty(navigator, 'deviceMemory', { get: () => profile.ram });
                        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => profile.cores });

                        if (navigator.userAgentData) {
                            Object.defineProperty(navigator, 'userAgentData', {
                                get: () => ({
                                    platform: profile.mobile ? "Android" : "macOS",
                                    mobile: profile.mobile,
                                    brands: [{brand: "Google Chrome", version: "122"}, {brand: "Chromium", version: "122"}]
                                })
                            });
                        }

                        Object.defineProperty(screen, 'width', { get: () => profile.width });
                        Object.defineProperty(screen, 'height', { get: () => profile.height });
                        Object.defineProperty(window, 'innerWidth', { get: () => profile.width });
                        Object.defineProperty(window, 'innerHeight', { get: () => profile.height });
                    })();
                    </script>
                    `;

                    if (htmlStr.includes('<head>')) {
                        htmlStr = htmlStr.replace('<head>', '<head>' + spoofScript);
                    } else {
                        htmlStr = spoofScript + htmlStr;
                    }

                    buffer = Buffer.from(htmlStr, 'utf8');
                }

                delete proxyRes.headers['content-encoding'];
                proxyRes.headers['content-length'] = buffer.length;

                Object.keys(proxyRes.headers).forEach(key => {
                    if (key !== 'x-frame-options' && key !== 'content-security-policy' && key !== 'x-xss-protection') {
                        res.setHeader(key, proxyRes.headers[key]);
                    }
                });

                if (res.getHeader('location')) {
                    let redirectUrl = res.getHeader('location');
                    if (redirectUrl.startsWith('/')) {
                        const urlObj = new URL(targetUrl);
                        redirectUrl = urlObj.origin + redirectUrl;
                    }
                    res.setHeader('location', `/proxy?url=${encodeURIComponent(redirectUrl)}&country=${requestedCountry}&device=${requestedDevice}`);
                }

                res.writeHead(proxyRes.statusCode);
                res.end(buffer);
            });
        },
        onError: function(err, req, res) {
            console.error('Proxy Error:', err.message);
            res.status(500).send(`Error from Proxy: ${err.message}`);
        }
    })(req, res, next);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Pro Proxy Server running on port ${PORT}`);
});
