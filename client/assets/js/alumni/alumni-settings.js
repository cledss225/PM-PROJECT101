"use strict";


/* =========================================================
   ALUMNIHUB
   ALUMNI SETTINGS
========================================================= */

const API_BASE_URL = "/api";


const state = {

    user: null,

    profile: null,

    activeSection: "account",

    originalAccount: null,

    originalPreferences: null

};


const el = {};



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSettingsPage
);


async function initializeSettingsPage() {

    cacheElements();

    initializeTheme();

    bindEvents();

    initializeSettingsNavigation();

    initializePasswordToggles();

    loadPreferences();


    if (!getToken()) {

        redirectToLogin();

        return;

    }


    await loadSettingsPage();

}



/* =========================================================
   CACHE ELEMENTS
========================================================= */

function cacheElements() {

    const ids = [

        "sidebar",
        "sidebarOverlay",

        "sidebarProfileAvatar",
        "sidebarProfileName",

        "menuToggle",

        "refreshSettingsBtn",

        "themeToggle",
        "themeIcon",

        "topbarAvatar",
        "topbarUserName",

        "logoutBtn",

        "accountSettingsForm",

        "settingsFirstName",
        "settingsMiddleName",
        "settingsLastName",
        "settingsEmail",

        "settingsVerificationStatus",
        "settingsRoleName",
        "settingsMemberSince",
        "settingsLastUpdated",

        "resetAccountSettingsBtn",
        "saveAccountSettingsBtn",

        "changePasswordForm",
        "currentPassword",
        "newPassword",
        "confirmPassword",

        "clearPasswordFormBtn",
        "changePasswordBtn",

        "toastPreference",
        "animationPreference",

        "resetPreferencesBtn",
        "savePreferencesBtn",

        "settingsLastLogin",

        "securityLogoutBtn",

        "logoutConfirmModal",
        "cancelLogoutBtn",
        "confirmLogoutBtn",

        "settingsLoadingOverlay",

        "toastContainer"

    ];


    ids.forEach(id => {

        el[id] =
            document.getElementById(id);

    });

}



/* =========================================================
   BIND EVENTS
========================================================= */

function bindEvents() {


    /* MOBILE SIDEBAR */

    el.menuToggle
        ?.addEventListener(
            "click",
            toggleSidebar
        );


    el.sidebarOverlay
        ?.addEventListener(
            "click",
            closeSidebar
        );


    /* REFRESH */

    el.refreshSettingsBtn
        ?.addEventListener(
            "click",
            refreshSettings
        );


    /* THEME TOPBAR */

    el.themeToggle
        ?.addEventListener(
            "click",
            toggleTheme
        );


    /* ACCOUNT FORM */

    el.accountSettingsForm
        ?.addEventListener(
            "submit",
            saveAccountSettings
        );


    el.resetAccountSettingsBtn
        ?.addEventListener(
            "click",
            resetAccountSettings
        );


    /* PASSWORD */

    el.changePasswordForm
        ?.addEventListener(
            "submit",
            changePassword
        );


    el.clearPasswordFormBtn
        ?.addEventListener(
            "click",
            clearPasswordForm
        );


    /* PREFERENCES */

    el.savePreferencesBtn
        ?.addEventListener(
            "click",
            savePreferences
        );


    el.resetPreferencesBtn
        ?.addEventListener(
            "click",
            resetPreferences
        );


    /* LOGOUT */

    el.logoutBtn
        ?.addEventListener(
            "click",
            openLogoutModal
        );


    el.securityLogoutBtn
        ?.addEventListener(
            "click",
            openLogoutModal
        );


    el.cancelLogoutBtn
        ?.addEventListener(
            "click",
            closeLogoutModal
        );


    el.confirmLogoutBtn
        ?.addEventListener(
            "click",
            logout
        );


    el.logoutConfirmModal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    el.logoutConfirmModal
                ) {

                    closeLogoutModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}



/* =========================================================
   SETTINGS NAVIGATION
========================================================= */

