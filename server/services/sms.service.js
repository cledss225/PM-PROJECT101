function normalizePhilippineNumber(
    phoneNumber
) {

    let value =
        String(
            phoneNumber || ""
        )
            .replace(
                /\D/g,
                ""
            );


    if (
        /^09\d{9}$/.test(
            value
        )
    ) {

        return `63${value.slice(1)}`;

    }


    if (
        /^639\d{9}$/.test(
            value
        )
    ) {

        return value;

    }


    throw new Error(
        "Invalid Philippine mobile number."
    );

}


const SmsService = {


    async sendVerificationCode(
        phoneNumber,
        code
    ) {

        if (
            !process.env.SEMAPHORE_API_KEY
        ) {

            throw new Error(
                "Semaphore API key is not configured."
            );

        }


        const number =
            normalizePhilippineNumber(
                phoneNumber
            );


        const params =
            new URLSearchParams();


        params.append(
            "apikey",
            process.env.SEMAPHORE_API_KEY
        );


        params.append(
            "number",
            number
        );


        params.append(
            "message",
            "Your AlumniHub verification code is {otp}. It expires in 10 minutes."
        );


        params.append(
            "code",
            code
        );


        if (
            process.env.SEMAPHORE_SENDERNAME
        ) {

            params.append(
                "sendername",
                process.env.SEMAPHORE_SENDERNAME
            );

        }


        const response =
            await fetch(
                "https://api.semaphore.co/api/v4/otp",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "Accept":
                            "application/json"
                    },

                    body:
                        params.toString()
                }
            );


        const rawText =
            await response.text();


        let data;


        try {

            data =
                rawText
                    ? JSON.parse(
                        rawText
                    )
                    : null;

        } catch {

            throw new Error(
                `Invalid Semaphore response: ${rawText}`
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.message ||
                data?.error ||
                `Semaphore request failed with status ${response.status}.`
            );

        }


        const message =
            Array.isArray(data)
                ? data[0]
                : data;


        if (!message) {

            throw new Error(
                "Semaphore did not return a message result."
            );

        }


        const status =
            String(
                message.status || ""
            )
                .trim()
                .toLowerCase();


        if (
            status === "failed" ||
            status === "refunded"
        ) {

            throw new Error(
                `SMS delivery failed with status: ${message.status}.`
            );

        }


        return message;

    }


};


module.exports =
    SmsService;