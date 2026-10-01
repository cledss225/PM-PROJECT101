"use strict";

const API_BASE_URL = "http://localhost:5000/api";

const PROFILE_ENDPOINT = `${API_BASE_URL}/auth/me`;
const SIGN_OUT_OTHER_SESSIONS_ENDPOINT = `${API_BASE_URL}/auth/signout-other-sessions`;

const STORAGE_KEY = "officeSettings";

const DEFAULT_SETTINGS = {
    notifications: {
        verification: true,
        events: true,
        jobs: true,
        announcements: true,
        email: false
    },
    appearance: "light",
    security: {
        sessionTimeout: 30,
        loginActivityAlerts: true
    },
    preferences: {
        recordsPerPage: 10,
        dateFormat: "MMM_D_YYYY",
        defaultLandingPage: "office-dashboard.html",
        language: "en"
    }
};

const state = {
    profile: null,
    settings: structuredClone(DEFAULT_SETTINGS),
    inactivityTimer: null,
    mediaQuery: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    setCurrentYear();
    loadSavedSettings();
    applySettingsToControls();
    applyAppearance();
    setupSystemThemeListener();
    startSessionTimeoutWatcher();
    loadProfile();

    window.setTimeout(() => {
        el.pageLoader?.classList.add("hide");
    }, 250);
});


function cacheElements() {

    [
        "pageLoader",

        "sidebar",
        "sidebarOverlay",
        "sidebarClose",
        "menuToggle",

        "globalSearch",
        "themeToggle",
        "themeIcon",

        "headerProfileButton",
        "profileDropdown",

        "sidebarProfileImage",
        "headerProfileImage",
        "sidebarInitials",
        "headerInitials",
        "sidebarUserName",
        "headerUserName",

        "logoutButton",
        "profileLogoutButton",
        "confirmLogoutButton",

        "saveAllSettingsButton",
        "saveAllSettingsText",
        "resetAllSettingsButton",
        "confirmResetSettingsButton",

        "accountFirstName",
        "accountMiddleName",
        "accountLastName",
        "accountEmail",
        "accountRole",


        "notificationVerification",
        "notificationEvents",
        "notificationJobs",
        "notificationAnnouncements",
        "notificationEmail",

        "lightThemeOption",
        "darkThemeOption",
        "systemThemeOption",

        "sessionTimeout",
        "loginActivityAlerts",
        "signOutOtherSessionsButton",
        "confirmSignOutSessionsButton",

        "recordsPerPage",
        "dateFormat",
        "defaultLandingPage",
        "languagePreference",

        "resetSettingsModal",
        "signOutSessionsModal",
        "logoutModal",

        "toastContainer",
        "currentYear"

    ].forEach(id => {
        el[id] = document.getElementById(id);
    });

}


