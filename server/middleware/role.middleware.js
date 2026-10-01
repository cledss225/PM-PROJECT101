const authorizeRole = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }


        const currentRole = Number(

            req.user.role_id ??
            req.user.roleId ??
            req.user.role

        );


        const permittedRoles =
            allowedRoles.map(role => Number(role));


        if (
            !currentRole ||
            !permittedRoles.includes(currentRole)
        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied.",

                current_role: currentRole || null

            });

        }


        next();

    };

};


module.exports = authorizeRole;