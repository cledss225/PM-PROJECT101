/* =========================================================
   ALUMNIHUB SETTINGS
   PART 1: CORE, USER DATA, NAVIGATION, THEME, BIO
========================================================= */

"use strict";


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const SETTINGS_STORAGE_KEY = "alumniHubSettings";
const PROFILE_IMAGE_STORAGE_KEY = "alumniHubProfileImage";
const THEME_STORAGE_KEY = "savedTheme";
const ACCENT_STORAGE_KEY = "alumniHubAccentColor";
const FONT_SIZE_STORAGE_KEY = "alumniHubFontSize";


/* =========================================================
   AUTHENTICATION
========================================================= */

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");


if (!token) {

    window.location.href = "login.html";

}


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentUser = null;
let currentProfileImage = null;
let settingsToastTimer = null;


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings = {

    profile: {

        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "System Administrator",
        address: "",
        bio: ""

    },

    notifications: {

        emailNotifications: true,
        systemNotifications: true,
        eventReminders: true,
        jobAlerts: true,
        announcementNotifications: true,
        marketingEmails: false

    },

    appearance: {

        theme: "light",
        accentColor: "blue",
        fontSize: "medium"

    },

    security: {

        twoFactorAuthentication: false,
        loginAlerts: true,
        automaticLogout: true,
        sessionTimeout: "30"

    },

    system: {

        language: "en",
        timezone: "Asia/Manila",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12",
        defaultDashboard: "dashboard.html",
        recordsPerPage: "25",
        automaticDataRefresh: true,
        confirmationDialogs: true

    }

};


/* =========================================================
   DOM HELPER
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   SAFE JSON PARSER
========================================================= */

function parseJSON(value, fallback = null) {

    if (!value) {

        return fallback;

    }


    try {

        return JSON.parse(value);

    } catch (error) {

        console.error("Unable to parse stored JSON:", error);

        return fallback;

    }

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

function loadCurrentUser() {

    currentUser = parseJSON(storedUser, {});


    if (!currentUser || typeof currentUser !== "object") {

        currentUser = {};

    }


    const firstName =

        currentUser.first_name ||
        currentUser.firstName ||
        currentUser.name?.split(" ")[0] ||
        "Administrator";


    const middleName =

        currentUser.middle_name ||
        currentUser.middleName ||
        "";


    const lastName =

        currentUser.last_name ||
        currentUser.lastName ||
        currentUser.name?.split(" ").slice(1).join(" ") ||
        "";


    const email =

        currentUser.email ||
        "admin@alumnihub.com";


    const role = getUserRoleName(currentUser);


    currentUser = {

        ...currentUser,

        firstName,
        middleName,
        lastName,
        email,
        role

    };


    populateUserInformation();

}


/* =========================================================
   USER ROLE
========================================================= */

function getUserRoleName(user) {

    const roleId = Number(

        user.role_id ||
        user.roleId ||
        user.role?.role_id ||
        user.role?.id

    );


    const storedRoleName =

        user.role_name ||
        user.roleName ||
        user.role?.role_name ||
        user.role?.name;


    if (storedRoleName) {

        return storedRoleName;

    }


    switch (roleId) {

        case 1:
            return "Administrator";

        case 2:
            return "Alumni";

        case 3:
            return "Student";

        default:
            return "Administrator";

    }

}


/* =========================================================
   FULL NAME
========================================================= */

function getFullName(user = currentUser) {

    if (!user) {

        return "Administrator";

    }


    const nameParts = [

        user.firstName,
        user.middleName,
        user.lastName

    ].filter(Boolean);


    return nameParts.length
        ? nameParts.join(" ")
        : "Administrator";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(user = currentUser) {

    if (!user) {

        return "A";

    }


    const firstName = user.firstName || "";
    const lastName = user.lastName || "";


    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
        .trim()
        .toUpperCase();


    return initials || "A";

}


/* =========================================================
   POPULATE USER INFORMATION
========================================================= */

function populateUserInformation() {

    const fullName = getFullName();
    const initials = getInitials();
    const email = currentUser.email || "admin@alumnihub.com";
    const role = currentUser.role || "Administrator";


    setTextContent("sidebarName", fullName);
    setTextContent("sidebarEmail", email);
    setTextContent("accountRole", role);


    setAvatarInitials("sidebarAvatar", initials);
    setAvatarInitials("topbarAvatar", initials);
    setAvatarInitials("settingsProfilePreview", initials);


    setInputValue("settingsFirstName", currentUser.firstName);
    setInputValue("settingsMiddleName", currentUser.middleName);
    setInputValue("settingsLastName", currentUser.lastName);
    setInputValue("settingsEmail", email);


    const username = createUsername(

        currentUser.firstName,
        currentUser.lastName,
        email

    );


    setTextContent("accountUsername", username);


    if (currentUser.created_at || currentUser.createdAt) {

        const createdDate = formatAccountDate(

            currentUser.created_at ||
            currentUser.createdAt

        );


        setTextContent("accountCreatedDate", createdDate);

    }


    if (currentUser.last_login || currentUser.lastLogin) {

        const lastLogin = formatAccountDateTime(

            currentUser.last_login ||
            currentUser.lastLogin

        );


        setTextContent("accountLastLogin", lastLogin);

    }


    updateBioCharacterCount();

}


/* =========================================================
   SET TEXT CONTENT SAFELY
========================================================= */

function setTextContent(id, value) {

    const element = getElement(id);


    if (!element) {

        return;

    }


    element.textContent = value ?? "";

}


/* =========================================================
   SET INPUT VALUE SAFELY
========================================================= */

function setInputValue(id, value) {

    const element = getElement(id);


    if (!element) {

        return;

    }


    element.value = value ?? "";

}


/* =========================================================
   SET AVATAR INITIALS
========================================================= */

function setAvatarInitials(id, initials) {

    const avatar = getElement(id);


    if (!avatar) {

        return;

    }


    if (avatar.querySelector("img")) {

        return;

    }


    avatar.textContent = initials;

}


/* =========================================================
   CREATE USERNAME
========================================================= */

function createUsername(firstName, lastName, email) {

    if (firstName || lastName) {

        return `${firstName || ""}.${lastName || ""}`
            .replace(/\s+/g, "")
            .replace(/\.+/g, ".")
            .replace(/^\.|\.$/g, "")
            .toLowerCase();

    }


    if (email && email.includes("@")) {

        return email.split("@")[0];

    }


    return "administrator";

}


/* =========================================================
   FORMAT ACCOUNT DATE
========================================================= */

function formatAccountDate(dateValue) {

    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return "Not available";

    }


    return new Intl.DateTimeFormat("en-US", {

        month: "long",
        year: "numeric"

    }).format(date);

}


/* =========================================================
   FORMAT LAST LOGIN
========================================================= */

function formatAccountDateTime(dateValue) {

    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return "Not available";

    }


    return new Intl.DateTimeFormat("en-US", {

        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"

    }).format(date);

}