function bindEvents() {

    document
        .querySelectorAll("[data-settings-section]")
        .forEach(button => {

            button.addEventListener("click", () => {
                switchSettingsSection(
                    button.dataset.settingsSection
                );
            });



        });






    el.saveAllSettingsButton?.addEventListener(
        "click",
        saveAllSettings
    );


    el.resetAllSettingsButton?.addEventListener(
        "click",
        () => openModal("resetSettingsModal")
    );


    el.confirmResetSettingsButton?.addEventListener(
        "click",
        resetSettingsToDefaults
    );


    [
        el.lightThemeOption,
        el.darkThemeOption,
        el.systemThemeOption

    ].forEach(option => {

        option?.addEventListener("change", () => {

            if (!option.checked) {
                return;
            }

            state.settings.appearance =
                option.value;

            applyAppearance();

        });

    });


    el.themeToggle?.addEventListener(
        "click",
        quickToggleTheme
    );


    [
        el.notificationVerification,
        el.notificationEvents,
        el.notificationJobs,
        el.notificationAnnouncements,
        el.notificationEmail,
        el.loginActivityAlerts

    ].forEach(control => {

        control?.addEventListener(
            "change",
            collectSettingsFromControls
        );

    });


    [
        el.sessionTimeout,
        el.recordsPerPage,
        el.dateFormat,
        el.defaultLandingPage,
        el.languagePreference

    ].forEach(control => {

        control?.addEventListener(
            "change",
            () => {

                collectSettingsFromControls();

                if (
                    control ===
                    el.sessionTimeout
                ) {
                    startSessionTimeoutWatcher();
                }

            }
        );

    });


    el.signOutOtherSessionsButton?.addEventListener(
        "click",
        () => openModal("signOutSessionsModal")
    );


    el.confirmSignOutSessionsButton?.addEventListener(
        "click",
        signOutOtherSessions
    );


    el.menuToggle?.addEventListener(
        "click",
        openSidebar
    );


    el.sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    el.sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    el.headerProfileButton?.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            el.profileDropdown?.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !event.target.closest(
                    ".header-profile-wrapper"
                )
            ) {

                el.profileDropdown?.classList.remove(
                    "show"
                );

            }

        }
    );


    [
        el.logoutButton,
        el.profileLogoutButton

    ].forEach(button => {

        button?.addEventListener(
            "click",
            () => openModal("logoutModal")
        );

    });


    el.confirmLogoutButton?.addEventListener(
        "click",
        performLogout
    );


    document
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => closeModal(
                    button.dataset.closeModal
                )
            );

        });


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                el.globalSearch?.focus();

            }


            if (event.key === "Escape") {

                closeSidebar();

                document
                    .querySelectorAll(".modal.show")
                    .forEach(modal => {
                        closeModal(modal.id);
                    });

            }

        }
    );


    el.globalSearch?.addEventListener(
        "input",
        filterSettingsMenu
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 960
            ) {
                closeSidebar();
            }

        }
    );


    [
        "mousemove",
        "keydown",
        "click",
        "touchstart",
        "scroll"

    ].forEach(eventName => {

        document.addEventListener(
            eventName,
            resetInactivityTimer,
            { passive: true }
        );

    });

}


async function loadProfile() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        showToast(
            "Session expired",
            "Please sign in again.",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                PROFILE_ENDPOINT,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                body?.error ||
                "Unable to load account information."
            );

        }


        const profile =
            normalizeProfile(
                body?.user ??
                body?.profile ??
                body?.data ??
                body
            );


        state.profile =
            profile;


        renderProfile(profile);


    } catch (error) {

        console.error(
            "LOAD SETTINGS PROFILE ERROR:",
            error
        );


        loadProfileFromLocalStorage();


        showToast(
            "Profile fallback",
            "Using locally saved account information.",
            "info"
        );

    }

}


function normalizeProfile(user) {

    return {

        firstName:
            user?.first_name ??
            user?.firstName ??
            "",

        middleName:
            user?.middle_name ??
            user?.middleName ??
            "",

        lastName:
            user?.last_name ??
            user?.lastName ??
            "",

        email:
            user?.email ??
            "",

        roleId:
            user?.role_id ??
            user?.roleId ??
            null,

        roleName:
            user?.role_name ??
            user?.roleName ??
            user?.role ??
            "",

        profilePicture:
            user?.profile_picture ??
            user?.profilePicture ??
            ""

    };

}


function renderProfile(profile) {

    const fullName =
        [
            profile.firstName,
            profile.middleName,
            profile.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        "Alumni Office Staff";


    const initials =
        getInitials(fullName);


    setValue(
        el.accountFirstName,
        profile.firstName
    );

    setValue(
        el.accountMiddleName,
        profile.middleName
    );

    setValue(
        el.accountLastName,
        profile.lastName
    );

    setValue(
        el.accountEmail,
        profile.email
    );

    setText(
        el.accountRole,
        formatRoleName(profile)
    );

    setText(
        el.sidebarUserName,
        fullName
    );

    setText(
        el.headerUserName,
        fullName
    );

    setText(
        el.sidebarInitials,
        initials
    );

    setText(
        el.headerInitials,
        initials
    );


    setProfileImage(
        el.sidebarProfileImage,
        el.sidebarInitials,
        profile.profilePicture
    );


    setProfileImage(
        el.headerProfileImage,
        el.headerInitials,
        profile.profilePicture
    );

}


function loadProfileFromLocalStorage() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user") ||
                "null"
            );


        if (!user) {
            return;
        }


        const profile =
            normalizeProfile(user);


        state.profile =
            profile;


        renderProfile(profile);


    } catch (_) {}

}


