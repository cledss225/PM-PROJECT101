const pool = require("../config/db");


const JobService = {


    // ==========================================
    // GET ALL JOBS
    // ==========================================

    async getAllJobs() {

        const result = await pool.query(`
            SELECT
                j.job_id,
                j.title,
                j.company_name,
                j.employment_type,
                j.location,
                j.work_setup,
                j.salary_min,
                j.salary_max,
                j.salary_currency,
                j.status,
                j.description,
                j.requirements,
                j.application_deadline,
                j.contact_email,
                j.application_link,
                j.company_logo,
                j.created_by,
                j.created_at,
                j.updated_at,

                u.first_name AS creator_first_name,
                u.last_name AS creator_last_name

            FROM jobs j

            LEFT JOIN users u
                ON j.created_by = u.user_id

            ORDER BY
                j.created_at DESC
        `);


        return result.rows;

    },


    // ==========================================
    // GET ONE JOB
    // ==========================================

    async getJobById(jobId) {

        const result = await pool.query(`
            SELECT
                j.job_id,
                j.title,
                j.company_name,
                j.employment_type,
                j.location,
                j.work_setup,
                j.salary_min,
                j.salary_max,
                j.salary_currency,
                j.status,
                j.description,
                j.requirements,
                j.application_deadline,
                j.contact_email,
                j.application_link,
                j.company_logo,
                j.created_by,
                j.created_at,
                j.updated_at

            FROM jobs j

            WHERE j.job_id = $1
        `, [
            jobId
        ]);


        if (result.rows.length === 0) {

            throw new Error(
                "Job opportunity not found."
            );

        }


        return result.rows[0];

    },


    // ==========================================
    // CREATE JOB
    // ==========================================

    async createJob(data, createdBy) {

        const result = await pool.query(`
            INSERT INTO jobs (
                title,
                company_name,
                employment_type,
                location,
                work_setup,
                salary_min,
                salary_max,
                salary_currency,
                status,
                description,
                requirements,
                application_deadline,
                contact_email,
                application_link,
                company_logo,
                created_by
            )

            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16
            )

            RETURNING *
        `, [

            data.title,
            data.company_name,
            data.employment_type,
            data.location,
            data.work_setup || "onsite",

            data.salary_min ?? null,
            data.salary_max ?? null,
            data.salary_currency || "PHP",

            data.status || "active",

            data.description,
            data.requirements || null,

            data.application_deadline || null,
            data.contact_email || null,
            data.application_link || null,

            data.company_logo || null,

            createdBy || null

        ]);


        return result.rows[0];

    },


    // ==========================================
    // UPDATE JOB
    // ==========================================

    async updateJob(jobId, data) {

        const existingJob =
            await this.getJobById(jobId);


        const result = await pool.query(`
            UPDATE jobs

            SET
                title = $1,
                company_name = $2,
                employment_type = $3,
                location = $4,
                work_setup = $5,
                salary_min = $6,
                salary_max = $7,
                salary_currency = $8,
                status = $9,
                description = $10,
                requirements = $11,
                application_deadline = $12,
                contact_email = $13,
                application_link = $14,
                company_logo = $15,
                updated_at = NOW()

            WHERE job_id = $16

            RETURNING *
        `, [

            data.title ??
                existingJob.title,

            data.company_name ??
                existingJob.company_name,

            data.employment_type ??
                existingJob.employment_type,

            data.location ??
                existingJob.location,

            data.work_setup ??
                existingJob.work_setup,

            data.salary_min !== undefined
                ? data.salary_min
                : existingJob.salary_min,

            data.salary_max !== undefined
                ? data.salary_max
                : existingJob.salary_max,

            data.salary_currency ??
                existingJob.salary_currency,

            data.status ??
                existingJob.status,

            data.description ??
                existingJob.description,

            data.requirements !== undefined
                ? data.requirements
                : existingJob.requirements,

            data.application_deadline !== undefined
                ? data.application_deadline
                : existingJob.application_deadline,

            data.contact_email !== undefined
                ? data.contact_email
                : existingJob.contact_email,

            data.application_link !== undefined
                ? data.application_link
                : existingJob.application_link,

            data.company_logo !== undefined
                ? data.company_logo
                : existingJob.company_logo,

            jobId

        ]);


        return result.rows[0];

    },


    // ==========================================
    // DELETE JOB
    // ==========================================

    async deleteJob(jobId) {

        const result = await pool.query(`
            DELETE FROM jobs

            WHERE job_id = $1

            RETURNING
                job_id,
                title,
                company_name
        `, [
            jobId
        ]);


        if (result.rows.length === 0) {

            throw new Error(
                "Job opportunity not found."
            );

        }


        return result.rows[0];

    }


};


module.exports = JobService;