function initializeSettingsNavigation() {

    const navButtons =
        document.querySelectorAll(
            ".settings-nav-button[data-settings-section]"
        );


    const panels =
        document.querySelectorAll(
            ".settings-section[data-section-panel]"
        );


    navButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.settingsSection;


                if (!section) {

                    return;

                }


                state.activeSection =
                    section;


                navButtons.forEach(item => {

                    item.classList.toggle(
                        "active",
                        item === button
                    );

                });


                panels.forEach(panel => {

                    const active =
                        panel.dataset.sectionPanel ===
                        section;


                    panel.classList.toggle(
                        "active",
                        active
                    );


                    panel.classList.toggle(
                        "hidden",
                        !active
                    );

                });


                window.scrollTo({
                    top: 0,
                    behavior:
                        animationsEnabled()
                            ? "smooth"
                            : "auto"
                });

            }
        );

    });


    showSettingsSection(
        state.activeSection
    );

}



/* =========================================================
   SHOW SPECIFIC SECTION
========================================================= */

function showSettingsSection(section) {

    const navButtons =
        document.querySelectorAll(
            ".settings-nav-button[data-settings-section]"
        );


    const panels =
        document.querySelectorAll(
            ".settings-section[data-section-panel]"
        );


    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.settingsSection ===
            section
        );

    });


    panels.forEach(panel => {

        const active =
            panel.dataset.sectionPanel ===
            section;


        panel.classList.toggle(
            "active",
            active
        );


        panel.classList.toggle(
            "hidden",
            !active
        );

    });


    state.activeSection =
        section;

}




/* =========================================================
   SHARED ALUMNI AVATAR
========================================================= */

function renderSharedAlumniAvatar(
    element,
    picture,
    initials
) {

    if (!element) {
        return;
    }


    element.innerHTML = "";


    if (picture) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            picture;

        image.alt =
            "Profile picture";


        Object.assign(
            image.style,
            {
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "inherit"
            }
        );


        image.addEventListener(
            "error",
            () => {

                element.innerHTML = "";

                const fallback =
                    document.createElement(
                        "span"
                    );

                fallback.textContent =
                    initials;

                element.appendChild(
                    fallback
                );

            },
            {
                once: true
            }
        );


        element.appendChild(
            image
        );

        return;

    }


    const fallback =
        document.createElement(
            "span"
        );

    fallback.textContent =
        initials;

    element.appendChild(
        fallback
    );

}

/* =========================================================
   LOAD PAGE
========================================================= */

async function loadSettingsPage() {

    showLoadingOverlay();


    try {

        const userResponse =
            await apiRequest(
                "/auth/me",
                {
                    method: "GET"
                }
            );


        state.user =
            userResponse.user ||
            userResponse.data ||
            userResponse;


        if (
            state.user?.role_id !== undefined &&
            Number(
                state.user.role_id
            ) !== 2
        ) {

            throw new Error(
                "This page is only available to alumni accounts."
            );

        }


        try {

            const profileResponse =
                await apiRequest(
                    "/alumni/profile",
                    {
                        method: "GET"
                    }
                );


            state.profile =
                profileResponse.profile ||
                profileResponse.alumni ||
                profileResponse.data ||
                profileResponse ||
                {};

        } catch (error) {

            console.warn(
                "PROFILE SETTINGS LOAD:",
                error
            );


            state.profile = {};

        }


        renderUserInformation();

        renderAccountForm();

        renderSecurityInformation();


    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        if (
            error.status === 401 ||
            error.status === 403
        ) {

            clearSession();

            redirectToLogin();

            return;

        }


        showToast(
            "Unable to load settings",
            error.message ||
            "Please try again.",
            "error"
        );


    } finally {

        hideLoadingOverlay();

    }

}



/* =========================================================
   RENDER USER
========================================================= */

function renderUserInformation() {

    const user =
        state.user || {};


    const fullName =
        [

            user.first_name,
            user.middle_name,
            user.last_name

        ]
            .filter(Boolean)
            .join(" ")
            .replace(
                /\s+/g,
                " "
            )
            .trim() ||
        "Alumni User";


    const initials =
        getInitials(
            user.first_name,
            user.last_name
        );


    setText(
        el.sidebarProfileName,
        fullName
    );


    setText(
        el.topbarUserName,
        fullName
    );


    renderSharedAlumniAvatar(
        el.sidebarProfileAvatar,
        user.profile_picture,
        initials
    );


    renderSharedAlumniAvatar(
        el.topbarAvatar,
        user.profile_picture,
        initials
    );

}



