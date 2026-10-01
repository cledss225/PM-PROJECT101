const nodemailer =
    require("nodemailer");


const transporter =
    nodemailer.createTransport({

        service:
            "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_APP_PASSWORD

        },

        tls: {
            rejectUnauthorized: false
        }

    });


const EmailService = {


    async sendVerificationCode(
        email,
        code
    ) {

        if (
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_APP_PASSWORD
        ) {

            throw new Error(
                "Email sender is not configured."
            );

        }


        await transporter.sendMail({

            from:
                `"AlumniHub - Alumni Management System" <${process.env.EMAIL_USER}>`,

            to:
                email,

            subject:
                "Your AlumniHub Verification Code",

            text:
                `Your AlumniHub verification code is ${code}. This code expires in 10 minutes.`,

            html: `
                <div
                    style="
                        font-family:Arial,sans-serif;
                        max-width:520px;
                        margin:0 auto;
                        padding:28px;
                        color:#1f2937;
                    "
                >
                    <h2 style="margin:0 0 10px;">
                        AlumniHub Email Verification
                    </h2>

                    <p style="line-height:1.6;">
                        Use the verification code below to verify your alumni account.
                    </p>

                    <div
                        style="
                            margin:24px 0;
                            padding:18px;
                            border-radius:12px;
                            background:#f5f3ff;
                            text-align:center;
                        "
                    >
                        <div
                            style="
                                font-size:30px;
                                font-weight:700;
                                letter-spacing:8px;
                                color:#6d28d9;
                            "
                        >
                            ${code}
                        </div>
                    </div>

                    <p style="line-height:1.6;">
                        This code will expire in <strong>10 minutes</strong>.
                        If you did not create an AlumniHub account, you can ignore this email.
                    </p>
                </div>
            `

        });

    }


};


module.exports =
    EmailService;