/* =========================================================
   SETTINGS NAVIGATION
========================================================= */

function initializeSettingsNavigation() {

    const navigationButtons = document.querySelectorAll(
        ".settings-nav-item"
    );


    const settingsSections = document.querySelectorAll(
        ".settings-section"
    );


    navigationButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.settingsTarget;


            if (!targetId) {

                return;

            }


            navigationButtons.forEach((item) => {

                item.classList.remove("active");

            });


            settingsSections.forEach((section) => {

                section.classList.remove("active");

            });


            button.classList.add("active");


            const targetSection = getElement(targetId);


            if (targetSection) {

                targetSection.classList.add("active");

            }


            if (window.innerWidth <= 900) {

                targetSection?.scrollIntoView({

                    behavior: "smooth",
                    block: "start"

                });

            }


            localStorage.setItem(
                "alumniHubActiveSettingsSection",
                targetId
            );

        });

    });


    restoreActiveSettingsSection();

}


/* =========================================================
   RESTORE ACTIVE SETTINGS SECTION
========================================================= */

function restoreActiveSettingsSection() {

    const savedSection = localStorage.getItem(
        "alumniHubActiveSettingsSection"
    );


    if (!savedSection) {

        return;

    }


    const savedButton = document.querySelector(
        `[data-settings-target="${savedSection}"]`
    );


    const savedContent = getElement(savedSection);


    if (!savedButton || !savedContent) {

        return;

    }


    document
        .querySelectorAll(".settings-nav-item")
        .forEach((button) => {

            button.classList.remove("active");

        });


    document
        .querySelectorAll(".settings-section")
        .forEach((section) => {

            section.classList.remove("active");

        });


    savedButton.classList.add("active");
    savedContent.classList.add("active");

}


/* =========================================================
   BIO CHARACTER COUNTER
========================================================= */

function initializeBioCharacterCounter() {

    const bioInput = getElement("settingsBio");


    if (!bioInput) {

        return;

    }


    bioInput.addEventListener("input", updateBioCharacterCount);


    updateBioCharacterCount();

}


/* =========================================================
   UPDATE BIO COUNTER
========================================================= */

function updateBioCharacterCount() {

    const bioInput = getElement("settingsBio");
    const counter = getElement("bioCharacterCount");


    if (!bioInput || !counter) {

        return;

    }


    counter.textContent = bioInput.value.length;

}


/* =========================================================
   THEME HELPERS
========================================================= */

function getSavedTheme() {

    return (

        localStorage.getItem(THEME_STORAGE_KEY) ||
        localStorage.getItem("theme") ||
        defaultSettings.appearance.theme

    );

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    const body = document.body;


    body.classList.remove("dark", "dark-mode");


    if (theme === "dark") {

        body.classList.add("dark", "dark-mode");

    }


    if (theme === "system") {

        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


        if (prefersDark) {

            body.classList.add("dark", "dark-mode");

        }

    }


    updateThemeToggleIcon();

}


/* =========================================================
   UPDATE TOPBAR THEME ICON
========================================================= */

function updateThemeToggleIcon() {

    const themeToggle = getElement("themeToggle");


    if (!themeToggle) {

        return;

    }


    const icon = themeToggle.querySelector("i");


    if (!icon) {

        return;

    }


    const darkModeEnabled =

        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");


    icon.className = darkModeEnabled
        ? "bx bx-sun"
        : "bx bx-moon";


    themeToggle.setAttribute(

        "aria-label",

        darkModeEnabled
            ? "Switch to light mode"
            : "Switch to dark mode"

    );

}


/* =========================================================
   TOPBAR THEME TOGGLE
========================================================= */

function initializeTopbarThemeToggle() {

    const themeToggle = getElement("themeToggle");


    if (!themeToggle) {

        return;

    }


    themeToggle.addEventListener("click", () => {

        const darkModeEnabled =

            document.body.classList.contains("dark") ||
            document.body.classList.contains("dark-mode");


        const nextTheme = darkModeEnabled
            ? "light"
            : "dark";


        localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme
        );


        localStorage.setItem(
            "theme",
            nextTheme
        );


        applyTheme(nextTheme);
        synchronizeThemeRadio(nextTheme);

    });

}


/* =========================================================
   SYNCHRONIZE THEME RADIO
========================================================= */

function synchronizeThemeRadio(theme) {

    const themeInputs = document.querySelectorAll(
        'input[name="settingsTheme"]'
    );


    themeInputs.forEach((input) => {

        input.checked = input.value === theme;


        const choice = input.closest(".theme-choice");


        if (choice) {

            choice.classList.toggle(
                "active",
                input.checked
            );

        }

    });

}


/* =========================================================
   SYSTEM THEME CHANGE LISTENER
========================================================= */

function initializeSystemThemeListener() {

    const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );


    mediaQuery.addEventListener("change", () => {

        const savedTheme = getSavedTheme();


        if (savedTheme === "system") {

            applyTheme("system");

        }

    });

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initializeMobileSidebar() {

    const menuButton = getElement("mobileMenuButton");
    const sidebar = document.querySelector(".sidebar");


    if (!menuButton || !sidebar) {

        return;

    }


    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("show");
        document.body.classList.toggle("sidebar-open");

    });


    document.addEventListener("click", (event) => {

        if (window.innerWidth > 900) {

            return;

        }


        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedMenuButton = menuButton.contains(event.target);


        if (!clickedInsideSidebar && !clickedMenuButton) {

            sidebar.classList.remove("show");
            document.body.classList.remove("sidebar-open");

        }

    });

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButton = getElement("logout");


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener("click", () => {

        const shouldLogout = window.confirm(
            "Are you sure you want to log out?"
        );


        if (!shouldLogout) {

            return;

        }


        localStorage.removeItem("token");
        localStorage.removeItem("user");


        window.location.href = "login.html";

    });

}


/* =========================================================
   ESCAPE KEY HANDLER
========================================================= */

function initializeEscapeKeyHandler() {

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") {

            return;

        }


        document
            .querySelectorAll(".settings-modal.show")
            .forEach((modal) => {

                modal.classList.remove("show");
                modal.setAttribute("aria-hidden", "true");

            });

    });

}


/* =========================================================
   PART 1 INITIALIZER
========================================================= */

function initializeSettingsPartOne() {

    loadCurrentUser();

    const savedTheme = getSavedTheme();


    applyTheme(savedTheme);
    synchronizeThemeRadio(savedTheme);

    initializeSettingsNavigation();
    initializeBioCharacterCounter();
    initializeTopbarThemeToggle();
    initializeSystemThemeListener();
    initializeMobileSidebar();
    initializeLogout();
    initializeEscapeKeyHandler();

}


