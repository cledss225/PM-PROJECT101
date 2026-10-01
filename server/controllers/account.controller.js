const AccountService =
    require("../services/account.service");


const AccountController = {


    // GET PENDING ACCOUNTS

    async getPendingAccounts(req, res) {

        try {

            const accounts =
                await AccountService
                    .getPendingAccounts();


            return res.status(200).json({

                success: true,

                count: accounts.length,

                accounts

            });

        } catch (error) {

            console.error(
                "GET PENDING ACCOUNTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load pending accounts."

            });

        }

    },


    // GET ACCOUNT DETAILS

    async getAccountById(req, res) {

        try {

            const userId =
                Number(req.params.id);


            if (!Number.isInteger(userId)) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid user ID."

                });

            }


            const account =
                await AccountService
                    .getAccountById(userId);


            return res.status(200).json({

                success: true,

                account

            });

        } catch (error) {

            return res.status(404).json({

                success: false,

                message: error.message

            });

        }

    },


    // APPROVE ACCOUNT

    async approveAccount(req, res) {

        try {

            const userId =
                Number(req.params.id);


            if (!Number.isInteger(userId)) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid user ID."

                });

            }


            const result =
                await AccountService
                    .approveAccount(
                        userId,
                        req.user?.user_id
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Alumni account approved successfully.",

                account: result.account,

                approved_by:
                    result.approved_by

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    },


    // REJECT ACCOUNT

    async rejectAccount(req, res) {

        try {

            const userId =
                Number(req.params.id);


            const reason =
                req.body.reason?.trim();


            if (!Number.isInteger(userId)) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid user ID."

                });

            }


            if (!reason) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Rejection reason is required."

                });

            }


            const result =
                await AccountService
                    .rejectAccount(
                        userId,
                        reason,
                        req.user?.user_id
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Alumni account rejected successfully.",

                account: result.account,

                rejection_reason:
                    result.rejection_reason,

                rejected_by:
                    result.rejected_by

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    },
    // GET ALL VERIFICATION RECORDS
// OFFICE MONITORING

async getVerificationRecords(req, res) {

    try {

        const accounts =
            await AccountService
                .getVerificationRecords();

        return res.status(200).json({

            success: true,

            count: accounts.length,

            accounts

        });

    } catch (error) {

        console.error(
            "GET VERIFICATION RECORDS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load verification records."

        });

    }

},
// GET ALL VERIFICATION RECORDS
// OFFICE MONITORING

async getVerificationRecords(req, res) {

    try {

        const accounts =
            await AccountService
                .getVerificationRecords();

        return res.status(200).json({

            success: true,

            count: accounts.length,

            accounts

        });

    } catch (error) {

        console.error(
            "GET VERIFICATION RECORDS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load verification records."

        });

    }

}

};


module.exports = AccountController;