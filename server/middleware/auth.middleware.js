const jwt = require("jsonwebtoken");


const authenticateToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message: "No token provided."

            });

        }


        const token = authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format."

            });

        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        next();

    } catch (error) {

        return res.status(403).json({

            success: false,

            message: "Invalid or expired token."

        });

    }

};


module.exports = authenticateToken;