function switchSettingsSection(sectionId) {

    document
        .querySelectorAll(".settings-section")
        .forEach(section => {

            const active =
                section.id === sectionId;


            section.hidden =
                !active;


            section.classList.toggle(
                "active",
                active
            );

        });


    document
        .querySelectorAll("[data-settings-section]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.settingsSection ===
                    sectionId
            );

        });

}


function filterSettingsMenu() {

    const query =
        el.globalSearch?.value
            .trim()
            .toLowerCase() ||
        "";


    const buttons =
        document.querySelectorAll(
            "[data-settings-section]"
        );


    if (!query) {

        buttons.forEach(button => {
            button.style.display = "";
        });

        return;

    }


    buttons.forEach(button => {

        const text =
            button.textContent
                .toLowerCase();


        button.style.display =
            text.includes(query)
                ? ""
                : "none";

    });

}


function loadSavedSettings() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            state.settings =
                structuredClone(
                    DEFAULT_SETTINGS
                );

            return;

        }


        const saved =
            JSON.parse(raw);


        state.settings = {
            notifications: {
                ...DEFAULT_SETTINGS.notifications,
                ...(saved.notifications || {})
            },
            appearance:
                saved.appearance ||
                DEFAULT_SETTINGS.appearance,
            security: {
                ...DEFAULT_SETTINGS.security,
                ...(saved.security || {})
            },
            preferences: {
                ...DEFAULT_SETTINGS.preferences,
                ...(saved.preferences || {})
            }
        };


    } catch (_) {

        state.settings =
            structuredClone(
                DEFAULT_SETTINGS
            );

    }

}


function collectSettingsFromControls() {

    state.settings = {

        notifications: {
            verification:
                Boolean(
                    el.notificationVerification?.checked
                ),

            events:
                Boolean(
                    el.notificationEvents?.checked
                ),

            jobs:
                Boolean(
                    el.notificationJobs?.checked
                ),

            announcements:
                Boolean(
                    el.notificationAnnouncements?.checked
                ),

            email:
                Boolean(
                    el.notificationEmail?.checked
                )
        },

        appearance:
            document.querySelector(
                'input[name="appearanceTheme"]:checked'
            )?.value ||
            "light",

        security: {
            sessionTimeout:
                Number(
                    el.sessionTimeout?.value ||
                    30
                ),

            loginActivityAlerts:
                Boolean(
                    el.loginActivityAlerts?.checked
                )
        },

        preferences: {
            recordsPerPage:
                Number(
                    el.recordsPerPage?.value ||
                    10
                ),

            dateFormat:
                el.dateFormat?.value ||
                "MMM_D_YYYY",

            defaultLandingPage:
                el.defaultLandingPage?.value ||
                "office-dashboard.html",

            language:
                el.languagePreference?.value ||
                "en"
        }

    };


    return state.settings;

}


function applySettingsToControls() {

    const s =
        state.settings;


    if (el.notificationVerification) {
        el.notificationVerification.checked =
            s.notifications.verification;
    }

    if (el.notificationEvents) {
        el.notificationEvents.checked =
            s.notifications.events;
    }

    if (el.notificationJobs) {
        el.notificationJobs.checked =
            s.notifications.jobs;
    }

    if (el.notificationAnnouncements) {
        el.notificationAnnouncements.checked =
            s.notifications.announcements;
    }

    if (el.notificationEmail) {
        el.notificationEmail.checked =
            s.notifications.email;
    }


    const themeInput =
        document.querySelector(
            `input[name="appearanceTheme"][value="${s.appearance}"]`
        );


    if (themeInput) {
        themeInput.checked = true;
    }


    if (el.sessionTimeout) {
        el.sessionTimeout.value =
            String(
                s.security.sessionTimeout
            );
    }


    if (el.loginActivityAlerts) {
        el.loginActivityAlerts.checked =
            s.security.loginActivityAlerts;
    }


    if (el.recordsPerPage) {
        el.recordsPerPage.value =
            String(
                s.preferences.recordsPerPage
            );
    }


    if (el.dateFormat) {
        el.dateFormat.value =
            s.preferences.dateFormat;
    }


    if (el.defaultLandingPage) {
        el.defaultLandingPage.value =
            s.preferences.defaultLandingPage;
    }


    if (el.languagePreference) {
        el.languagePreference.value =
            s.preferences.language;
    }

}


