const registerForm =
    document.getElementById(
        "registerForm"
    );

const registerPage =
    document.getElementById(
        "registerPage"
    );

const registerView =
    document.getElementById(
        "registerView"
    );

const verificationView =
    document.getElementById(
        "verificationView"
    );

const footerStageText =
    document.getElementById(
        "footerStageText"
    );

let pendingRegistration = null;


if (!registerForm) {

    console.error(
        "Register form was not found."
    );

} else {

    registerForm.addEventListener(
        "submit",
        handleRegister
    );

}


initializePasswordToggles();
initializeVerificationUI();


async function handleRegister(
    event
) {

    event.preventDefault();


    const firstName =
        document.getElementById(
            "firstName"
        )?.value.trim() || "";


    const middleName =
        document.getElementById(
            "middleName"
        )?.value.trim() || "";


    const lastName =
        document.getElementById(
            "lastName"
        )?.value.trim() || "";


    const email =
        document.getElementById(
            "registerEmail"
        )?.value.trim().toLowerCase() || "";


    const phoneNumber =
        document.getElementById(
            "phoneNumber"
        )?.value.trim() || "";


    const password =
        document.getElementById(
            "registerPassword"
        )?.value || "";


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        )?.value || "";


    const submitButton =
        document.getElementById(
            "registerButton"
        );


    if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !password ||
        !confirmPassword
    ) {

        showRegisterMessage(
            "Please complete all required fields.",
            "error"
        );

        return;

    }


    if (
        !/^09\d{9}$/.test(
            phoneNumber
        )
    ) {

        showRegisterMessage(
            "Please enter a valid 11-digit Philippine mobile number.",
            "error"
        );

        return;

    }


    if (
        password.length < 8
    ) {

        showRegisterMessage(
            "Password must be at least 8 characters long.",
            "error"
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        showRegisterMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    const originalButtonContent =
        submitButton?.innerHTML;


    try {

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.innerHTML = `
                <span class="login-spinner"></span>
                Creating account...
            `;

        }


        const response =
            await fetch(
                "/api/auth/register",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            role_id:
                                2,

                            first_name:
                                firstName,

                            middle_name:
                                middleName ||
                                null,

                            last_name:
                                lastName,

                            email,

                            phone_number:
                                phoneNumber,

                            password
                        })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "REGISTER HTTP STATUS:",
            response.status
        );


        console.log(
            "REGISTER RESPONSE:",
            responseText
        );


        let data = {};


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    `Invalid server response: ${responseText}`
                );

            }

        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to create account."
            );

        }


        pendingRegistration = {
            user:
                data.user || null,

            email,

            phoneNumber,

            firstName,

            lastName
        };


        showVerificationStep();


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        showRegisterMessage(
            error.message ||
            "Unable to create account.",
            "error"
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                originalButtonContent ||
                `
                    <span>Create Account</span>
                    <i class="bx bx-user-plus"></i>
                `;

        }

    }

}


function showVerificationStep() {

    const summary =
        document.getElementById(
            "verificationAccountSummary"
        );


    if (summary) {

        summary.textContent =
            `Account created for ${pendingRegistration?.email || "your email"}. Choose a verification method to continue.`;

    }


    const emailText =
        document.getElementById(
            "emailVerificationText"
        );


    if (emailText) {

        emailText.textContent =
            `Verification code will be sent to ${maskEmail(
                pendingRegistration?.email
            )}.`;

    }


    const smsText =
        document.getElementById(
            "smsVerificationText"
        );


    if (smsText) {

        smsText.textContent =
            `A 6-digit OTP will be sent to ${maskPhone(
                pendingRegistration?.phoneNumber
            )}.`;

    }


    registerPage?.classList.add(
        "verification-mode"
    );


    window.setTimeout(
        () => {

            registerView?.classList.add(
                "hide"
            );

            verificationView?.classList.add(
                "show"
            );

            if (footerStageText) {

                footerStageText.textContent =
                    "Alumni Verification";

            }

        },
        380
    );

}


function initializeVerificationUI() {

    document
        .querySelectorAll(
            ".verification-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        selectVerificationMethod(
                            card.dataset.method
                        );

                    }
                );

            }
        );


    setupOtpGroup(
        "email"
    );

    setupOtpGroup(
        "sms"
    );


    document
        .getElementById(
            "sendEmailCodeBtn"
        )
        ?.addEventListener(
            "click",
            sendEmailVerificationCode
        );


    document
        .getElementById(
            "sendSmsCodeBtn"
        )
        ?.addEventListener(
            "click",
            sendSmsVerificationCode
        );


    document
        .getElementById(
            "verifyEmailCodeBtn"
        )
        ?.addEventListener(
            "click",
            verifyEmailVerificationCode
        );


    document
        .getElementById(
            "verifySmsCodeBtn"
        )
        ?.addEventListener(
            "click",
            verifySmsVerificationCode
        );


    document
        .getElementById(
            "manualVerificationBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                showManualVerificationComplete();

            }
        );

}