/* =========================================================
   ALUMNIHUB SETTINGS
   PART 2: PROFILE IMAGE, PASSWORD, APPEARANCE
========================================================= */


/* =========================================================
   PROFILE IMAGE PREVIEW
========================================================= */

function initializeProfileImageUpload() {

    const profilePictureInput = getElement("profilePictureInput");
    const removeButton = getElement("removeProfilePictureButton");


    if (profilePictureInput) {

        profilePictureInput.addEventListener("change", (event) => {

            const file = event.target.files?.[0];


            if (!file) {

                return;

            }


            const allowedTypes = [

                "image/jpeg",
                "image/png"

            ];


            if (!allowedTypes.includes(file.type)) {

                showSettingsToast(
                    "Please select a JPG or PNG image.",
                    "error"
                );

                profilePictureInput.value = "";

                return;

            }


            const maximumFileSize = 2 * 1024 * 1024;


            if (file.size > maximumFileSize) {

                showSettingsToast(
                    "Profile image must not exceed 2 MB.",
                    "error"
                );

                profilePictureInput.value = "";

                return;

            }


            const reader = new FileReader();


            reader.addEventListener("load", () => {

                const imageData = reader.result;


                if (typeof imageData !== "string") {

                    return;

                }


                currentProfileImage = imageData;

                displayProfileImage(imageData);


                showSettingsToast(
                    "Profile picture is ready to be saved.",
                    "success"
                );

            });


            reader.addEventListener("error", () => {

                showSettingsToast(
                    "Unable to read the selected image.",
                    "error"
                );

            });


            reader.readAsDataURL(file);

        });

    }


    if (removeButton) {

        removeButton.addEventListener("click", () => {

            currentProfileImage = null;


            if (profilePictureInput) {

                profilePictureInput.value = "";

            }


            removeDisplayedProfileImage();


            showSettingsToast(
                "Profile picture removed. Save changes to confirm.",
                "warning"
            );

        });

    }


    loadStoredProfileImage();

}


/* =========================================================
   LOAD STORED PROFILE IMAGE
========================================================= */

function loadStoredProfileImage() {

    const savedImage = localStorage.getItem(
        PROFILE_IMAGE_STORAGE_KEY
    );


    if (!savedImage) {

        currentProfileImage = null;

        return;

    }


    currentProfileImage = savedImage;

    displayProfileImage(savedImage);

}


/* =========================================================
   DISPLAY PROFILE IMAGE
========================================================= */

function displayProfileImage(imageSource) {

    const avatarIds = [

        "settingsProfilePreview",
        "sidebarAvatar",
        "topbarAvatar"

    ];


    avatarIds.forEach((avatarId) => {

        const avatar = getElement(avatarId);


        if (!avatar) {

            return;

        }


        avatar.innerHTML = "";


        const image = document.createElement("img");


        image.src = imageSource;
        image.alt = "Profile picture";


        image.addEventListener("error", () => {

            avatar.innerHTML = "";
            avatar.textContent = getInitials();

        });


        avatar.appendChild(image);

    });

}


/* =========================================================
   REMOVE DISPLAYED PROFILE IMAGE
========================================================= */

function removeDisplayedProfileImage() {

    const initials = getInitials();


    [

        "settingsProfilePreview",
        "sidebarAvatar",
        "topbarAvatar"

    ].forEach((avatarId) => {

        const avatar = getElement(avatarId);


        if (!avatar) {

            return;

        }


        avatar.innerHTML = "";
        avatar.textContent = initials;

    });

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function initializePasswordVisibility() {

    const visibilityButtons = document.querySelectorAll(
        ".password-visibility-button"
    );


    visibilityButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.passwordTarget;
            const passwordInput = getElement(targetId);


            if (!passwordInput) {

                return;

            }


            const isPasswordHidden =
                passwordInput.type === "password";


            passwordInput.type = isPasswordHidden
                ? "text"
                : "password";


            const icon = button.querySelector("i");


            if (icon) {

                icon.className = isPasswordHidden
                    ? "bx bx-show"
                    : "bx bx-hide";

            }


            button.setAttribute(

                "aria-label",

                isPasswordHidden
                    ? "Hide password"
                    : "Show password"

            );

        });

    });

}


/* =========================================================
   PASSWORD STRENGTH INITIALIZATION
========================================================= */

function initializePasswordStrength() {

    const newPasswordInput = getElement("newPassword");
    const confirmPasswordInput = getElement("confirmPassword");


    if (newPasswordInput) {

        newPasswordInput.addEventListener("input", () => {

            updatePasswordStrength();
            updatePasswordRequirements();
            updatePasswordMatchStatus();

        });

    }


    if (confirmPasswordInput) {

        confirmPasswordInput.addEventListener(
            "input",
            updatePasswordMatchStatus
        );

    }


    updatePasswordStrength();
    updatePasswordRequirements();
    updatePasswordMatchStatus();

}


/* =========================================================
   PASSWORD RULES
========================================================= */

function getPasswordRules(password) {

    return {

        length: password.length >= 8,

        uppercase: /[A-Z]/.test(password),

        lowercase: /[a-z]/.test(password),

        number: /\d/.test(password),

        special: /[^A-Za-z0-9]/.test(password)

    };

}


/* =========================================================
   CALCULATE PASSWORD SCORE
========================================================= */

function calculatePasswordScore(password) {

    if (!password) {

        return 0;

    }


    const rules = getPasswordRules(password);


    return Object.values(rules).filter(Boolean).length;

}


/* =========================================================
   UPDATE PASSWORD STRENGTH
========================================================= */

function updatePasswordStrength() {

    const passwordInput = getElement("newPassword");
    const strengthBar = getElement("passwordStrengthBar");
    const strengthText = getElement("passwordStrengthText");


    if (!passwordInput || !strengthBar || !strengthText) {

        return;

    }


    const password = passwordInput.value;
    const score = calculatePasswordScore(password);


    let width = "0%";
    let text = "None";
    let color = "#94a3b8";


    if (password.length > 0 && score <= 1) {

        width = "20%";
        text = "Weak";
        color = "#dc2626";

    } else if (score === 2) {

        width = "40%";
        text = "Fair";
        color = "#ea580c";

    } else if (score === 3) {

        width = "60%";
        text = "Good";
        color = "#eab308";

    } else if (score === 4) {

        width = "80%";
        text = "Strong";
        color = "#16a34a";

    } else if (score === 5) {

        width = "100%";
        text = "Very Strong";
        color = "#15803d";

    }


    strengthBar.style.width = width;
    strengthBar.style.background = color;

    strengthText.textContent = text;
    strengthText.style.color = color;

}


/* =========================================================
   UPDATE PASSWORD REQUIREMENTS
========================================================= */