function saveAllSettings() {

    try {

        collectSettingsFromControls();


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                state.settings
            )
        );


        applyAppearance();

        startSessionTimeoutWatcher();


        setSaveSettingsLoading(true);


        window.setTimeout(() => {

            setSaveSettingsLoading(false);


            showToast(
                "Settings saved",
                "Your Office Portal preferences were saved successfully.",
                "success"
            );

        }, 350);


    } catch (error) {

        console.error(
            "SAVE SETTINGS ERROR:",
            error
        );


        setSaveSettingsLoading(false);


        showToast(
            "Unable to save settings",
            "Your preferences could not be saved.",
            "error"
        );

    }

}


function resetSettingsToDefaults() {

    state.settings =
        structuredClone(
            DEFAULT_SETTINGS
        );


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            state.settings
        )
    );


    applySettingsToControls();

    applyAppearance();

    startSessionTimeoutWatcher();


    closeModal(
        "resetSettingsModal"
    );


    showToast(
        "Settings reset",
        "Default AlumniHub settings were restored.",
        "success"
    );

}


function applyAppearance() {

    const mode =
        state.settings.appearance ||
        "light";


    let shouldUseDark =
        false;


    if (
        mode === "dark"
    ) {

        shouldUseDark =
            true;

    } else if (
        mode === "system"
    ) {

        shouldUseDark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

    }


    document.body.classList.toggle(
        "dark",
        shouldUseDark
    );


    document.body.classList.toggle(
        "dark-mode",
        shouldUseDark
    );


    localStorage.setItem(
        "savedTheme",
        shouldUseDark
            ? "dark"
            : "light"
    );


    localStorage.setItem(
        "theme",
        shouldUseDark
            ? "dark"
            : "light"
    );


    updateThemeIcon();

}


function quickToggleTheme() {

    collectSettingsFromControls();


    const isCurrentlyDark =
        document.body.classList.contains(
            "dark"
        ) ||
        document.body.classList.contains(
            "dark-mode"
        );


    state.settings.appearance =
        isCurrentlyDark
            ? "light"
            : "dark";


    const target =
        document.querySelector(
            `input[name="appearanceTheme"][value="${state.settings.appearance}"]`
        );


    if (target) {
        target.checked = true;
    }


    applyAppearance();

}


function setupSystemThemeListener() {

    if (
        state.mediaQuery
    ) {
        return;
    }


    state.mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    state.mediaQuery.addEventListener(
        "change",
        () => {

            if (
                state.settings.appearance ===
                "system"
            ) {

                applyAppearance();

            }

        }
    );

}


function updateThemeIcon() {

    if (!el.themeIcon) {
        return;
    }


    const dark =
        document.body.classList.contains(
            "dark"
        ) ||
        document.body.classList.contains(
            "dark-mode"
        );


    el.themeIcon.className =
        dark
            ? "bx bx-sun"
            : "bx bx-moon";

}




async function signOutOtherSessions() {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        showToast(
            "Session expired",
            "Please sign in again.",
            "error"
        );

        return;

    }


    try {

        if (
            el.confirmSignOutSessionsButton
        ) {

            el.confirmSignOutSessionsButton.disabled =
                true;

            el.confirmSignOutSessionsButton.textContent =
                "Signing out...";

        }


        const response =
            await fetch(
                SIGN_OUT_OTHER_SESSIONS_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                body?.error ||
                "Unable to sign out other sessions."
            );

        }


        closeModal(
            "signOutSessionsModal"
        );


        showToast(
            "Other sessions signed out",
            "Your current session remains active.",
            "success"
        );


    } catch (error) {

        console.error(
            "SIGN OUT OTHER SESSIONS ERROR:",
            error
        );


        showToast(
            "Unable to sign out sessions",
            error.message ||
            "Something went wrong.",
            "error"
        );


    } finally {

        if (
            el.confirmSignOutSessionsButton
        ) {

            el.confirmSignOutSessionsButton.disabled =
                false;

            el.confirmSignOutSessionsButton.textContent =
                "Continue";

        }

    }

}