/* =========================================================
   ACCOUNT
========================================================= */

function renderAccountForm() {

    const user =
        state.user || {};


    setInputValue(
        el.settingsFirstName,
        user.first_name
    );


    setInputValue(
        el.settingsMiddleName,
        user.middle_name
    );


    setInputValue(
        el.settingsLastName,
        user.last_name
    );


    setInputValue(
        el.settingsEmail,
        user.email
    );


    const verified =
        isVerifiedUser(user);


    setText(
        el.settingsVerificationStatus,
        verified
            ? "Verified"
            : "Pending Verification"
    );


    setText(
        el.settingsRoleName,
        "Alumni"
    );


    setText(
        el.settingsMemberSince,
        formatDate(
            user.created_at
        )
    );


    setText(
        el.settingsLastUpdated,
        formatDate(
            user.updated_at
        )
    );


    state.originalAccount = {

        firstName:
            user.first_name || "",

        middleName:
            user.middle_name || "",

        lastName:
            user.last_name || "",

        email:
            user.email || ""

    };

}



/* =========================================================
   SAVE ACCOUNT
========================================================= */

async function saveAccountSettings(event) {

    event.preventDefault();


    const firstName =
        getInputValue(
            el.settingsFirstName
        );


    const middleName =
        getInputValue(
            el.settingsMiddleName
        );


    const lastName =
        getInputValue(
            el.settingsLastName
        );


    const email =
        getInputValue(
            el.settingsEmail
        );


    if (
        !firstName ||
        !lastName ||
        !email
    ) {

        showToast(
            "Missing information",
            "First name, last name, and email are required.",
            "error"
        );

        return;

    }


    const button =
        el.saveAccountSettingsBtn;


    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        /*
            Uses existing Alumni profile endpoint.

            If your current controller only allows
            profile fields and not email/name fields,
            we can adjust the backend afterward.
        */

        await apiRequest(
            "/alumni/profile",
            {
                method: "PUT",

                body: JSON.stringify({

                    first_name:
                        firstName,

                    middle_name:
                        middleName ||
                        null,

                    last_name:
                        lastName,

                    email

                })
            }
        );


        state.user = {

            ...state.user,

            first_name:
                firstName,

            middle_name:
                middleName,

            last_name:
                lastName,

            email

        };


        localStorage.setItem(
            "user",
            JSON.stringify(
                state.user
            )
        );


        state.originalAccount = {

            firstName,

            middleName,

            lastName,

            email

        };


        renderUserInformation();


        setText(
            el.settingsLastUpdated,
            formatDate(
                new Date()
            )
        );


        showToast(
            "Account updated",
            "Your account information has been saved.",
            "success"
        );


    } catch (error) {

        console.error(
            "SAVE ACCOUNT SETTINGS ERROR:",
            error
        );


        showToast(
            "Unable to save account",
            error.message ||
            "Please try again.",
            "error"
        );


    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}



/* =========================================================
   RESET ACCOUNT
========================================================= */

function resetAccountSettings() {

    const original =
        state.originalAccount;


    if (!original) {

        return;

    }


    setInputValue(
        el.settingsFirstName,
        original.firstName
    );


    setInputValue(
        el.settingsMiddleName,
        original.middleName
    );


    setInputValue(
        el.settingsLastName,
        original.lastName
    );


    setInputValue(
        el.settingsEmail,
        original.email
    );


    showToast(
        "Changes reset",
        "Unsaved account changes were discarded.",
        "success"
    );

}



/* =========================================================
   PASSWORD TOGGLES
========================================================= */

function initializePasswordToggles() {

    const buttons =
        document.querySelectorAll(
            "[data-password-target]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.passwordTarget;


                const input =
                    document.getElementById(
                        targetId
                    );


                if (!input) {

                    return;

                }


                const showing =
                    input.type === "text";


                input.type =
                    showing
                        ? "password"
                        : "text";


                const icon =
                    button.querySelector("i");


                if (icon) {

                    icon.className =
                        showing
                            ? "bx bx-hide"
                            : "bx bx-show";

                }


                button.setAttribute(
                    "aria-label",
                    showing
                        ? "Show password"
                        : "Hide password"
                );

            }
        );

    });

}



