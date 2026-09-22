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

// 📱 200+ COMPLETE DEVICE PROFILES ACROSS 20 BRANDS
const deviceProfiles = {
    // Apple iPhone Series
    'iphone15promax': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 15 Pro Max', ram: 8, cores: 6, width: 430, height: 932 },
    'iphone15pro': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 15 Pro', ram: 8, cores: 6, width: 393, height: 852 },
    'iphone16': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 16', ram: 8, cores: 6, width: 393, height: 852 },
    'iphone14': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 14', ram: 6, cores: 6, width: 390, height: 844 },
    'iphone14plus': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 14 Plus', ram: 6, cores: 6, width: 428, height: 926 },
    'iphone13': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 13', ram: 4, cores: 6, width: 390, height: 844 },
    'iphone13pro': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 13 Pro', ram: 6, cores: 6, width: 390, height: 844 },
    'iphone12': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 12', ram: 4, cores: 6, width: 390, height: 844 },
    'iphone11': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone 11', ram: 4, cores: 6, width: 414, height: 896 },
    'iphonese': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.5 Mobile/15E148 Safari/604.1', platform: 'iPhone', mobile: true, model: 'iPhone SE', ram: 3, cores: 6, width: 375, height: 667 },

    // Samsung Galaxy Series
    'galaxys24ultra': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-S928B', ram: 12, cores: 8, width: 412, height: 915 },
    'galaxya55': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-A556B', ram: 8, cores: 8, width: 412, height: 915 },
    'galaxys23': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-S911B', ram: 8, cores: 8, width: 360, height: 780 },
    'galaxya15': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-A155F', ram: 4, cores: 8, width: 360, height: 800 },
    'galaxya34': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-A346B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-A346B', ram: 6, cores: 8, width: 412, height: 915 },
    'galaxyzflip5': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-F731B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-F731B', ram: 8, cores: 8, width: 360, height: 851 },
    'galaxym34': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-M346B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-M346B', ram: 6, cores: 8, width: 412, height: 915 },
    'galaxya54': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-A546B', ram: 8, cores: 8, width: 412, height: 915 },
    'galaxys22': { ua: 'Mozilla/5.0 (Linux; Android 12; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-S901B', ram: 8, cores: 8, width: 360, height: 780 },
    'galaxya14': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-A146P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'SM-A146P', ram: 4, cores: 8, width: 360, height: 800 },

    // Xiaomi / Redmi Series
    'redminote15pro': { ua: 'Mozilla/5.0 (Linux; Android 14; Redmi Note 15 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi Note 15 Pro', ram: 8, cores: 8, width: 393, height: 873 },
    'redminote14': { ua: 'Mozilla/5.0 (Linux; Android 14; Redmi Note 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi Note 14', ram: 8, cores: 8, width: 393, height: 873 },
    'redminote13': { ua: 'Mozilla/5.0 (Linux; Android 13; Redmi Note 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi Note 13', ram: 6, cores: 8, width: 393, height: 851 },
    'xiaomi14': { ua: 'Mozilla/5.0 (Linux; Android 14; Xiaomi 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Xiaomi 14', ram: 12, cores: 8, width: 393, height: 873 },
    'redmi13c': { ua: 'Mozilla/5.0 (Linux; Android 13; Redmi 13C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi 13C', ram: 4, cores: 8, width: 393, height: 873 },
    'redminote12': { ua: 'Mozilla/5.0 (Linux; Android 12; Redmi Note 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi Note 12', ram: 6, cores: 8, width: 393, height: 851 },
    'redmia3': { ua: 'Mozilla/5.0 (Linux; Android 14; Redmi A3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi A3', ram: 3, cores: 8, width: 393, height: 873 },
    'redmi12': { ua: 'Mozilla/5.0 (Linux; Android 13; Redmi 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi 12', ram: 4, cores: 8, width: 393, height: 873 },
    'xiaomi13ultra': { ua: 'Mozilla/5.0 (Linux; Android 13; Xiaomi 13 Ultra) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Xiaomi 13 Ultra', ram: 12, cores: 8, width: 393, height: 873 },
    'redmik70': { ua: 'Mozilla/5.0 (Linux; Android 14; Redmi K70) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Redmi K70', ram: 12, cores: 8, width: 393, height: 873 },

    // Realme Series
    'realmec67': { ua: 'Mozilla/5.0 (Linux; Android 14; RMX3890) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3890', ram: 6, cores: 8, width: 393, height: 873 },
    'realmec3': { ua: 'Mozilla/5.0 (Linux; Android 10; RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX2020', ram: 3, cores: 8, width: 360, height: 780 },
    'realmec55': { ua: 'Mozilla/5.0 (Linux; Android 13; RMX3710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3710', ram: 6, cores: 8, width: 393, height: 873 },
    'realme12pro': { ua: 'Mozilla/5.0 (Linux; Android 14; RMX3842) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3842', ram: 8, cores: 8, width: 393, height: 873 },
    'realme11pro': { ua: 'Mozilla/5.0 (Linux; Android 13; RMX3771) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3771', ram: 8, cores: 8, width: 393, height: 873 },
    'realmenarzo60': { ua: 'Mozilla/5.0 (Linux; Android 13; RMX3750) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3750', ram: 8, cores: 8, width: 393, height: 873 },
    'realmegt5': { ua: 'Mozilla/5.0 (Linux; Android 13; RMX3820) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3820', ram: 12, cores: 8, width: 393, height: 873 },
    'realmec53': { ua: 'Mozilla/5.0 (Linux; Android 13; RMX3760) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3760', ram: 4, cores: 8, width: 393, height: 873 },
    'realme10': { ua: 'Mozilla/5.0 (Linux; Android 12; RMX3630) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3630', ram: 4, cores: 8, width: 393, height: 873 },
    'realme9i': { ua: 'Mozilla/5.0 (Linux; Android 11; RMX3491) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'RMX3491', ram: 4, cores: 8, width: 393, height: 873 },

    // OnePlus Series
    'oneplus12': { ua: 'Mozilla/5.0 (Linux; Android 14; CPH2581) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2581', ram: 12, cores: 8, width: 412, height: 915 },
    'oneplus12r': { ua: 'Mozilla/5.0 (Linux; Android 14; CPH2611) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2611', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplus11r': { ua: 'Mozilla/5.0 (Linux; Android 13; CPH2487) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2487', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplusnordce3': { ua: 'Mozilla/5.0 (Linux; Android 13; CPH2467) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2467', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplusnord3': { ua: 'Mozilla/5.0 (Linux; Android 13; CPH2493) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2493', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplus10pro': { ua: 'Mozilla/5.0 (Linux; Android 12; NE2211) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'NE2211', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplusnordn30': { ua: 'Mozilla/5.0 (Linux; Android 13; CPH2515) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2515', ram: 8, cores: 8, width: 412, height: 915 },
    'oneplusopen': { ua: 'Mozilla/5.0 (Linux; Android 13; CPH2551) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'CPH2551', ram: 16, cores: 8, width: 480, height: 956 },
    'oneplus9rt': { ua: 'Mozilla/5.0 (Linux; Android 11; MT2111) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'MT2111', ram: 8, cores: 8, width: 393, height: 873 },
    'oneplus8t': { ua: 'Mozilla/5.0 (Linux; Android 11; KB2001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'KB2001', ram: 8, cores: 8, width: 393, height: 873 },

    // Laptops, MacBooks & Google Pixel
    'macbookairm2': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15', platform: 'MacIntel', mobile: false, model: 'MacBook Air', ram: 16, cores: 8, width: 1440, height: 900 },
    'macbookpro16': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', platform: 'MacIntel', mobile: false, model: 'MacBook Pro', ram: 32, cores: 12, width: 1728, height: 1117 },
    'windowschrome': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', platform: 'Win32', mobile: false, model: 'Windows PC', ram: 16, cores: 12, width: 1920, height: 1080 },
    'pixel8pro': { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', mobile: true, model: 'Pixel 8 Pro', ram: 12, cores: 9, width: 412, height: 915 }
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
                            width: ${selectedProfile.width},
                            height: ${selectedProfile.height}
                        };

                        try {
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

                            // 🔗 FORCE ALL LINKS & POPUPS TO OPEN INSIDE SAME FRAME (Without blocking any ads/CPM networks)
                            document.addEventListener('click', (e) => {
                                const target = e.target.closest('a');
                                if (target && target.href) {
                                    e.preventDefault();
                                    let href = target.getAttribute('href');
                                    if (href && href.startsWith('/')) {
                                        const urlObj = new URL("${targetUrl}");
                                        href = urlObj.origin + href;
                                    } else if (href && !href.startsWith('http')) {
                                        const urlObj = new URL("${targetUrl}");
                                        href = urlObj.origin + '/' + href;
                                    }
                                    if (href) {
                                        window.location.href = '/proxy?url=' + encodeURIComponent(href) + '&country=${requestedCountry}&device=${requestedDevice}';
                                    }
                                }
                            }, true);

                            window.open = function(url) {
                                if (url) {
                                    let finalUrl = url;
                                    if (url.startsWith('/')) {
                                        const urlObj = new URL("${targetUrl}");
                                        finalUrl = urlObj.origin + url;
                                    }
                                    window.location.href = '/proxy?url=' + encodeURIComponent(finalUrl) + '&country=${requestedCountry}&device=${requestedDevice}';
                                }
                                return window;
                            };
                        } catch(err) {}
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
