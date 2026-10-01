const pool = require("../config/db");


// ==========================================
// GET ALL ANNOUNCEMENTS
// ==========================================

exports.getAllAnnouncements = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM announcements
            ORDER BY created_at DESC
        `);

        res.status(200).json({
            success: true,
            announcements: result.rows
        });

    } catch (error) {

        console.error(
            "GET ANNOUNCEMENTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load announcements."
        });

    }

};


// ==========================================
// GET ONE ANNOUNCEMENT
// ==========================================

exports.getAnnouncementById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM announcements
            WHERE announcement_id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Announcement not found."
            });

        }

        res.status(200).json({
            success: true,
            announcement: result.rows[0]
        });

    } catch (error) {

        console.error(
            "GET ANNOUNCEMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load announcement."
        });

    }

};


// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================

exports.createAnnouncement = async (req, res) => {

    try {

        const {
            title,
            category,
            priority,
            target_audience,
            target_value,
            status,
            publish_date,
            expiry_date,
            content
        } = req.body;


        if (!title || !content) {

            return res.status(400).json({
                success: false,
                message: "Title and content are required."
            });

        }


        const createdBy =
            req.user?.user_id ||
            req.user?.id ||
            null;


        const result = await pool.query(
            `
            INSERT INTO announcements (
                title,
                category,
                priority,
                target_audience,
                target_value,
                status,
                publish_date,
                expiry_date,
                content,
                created_by
            )

            VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,$10
            )

            RETURNING *
            `,
            [
                title,
                category || "general",
                priority || "normal",
                target_audience || "all",
                target_value || null,
                status || "published",
                publish_date || null,
                expiry_date || null,
                content,
                createdBy
            ]
        );


        res.status(201).json({
            success: true,
            message: "Announcement created successfully.",
            announcement: result.rows[0]
        });

    } catch (error) {

        console.error(
            "CREATE ANNOUNCEMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to create announcement.",
            error: error.message
        });

    }

};


// ==========================================
// UPDATE ANNOUNCEMENT
// ==========================================

exports.updateAnnouncement = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            category,
            priority,
            target_audience,
            target_value,
            status,
            publish_date,
            expiry_date,
            content
        } = req.body;


        const result = await pool.query(
            `
            UPDATE announcements

            SET
                title = $1,
                category = $2,
                priority = $3,
                target_audience = $4,
                target_value = $5,
                status = $6,
                publish_date = $7,
                expiry_date = $8,
                content = $9,
                updated_at = CURRENT_TIMESTAMP

            WHERE announcement_id = $10

            RETURNING *
            `,
            [
                title,
                category,
                priority,
                target_audience,
                target_value || null,
                status,
                publish_date || null,
                expiry_date || null,
                content,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Announcement not found."
            });

        }


        res.status(200).json({
            success: true,
            message: "Announcement updated successfully.",
            announcement: result.rows[0]
        });

    } catch (error) {

        console.error(
            "UPDATE ANNOUNCEMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to update announcement.",
            error: error.message
        });

    }

};


// ==========================================
// DELETE ANNOUNCEMENT
// ==========================================

exports.deleteAnnouncement = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM announcements
            WHERE announcement_id = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Announcement not found."
            });

        }


        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully."
        });

    } catch (error) {

        console.error(
            "DELETE ANNOUNCEMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete announcement.",
            error: error.message
        });

    }

};