/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword(event) {

    event.preventDefault();


    const currentPassword =
        getInputValue(
            el.currentPassword
        );


    const newPassword =
        getInputValue(
            el.newPassword
        );


    const confirmPassword =
        getInputValue(
            el.confirmPassword
        );


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showToast(
            "Missing information",
            "Complete all password fields.",
            "error"
        );

        return;

    }


    if (
        newPassword.length < 8
    ) {

        showToast(
            "Invalid password",
            "Your new password must contain at least 8 characters.",
            "error"
        );

        return;

    }


    if (
        currentPassword ===
        newPassword
    ) {

        showToast(
            "Choose another password",
            "Your new password must be different from your current password.",
            "error"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showToast(
            "Passwords do not match",
            "Confirm your new password correctly.",
            "error"
        );

        return;

    }


    setButtonLoading(
        el.changePasswordBtn,
        true,
        "Changing..."
    );


    try {

        await apiRequest(
            "/auth/change-password",
            {
                method: "PUT",

                body: JSON.stringify({

                    current_password:
                        currentPassword,

                    new_password:
                        newPassword

                })
            }
        );


        clearPasswordForm();


        showToast(
            "Password changed",
            "Your AlumniHub password was updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        showToast(
            "Unable to change password",
            error.message ||
            "Please verify your current password.",
            "error"
        );


    } finally {

        setButtonLoading(
            el.changePasswordBtn,
            false
        );

    }

}



/* =========================================================
   CLEAR PASSWORD
========================================================= */

function clearPasswordForm() {

    [
        el.currentPassword,
        el.newPassword,
        el.confirmPassword

    ].forEach(input => {

        if (input) {

            input.value = "";

            input.type =
                "password";

        }

    });


    document
        .querySelectorAll(
            "[data-password-target] i"
        )
        .forEach(icon => {

            icon.className =
                "bx bx-hide";

        });

}



/* =========================================================
   APPEARANCE BUTTONS
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            "savedTheme"
        ) ||
        localStorage.getItem(
            "theme"
        ) ||
        "dark";


    applyTheme(
        savedTheme
    );


    const options =
        document.querySelectorAll(
            "[data-theme-option]"
        );


    options.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                const theme =
                    option.dataset.themeOption;


                applyTheme(
                    theme
                );


                showToast(
                    "Appearance updated",
                    `${capitalize(theme)} theme is now active.`,
                    "success"
                );

            }
        );

    });


    updateThemeOptions();

}



/* =========================================================
   TOPBAR THEME
========================================================= */

function toggleTheme() {

    const nextTheme =
        getCurrentTheme() ===
        "dark"

            ? "light"

            : "dark";


    applyTheme(
        nextTheme
    );


    showToast(
        "Appearance updated",
        `${capitalize(nextTheme)} theme is now active.`,
        "success"
    );

}



function applyTheme(theme) {

    const dark =
        theme === "dark";


    document.body
        .classList
        .toggle(
            "dark",
            dark
        );


    document.body
        .classList
        .toggle(
            "dark-mode",
            dark
        );


    localStorage.setItem(
        "savedTheme",
        dark
            ? "dark"
            : "light"
    );


    localStorage.setItem(
        "theme",
        dark
            ? "dark"
            : "light"
    );


    if (
        el.themeIcon
    ) {

        el.themeIcon.className =
            dark
                ? "bx bx-sun"
                : "bx bx-moon";

    }


    updateThemeOptions();

}



/* =========================================================
   THEME SELECTION UI
========================================================= */

function updateThemeOptions() {

    const current =
        getCurrentTheme();


    document
        .querySelectorAll(
            "[data-theme-option]"
        )
        .forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.themeOption ===
                current
            );

        });

}



function getCurrentTheme() {

    return (

        document.body
            .classList
            .contains("dark") ||

        document.body
            .classList
            .contains("dark-mode")

    )
        ? "dark"
        : "light";

}



