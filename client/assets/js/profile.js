const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");
const logoutButton = document.getElementById("logout");
const discardButton = document.getElementById("discardChanges");

function getInitials(firstName = "", lastName = "") {
    const firstInitial = firstName.trim().charAt(0);
    const lastInitial = lastName.trim().charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase() || "A";
}

function getFullName(user) {
    return [
        user.first_name,
        user.middle_name,
        user.last_name
    ]
        .filter(value => value && value.trim())
        .join(" ");
}

function showMessage(message, type = "success") {
    if (!profileMessage) {
        return;
    }

    profileMessage.textContent = message;
    profileMessage.className = `profile-message ${type}`;
}

function clearMessage() {
    if (!profileMessage) {
        return;
    }

    profileMessage.textContent = "";
    profileMessage.className = "profile-message";
}

function formatMemberSince(dateValue) {
    if (!dateValue) {
        return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatLastLogin(dateValue) {
    if (!dateValue) {
        return "No login record";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "No login record";
    }

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function setInputValue(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.value = value;
    }
}

function updateProfileInterface(user) {
    const fullName = getFullName(user) || "Administrator";
    const initials = getInitials(
        user.first_name,
        user.last_name
    );

    const roleName = user.role_name || "Administrator";
    const accountStatus = user.is_active
        ? "Active"
        : "Inactive";

    const profileStatus = user.is_active
        ? "Active Account"
        : "Inactive Account";

    setInputValue(
        "firstName",
        user.first_name || ""
    );

    setInputValue(
        "middleName",
        user.middle_name || ""
    );

    setInputValue(
        "lastName",
        user.last_name || ""
    );

    setInputValue(
        "email",
        user.email || ""
    );

    setInputValue(
        "role",
        roleName
    );

    setInputValue(
        "accountStatus",
        accountStatus
    );

    setTextContent(
        "profileFullName",
        fullName
    );

    setTextContent(
        "profileRole",
        roleName
    );

    setTextContent(
        "profileStatus",
        profileStatus
    );

    setTextContent(
        "profileAvatar",
        initials
    );

    setTextContent(
        "sidebarAvatar",
        initials
    );

    setTextContent(
        "topbarAvatar",
        initials
    );

    setTextContent(
        "sidebarName",
        fullName
    );

    setTextContent(
        "sidebarEmail",
        user.email || "No email"
    );

    setTextContent(
        "summaryEmail",
        user.email || "No email"
    );

    setTextContent(
        "memberSince",
        formatMemberSince(user.created_at)
    );

    setTextContent(
        "lastLogin",
        formatLastLogin(user.last_login)
    );

    setTextContent(
        "accountId",
        `#USR-${user.user_id}`
    );

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}

async function loadProfile(showDiscardMessage = false) {
    clearMessage();

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/me",
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to load profile."
            );
        }

        updateProfileInterface(data.user);

        if (showDiscardMessage) {
            showMessage(
                "Unsaved changes were discarded.",
                "success"
            );
        }

    } catch (error) {
        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

        if (
            responseRequiresLogin(error.message)
        ) {
            logoutUser();
        }
    }
}

function responseRequiresLogin(message = "") {
    const normalizedMessage =
        message.toLowerCase();

    return (
        normalizedMessage.includes("token") ||
        normalizedMessage.includes("expired") ||
        normalizedMessage.includes("unauthorized") ||
        normalizedMessage.includes("invalid")
    );
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

if (profileForm) {
    profileForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            showMessage(
                "Profile update function will be connected next.",
                "success"
            );
        }
    );
}

if (discardButton) {
    discardButton.addEventListener(
        "click",
        function () {
            loadProfile(true);
        }
    );
}

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        logoutUser
    );
}

loadProfile();