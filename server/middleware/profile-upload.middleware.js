const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDirectory =
    path.join(
        __dirname,
        "../../client/assets/images/avatars"
    );


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


const storage =
    multer.diskStorage({

        destination(
            req,
            file,
            callback
        ) {

            callback(
                null,
                uploadDirectory
            );

        },


        filename(
            req,
            file,
            callback
        ) {

            const extension =
                path.extname(
                    file.originalname
                )
                    .toLowerCase();


            const safeExtension =
                [".jpg", ".jpeg", ".png", ".webp"]
                    .includes(extension)
                    ? extension
                    : ".jpg";


            const fileName =
                `alumni-${req.user.user_id}-${Date.now()}${safeExtension}`;


            callback(
                null,
                fileName
            );

        }

    });


function fileFilter(
    req,
    file,
    callback
) {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        return callback(
            new Error(
                "Only JPG, PNG, and WEBP images are allowed."
            )
        );

    }


    callback(
        null,
        true
    );

}


const uploadProfilePicture =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024
        }

    });


module.exports =
    uploadProfilePicture;