const JobService = require("../services/job.service");

const JobController = {

    // ==========================================
    // GET ALL JOBS
    // ==========================================
    async getAllJobs(req, res) {
        try {
            const jobs = await JobService.getAllJobs();

            res.status(200).json({
                success: true,
                count: jobs.length,
                jobs
            });

        } catch (error) {
            console.error("GET ALL JOBS ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Failed to retrieve job opportunities.",
                error: error.message
            });
        }
    },


    // ==========================================
    // GET ONE JOB
    // ==========================================
    async getJobById(req, res) {
        try {
            const { id } = req.params;

            const job = await JobService.getJobById(id);

            res.status(200).json({
                success: true,
                job
            });

        } catch (error) {
            console.error("GET JOB ERROR:", error);

            const status =
                error.message === "Job opportunity not found."
                    ? 404
                    : 500;

            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    },


    // ==========================================
    // CREATE JOB
    // ==========================================
    async createJob(req, res) {
        try {
            const {
                title,
                company_name,
                employment_type,
                location,
                description
            } = req.body;

            if (
                !title ||
                !company_name ||
                !employment_type ||
                !location ||
                !description
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Title, company, employment type, location, and description are required."
                });
            }

            const createdBy =
                req.user?.user_id ||
                req.user?.id ||
                null;

            const job = await JobService.createJob(
                req.body,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Job opportunity created successfully.",
                job
            });

        } catch (error) {
            console.error("CREATE JOB ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Failed to create job opportunity.",
                error: error.message
            });
        }
    },


    // ==========================================
    // UPDATE JOB
    // ==========================================
    async updateJob(req, res) {
        try {
            const { id } = req.params;

            const job = await JobService.updateJob(
                id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Job opportunity updated successfully.",
                job
            });

        } catch (error) {
            console.error("UPDATE JOB ERROR:", error);

            const status =
                error.message === "Job opportunity not found."
                    ? 404
                    : 500;

            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    },


    // ==========================================
    // DELETE JOB
    // ==========================================
    async deleteJob(req, res) {
        try {
            const { id } = req.params;

            const deletedJob =
                await JobService.deleteJob(id);

            res.status(200).json({
                success: true,
                message: "Job opportunity deleted successfully.",
                job: deletedJob
            });

        } catch (error) {
            console.error("DELETE JOB ERROR:", error);

            const status =
                error.message === "Job opportunity not found."
                    ? 404
                    : 500;

            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    }

};

module.exports = JobController;