/* =========================================================
   PREFERENCES
========================================================= */

function loadPreferences() {

    const defaults = {

        toast:
            true,

        animations:
            true

    };


    let saved = {};


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "alumniPortalPreferences"
                ) ||
                "{}"
            );

    } catch {

        saved = {};

    }


    const preferences = {

        ...defaults,

        ...saved

    };


    if (
        el.toastPreference
    ) {

        el.toastPreference.checked =
            preferences.toast;

    }


    if (
        el.animationPreference
    ) {

        el.animationPreference.checked =
            preferences.animations;

    }


    state.originalPreferences = {

        ...preferences

    };


    applyAnimationPreference(
        preferences.animations
    );

}



/* =========================================================
   SAVE PREFERENCES
========================================================= */

function savePreferences() {

    const preferences = {

        toast:
            Boolean(
                el.toastPreference
                    ?.checked
            ),

        animations:
            Boolean(
                el.animationPreference
                    ?.checked
            )

    };


    localStorage.setItem(
        "alumniPortalPreferences",
        JSON.stringify(
            preferences
        )
    );


    state.originalPreferences = {

        ...preferences

    };


    applyAnimationPreference(
        preferences.animations
    );


    showToast(
        "Preferences saved",
        "Your portal preferences have been updated.",
        "success",
        true
    );

}



/* =========================================================
   RESET PREFERENCES
========================================================= */

function resetPreferences() {

    const defaults = {

        toast:
            true,

        animations:
            true

    };


    if (
        el.toastPreference
    ) {

        el.toastPreference.checked =
            defaults.toast;

    }


    if (
        el.animationPreference
    ) {

        el.animationPreference.checked =
            defaults.animations;

    }


    localStorage.setItem(
        "alumniPortalPreferences",
        JSON.stringify(
            defaults
        )
    );


    state.originalPreferences = {

        ...defaults

    };


    applyAnimationPreference(
        true
    );


    showToast(
        "Preferences reset",
        "Default portal preferences were restored.",
        "success",
        true
    );

}



/* =========================================================
   ANIMATION PREFERENCE
========================================================= */

function applyAnimationPreference(enabled) {

    document.body.classList.toggle(
        "reduce-animations",
        !enabled
    );

}



function animationsEnabled() {

    if (
        !el.animationPreference
    ) {

        return true;

    }


    return el.animationPreference.checked;

}



/* =========================================================
   SECURITY
========================================================= */

function renderSecurityInformation() {

    const user =
        state.user || {};


    setText(
        el.settingsLastLogin,
        formatDateTime(
            user.last_login
        )
    );

}



/* =========================================================
   REFRESH
========================================================= */

async function refreshSettings() {

    const icon =
        el.refreshSettingsBtn
            ?.querySelector("i");


    icon
        ?.classList
        .add("bx-spin");


    try {

        await loadSettingsPage();


        showToast(
            "Settings refreshed",
            "Latest account information was loaded.",
            "success"
        );


    } finally {

        icon
            ?.classList
            .remove("bx-spin");

    }

}



/* =========================================================
   SIDEBAR
========================================================= */

function toggleSidebar() {

    el.sidebar
        ?.classList
        .toggle("open");


    el.sidebarOverlay
        ?.classList
        .toggle("show");

}



function closeSidebar() {

    el.sidebar
        ?.classList
        .remove("open");


    el.sidebarOverlay
        ?.classList
        .remove("show");

}



/* =========================================================
   LOGOUT MODAL
========================================================= */

function openLogoutModal() {

    el.logoutConfirmModal
        ?.classList
        .remove("hidden");


    document.body.style.overflow =
        "hidden";

}



function closeLogoutModal() {

    el.logoutConfirmModal
        ?.classList
        .add("hidden");


    document.body.style.overflow =
        "";

}



/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    clearSession();

    redirectToLogin();

}



function clearSession() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "authToken"
    );


    localStorage.removeItem(
        "user"
    );

}



function getToken() {

    return (

        localStorage.getItem(
            "token"
        ) ||

        localStorage.getItem(
            "authToken"
        ) ||

        ""

    );

}



