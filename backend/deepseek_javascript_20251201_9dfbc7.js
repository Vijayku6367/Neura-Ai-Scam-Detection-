// Gamified Scam Hunting System
class ScamGame {
    constructor() {
        this.players = new Map();
        this.leaderboard = [];
        this.reports = [];
        this.rewards = {
            REPORT_SCAM: 10,
            CONFIRMED_SCAM: 50,
            PREVENTED_LOSS: 100,
            HONEYPOT_CATCH: 75,
            FIRST_REPORT: 25
        };

        this.achievements = {
            NOVICE_HUNTER: { name: "Novice Hunter", points: 100, description: "Report your first scam" },
            VIGILANT_GUARD: { name: "Vigilant Guard", points: 500, description: "Report 10 confirmed scams" },
            SCAM_SLAYER: { name: "Scam Slayer", points: 1000, description: "Prevent a major loss" },
            COMMUNITY_HERO: { name: "Community Hero", points: 2000, description: "Top 10 on leaderboard" },
            HONEYPOT_MASTER: { name: "Honeypot Master", points: 1500, description: "Catch 5 scammers via honeypots" }
        };

        this.initDemoPlayers();
    }

    // Initialize with some demo players
    initDemoPlayers() {
        const demoPlayers = [
            { id: 'user1', name: 'CryptoGuard', points: 1250, reports: 45, achievements: ['NOVICE_HUNTER', 'VIGILANT_GUARD'] },
            { id: 'user2', name: 'ScamSlayer', points: 980, reports: 32, achievements: ['NOVICE_HUNTER'] },
            { id: 'user3', name: 'BlockchainSheriff', points: 760, reports: 28, achievements: ['NOVICE_HUNTER'] },
            { id: 'user4', name: 'DeFiDetective', points: 540, reports: 19, achievements: ['NOVICE_HUNTER'] },
            { id: 'user5', name: 'Web3Warrior', points: 320, reports: 12, achievements: [] }
        ];

        demoPlayers.forEach(player => {
            this.players.set(player.id, player);
        });

        this.updateLeaderboard();
    }

    // Register new player
    registerPlayer(userId, userName) {
        if (this.players.has(userId)) {
            return { error: 'Player already exists' };
        }

        const newPlayer = {
            id: userId,
            name: userName,
            points: 0,
            reports: 0,
            joinedAt: new Date(),
            achievements: [],
            level: 1
        };

        this.players.set(userId, newPlayer);
        this.updateLeaderboard();

        return {
            success: true,
            player: newPlayer,
            message: `Welcome to Scam Hunters, ${userName}!`
        };
    }

    // Report a scam
    reportScam(userId, scamData) {
        const player = this.players.get(userId);
        if (!player) {
            return { error: 'Player not found' };
        }

        const report = {
            id: `report_${Date.now()}`,
            userId: userId,
            userName: player.name,
            ...scamData,
            reportedAt: new Date(),
            status: 'UNDER_REVIEW',
            pointsAwarded: 0
        };

        // Initial points for reporting
        let points = this.rewards.REPORT_SCAM;
        player.reports++;
        report.pointsAwarded = points;

        // Check if first to report
        const existingReports = this.reports.filter(r => 
            r.scamAddress === scamData.scamAddress && 
            r.reportedAt < report.reportedAt
        );

        if (existingReports.length === 0) {
            points += this.rewards.FIRST_REPORT;
            report.pointsAwarded = points;
            report.firstReport = true;
        }

        // Award points
        player.points += points;
        this.reports.push(report);

        // Check for achievements
        this.checkAchievements(player);

        this.updateLeaderboard();

        return {
            success: true,
            report: report,
            pointsEarned: points,
            newTotal: player.points,
            message: this.getEncouragementMessage(points)
        };
    }

    // Confirm a scam report (admin function)
    confirmScam(reportId, severity = 'MEDIUM') {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) {
            return { error: 'Report not found' };
        }

        const player = this.players.get(report.userId);
        if (!player) {
            return { error: 'Player not found' };
        }

        // Award confirmation points based on severity
        let confirmationPoints = this.rewards.CONFIRMED_SCAM;
        if (severity === 'HIGH') {
            confirmationPoints += 50;
        } else if (severity === 'CRITICAL') {
            confirmationPoints += 100;
        }