function updatePasswordRequirements() {

    const passwordInput = getElement("newPassword");


    if (!passwordInput) {

        return;

    }


    const rules = getPasswordRules(passwordInput.value);


    updatePasswordRequirement(
        "requirementLength",
        rules.length
    );


    updatePasswordRequirement(
        "requirementUppercase",
        rules.uppercase
    );


    updatePasswordRequirement(
        "requirementLowercase",
        rules.lowercase
    );


    updatePasswordRequirement(
        "requirementNumber",
        rules.number
    );


    updatePasswordRequirement(
        "requirementSpecial",
        rules.special
    );

}


/* =========================================================
   UPDATE ONE PASSWORD REQUIREMENT
========================================================= */

function updatePasswordRequirement(elementId, isValid) {

    const requirement = getElement(elementId);


    if (!requirement) {

        return;

    }


    requirement.classList.toggle("valid", isValid);


    const icon = requirement.querySelector("i");


    if (icon) {

        icon.className = isValid
            ? "bx bx-check-circle"
            : "bx bx-circle";

    }

}


/* =========================================================
   PASSWORD MATCH STATUS
========================================================= */

function updatePasswordMatchStatus() {

    const newPasswordInput = getElement("newPassword");
    const confirmPasswordInput = getElement("confirmPassword");
    const matchMessage = getElement("passwordMatchMessage");


    if (
        !newPasswordInput ||
        !confirmPasswordInput ||
        !matchMessage
    ) {

        return;

    }


    const newPassword = newPasswordInput.value;
    const confirmedPassword = confirmPasswordInput.value;


    if (!confirmedPassword) {

        matchMessage.textContent =
            "Re-enter the new password.";

        matchMessage.style.color = "";

        return;

    }


    if (newPassword === confirmedPassword) {

        matchMessage.textContent =
            "Passwords match.";

        matchMessage.style.color = "#16a34a";

    } else {

        matchMessage.textContent =
            "Passwords do not match.";

        matchMessage.style.color = "#dc2626";

    }

}


/* =========================================================
   VALIDATE PASSWORD FORM
========================================================= */

function validatePasswordForm() {

    const currentPassword =
        getElement("currentPassword")?.value.trim() || "";


    const newPassword =
        getElement("newPassword")?.value || "";


    const confirmPassword =
        getElement("confirmPassword")?.value || "";


    if (!currentPassword) {

        return {

            valid: false,
            message: "Please enter your current password."

        };

    }


    if (!newPassword) {

        return {

            valid: false,
            message: "Please enter a new password."

        };

    }


    const rules = getPasswordRules(newPassword);
    const allRulesValid = Object.values(rules).every(Boolean);


    if (!allRulesValid) {

        return {

            valid: false,

            message:
                "The new password must meet all password requirements."

        };

    }


    if (newPassword !== confirmPassword) {

        return {

            valid: false,
            message: "The new passwords do not match."

        };

    }


    if (currentPassword === newPassword) {

        return {

            valid: false,

            message:
                "The new password must be different from the current password."

        };

    }


    return {

        valid: true,
        message: "Password information is valid."

    };

}


function initializeUpdatePasswordButton() {

    const updatePasswordButton =
        getElement(
            "updatePasswordButton"
        );


    if (!updatePasswordButton) {

        return;

    }


    updatePasswordButton.addEventListener(
        "click",
        async () => {

            const validation =
                validatePasswordForm();


            if (!validation.valid) {

                showSettingsToast(
                    validation.message,
                    "error"
                );

                return;

            }


            const currentPassword =
                getElement(
                    "currentPassword"
                )?.value || "";


            const newPassword =
                getElement(
                    "newPassword"
                )?.value || "";


            const confirmPassword =
                getElement(
                    "confirmPassword"
                )?.value || "";


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                showSettingsToast(
                    "Your session has expired. Please log in again.",
                    "error"
                );

                return;

            }


            const originalHTML =
                updatePasswordButton.innerHTML;


            updatePasswordButton.disabled =
                true;


            updatePasswordButton.innerHTML = `
                <i class="bx bx-loader-alt bx-spin"></i>
                Updating...
            `;


            try {

                const response =
                    await fetch(
                        "/api/auth/change-password",
                        {
                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    current_password:
                                        currentPassword,

                                    new_password:
                                        newPassword,

                                    confirm_password:
                                        confirmPassword

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to change password."
                    );

                }


                showSettingsToast(
                    data.message ||
                    "Password changed successfully.",
                    "success"
                );


                clearPasswordFields();


                updatePasswordStrength();
                updatePasswordRequirements();
                updatePasswordMatchStatus();


            } catch (error) {

                console.error(
                    "CHANGE PASSWORD FRONTEND ERROR:",
                    error
                );


                showSettingsToast(
                    error.message ||
                    "Unable to change password.",
                    "error"
                );


            } finally {

                updatePasswordButton.disabled =
                    false;


                updatePasswordButton.innerHTML =
                    originalHTML;

            }

        }
    );

}


/* =========================================================
   CLEAR PASSWORD FIELDS
========================================================= */

function clearPasswordFields() {

    [

        "currentPassword",
        "newPassword",
        "confirmPassword"

    ].forEach((fieldId) => {

        const field = getElement(fieldId);


        if (field) {

            field.value = "";
            field.type = "password";

        }

    });


    document
        .querySelectorAll(".password-visibility-button i")
        .forEach((icon) => {

            icon.className = "bx bx-hide";

        });


    updatePasswordStrength();
    updatePasswordRequirements();
    updatePasswordMatchStatus();

}


/* =========================================================
   APPEARANCE CONTROLS
========================================================= */

function initializeAppearanceControls() {

    initializeThemeChoices();
    initializeAccentColorChoices();
    initializeFontSizeChoices();

}


/* =========================================================
   THEME CHOICES
========================================================= */

function initializeThemeChoices() {

    const themeInputs = document.querySelectorAll(
        'input[name="settingsTheme"]'
    );


    themeInputs.forEach((input) => {

        input.addEventListener("change", () => {

            if (!input.checked) {

                return;

            }


            const theme = input.value;


            localStorage.setItem(
                THEME_STORAGE_KEY,
                theme
            );


            localStorage.setItem(
                "theme",
                theme
            );


            applyTheme(theme);
            synchronizeThemeRadio(theme);

        });

    });

}


/* =========================================================
   ACCENT COLOR CHOICES
========================================================= */

function initializeAccentColorChoices() {

    const accentInputs = document.querySelectorAll(
        'input[name="accentColor"]'
    );


    accentInputs.forEach((input) => {

        input.addEventListener("change", () => {

            if (!input.checked) {

                return;

            }


            applyAccentColor(input.value);
            synchronizeAccentColorChoice(input.value);

        });

    });

}


/* =========================================================
   APPLY ACCENT COLOR
========================================================= */

