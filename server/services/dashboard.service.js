const Dashboard = require("../models/dashboard.model");

const DashboardService = {

    async getDashboardData(){

        const stats = await Dashboard.getStats();

        const batchStats = await Dashboard.getBatchStatistics();

        const employmentStats = await Dashboard.getEmploymentStatistics();

        const recentRegistrations =
            await Dashboard.getRecentRegistrations();

        return {

            stats,

            batchStats,

            employmentStats,

            recentRegistrations

        };

    }

};

module.exports = DashboardService;