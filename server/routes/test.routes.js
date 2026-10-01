const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");


// PUBLIC TEST ROUTE
// GET /api/test

router.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message: "Test route is working."

        });

    }
);


// PROTECTED TEST ROUTE
// GET /api/test/profile

router.get(
    "/profile",
    authenticateToken,
    (req, res) => {

        return res.status(200).json({

            success: true,

            message: "Protected test route is working.",

            user: req.user

        });

    }
);


module.exports = router;