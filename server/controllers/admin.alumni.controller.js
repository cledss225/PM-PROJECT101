const AlumniAdminService =
require("../services/alumni.admin.service");

const AdminAlumni =
require("../models/admin.alumni.model");


const AdminAlumniController = {

    // =====================================
    // CREATE ALUMNI
    // =====================================

    async createAlumni(req, res){

        try{

            const alumni =
            await AlumniAdminService.createAlumni(
                req.body,
                req.user
            );


            const createdAndVerified =
            Number(req.user?.role_id) === 1 &&
            (
                req.body.verify_immediately === true ||
                req.body.verify_immediately === "true"
            );


            return res.status(201).json({

                success: true,

                message: createdAndVerified
                    ? "Alumni account created and verified successfully."
                    : "Alumni account created successfully and is pending verification.",

                alumni

            });

        }catch(error){

            console.error(
                "CREATE ALUMNI CONTROLLER ERROR:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                error.message ||
                "Unable to create alumni account."

            });

        }

    },


    // =====================================
    // UPDATE ALUMNI
    // =====================================

    async updateAlumni(req, res){

        try{

            const alumni =
            await AdminAlumni.update(
                req.params.user_id,
                req.body
            );


            if(!alumni){

                return res.status(404).json({

                    success: false,

                    message: "Alumni not found."

                });

            }


            return res.json({

                success: true,

                message: "Alumni updated successfully.",

                alumni

            });

        }catch(error){

            console.error(
                "UPDATE ALUMNI CONTROLLER ERROR:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                error.message ||
                "Unable to update alumni record."

            });

        }

    },


    // =====================================
    // DELETE ALUMNI
    // =====================================

    async deleteAlumni(req, res){

        try{

            const deleted =
            await AdminAlumni.delete(
                req.params.user_id
            );


            if(!deleted){

                return res.status(404).json({

                    success: false,

                    message: "Alumni not found."

                });

            }


            return res.json({

                success: true,

                message: "Alumni deleted successfully."

            });

        }catch(error){

            console.error(
                "DELETE ALUMNI CONTROLLER ERROR:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                error.message ||
                "Unable to delete alumni record."

            });

        }

    }

};


module.exports = AdminAlumniController;