onProxyRes: function (proxyRes, req, res) {
            let body = [];

            proxyRes.on('data', function(chunk) {
                body.push(chunk);
            });

            proxyRes.on('end', function() {
                let buffer = Buffer.concat(body);
                const encoding = proxyRes.headers['content-encoding'];
                const contentType = proxyRes.headers['content-type'] || '';

                // Proper Decompression
                try {
                    if (encoding === 'gzip') {
                        buffer = zlib.gunzipSync(buffer);
                    } else if (encoding === 'deflate') {
                        buffer = zlib.inflateSync(buffer);
                    } else if (encoding === 'br') {
                        buffer = zlib.brotliDecompressSync(buffer);
                    }
                } catch(e) {
                    // Fallback to original buffer if decompression fails
                }

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

                // Remove encoding header since we already decoded it
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
