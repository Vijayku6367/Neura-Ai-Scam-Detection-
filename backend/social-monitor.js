// Social Media Scam Monitoring System
class SocialMonitor {
    constructor() {
        this.platforms = {
            TWITTER: {
                name: "Twitter",
                baseUrl: "https://twitter.com/",
                scanInterval: 60000, // 1 minute
                scamKeywords: ['free mint', 'guaranteed profit', 'limited offer', 'whitelist spot', 'airdrop', 'presale access']
            },
            DISCORD: {
                name: "Discord", 
                baseUrl: "https://discord.gg/",
                scanInterval: 30000, // 30 seconds
                scamKeywords: ['verify your wallet', 'click this link', 'admin message', 'special offer']
            },
            TELEGRAM: {
                name: "Telegram",
                baseUrl: "https://t.me/",
                scanInterval: 45000, // 45 seconds
                scamKeywords: ['official announcement', 'partnership', 'exchange listing', 'burn event']
            }
        };
        
        this.detectedScams = [];
        this.isMonitoring = false;
    }

    // Start monitoring all platforms
    startGlobalMonitoring() {
        this.isMonitoring = true;
        console.log('🌐 Starting global social media monitoring...');

        // Monitor each platform
        Object.keys(this.platforms).forEach(platform => {
            this.monitorPlatform(platform);
        });

        return {
            success: true,
            message: 'Social media monitoring started for all platforms',
            platforms: Object.keys(this.platforms)
        };
    }

    // Monitor specific platform
    monitorPlatform(platform) {
        if (!this.platforms[platform]) {
            console.error(`Unknown platform: ${platform}`);
            return;
        }

        const platformConfig = this.platforms[platform];
        
        const scanInterval = setInterval(() => {
            if (!this.isMonitoring) {
                clearInterval(scanInterval);
                return;
            }

            this.performPlatformScan(platform, platformConfig);
            
        }, platformConfig.scanInterval);
    }

    // Perform scan on a platform
    async performPlatformScan(platform, config) {
        console.log(`🔍 Scanning ${config.name} for scams...`);
        
        // Simulate finding scam posts (40% chance)
        if (Math.random() > 0.6) {
            const scamPost = this.generateMockScamPost(platform, config);
            this.detectedScams.push(scamPost);
            
            console.log(`🚨 SCAM DETECTED on ${config.name}: ${scamPost.content.substring(0, 50)}...`);
            
            // Auto-takedown simulation (60% success rate)
            if (Math.random() > 0.4) {
                await this.attemptTakedown(scamPost);
            }
        }
    }

    // Generate mock scam post
    generateMockScamPost(platform, config) {
        const scamTemplates = [
            `🚀 HUGE ANNOUNCEMENT! We're doing a FREE MINT for first 1000 people! ${config.baseUrl}fakelink123`,
            `💎 LIMITED TIME OFFER: Guaranteed 10x returns on our new token! Don't miss out! ${config.baseUrl}scamlink456`,
            `🎁 WHITELIST SPOTS AVAILABLE! Verify your wallet to get early access: ${config.baseUrl}verify789`,
            `🔥 PARTNERSHIP NEWS: We're partnering with major exchange! Get in early: ${config.baseUrl}earlyaccess000`
        ];

        const randomTemplate = scamTemplates[Math.floor(Math.random() * scamTemplates.length)];
        const randomKeyword = config.scamKeywords[Math.floor(Math.random() * config.scamKeywords.length)];

        return {
            id: `scam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            platform: platform,
            platformName: config.name,
            content: randomTemplate,
            detectedKeyword: randomKeyword,
            url: `${config.baseUrl}${Math.random().toString(36).substr(2, 10)}`,
            severity: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
            detectedAt: new Date(),
            status: 'DETECTED'
        };
    }

    // Attempt to take down scam post
    async attemptTakedown(scamPost) {
        console.log(`🛑 Attempting takedown for scam on ${scamPost.platformName}...`);
        
        // Simulate takedown process
        return new Promise(resolve => {
            setTimeout(() => {
                const success = Math.random() > 0.3; // 70% success rate
                
                scamPost.status = success ? 'TAKEN_DOWN' : 'FAILED';
                scamPost.takedownAttemptedAt = new Date();
                scamPost.takedownSuccess = success;

                if (success) {
                    console.log(`✅ Successfully taken down scam on ${scamPost.platformName}`);
                } else {
                    console.log(`❌ Failed to take down scam on ${scamPost.platformName}`);
                }

                resolve(success);
            }, 2000);
        });
    }

    // Stop monitoring
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('🛑 Social media monitoring stopped');
        
        return {
            success: true,
            message: 'Monitoring stopped',
            totalScamsDetected: this.detectedScams.length
        };
    }

    // Get monitoring statistics
    getStats() {
        const platformStats = {};
        
        Object.keys(this.platforms).forEach(platform => {
            const platformScams = this.detectedScams.filter(scam => scam.platform === platform);
            platformStats[platform] = {
                totalDetected: platformScams.length,
                takenDown: platformScams.filter(s => s.status === 'TAKEN_DOWN').length,
                highSeverity: platformScams.filter(s => s.severity === 'HIGH').length
            };
        });

        return {
            totalScamsDetected: this.detectedScams.length,
            takedownSuccessRate: this.detectedScams.length > 0 ? 
                (this.detectedScams.filter(s => s.status === 'TAKEN_DOWN').length / this.detectedScams.length) * 100 : 0,
            byPlatform: platformStats,
            isActive: this.isMonitoring
        };
    }

    // Search for specific scams
    searchScams(keyword, platform = null) {
        let results = this.detectedScams;
        
        if (platform) {
            results = results.filter(scam => scam.platform === platform);
        }
        
        if (keyword) {
            results = results.filter(scam => 
                scam.content.toLowerCase().includes(keyword.toLowerCase()) ||
                scam.detectedKeyword.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        return results;
    }

    // Get recent scams
    getRecentScams(limit = 10) {
        return this.detectedScams
            .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
            .slice(0, limit);
    }
}

module.exports = SocialMonitor;
