const loginForm = document.getElementById("loginForm");


if (!loginForm) {

    console.error("Login form was not found.");

} else {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


async function handleLogin(event) {

    event.preventDefault();


    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const submitButton =
        loginForm.querySelector(
            'button[type="submit"]'
        );


    if (
        !emailInput ||
        !passwordInput ||
        !submitButton
    ) {

        console.error(
            "Required login elements are missing."
        );

        return;

    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const originalButtonContent =
        submitButton.innerHTML;


    try {

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span class="login-spinner"></span>
            Signing in...
        `;


        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const responseText =
            await response.text();


        console.log(
            "Login HTTP status:",
            response.status
        );

        console.log(
            "Login raw response:",
            responseText
        );


        let data;


        try {

            data = JSON.parse(responseText);

        } catch (parseError) {

            throw new Error(
                `Invalid server response: ${responseText}`
            );

        }


        if (!response.ok || !data.success) {

            showLoginMessage(
                data.message ||
                "Invalid email or password.",
                "error"
            );

            return;

        }


        if (
            !data.token ||
            !data.user
        ) {

            throw new Error(
                "The server did not return a token or user information."
            );

        }


        localStorage.setItem(
            "token",
            data.token
        );


        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        const redirectPath =
            getRoleRedirect(data.user);


        if (!redirectPath) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");


            showLoginMessage(
                `Unrecognized account role: ${
                    data.user.role_id ?? "none"
                }`,
                "error"
            );

            return;

        }


        showLoginSuccess(
            redirectPath,
            data.user
        );


    } catch (error) {

        console.error(
            "Complete login error:",
            error
        );


        showLoginMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );


    } finally {

        if (
            !document.querySelector(
                ".login-success-overlay"
            )
        ) {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonContent;

        }

    }

}


function getRoleRedirect(user) {

    const roleId =
        Number(user.role_id);


    switch (roleId) {

        case 1:
            return "dashboard.html";


        case 2:
            return "../alumni/alumni-dashboard.html";


        case 3:
            return "../office/office-dashboard.html";


        default:
            return null;

    }

}


function showLoginMessage(
    message,
    type
) {

    let messageBox =
        document.getElementById(
            "loginMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "loginMessage";

        loginForm.prepend(
            messageBox
        );

    }


    messageBox.className =
        `login-message ${type}`;

    messageBox.textContent =
        message;


    requestAnimationFrame(() => {

        messageBox.classList.add(
            "show"
        );

    });


    window.clearTimeout(
        messageBox.hideTimer
    );


    messageBox.hideTimer =
        window.setTimeout(() => {

            messageBox.classList.remove(
                "show"
            );

        }, 5000);

}


function showLoginSuccess(
    redirectPath,
    user
) {

    const roleId =
        Number(user.role_id);


    let portalName =
        "AlumniHub dashboard";


    if (roleId === 3) {

        portalName =
            "Alumni Office portal";

    } else if (roleId === 2) {

        portalName =
            "Alumni portal";

    }


    const overlay =
        document.createElement("div");


    overlay.className =
        "login-success-overlay";


    overlay.innerHTML = `
        <div class="login-success-card">

            <div class="success-icon">
    <img
        src="/assets/images/logo/ams-round-logo.jpg"
        alt="AMS Logo"
        class="success-logo"
    >
</div>

            <h2>Access Granted</h2>

            <p>
                Preparing your ${portalName}...
            </p>

            <div class="success-progress">
                <span></span>
            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    requestAnimationFrame(() => {

        overlay.classList.add(
            "show"
        );

    });


    setTimeout(() => {

        document.body.classList.add(
            "page-leaving"
        );

    }, 1100);


    setTimeout(() => {

        window.location.href =
            redirectPath;

    }, 1650);

}s
