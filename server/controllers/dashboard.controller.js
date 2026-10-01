const Dashboard = require("../models/dashboard.model");


const DashboardController = {


    async getStats(req, res) {

        try {

            const stats = await Dashboard.getStats();


            res.json({

                success:true,

                stats

            });


        } catch(error) {

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    },



    async getBatchStatistics(req, res) {

        try {


            const batches = await Dashboard.getBatchStatistics();


            res.json({

                success:true,

                batches

            });


        } catch(error) {


            res.status(500).json({

                success:false,

                message:error.message

            });


        }

    },



    async getEmploymentStatistics(req,res){

        try {


            const employment = await Dashboard.getEmploymentStatistics();


            res.json({

                success:true,

                employment

            });


        } catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }

    },



    async getRecentRegistrations(req,res){

    try {


        const recent = await Dashboard.getRecentRegistrations();


        res.json({

            success:true,

            recent

        });


    } catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

},


async getRecentActivity(req, res) {

    try {

        const range =
            req.query.range || "today";


        const activities =
            await Dashboard.getRecentActivity(
                range
            );


        res.json({

            success: true,

            range,

            activities

        });


    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}


};


module.exports = DashboardController;