        player.points += confirmationPoints;
        report.status = 'CONFIRMED';
        report.confirmedAt = new Date();
        report.confirmationPoints = confirmationPoints;
        report.severity = severity;

        // Check for prevented loss
        if (severity === 'HIGH' || severity === 'CRITICAL') {
            player.points += this.rewards.PREVENTED_LOSS;
            report.preventedLoss = true;
        }

        this.checkAchievements(player);
        this.updateLeaderboard();

        return {
            success: true,
            pointsAwarded: confirmationPoints,
            player: {
                name: player.name,
                totalPoints: player.points,
                rank: this.getPlayerRank(player.id)
            }
        };
    }

    // Honeypot scammer catch
    recordHoneypotCatch(userId, scammerData) {
        const player = this.players.get(userId);
        if (!player) {
            return { error: 'Player not found' };
        }

        const points = this.rewards.HONEYPOT_CATCH;
        player.points += points;

        const catchRecord = {
            id: `catch_${Date.now()}`,
            userId: userId,
            userName: player.name,
            ...scammerData,
            caughtAt: new Date(),
            pointsAwarded: points
        };

        this.checkAchievements(player);
        this.updateLeaderboard();

        return {
            success: true,
            catchRecord: catchRecord,
            pointsEarned: points,
            message: `🎯 Great catch! You caught a scammer!`
        };
    }

    // Check and award achievements
    checkAchievements(player) {
        const unlocked = [];

        // Novice Hunter
        if (player.reports >= 1 && !player.achievements.includes('NOVICE_HUNTER')) {
            player.achievements.push('NOVICE_HUNTER');
            player.points += this.achievements.NOVICE_HUNTER.points;
            unlocked.push('NOVICE_HUNTER');
        }

        // Vigilant Guard
        if (player.reports >= 10 && !player.achievements.includes('VIGILANT_GUARD')) {
            player.achievements.push('VIGILANT_GUARD');
            player.points += this.achievements.VIGILANT_GUARD.points;
            unlocked.push('VIGILANT_GUARD');
        }

        // Update level based on points
        player.level = Math.floor(player.points / 500) + 1;

        return unlocked;
    }

    // Update leaderboard
    updateLeaderboard() {
        this.leaderboard = Array.from(this.players.values())
            .sort((a, b) => b.points - a.points)
            .map((player, index) => ({
                rank: index + 1,
                ...player
            }));
    }

    // Get player rank
    getPlayerRank(userId) {
        const playerIndex = this.leaderboard.findIndex(p => p.id === userId);
        return playerIndex !== -1 ? playerIndex + 1 : null;
    }

    // Get leaderboard
    getLeaderboard(limit = 10) {
        return this.leaderboard.slice(0, limit);
    }

    // Get player stats
    getPlayerStats(userId) {
        const player = this.players.get(userId);
        if (!player) {
            return { error: 'Player not found' };
        }

        const playerReports = this.reports.filter(r => r.userId === userId);
        const confirmedReports = playerReports.filter(r => r.status === 'CONFIRMED');

        return {
            player: player,
            stats: {
                totalReports: player.reports,
                confirmedReports: confirmedReports.length,
                successRate: player.reports > 0 ? (confirmedReports.length / player.reports) * 100 : 0,
                totalPoints: player.points,
                rank: this.getPlayerRank(userId),
                level: player.level
            },
            recentActivity: playerReports.slice(-5).reverse()
        };
    }

    // Get encouragement message
    getEncouragementMessage(points) {
        const messages = [
            "🎯 Great catch! You saved someone from getting scammed!",
            "🛡️ Community protector! Keep up the good work!",
            "🔥 Scam hunter level up! The community thanks you!",
            "💪 You're making crypto safer for everyone!",
            "🌟 Outstanding work! You're a true Web3 guardian!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Get game statistics
    getGameStats() {
        const totalPlayers = this.players.size;
        const totalReports = this.reports.length;
        const totalPoints = Array.from(this.players.values()).reduce((sum, player) => sum + player.points, 0);
        const confirmedScams = this.reports.filter(r => r.status === 'CONFIRMED').length;

        return {
            totalPlayers,
            totalReports,
            confirmedScams,
            totalPointsAwarded: totalPoints,
            averagePointsPerPlayer: totalPlayers > 0 ? Math.round(totalPoints / totalPlayers) : 0,
            topHunter: this.leaderboard[0] || null
        };
    }
}

module.exports = ScamGame;