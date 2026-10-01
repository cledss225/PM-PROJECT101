const AuthService =
    require("../services/auth.service");


const AuthController = {


    async register(
        req,
        res
    ) {

        try {

            const user =
                await AuthService.register(
                    req.body
                );


            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Registration successful.",

                    user

                });


        } catch (error) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async sendEmailVerificationCode(
        req,
        res
    ) {

        try {

            const result =
                await AuthService
                    .sendEmailVerificationCode(
                        req.body.email
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Verification code sent successfully.",

                    expires_at:
                        result.expires_at

                });


        } catch (error) {

            console.error(
                "SEND EMAIL VERIFICATION ERROR:",
                error
            );


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async verifyEmailVerificationCode(
        req,
        res
    ) {

        try {

            const result =
                await AuthService
                    .verifyEmailVerificationCode(
                        req.body.email,
                        req.body.code
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Email verified successfully.",

                    user:
                        result.user

                });


        } catch (error) {

            console.error(
                "VERIFY EMAIL CODE ERROR:",
                error
            );


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async sendSmsVerificationCode(
        req,
        res
    ) {

        try {

            const result =
                await AuthService
                    .sendSmsVerificationCode(
                        req.body.email
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "SMS OTP sent successfully.",

                    expires_at:
                        result.expires_at,

                    phone_number:
                        result.masked_phone_number

                });


        } catch (error) {

            console.error(
                "SEND SMS VERIFICATION ERROR:",
                error
            );


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async verifySmsVerificationCode(
        req,
        res
    ) {

        try {

            const result =
                await AuthService
                    .verifySmsVerificationCode(
                        req.body.email,
                        req.body.code
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Mobile number verified successfully.",

                    user:
                        result.user

                });


        } catch (error) {

            console.error(
                "VERIFY SMS CODE ERROR:",
                error
            );


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async login(
        req,
        res
    ) {

        try {

            const {
                email,
                password
            } = req.body;


            const result =
                await AuthService.login(
                    email,
                    password
                );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Login successful.",

                    token:
                        result.token,

                    user:
                        result.user

                });


        } catch (error) {

            return res
                .status(401)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async getCurrentUser(
        req,
        res
    ) {

        try {

            const user =
                await AuthService
                    .getCurrentUser(
                        req.user.user_id
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    user

                });


        } catch (error) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async updateAccount(
        req,
        res
    ) {

        try {

            const userId =
                req.user.user_id;


            const updatedUser =
                await AuthService
                    .updateAccount(
                        userId,
                        req.body
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Account information updated successfully.",

                    user:
                        updatedUser

                });


        } catch (error) {

            console.error(
                "UPDATE ACCOUNT ERROR:",
                error
            );


            const status =
                error.message ===
                "User not found."
                    ? 404
                    : 400;


            return res
                .status(status)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async updateProfilePicture(
        req,
        res
    ) {

        try {

            const userId =
                req.user.user_id;


            if (!req.file) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please select a valid profile picture."

                    });

            }


            const profilePicturePath =
                `/assets/images/avatars/${req.file.filename}`;


            const updatedUser =
                await AuthService
                    .updateProfilePicture(
                        userId,
                        profilePicturePath
                    );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Profile picture updated successfully.",

                    profile_picture:
                        updatedUser.profile_picture,

                    user:
                        updatedUser

                });


        } catch (error) {

            console.error(
                "UPDATE PROFILE PICTURE ERROR:",
                error
            );


            const status =
                error.message ===
                "User not found."
                    ? 404
                    : 400;


            return res
                .status(status)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    },


    async changePassword(
        req,
        res
    ) {

        try {

            const userId =
                req.user.user_id;


            await AuthService
                .changePassword(
                    userId,
                    req.body
                );


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Password changed successfully."

                });


        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            const status =
                error.message ===
                "User not found."
                    ? 404
                    : 400;


            return res
                .status(status)
                .json({

                    success: false,

                    message:
                        error.message

                });

        }

    }


};


module.exports =
    AuthController;