function selectVerificationMethod(
    method
) {

    document
        .querySelectorAll(
            ".verification-card"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "active",
                    card.dataset.method ===
                    method
                );

            }
        );


    const panels = {
        email:
            "emailVerificationPanel",

        sms:
            "smsVerificationPanel",

        manual:
            "manualVerificationPanel"
    };


    Object
        .entries(
            panels
        )
        .forEach(
            ([key, id]) => {

                document
                    .getElementById(
                        id
                    )
                    ?.classList.toggle(
                        "show",
                        key === method
                    );

            }
        );

}


function setupOtpGroup(
    groupName
) {

    const inputs =
        Array.from(
            document.querySelectorAll(
                `[data-otp-group="${groupName}"] input`
            )
        );


    inputs.forEach(
        (input, index) => {

            input.addEventListener(
                "input",
                () => {

                    input.value =
                        input.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                1
                            );


                    if (
                        input.value &&
                        inputs[index + 1]
                    ) {

                        inputs[index + 1]
                            .focus();

                    }

                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Backspace" &&
                        !input.value &&
                        inputs[index - 1]
                    ) {

                        inputs[index - 1]
                            .focus();

                    }

                }
            );

        }
    );

}


async function sendEmailVerificationCode() {

    const button =
        document.getElementById(
            "sendEmailCodeBtn"
        );


    const email =
        pendingRegistration?.email;


    if (!email) {

        showVerificationNotice(
            "Registration email was not found. Please return to registration and try again."
        );

        return;

    }


    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML = `
                <span class="login-spinner"></span>
                Sending Code...
            `;

        }


        const response =
            await fetch(
                "/api/auth/send-email-code",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email
                        })
                }
            );


        const responseText =
            await response.text();


        let data = {};


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    `Invalid server response: ${responseText}`
                );

            }

        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to send verification code."
            );

        }


        showVerificationNotice(
            `A 6-digit verification code was sent to ${maskEmail(email)}. It expires in 10 minutes.`
        );


        const firstInput =
            document.querySelector(
                '[data-otp-group="email"] input'
            );


        firstInput?.focus();


    } catch (error) {

        console.error(
            "SEND EMAIL CODE ERROR:",
            error
        );


        showVerificationNotice(
            error.message ||
            "Unable to send verification code."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalContent ||
                "Send Code";

        }

    }

}


async function verifyEmailVerificationCode() {

    const button =
        document.getElementById(
            "verifyEmailCodeBtn"
        );


    const email =
        pendingRegistration?.email;


    const inputs =
        Array.from(
            document.querySelectorAll(
                '[data-otp-group="email"] input'
            )
        );


    const code =
        inputs
            .map(
                input =>
                    input.value.trim()
            )
            .join("");


    if (!email) {

        showVerificationNotice(
            "Registration email was not found."
        );

        return;

    }


    if (
        !/^\d{6}$/.test(
            code
        )
    ) {

        showVerificationNotice(
            "Please enter the complete 6-digit verification code."
        );

        return;

    }


    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML = `
                <span class="login-spinner"></span>
                Verifying...
            `;

        }


        const response =
            await fetch(
                "/api/auth/verify-email-code",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            code
                        })
                }
            );


        const responseText =
            await response.text();


        let data = {};


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    `Invalid server response: ${responseText}`
                );

            }

        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to verify email."
            );

        }


        showVerificationNotice(
            "Email verified successfully! Your AlumniHub account is now verified. Redirecting to sign in..."
        );


        if (button) {

            button.innerHTML = `
                <i class="bx bx-check"></i>
                Verified
            `;

        }


        window.setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1800
        );


    } catch (error) {

        console.error(
            "VERIFY EMAIL CODE ERROR:",
            error
        );


        showVerificationNotice(
            error.message ||
            "Unable to verify email."
        );


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalContent ||
                "Verify Email";

        }

    }

}


async function sendSmsVerificationCode() {

    const button =
        document.getElementById(
            "sendSmsCodeBtn"
        );


    const email =
        pendingRegistration?.email;


    if (!email) {

        showVerificationNotice(
            "Registration email was not found."
        );

        return;

    }


    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML = `
                <span class="login-spinner"></span>
                Sending OTP...
            `;

        }


        const response =
            await fetch(
                "/api/auth/send-sms-code",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email
                        })
                }
            );


        const responseText =
            await response.text();


        let data = {};


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    `Invalid server response: ${responseText}`
                );

            }

        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to send SMS OTP."
            );

        }


        showVerificationNotice(
            `A 6-digit SMS OTP was sent to ${data.phone_number || maskPhone(pendingRegistration?.phoneNumber)}. It expires in 10 minutes.`
        );


        document
            .querySelector(
                '[data-otp-group="sms"] input'
            )
            ?.focus();


    } catch (error) {

        console.error(
            "SEND SMS OTP ERROR:",
            error
        );


        showVerificationNotice(
            error.message ||
            "Unable to send SMS OTP."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalContent ||
                "Send OTP";

        }

    }

}


