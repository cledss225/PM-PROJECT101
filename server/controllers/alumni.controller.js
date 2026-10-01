const Alumni = require("../models/alumni.model");


const AlumniController = {


    async createProfile(req, res) {

        try {

            const profile = await Alumni.create({

                user_id: req.user.user_id,

                student_number: req.body.student_number,

                program: req.body.program,

                batch_year: req.body.batch_year,

                birth_date: req.body.birth_date,

                gender: req.body.gender,

                phone_number: req.body.phone_number,

                address: req.body.address,

                current_job: req.body.current_job,

                company: req.body.company,

                linkedin_url: req.body.linkedin_url

            });


            res.status(201).json({

                success: true,

                message: "Alumni profile created successfully.",

                profile

            });


        } catch(error) {

            res.status(400).json({

                success: false,

                message: error.message

            });

        }

    },



    async getProfile(req,res){

        try {

            const profile = await Alumni.findByUserId(
                req.user.user_id
            );


            if(!profile){

                return res.status(404).json({

                    success:false,

                    message:"Profile not found."

                });

            }


            res.json({

                success:true,

                profile

            });


        } catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    },



    async getAllAlumni(req, res) {

        try {

            const result =
                await Alumni.findAll({

                    page:
                        req.query.page,

                    limit:
                        req.query.limit,

                    search:
                        req.query.search,

                    program:
                        req.query.program,

                    batch:
                        req.query.batch,

                    verification:
                        req.query.verification,

                    sort:
                        req.query.sort

                });


            res.json({

                success: true,

                count:
                    result.alumni.length,

                total:
                    result.total,

                page:
                    result.page,

                limit:
                    result.limit,

                totalPages:
                    result.totalPages,

                alumni:
                    result.alumni

            });


        } catch(error) {

            console.error(
                "GET ALL ALUMNI ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load alumni directory."

            });

        }

    },



    async getDirectoryMeta(req, res) {

        try {

            const meta =
                await Alumni.getDirectoryMeta();


            res.json({

                success: true,

                summary:
                    meta.summary,

                filters:
                    meta.filters

            });


        } catch(error) {

            console.error(
                "GET ALUMNI DIRECTORY META ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load alumni directory information."

            });

        }

    },



    async updateProfile(req,res){

        try{


            const profile = await Alumni.update(

                req.user.user_id,

                req.body

            );


            res.json({

                success:true,

                message:"Profile updated successfully.",

                profile

            });


        }catch(error){


            res.status(400).json({

                success:false,

                message:error.message

            });


        }


    },



    async deleteProfile(req,res){

        try{


            await Alumni.delete(

                req.user.user_id

            );


            res.json({

                success:true,

                message:"Profile deleted successfully."

            });


        }catch(error){


            res.status(400).json({

                success:false,

                message:error.message

            });


        }


    }


};


module.exports = AlumniController;