function applyAccentColor(accentColor) {

    const validAccentColors = [

        "blue",
        "green",
        "purple",
        "orange"

    ];


    const selectedAccent = validAccentColors.includes(accentColor)
        ? accentColor
        : "blue";


    document.body.classList.remove(

        "accent-blue",
        "accent-green",
        "accent-purple",
        "accent-orange"

    );


    document.body.classList.add(
        `accent-${selectedAccent}`
    );


    localStorage.setItem(
        ACCENT_STORAGE_KEY,
        selectedAccent
    );

}


/* =========================================================
   SYNCHRONIZE ACCENT CHOICE
========================================================= */

function synchronizeAccentColorChoice(accentColor) {

    const accentInputs = document.querySelectorAll(
        'input[name="accentColor"]'
    );


    accentInputs.forEach((input) => {

        const isSelected = input.value === accentColor;


        input.checked = isSelected;


        const choice = input.closest(
            ".accent-color-choice"
        );


        if (choice) {

            choice.classList.toggle(
                "active",
                isSelected
            );

        }

    });

}


/* =========================================================
   FONT SIZE CHOICES
========================================================= */

function initializeFontSizeChoices() {

    const fontSizeInputs = document.querySelectorAll(
        'input[name="fontSize"]'
    );


    fontSizeInputs.forEach((input) => {

        input.addEventListener("change", () => {

            if (!input.checked) {

                return;

            }


            applyFontSize(input.value);
            synchronizeFontSizeChoice(input.value);

        });

    });

}


/* =========================================================
   APPLY FONT SIZE
========================================================= */

function applyFontSize(fontSize) {

    const validFontSizes = [

        "small",
        "medium",
        "large"

    ];


    const selectedFontSize = validFontSizes.includes(fontSize)
        ? fontSize
        : "medium";


    document.body.classList.remove(

        "font-small",
        "font-medium",
        "font-large"

    );


    document.body.classList.add(
        `font-${selectedFontSize}`
    );


    localStorage.setItem(
        FONT_SIZE_STORAGE_KEY,
        selectedFontSize
    );

}


/* =========================================================
   SYNCHRONIZE FONT SIZE CHOICE
========================================================= */

function synchronizeFontSizeChoice(fontSize) {

    const fontSizeInputs = document.querySelectorAll(
        'input[name="fontSize"]'
    );


    fontSizeInputs.forEach((input) => {

        const isSelected = input.value === fontSize;


        input.checked = isSelected;


        const choice = input.closest(
            ".font-size-choice"
        );


        if (choice) {

            choice.classList.toggle(
                "active",
                isSelected
            );

        }

    });

}


/* =========================================================
   LOAD STORED APPEARANCE
========================================================= */

function loadStoredAppearance() {

    const storedSettings = parseJSON(

        localStorage.getItem(SETTINGS_STORAGE_KEY),

        {}

    );


    const savedTheme =

        localStorage.getItem(THEME_STORAGE_KEY) ||
        storedSettings?.appearance?.theme ||
        defaultSettings.appearance.theme;


    const savedAccentColor =

        localStorage.getItem(ACCENT_STORAGE_KEY) ||
        storedSettings?.appearance?.accentColor ||
        defaultSettings.appearance.accentColor;


    const savedFontSize =

        localStorage.getItem(FONT_SIZE_STORAGE_KEY) ||
        storedSettings?.appearance?.fontSize ||
        defaultSettings.appearance.fontSize;


    applyTheme(savedTheme);
    synchronizeThemeRadio(savedTheme);


    applyAccentColor(savedAccentColor);
    synchronizeAccentColorChoice(savedAccentColor);


    applyFontSize(savedFontSize);
    synchronizeFontSizeChoice(savedFontSize);

}


/* =========================================================
   FORM CHANGE DETECTION
========================================================= */

function initializeSettingsChangeDetection() {

    const controls = document.querySelectorAll(

        ".settings-content input, " +
        ".settings-content textarea, " +
        ".settings-content select"

    );


    controls.forEach((control) => {

        control.addEventListener("change", () => {

            document.body.classList.add(
                "settings-has-unsaved-changes"
            );

        });


        if (
            control.tagName === "INPUT" ||
            control.tagName === "TEXTAREA"
        ) {

            control.addEventListener("input", () => {

                document.body.classList.add(
                    "settings-has-unsaved-changes"
                );

            });

        }

    });

}


/* =========================================================
   UNSAVED CHANGES WARNING
========================================================= */

function initializeUnsavedChangesWarning() {

    window.addEventListener("beforeunload", (event) => {

        const hasUnsavedChanges =
            document.body.classList.contains(
                "settings-has-unsaved-changes"
            );


        if (!hasUnsavedChanges) {

            return;

        }


        event.preventDefault();

        event.returnValue = "";

    });

}


/* =========================================================
   PART 2 INITIALIZER
========================================================= */

function initializeSettingsPartTwo() {

    initializeProfileImageUpload();

    initializePasswordVisibility();
    initializePasswordStrength();
    initializeUpdatePasswordButton();

    initializeAppearanceControls();
    loadStoredAppearance();

    initializeSettingsChangeDetection();
    initializeUnsavedChangesWarning();

}


/* =========================================================
   ALUMNIHUB SETTINGS
   PART 3: LOAD, SAVE, RESET, MODALS, TOAST, INITIALIZATION
========================================================= */


/* =========================================================
   MERGE SETTINGS SAFELY
========================================================= */

function mergeSettings(defaultValues, savedValues) {

    return {

        profile: {

            ...defaultValues.profile,
            ...(savedValues?.profile || {})

        },

        notifications: {

            ...defaultValues.notifications,
            ...(savedValues?.notifications || {})

        },

        appearance: {

            ...defaultValues.appearance,
            ...(savedValues?.appearance || {})

        },

        security: {

            ...defaultValues.security,
            ...(savedValues?.security || {})

        },

        system: {

            ...defaultValues.system,
            ...(savedValues?.system || {})

        }

    };

}


/* =========================================================
   LOAD SAVED SETTINGS
========================================================= */

function loadSavedSettings() {

    const savedSettings = parseJSON(

        localStorage.getItem(SETTINGS_STORAGE_KEY),

        {}

    );


    const settings = mergeSettings(

        defaultSettings,
        savedSettings

    );


    /*
     * Give priority to the logged-in user's information
     * when there is no manually saved profile value.
     */

    settings.profile.firstName =

        savedSettings?.profile?.firstName ??
        currentUser?.firstName ??
        "";


    settings.profile.middleName =

        savedSettings?.profile?.middleName ??
        currentUser?.middleName ??
        "";


    settings.profile.lastName =

        savedSettings?.profile?.lastName ??
        currentUser?.lastName ??
        "";


    settings.profile.email =

        savedSettings?.profile?.email ??
        currentUser?.email ??
        "";


    populateProfileSettings(settings.profile);
    populateNotificationSettings(settings.notifications);
    populateSecuritySettings(settings.security);
    populateSystemSettings(settings.system);


    applyTheme(settings.appearance.theme);

    synchronizeThemeRadio(
        settings.appearance.theme
    );


    applyAccentColor(
        settings.appearance.accentColor
    );

    synchronizeAccentColorChoice(
        settings.appearance.accentColor
    );


    applyFontSize(
        settings.appearance.fontSize
    );

    synchronizeFontSizeChoice(
        settings.appearance.fontSize
    );


    updateBioCharacterCount();


    document.body.classList.remove(
        "settings-has-unsaved-changes"
    );

}