async function verifySmsVerificationCode() {

    const button =
        document.getElementById(
            "verifySmsCodeBtn"
        );


    const email =
        pendingRegistration?.email;


    const inputs =
        Array.from(
            document.querySelectorAll(
                '[data-otp-group="sms"] input'
            )
        );


    const code =
        inputs
            .map(
                input =>
                    input.value.trim()
            )
            .join("");


    if (!email) {

        showVerificationNotice(
            "Registration email was not found."
        );

        return;

    }


    if (
        !/^\d{6}$/.test(
            code
        )
    ) {

        showVerificationNotice(
            "Please enter the complete 6-digit SMS OTP."
        );

        return;

    }


    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML = `
                <span class="login-spinner"></span>
                Verifying...
            `;

        }


        const response =
            await fetch(
                "/api/auth/verify-sms-code",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            code
                        })
                }
            );


        const responseText =
            await response.text();


        let data = {};


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    `Invalid server response: ${responseText}`
                );

            }

        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to verify SMS OTP."
            );

        }


        showVerificationNotice(
            "Mobile number verified successfully! Your AlumniHub account is now verified. Redirecting to sign in..."
        );


        if (button) {

            button.innerHTML = `
                <i class="bx bx-check"></i>
                Verified
            `;

        }


        window.setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1800
        );


    } catch (error) {

        console.error(
            "VERIFY SMS OTP ERROR:",
            error
        );


        showVerificationNotice(
            error.message ||
            "Unable to verify SMS OTP."
        );


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalContent ||
                "Verify Mobile Number";

        }

    }

}


function showManualVerificationComplete() {

    const button =
        document.getElementById(
            "manualVerificationBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML = `
            <span class="login-spinner"></span>
            Submitting...
        `;

    }


    window.setTimeout(
        () => {

            if (button) {

                button.innerHTML = `
                    <i class="bx bx-check"></i>
                    Submitted for Admin Review
                `;

            }


            showVerificationNotice(
                "Your account is pending manual administrator verification."
            );


            window.setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                1800
            );

        },
        700
    );

}


function showVerificationNotice(
    message
) {

    const summary =
        document.getElementById(
            "verificationAccountSummary"
        );


    if (!summary) return;


    summary.textContent =
        message;


    summary.style.border =
        "1px solid rgba(139, 92, 246, 0.18)";

    summary.style.background =
        "rgba(139, 92, 246, 0.06)";

}


function showRegisterMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "registerMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.className =
        `register-message ${type} show`;


    messageBox.textContent =
        message;


    window.clearTimeout(
        messageBox.hideTimer
    );


    messageBox.hideTimer =
        window.setTimeout(
            () => {

                messageBox.classList.remove(
                    "show"
                );

            },
            5000
        );

}


function initializePasswordToggles() {

    setupPasswordToggle(
        "registerPassword",
        "registerPasswordToggle"
    );


    setupPasswordToggle(
        "confirmPassword",
        "confirmPasswordToggle"
    );

}


function setupPasswordToggle(
    inputId,
    toggleId
) {

    const input =
        document.getElementById(
            inputId
        );


    const toggle =
        document.getElementById(
            toggleId
        );


    if (
        !input ||
        !toggle
    ) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            const hidden =
                input.type ===
                "password";


            input.type =
                hidden
                    ? "text"
                    : "password";


            toggle.className =
                hidden
                    ? "bx bx-hide password-toggle"
                    : "bx bx-show password-toggle";


            toggle.title =
                hidden
                    ? "Hide password"
                    : "Show password";

        }
    );

}


function maskEmail(
    email
) {

    if (!email) {
        return "your registered email";
    }


    const parts =
        String(email).split("@");


    if (parts.length !== 2) {
        return email;
    }


    const name =
        parts[0];

    const domain =
        parts[1];


    const visible =
        name.slice(
            0,
            Math.min(
                2,
                name.length
            )
        );


    return `${visible}${"*".repeat(
        Math.max(
            2,
            name.length - visible.length
        )
    )}@${domain}`;

}


function maskPhone(
    phone
) {

    if (!phone) {
        return "your registered mobile number";
    }


    const value =
        String(phone);


    if (value.length < 4) {
        return value;
    }


    return `${value.slice(0, 2)}${"*".repeat(
        Math.max(
            5,
            value.length - 5
        )
    )}${value.slice(-3)}`;

}