function startSessionTimeoutWatcher() {

    clearTimeout(
        state.inactivityTimer
    );


    const minutes =
        Number(
            state.settings.security
                .sessionTimeout
        );


    if (
        !minutes ||
        minutes <= 0
    ) {

        state.inactivityTimer =
            null;

        return;

    }


    state.inactivityTimer =
        window.setTimeout(
            () => {

                showToast(
                    "Session timed out",
                    "You were signed out due to inactivity.",
                    "info"
                );


                window.setTimeout(
                    performLogout,
                    900
                );

            },
            minutes * 60 * 1000
        );

}


function resetInactivityTimer() {

    if (
        Number(
            state.settings.security
                .sessionTimeout
        ) > 0
    ) {

        startSessionTimeoutWatcher();

    }

}


function openSidebar() {

    el.sidebar?.classList.add("open");

    el.sidebarOverlay?.classList.add("show");

    document.body.style.overflow =
        "hidden";

}


function closeSidebar() {

    el.sidebar?.classList.remove("open");

    el.sidebarOverlay?.classList.remove("show");


    if (
        !document.querySelector(".modal.show")
    ) {

        document.body.style.overflow =
            "";

    }

}


function openModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {
        return;
    }


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !document.querySelector(".modal.show")
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function performLogout() {

    clearTimeout(
        state.inactivityTimer
    );


    localStorage.removeItem("token");

    localStorage.removeItem("user");

    sessionStorage.clear();


    window.location.href =
        "../pages/login.html";

}


function setSaveSettingsLoading(
    loading
) {

    if (
        !el.saveAllSettingsButton
    ) {
        return;
    }


    el.saveAllSettingsButton.disabled =
        loading;


    if (
        el.saveAllSettingsText
    ) {

        el.saveAllSettingsText.textContent =
            loading
                ? "Saving..."
                : "Save Changes";

    }

}




function setProfileImage(
    image,
    initials,
    source
) {

    if (!image || !initials) {
        return;
    }


    if (!source) {

        image.style.display =
            "none";

        initials.style.display =
            "flex";

        return;

    }


    image.src =
        resolveImageUrl(source);


    image.style.display =
        "block";


    initials.style.display =
        "none";


    image.onerror =
        () => {

            image.style.display =
                "none";

            initials.style.display =
                "flex";

        };

}


function showToast(
    title,
    message,
    type = "info"
) {

    if (!el.toastContainer) {
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <i class="bx ${
            type === "success"
                ? "bx-check-circle"
                : type === "error"
                ? "bx-error-circle"
                : "bx-info-circle"
        }"></i>

        <div>

            <strong>
                ${escapeHtml(title)}
            </strong>

            <span>
                ${escapeHtml(message)}
            </span>

        </div>

    `;


    el.toastContainer.appendChild(
        toast
    );


    window.setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";


            window.setTimeout(
                () => toast.remove(),
                220
            );

        },
        3200
    );

}


function formatRoleName(profile) {

    if (
        profile.roleName &&
        !/^\d+$/.test(
            String(profile.roleName)
        )
    ) {

        return profile.roleName;

    }


    if (
        Number(profile.roleId) === 1
    ) {
        return "Administrator";
    }


    if (
        Number(profile.roleId) === 3
    ) {
        return "Alumni Office";
    }


    return "Alumni Office";

}


function getInitials(name) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "AO";
    }


    if (parts.length === 1) {

        return parts[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function resolveImageUrl(path) {

    if (!path) {
        return "";
    }


    if (
        /^(https?:|data:|blob:)/i
            .test(path)
    ) {

        return path;

    }


    if (
        path.startsWith("/")
    ) {

        return (
            `http://localhost:5000${path}`
        );

    }


    return path;

}


function setCurrentYear() {

    setText(
        el.currentYear,
        new Date().getFullYear()
    );

}


function setText(
    element,
    value
) {

    if (element) {

        element.textContent =
            value ?? "—";

    }

}


function setValue(
    element,
    value
) {

    if (element) {

        element.value =
            value ?? "";

    }

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


async function safeJson(response) {

    try {

        return await response.json();

    } catch (_) {

        return null;

    }

}