/* =========================================================
   POPULATE PROFILE SETTINGS
========================================================= */

function populateProfileSettings(profile) {

    setInputValue(
        "settingsFirstName",
        profile.firstName
    );

    setInputValue(
        "settingsMiddleName",
        profile.middleName
    );

    setInputValue(
        "settingsLastName",
        profile.lastName
    );

    setInputValue(
        "settingsEmail",
        profile.email
    );

    setInputValue(
        "settingsPhone",
        profile.phone
    );

    setInputValue(
        "settingsPosition",
        profile.position
    );

    setInputValue(
        "settingsAddress",
        profile.address
    );

    setInputValue(
        "settingsBio",
        profile.bio
    );

}


/* =========================================================
   POPULATE NOTIFICATION SETTINGS
========================================================= */

function populateNotificationSettings(notifications) {

    setCheckboxValue(
        "emailNotifications",
        notifications.emailNotifications
    );

    setCheckboxValue(
        "systemNotifications",
        notifications.systemNotifications
    );

    setCheckboxValue(
        "eventReminders",
        notifications.eventReminders
    );

    setCheckboxValue(
        "jobAlerts",
        notifications.jobAlerts
    );

    setCheckboxValue(
        "announcementNotifications",
        notifications.announcementNotifications
    );

    setCheckboxValue(
        "marketingEmails",
        notifications.marketingEmails
    );

}


/* =========================================================
   POPULATE SECURITY SETTINGS
========================================================= */

function populateSecuritySettings(security) {

    setCheckboxValue(
        "twoFactorAuthentication",
        security.twoFactorAuthentication
    );

    setCheckboxValue(
        "loginAlerts",
        security.loginAlerts
    );

    setCheckboxValue(
        "automaticLogout",
        security.automaticLogout
    );

    setInputValue(
        "sessionTimeout",
        security.sessionTimeout
    );

}


/* =========================================================
   POPULATE SYSTEM SETTINGS
========================================================= */

function populateSystemSettings(system) {

    setInputValue(
        "systemLanguage",
        system.language
    );

    setInputValue(
        "systemTimezone",
        system.timezone
    );

    setInputValue(
        "systemDateFormat",
        system.dateFormat
    );

    setInputValue(
        "systemTimeFormat",
        system.timeFormat
    );

    setInputValue(
        "defaultDashboard",
        system.defaultDashboard
    );

    setInputValue(
        "recordsPerPage",
        system.recordsPerPage
    );

    setCheckboxValue(
        "automaticDataRefresh",
        system.automaticDataRefresh
    );

    setCheckboxValue(
        "confirmationDialogs",
        system.confirmationDialogs
    );

}


/* =========================================================
   SET CHECKBOX VALUE
========================================================= */

function setCheckboxValue(id, value) {

    const checkbox = getElement(id);


    if (!checkbox) {

        return;

    }


    checkbox.checked = Boolean(value);

}


/* =========================================================
   GET INPUT VALUE
========================================================= */

function getInputValue(id) {

    const input = getElement(id);


    if (!input) {

        return "";

    }


    return input.value.trim();

}


/* =========================================================
   GET SELECT VALUE
========================================================= */

function getSelectValue(id) {

    const select = getElement(id);


    if (!select) {

        return "";

    }


    return select.value;

}


/* =========================================================
   GET CHECKBOX VALUE
========================================================= */

function getCheckboxValue(id) {

    const checkbox = getElement(id);


    return Boolean(checkbox?.checked);

}


/* =========================================================
   GET SELECTED RADIO VALUE
========================================================= */

function getRadioValue(name, fallback = "") {

    const selectedRadio = document.querySelector(

        `input[name="${name}"]:checked`

    );


    return selectedRadio?.value || fallback;

}


/* =========================================================
   COLLECT ALL SETTINGS
========================================================= */

function collectSettingsData() {

    return {

        profile: {

            firstName:
                getInputValue("settingsFirstName"),

            middleName:
                getInputValue("settingsMiddleName"),

            lastName:
                getInputValue("settingsLastName"),

            email:
                getInputValue("settingsEmail"),

            phone:
                getInputValue("settingsPhone"),

            position:
                getInputValue("settingsPosition"),

            address:
                getInputValue("settingsAddress"),

            bio:
                getInputValue("settingsBio")

        },

        notifications: {

            emailNotifications:
                getCheckboxValue("emailNotifications"),

            systemNotifications:
                getCheckboxValue("systemNotifications"),

            eventReminders:
                getCheckboxValue("eventReminders"),

            jobAlerts:
                getCheckboxValue("jobAlerts"),

            announcementNotifications:
                getCheckboxValue(
                    "announcementNotifications"
                ),

            marketingEmails:
                getCheckboxValue("marketingEmails")

        },

        appearance: {

            theme: getRadioValue(

                "settingsTheme",
                defaultSettings.appearance.theme

            ),

            accentColor: getRadioValue(

                "accentColor",
                defaultSettings.appearance.accentColor

            ),

            fontSize: getRadioValue(

                "fontSize",
                defaultSettings.appearance.fontSize

            )

        },

        security: {

            twoFactorAuthentication:
                getCheckboxValue(
                    "twoFactorAuthentication"
                ),

            loginAlerts:
                getCheckboxValue("loginAlerts"),

            automaticLogout:
                getCheckboxValue("automaticLogout"),

            sessionTimeout:
                getSelectValue("sessionTimeout")

        },

        system: {

            language:
                getSelectValue("systemLanguage"),

            timezone:
                getSelectValue("systemTimezone"),

            dateFormat:
                getSelectValue("systemDateFormat"),

            timeFormat:
                getSelectValue("systemTimeFormat"),

            defaultDashboard:
                getSelectValue("defaultDashboard"),

            recordsPerPage:
                getSelectValue("recordsPerPage"),

            automaticDataRefresh:
                getCheckboxValue(
                    "automaticDataRefresh"
                ),

            confirmationDialogs:
                getCheckboxValue(
                    "confirmationDialogs"
                )

        }

    };

}


/* =========================================================
   VALIDATE SETTINGS
========================================================= */