function redirectToLogin() {

    window.location.href =
        "../pages/login.html";

}



/* =========================================================
   LOADING OVERLAY
========================================================= */

function showLoadingOverlay() {

    el.settingsLoadingOverlay
        ?.classList
        .remove("hidden");

}



function hideLoadingOverlay() {

    el.settingsLoadingOverlay
        ?.classList
        .add("hidden");

}



/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(event) {

    if (
        event.key ===
        "Escape"
    ) {

        closeLogoutModal();

        closeSidebar();

    }

}



/* =========================================================
   API
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        Accept:
            "application/json",

        ...(
            options.headers ||
            {}
        )

    };


    if (
        options.body
    ) {

        headers[
            "Content-Type"
        ] =
            "application/json";

    }


    if (
        token
    ) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                ...options,

                headers

            }
        );


    const rawText =
        await response.text();


    let data = {};


    if (rawText) {

        try {

            data =
                JSON.parse(
                    rawText
                );

        } catch {

            data = {

                message:
                    rawText

            };

        }

    }


    if (
        !response.ok ||
        data.success === false
    ) {

        const error =
            new Error(

                data.message ||
                data.error ||
                `Request failed with status ${response.status}.`

            );


        error.status =
            response.status;


        error.data =
            data;


        throw error;

    }


    return data;

}



/* =========================================================
   BUTTON LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    text = "Loading..."
) {

    if (!button) {

        return;

    }


    if (loading) {

        button.dataset.originalHtml =
            button.innerHTML;


        button.disabled =
            true;


        button.innerHTML = `
            <i class="bx bx-loader-alt bx-spin"></i>
            <span>${escapeHtml(text)}</span>
        `;


        return;

    }


    button.disabled =
        false;


    if (
        button.dataset.originalHtml
    ) {

        button.innerHTML =
            button.dataset.originalHtml;


        delete button.dataset.originalHtml;

    }

}



/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message,
    type = "info",
    force = false
) {

    if (
        !force &&
        el.toastPreference &&
        !el.toastPreference.checked
    ) {

        return;

    }


    if (
        !el.toastContainer
    ) {

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    const icon =
        type === "success"

            ? "bx-check-circle"

            : type === "error"

                ? "bx-error-circle"

                : "bx-info-circle";


    toast.innerHTML = `
        <i class="bx ${icon}"></i>

        <div>

            <strong>
                ${escapeHtml(title)}
            </strong>

            <span>
                ${escapeHtml(message)}
            </span>

        </div>
    `;


    el.toastContainer
        .appendChild(
            toast
        );


    window.setTimeout(
        () => {

            toast.remove();

        },
        4200
    );

}



/* =========================================================
   HELPERS
========================================================= */

function setText(
    element,
    value
) {

    if (
        element
    ) {

        element.textContent =
            value ??
            "—";

    }

}



function setInputValue(
    element,
    value
) {

    if (
        element
    ) {

        element.value =
            value ??
            "";

    }

}



function getInputValue(element) {

    return (
        element
            ?.value ||
        ""
    )
        .trim();

}



function getInitials(
    firstName,
    lastName
) {

    const first =
        String(
            firstName ||
            ""
        ).trim();


    const last =
        String(
            lastName ||
            ""
        ).trim();


    return (

        `${first.charAt(0)}${last.charAt(0)}`
            .toUpperCase() ||

        "AL"

    );

}



function isVerifiedUser(user) {

    return (

        user?.is_verified === true ||

        user?.is_verified === 1 ||

        user?.is_verified === "true" ||

        normalizeText(
            user?.verification_status
        ) === "verified" ||

        normalizeText(
            user?.verification_status
        ) === "approved"

    );

}



function normalizeText(value) {

    return String(
        value ??
        ""
    )
        .trim()
        .toLowerCase();

}



function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-PH",
        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"

        }
    );

}



function formatDateTime(value) {

    if (!value) {

        return "Not recorded";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not recorded";

    }


    return date.toLocaleString(
        "en-PH",
        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"

        }
    );

}



function capitalize(value) {

    const text =
        String(
            value ||
            ""
        );


    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}



function escapeHtml(value) {

    return String(
        value ??
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}