function validateSettings(settings) {

    if (!settings.profile.firstName) {

        return {

            valid: false,

            message:
                "First name is required.",

            section: "profileSettings",

            field: "settingsFirstName"

        };

    }


    if (!settings.profile.lastName) {

        return {

            valid: false,

            message:
                "Last name is required.",

            section: "profileSettings",

            field: "settingsLastName"

        };

    }


    if (!settings.profile.email) {

        return {

            valid: false,

            message:
                "Email address is required.",

            section: "profileSettings",

            field: "settingsEmail"

        };

    }


    const validEmailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!validEmailPattern.test(settings.profile.email)) {

        return {

            valid: false,

            message:
                "Please enter a valid email address.",

            section: "profileSettings",

            field: "settingsEmail"

        };

    }


    return {

        valid: true,
        message: "Settings are valid."

    };

}


/* =========================================================
   OPEN SETTINGS SECTION
========================================================= */

function openSettingsSection(sectionId) {

    const targetButton = document.querySelector(

        `[data-settings-target="${sectionId}"]`

    );


    const targetSection = getElement(sectionId);


    if (!targetButton || !targetSection) {

        return;

    }


    document
        .querySelectorAll(".settings-nav-item")
        .forEach((button) => {

            button.classList.remove("active");

        });


    document
        .querySelectorAll(".settings-section")
        .forEach((section) => {

            section.classList.remove("active");

        });


    targetButton.classList.add("active");
    targetSection.classList.add("active");


    localStorage.setItem(

        "alumniHubActiveSettingsSection",
        sectionId

    );

}


/* =========================================================
   FOCUS INVALID FIELD
========================================================= */

function focusInvalidField(validation) {

    if (validation.section) {

        openSettingsSection(validation.section);

    }


    const field = getElement(validation.field);


    if (!field) {

        return;

    }


    window.setTimeout(() => {

        field.focus();

        field.scrollIntoView({

            behavior: "smooth",
            block: "center"

        });

    }, 100);

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings() {

    const settings = collectSettingsData();
    const validation = validateSettings(settings);


    if (!validation.valid) {

        closeSettingsModal("saveSettingsModal");

        focusInvalidField(validation);


        showSettingsToast(

            validation.message,
            "error"

        );


        return false;

    }


    try {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)

        );


        localStorage.setItem(

            THEME_STORAGE_KEY,
            settings.appearance.theme

        );


        localStorage.setItem(

            "theme",
            settings.appearance.theme

        );


        localStorage.setItem(

            ACCENT_STORAGE_KEY,
            settings.appearance.accentColor

        );


        localStorage.setItem(

            FONT_SIZE_STORAGE_KEY,
            settings.appearance.fontSize

        );


        if (currentProfileImage) {

            localStorage.setItem(

                PROFILE_IMAGE_STORAGE_KEY,
                currentProfileImage

            );

        } else {

            localStorage.removeItem(
                PROFILE_IMAGE_STORAGE_KEY
            );

        }


        updateStoredUser(settings.profile);


        currentUser = {

            ...currentUser,

            firstName: settings.profile.firstName,

            middleName: settings.profile.middleName,

            lastName: settings.profile.lastName,

            email: settings.profile.email

        };


        populateUserInformation();


        if (currentProfileImage) {

            displayProfileImage(
                currentProfileImage
            );

        } else {

            removeDisplayedProfileImage();

        }


        applyTheme(settings.appearance.theme);

        applyAccentColor(
            settings.appearance.accentColor
        );

        applyFontSize(
            settings.appearance.fontSize
        );


        document.body.classList.remove(
            "settings-has-unsaved-changes"
        );


        closeSettingsModal(
            "saveSettingsModal"
        );


        showSettingsToast(

            "Settings saved successfully.",

            "success"

        );


        return true;

    } catch (error) {

        console.error(
            "Unable to save settings:",
            error
        );


        closeSettingsModal(
            "saveSettingsModal"
        );


        showSettingsToast(

            "Unable to save settings. Browser storage may be full.",

            "error"

        );


        return false;

    }

}


/* =========================================================
   UPDATE STORED USER
========================================================= */

function updateStoredUser(profile) {

    const originalUser = parseJSON(

        localStorage.getItem("user"),

        {}

    );


    const updatedUser = {

        ...originalUser,

        first_name: profile.firstName,

        middle_name: profile.middleName,

        last_name: profile.lastName,

        email: profile.email,

        firstName: profile.firstName,

        middleName: profile.middleName,

        lastName: profile.lastName

    };


    localStorage.setItem(

        "user",
        JSON.stringify(updatedUser)

    );

}


/* =========================================================
   RESET SETTINGS
========================================================= */

function resetSettings() {

    try {

        const resetData = mergeSettings(

            defaultSettings,
            {}

        );


        resetData.profile.firstName =
            currentUser?.firstName || "";

        resetData.profile.middleName =
            currentUser?.middleName || "";

        resetData.profile.lastName =
            currentUser?.lastName || "";

        resetData.profile.email =
            currentUser?.email || "";


        localStorage.setItem(

            SETTINGS_STORAGE_KEY,
            JSON.stringify(resetData)

        );


        localStorage.setItem(

            THEME_STORAGE_KEY,
            resetData.appearance.theme

        );


        localStorage.setItem(

            "theme",
            resetData.appearance.theme

        );


        localStorage.setItem(

            ACCENT_STORAGE_KEY,
            resetData.appearance.accentColor

        );


        localStorage.setItem(

            FONT_SIZE_STORAGE_KEY,
            resetData.appearance.fontSize

        );


        localStorage.removeItem(
            PROFILE_IMAGE_STORAGE_KEY
        );


        currentProfileImage = null;


        populateProfileSettings(
            resetData.profile
        );


        populateNotificationSettings(
            resetData.notifications
        );


        populateSecuritySettings(
            resetData.security
        );


        populateSystemSettings(
            resetData.system
        );


        applyTheme(
            resetData.appearance.theme
        );


        synchronizeThemeRadio(
            resetData.appearance.theme
        );


        applyAccentColor(
            resetData.appearance.accentColor
        );


        synchronizeAccentColorChoice(
            resetData.appearance.accentColor
        );


        applyFontSize(
            resetData.appearance.fontSize
        );


        synchronizeFontSizeChoice(
            resetData.appearance.fontSize
        );


        removeDisplayedProfileImage();
        clearPasswordFields();
        updateBioCharacterCount();


        document.body.classList.remove(
            "settings-has-unsaved-changes"
        );


        closeSettingsModal(
            "resetSettingsModal"
        );


        showSettingsToast(

            "Settings restored to their default values.",

            "success"

        );

    } catch (error) {

        console.error(
            "Unable to reset settings:",
            error
        );


        closeSettingsModal(
            "resetSettingsModal"
        );


        showSettingsToast(

            "Unable to reset the settings.",

            "error"

        );

    }

}


/* =========================================================
   CANCEL UNSAVED CHANGES
========================================================= */

function cancelSettingsChanges() {

    const hasUnsavedChanges =
        document.body.classList.contains(
            "settings-has-unsaved-changes"
        );


    if (!hasUnsavedChanges) {

        showSettingsToast(

            "There are no unsaved changes.",

            "warning"

        );


        return;

    }


    const shouldCancel = window.confirm(

        "Discard all unsaved changes?"

    );


    if (!shouldCancel) {

        return;

    }


    loadSavedSettings();
    loadStoredProfileImage();


    showSettingsToast(

        "Unsaved changes were discarded.",

        "warning"

    );

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openSettingsModal(modalId) {

    const modal = getElement(modalId);


    if (!modal) {

        return;

    }


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow = "hidden";


    const firstButton = modal.querySelector(
        "button"
    );


    window.setTimeout(() => {

        firstButton?.focus();

    }, 50);

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeSettingsModal(modalId) {

    const modal = getElement(modalId);


    if (!modal) {

        return;

    }


    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const openModal = document.querySelector(
        ".settings-modal.show"
    );


    if (!openModal) {

        document.body.style.overflow = "";

    }

}


/* =========================================================
   INITIALIZE MODALS
========================================================= */

function initializeSettingsModals() {

    const saveButtons = [

        getElement("saveAllSettingsButton"),

        getElement("bottomSaveSettingsButton")

    ].filter(Boolean);


    const resetButtons = [

        getElement("resetSettingsButton"),

        getElement("bottomResetSettingsButton")

    ].filter(Boolean);


    saveButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const settings = collectSettingsData();
            const validation = validateSettings(settings);


            if (!validation.valid) {

                focusInvalidField(validation);


                showSettingsToast(

                    validation.message,
                    "error"

                );


                return;

            }


            openSettingsModal(
                "saveSettingsModal"
            );

        });

    });


    resetButtons.forEach((button) => {

        button.addEventListener("click", () => {

            openSettingsModal(
                "resetSettingsModal"
            );

        });

    });


    document
        .querySelectorAll("[data-close-modal]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                closeSettingsModal(
                    button.dataset.closeModal
                );

            });

        });


    document
        .querySelectorAll(".settings-modal-backdrop")
        .forEach((backdrop) => {

            backdrop.addEventListener("click", () => {

                const modal = backdrop.closest(
                    ".settings-modal"
                );


                if (modal) {

                    closeSettingsModal(
                        modal.id
                    );

                }

            });

        });


    getElement("confirmSaveSettingsButton")
        ?.addEventListener(
            "click",
            saveSettings
        );


    getElement("confirmResetSettingsButton")
        ?.addEventListener(
            "click",
            resetSettings
        );


    getElement("cancelSettingsButton")
        ?.addEventListener(
            "click",
            cancelSettingsChanges
        );

}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

function showSettingsToast(

    message,
    type = "success"

) {

    const toast = getElement("settingsToast");
    const toastMessage = getElement(
        "settingsToastMessage"
    );

    const toastIcon = getElement(
        "settingsToastIcon"
    );


    if (!toast || !toastMessage || !toastIcon) {

        console.log(message);

        return;

    }


    if (settingsToastTimer) {

        window.clearTimeout(
            settingsToastTimer
        );

    }


    toast.classList.remove(

        "show",
        "error",
        "warning"

    );


    toastMessage.textContent = message;


    if (type === "error") {

        toast.classList.add("error");

        toastIcon.className =
            "bx bx-error-circle";

    } else if (type === "warning") {

        toast.classList.add("warning");

        toastIcon.className =
            "bx bx-info-circle";

    } else {

        toastIcon.className =
            "bx bx-check-circle";

    }


    void toast.offsetWidth;


    toast.classList.add("show");


    settingsToastTimer = window.setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}


/* =========================================================
   NOTIFICATION SWITCH FEEDBACK
========================================================= */

function initializeNotificationSwitches() {

    const notificationIds = [

        "emailNotifications",
        "systemNotifications",
        "eventReminders",
        "jobAlerts",
        "announcementNotifications",
        "marketingEmails"

    ];


    notificationIds.forEach((id) => {

        const control = getElement(id);


        if (!control) {

            return;

        }


        control.addEventListener("change", () => {

            const label = control
                .closest(".settings-option-item")
                ?.querySelector("strong")
                ?.textContent
                ?.trim() || "Notification";


            showSettingsToast(

                `${label} ${
                    control.checked
                        ? "enabled"
                        : "disabled"
                }. Save changes to confirm.`,

                "warning"

            );

        });

    });

}


/* =========================================================
   SECURITY CONTROL BEHAVIOR
========================================================= */

function initializeSecurityControls() {

    const automaticLogout =
        getElement("automaticLogout");


    const sessionTimeout =
        getElement("sessionTimeout");


    function updateSessionTimeoutState() {

        if (!sessionTimeout) {

            return;

        }


        const isEnabled =
            automaticLogout?.checked ?? true;


        sessionTimeout.disabled = !isEnabled;

        sessionTimeout
            .closest(".settings-select-wrapper")
            ?.classList.toggle(
                "disabled",
                !isEnabled
            );

    }


    automaticLogout?.addEventListener(
        "change",
        updateSessionTimeoutState
    );


    updateSessionTimeoutState();

}


/* =========================================================
   PREVENT PASSWORD FROM BEING SAVED AS SETTINGS
========================================================= */

function excludePasswordFieldsFromUnsavedDetection() {

    [

        "currentPassword",
        "newPassword",
        "confirmPassword"

    ].forEach((id) => {

        const field = getElement(id);


        field?.addEventListener("input", () => {

            /*
             * Password fields are handled separately and
             * are never stored in localStorage.
             */

        });

    });

}


/* =========================================================
   FINAL ESCAPE KEY MODAL SUPPORT
========================================================= */

function initializeFinalModalEscapeHandler() {

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") {

            return;

        }


        document
            .querySelectorAll(".settings-modal.show")
            .forEach((modal) => {

                closeSettingsModal(
                    modal.id
                );

            });

    });

}


/* =========================================================
   PART 3 INITIALIZER
========================================================= */

function initializeSettingsPartThree() {

    loadSavedSettings();

    initializeSettingsModals();
    initializeNotificationSwitches();
    initializeSecurityControls();
    excludePasswordFieldsFromUnsavedDetection();
    initializeFinalModalEscapeHandler();

}


/* =========================================================
   FINAL APPLICATION INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            initializeSettingsPartOne();
            initializeSettingsPartTwo();
            initializeSettingsPartThree();


            console.log(
                "AlumniHub Settings initialized successfully."
            );

        } catch (error) {

            console.error(
                "Settings initialization failed:",
                error
            );


            showSettingsToast(

                "Some settings features failed to initialize.",

                "error"

            );

        }

    }
);  