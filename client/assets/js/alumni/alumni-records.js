"use strict";


/* =========================================================
   ALUMNIHUB — ALUMNI RECORDS
   PART 1A

   Included:
   - Global configuration
   - DOM initialization
   - Authentication checking
   - Role protection
   - User information display
   - Page loader
   - Current year
   - Responsive sidebar
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   LOCAL STORAGE DATA
========================================================= */

const token = localStorage.getItem("token");

let currentUser = getStoredUser();


/* =========================================================
   PAGE STATE
========================================================= */

const alumniRecordsState = {

    records: [],

    filteredRecords: [],

    selectedRecords: new Set(),

    currentPage: 1,

    recordsPerPage: 10,

    currentAlumni: null,

    isLoading: false

};


/* =========================================================
   DOM CONTENT LOADED
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPage
);


/* =========================================================
   INITIALIZE PAGE
========================================================= */

async function initializeAlumniRecordsPage() {

    try {

        protectAlumniOfficePage();

        displayCurrentUser();

        setCurrentYear();

        initializeSidebar();

    } catch (error) {

        console.error(
            "Alumni Records initialization error:",
            error
        );

    } finally {

        hidePageLoader();

    }

}


/* =========================================================
   AUTHENTICATION AND ROLE PROTECTION
========================================================= */

function protectAlumniOfficePage() {

    /*
        No token means that the user is not logged in.
    */

    if (!token) {

        redirectToLogin();

        throw new Error(
            "Authentication token was not found."
        );

    }


    /*
        No valid stored user information means that the
        login session is incomplete or corrupted.
    */

    if (!currentUser) {

        clearUserSession();

        redirectToLogin();

        throw new Error(
            "Stored user information is invalid."
        );

    }


    const roleId = Number(
        currentUser.role_id
    );


    /*
        Alumni Office pages are restricted to role_id = 3.
    */

    if (roleId !== 3) {

        redirectUserByRole(roleId);

        throw new Error(
            "User is not authorized to access the Alumni Office Portal."
        );

    }


    /*
        Inactive accounts must not access protected pages.
        The condition accepts different API response formats.
    */

    if (
        currentUser.is_active === false ||
        currentUser.is_active === "false" ||
        currentUser.is_active === 0
    ) {

        clearUserSession();

        redirectToLogin();

        throw new Error(
            "The current account is inactive."
        );

    }

}


/* =========================================================
   GET STORED USER
========================================================= */

function getStoredUser() {

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) {

        return null;

    }

    try {

        const parsedUser =
            JSON.parse(storedUser);

        if (
            !parsedUser ||
            typeof parsedUser !== "object"
        ) {

            return null;

        }

        return parsedUser;

    } catch (error) {

        console.error(
            "Unable to parse stored user:",
            error
        );

        return null;

    }

}


/* =========================================================
   REDIRECT USER BASED ON ROLE
========================================================= */

function redirectUserByRole(roleId) {

    switch (Number(roleId)) {

        case 1:

            window.location.replace(
                "../dashboard.html"
            );

            break;


        case 2:

            window.location.replace(
                "../alumni/alumni-dashboard.html"
            );

            break;


        case 3:

            window.location.replace(
                "office-dashboard.html"
            );

            break;


        default:

            clearUserSession();

            redirectToLogin();

            break;

    }

}


/* =========================================================
   REDIRECT TO LOGIN
========================================================= */

function redirectToLogin() {

    window.location.replace(
        "../login.html"
    );

}


/* =========================================================
   CLEAR USER SESSION
========================================================= */

function clearUserSession() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

}


/* =========================================================
   DISPLAY CURRENT USER
========================================================= */

function displayCurrentUser() {

    if (!currentUser) {

        return;

    }


    const fullName =
        getUserFullName(currentUser);

    const initials =
        getUserInitials(currentUser);

    const email =
        getSafeText(
            currentUser.email,
            "No email available"
        );

    const profilePicture =
        getProfilePicture(currentUser);


    /*
        Sidebar information
    */

    setElementText(
        "sidebarUserName",
        fullName
    );

    setElementText(
        "sidebarInitials",
        initials
    );


    /*
        Header information
    */

    setElementText(
        "headerUserName",
        getDisplayFirstName(currentUser)
    );

    setElementText(
        "headerInitials",
        initials
    );


    /*
        Profile dropdown information
    */

    setElementText(
        "profileDropdownName",
        fullName
    );

    setElementText(
        "profileDropdownEmail",
        email
    );

    setElementText(
        "profileDropdownInitials",
        initials
    );


    /*
        Profile images
    */

    configureProfileImage(
        "sidebarProfileImage",
        profilePicture
    );

    configureProfileImage(
        "headerProfileImage",
        profilePicture
    );

}


/* =========================================================
   GET USER FULL NAME
========================================================= */

function getUserFullName(user) {

    if (!user) {

        return "Alumni Office Staff";

    }


    /*
        Some API responses may already contain full_name.
    */

    if (
        typeof user.full_name === "string" &&
        user.full_name.trim()
    ) {

        return user.full_name.trim();

    }


    const nameParts = [

        user.first_name,

        user.middle_name,

        user.last_name

    ];


    const completeName = nameParts

        .filter((namePart) => {

            return (
                typeof namePart === "string" &&
                namePart.trim()
            );

        })

        .map((namePart) => {

            return namePart.trim();

        })

        .join(" ");


    return completeName ||
        "Alumni Office Staff";

}


/* =========================================================
   GET DISPLAY FIRST NAME
========================================================= */

function getDisplayFirstName(user) {

    if (
        user &&
        typeof user.first_name === "string" &&
        user.first_name.trim()
    ) {

        return user.first_name.trim();

    }


    const fullName =
        getUserFullName(user);

    const firstWord =
        fullName.split(" ")[0];


    return firstWord ||
        "Office Staff";

}


/* =========================================================
   GET USER INITIALS
========================================================= */

function getUserInitials(user) {

    if (!user) {

        return "AO";

    }


    const firstName =
        typeof user.first_name === "string"
            ? user.first_name.trim()
            : "";

    const lastName =
        typeof user.last_name === "string"
            ? user.last_name.trim()
            : "";


    if (firstName || lastName) {

        const firstInitial =
            firstName.charAt(0);

        const lastInitial =
            lastName.charAt(0);


        return (
            firstInitial +
            lastInitial
        )
            .toUpperCase() ||
            "AO";

    }


    const fullName =
        getUserFullName(user);

    const nameWords =
        fullName
            .split(" ")
            .filter(Boolean);


    if (nameWords.length >= 2) {

        return (
            nameWords[0].charAt(0) +
            nameWords[nameWords.length - 1].charAt(0)
        ).toUpperCase();

    }


    if (nameWords.length === 1) {

        return nameWords[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return "AO";

}


/* =========================================================
   GET PROFILE PICTURE
========================================================= */

function getProfilePicture(user) {

    if (!user) {

        return "";

    }


    return (

        user.profile_picture ||

        user.profile_image ||

        user.avatar ||

        ""

    );

}


/* =========================================================
   CONFIGURE PROFILE IMAGE
========================================================= */

function configureProfileImage(
    elementId,
    imageSource
) {

    const imageElement =
        document.getElementById(elementId);

    if (!imageElement) {

        return;

    }


    /*
        If the user has no uploaded profile picture,
        hide the image so that the initials underneath
        remain visible.
    */

    if (!imageSource) {

        imageElement.style.display = "none";

        imageElement.removeAttribute("src");

        return;

    }


    imageElement.style.display = "block";

    imageElement.src =
        resolveProfileImagePath(imageSource);


    /*
        If the image cannot be loaded, hide it and
        use the initials as fallback.
    */

    imageElement.addEventListener(
        "error",
        function handleProfileImageError() {

            imageElement.style.display = "none";

        },
        {
            once: true
        }
    );

}


/* =========================================================
   RESOLVE PROFILE IMAGE PATH
========================================================= */

function resolveProfileImagePath(imageSource) {

    const source =
        String(imageSource).trim();


    if (!source) {

        return "";

    }


    /*
        Already a complete URL or encoded image.
    */

    if (
        source.startsWith("http://") ||
        source.startsWith("https://") ||
        source.startsWith("data:")
    ) {

        return source;

    }


    /*
        Already a relative client path.
    */

    if (
        source.startsWith("../") ||
        source.startsWith("./")
    ) {

        return source;

    }


    /*
        Backend-uploaded profile picture.
        Change this path later if the server uses
        another uploads directory.
    */

    return `http://localhost:5000/uploads/${source}`;

}


/* =========================================================
   RESPONSIVE SIDEBAR
========================================================= */

function initializeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const menuToggle =
        document.getElementById("menuToggle");

    const sidebarClose =
        document.getElementById("sidebarClose");


    if (!sidebar) {

        return;

    }


    /*
        Open sidebar using the mobile menu button.
    */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            openSidebar
        );

    }


    /*
        Close sidebar using the X button.
    */

    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
        Close sidebar when the dark overlay is clicked.
    */

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
        Close mobile sidebar after clicking a menu link.
    */

    const sidebarLinks =
        sidebar.querySelectorAll(
            ".sidebar-link"
        );


    sidebarLinks.forEach((sidebarLink) => {

        sidebarLink.addEventListener(
            "click",
            function handleSidebarLinkClick() {

                if (
                    window.innerWidth <= 1024
                ) {

                    closeSidebar();

                }

            }
        );

    });


    /*
        Close the sidebar using the Escape key.
    */

    document.addEventListener(
        "keydown",
        function handleSidebarEscape(event) {

            if (
                event.key === "Escape" &&
                sidebar.classList.contains("active")
            ) {

                closeSidebar();

            }

        }
    );


    /*
        Reset mobile sidebar state when the window
        returns to desktop size.
    */

    window.addEventListener(
        "resize",
        handleSidebarWindowResize
    );

}


/* =========================================================
   OPEN SIDEBAR
========================================================= */

function openSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    if (sidebar) {

        sidebar.classList.add("active");

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add("active");

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE SIDEBAR
========================================================= */

function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    if (sidebar) {

        sidebar.classList.remove("active");

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove("active");

    }


    document.body.style.overflow = "";

}


/* =========================================================
   HANDLE SIDEBAR WINDOW RESIZE
========================================================= */

function handleSidebarWindowResize() {

    if (
        window.innerWidth > 1024
    ) {

        closeSidebar();

    }

}


/* =========================================================
   SET CURRENT YEAR
========================================================= */

function setCurrentYear() {

    const currentYearElement =
        document.getElementById("currentYear");

    if (!currentYearElement) {

        return;

    }


    currentYearElement.textContent =
        new Date().getFullYear();

}


/* =========================================================
   HIDE PAGE LOADER
========================================================= */

function hidePageLoader() {

    const pageLoader =
        document.getElementById("pageLoader");

    if (!pageLoader) {

        return;

    }


    /*
        Small delay prevents the loader from disappearing
        too abruptly when the page loads quickly.
    */

    window.setTimeout(() => {

        pageLoader.classList.add("hidden");


        window.setTimeout(() => {

            pageLoader.style.display =
                "none";

        }, 500);

    }, 350);

}


/* =========================================================
   GENERAL ELEMENT HELPERS
========================================================= */

function setElementText(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);

    if (!element) {

        return;

    }


    element.textContent =
        getSafeText(value, "—");

}


/* =========================================================
   SAFE TEXT
========================================================= */

function getSafeText(
    value,
    fallback = "—"
) {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }


    const cleanValue =
        String(value).trim();


    return cleanValue ||
        fallback;

}
/* =========================================================
   INITIALIZE PART 1B
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart1B
);


function initializeAlumniRecordsPart1B() {

    initializeTheme();

    initializeHeaderDropdowns();

    initializeGlobalSearchShortcut();

}


/* =========================================================
   THEME INITIALIZATION
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("theme") ||
        localStorage.getItem("savedTheme") ||
        "light";


    applyTheme(savedTheme);


    const themeToggle =
        document.getElementById(
            "themeToggle"
        );


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            toggleTheme
        );

    }

}


/* =========================================================
   TOGGLE THEME
========================================================= */

function toggleTheme() {

    const isDarkMode =

        document.body.classList.contains(
            "dark"
        ) ||

        document.body.classList.contains(
            "dark-mode"
        );


    const nextTheme =
        isDarkMode
            ? "light"
            : "dark";


    localStorage.setItem(
        "theme",
        nextTheme
    );


    localStorage.setItem(
        "savedTheme",
        nextTheme
    );


    applyTheme(nextTheme);

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    const isDark =
        theme === "dark";


    document.body.classList.toggle(
        "dark",
        isDark
    );


    document.body.classList.toggle(
        "dark-mode",
        isDark
    );


    document.documentElement.setAttribute(
        "data-theme",
        isDark
            ? "dark"
            : "light"
    );


    const themeIcon =
        document.getElementById(
            "themeIcon"
        );


    const themeToggle =
        document.getElementById(
            "themeToggle"
        );


    if (themeIcon) {

        themeIcon.className =
            isDark
                ? "bx bx-sun"
                : "bx bx-moon";

    }


    if (themeToggle) {

        themeToggle.setAttribute(
            "aria-label",
            isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );


        themeToggle.setAttribute(
            "title",
            isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

    }

}

/* =========================================================
   TOGGLE THEME
========================================================= */

function toggleTheme() {

    const isDarkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    const nextTheme =
        isDarkMode
            ? "light"
            : "dark";


    applyTheme(nextTheme);

    localStorage.setItem(
        "theme",
        nextTheme
    );

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    const themeIcon =
        document.getElementById("themeIcon");

    const themeToggle =
        document.getElementById("themeToggle");


    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );


        if (themeIcon) {

            themeIcon.className =
                "bx bx-sun";

        }


        if (themeToggle) {

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        }

    } else {

        document.body.classList.remove(
            "dark-mode"
        );


        if (themeIcon) {

            themeIcon.className =
                "bx bx-moon";

        }


        if (themeToggle) {

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        }

    }

}


/* =========================================================
   INITIALIZE HEADER DROPDOWNS
========================================================= */

function initializeHeaderDropdowns() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationDropdown =
        document.getElementById(
            "notificationDropdown"
        );

    const headerProfileButton =
        document.getElementById(
            "headerProfileButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    /*
        Notification dropdown
    */

    if (
        notificationButton &&
        notificationDropdown
    ) {

        notificationButton.addEventListener(
            "click",
            function toggleNotificationDropdown(
                event
            ) {

                event.stopPropagation();


                const shouldOpen =
                    !notificationDropdown
                        .classList
                        .contains("active");


                closeAllHeaderDropdowns();


                if (shouldOpen) {

                    notificationDropdown
                        .classList
                        .add("active");


                    notificationButton
                        .setAttribute(
                            "aria-expanded",
                            "true"
                        );

                }

            }
        );

    }


    /*
        Profile dropdown
    */

    if (
        headerProfileButton &&
        profileDropdown
    ) {

        headerProfileButton.addEventListener(
            "click",
            function toggleProfileDropdown(
                event
            ) {

                event.stopPropagation();


                const shouldOpen =
                    !profileDropdown
                        .classList
                        .contains("active");


                closeAllHeaderDropdowns();


                if (shouldOpen) {

                    profileDropdown
                        .classList
                        .add("active");


                    headerProfileButton
                        .setAttribute(
                            "aria-expanded",
                            "true"
                        );

                }

            }
        );

    }


    /*
        Prevent dropdown clicks from closing the dropdown
        immediately through the document listener.
    */

    if (notificationDropdown) {

        notificationDropdown.addEventListener(
            "click",
            function stopNotificationPropagation(
                event
            ) {

                event.stopPropagation();

            }
        );

    }


    if (profileDropdown) {

        profileDropdown.addEventListener(
            "click",
            function stopProfilePropagation(
                event
            ) {

                event.stopPropagation();

            }
        );

    }


    /*
        Close all dropdowns after clicking outside.
    */

    document.addEventListener(
        "click",
        closeAllHeaderDropdowns
    );


    /*
        Close dropdowns using Escape.
    */

    document.addEventListener(
        "keydown",
        function handleDropdownEscape(
            event
        ) {

            if (
                event.key === "Escape"
            ) {

                closeAllHeaderDropdowns();

            }

        }
    );


    initializeMarkAllNotificationsRead();

}


/* =========================================================
   CLOSE ALL HEADER DROPDOWNS
========================================================= */

function closeAllHeaderDropdowns() {

    const notificationDropdown =
        document.getElementById(
            "notificationDropdown"
        );

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );

    const headerProfileButton =
        document.getElementById(
            "headerProfileButton"
        );


    if (notificationDropdown) {

        notificationDropdown
            .classList
            .remove("active");

    }


    if (notificationButton) {

        notificationButton
            .setAttribute(
                "aria-expanded",
                "false"
            );

    }


    if (profileDropdown) {

        profileDropdown
            .classList
            .remove("active");

    }


    if (headerProfileButton) {

        headerProfileButton
            .setAttribute(
                "aria-expanded",
                "false"
            );

    }

}


/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

function initializeMarkAllNotificationsRead() {

    const markAllReadButton =
        document.getElementById(
            "markAllReadButton"
        );


    if (!markAllReadButton) {

        return;

    }


    markAllReadButton.addEventListener(
        "click",
        function markNotificationsAsRead() {

            const notificationDot =
                document.getElementById(
                    "notificationDot"
                );


            if (notificationDot) {

                notificationDot.style.display =
                    "none";

            }


            /*
                showToast() will be created in Part 1C.
                This condition prevents errors until
                Part 1C is pasted.
            */

            if (
                typeof showToast === "function"
            ) {

                showToast(
                    "success",
                    "Notifications updated",
                    "All notifications were marked as read."
                );

            }

        }
    );

}


/* =========================================================
   GLOBAL SEARCH SHORTCUT
========================================================= */

function initializeGlobalSearchShortcut() {

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );

    const recordSearchInput =
        document.getElementById(
            "recordSearchInput"
        );


    /*
        Ctrl + K or Command + K focuses the page search.
    */

    document.addEventListener(
        "keydown",
        function handleSearchShortcut(
            event
        ) {

            const pressedSearchShortcut =
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() === "k";


            if (!pressedSearchShortcut) {

                return;

            }


            event.preventDefault();

            closeAllHeaderDropdowns();


            if (recordSearchInput) {

                recordSearchInput.focus();

                recordSearchInput.select();

                return;

            }


            if (globalSearch) {

                globalSearch.focus();

                globalSearch.select();

            }

        }
    );


    /*
        The header search mirrors its text to the
        main records search field.
    */

    if (
        globalSearch &&
        recordSearchInput
    ) {

        globalSearch.addEventListener(
            "input",
            function mirrorGlobalSearch() {

                recordSearchInput.value =
                    globalSearch.value;


                /*
                    Trigger the search listener that
                    will be added in Part 2.
                */

                recordSearchInput.dispatchEvent(
                    new Event(
                        "input",
                        {
                            bubbles: true
                        }
                    )
                );

            }
        );


        recordSearchInput.addEventListener(
            "input",
            function mirrorRecordSearch() {

                if (
                    globalSearch.value !==
                    recordSearchInput.value
                ) {

                    globalSearch.value =
                        recordSearchInput.value;

                }

            }
        );

    }

}
/* =========================================================
   ALUMNI RECORDS — PART 1C

   Included:
   - Logout modal
   - Toast notification system
   - Generic modal helpers
   - Escape key modal handling
   - Body scroll locking
   - Additional utilities
========================================================= */


/* =========================================================
   INITIALIZE PART 1C
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart1C
);


function initializeAlumniRecordsPart1C() {

    initializeLogoutControls();

    initializeGenericModals();

}


/* =========================================================
   LOGOUT CONTROLS
========================================================= */

function initializeLogoutControls() {

    const sidebarLogoutButton =
        document.getElementById(
            "sidebarLogoutButton"
        );

    const profileLogoutButton =
        document.getElementById(
            "profileLogoutButton"
        );

    const cancelLogoutButton =
        document.getElementById(
            "cancelLogoutButton"
        );

    const confirmLogoutButton =
        document.getElementById(
            "confirmLogoutButton"
        );


    if (sidebarLogoutButton) {

        sidebarLogoutButton.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (profileLogoutButton) {

        profileLogoutButton.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (cancelLogoutButton) {

        cancelLogoutButton.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    if (confirmLogoutButton) {

        confirmLogoutButton.addEventListener(
            "click",
            performLogout
        );

    }

}


/* =========================================================
   OPEN LOGOUT MODAL
========================================================= */

function openLogoutModal() {

    closeAllHeaderDropdowns();

    openModal("logoutModal");

}


/* =========================================================
   CLOSE LOGOUT MODAL
========================================================= */

function closeLogoutModal() {

    closeModal("logoutModal");

}


/* =========================================================
   PERFORM LOGOUT
========================================================= */

function performLogout() {

    const confirmLogoutButton =
        document.getElementById(
            "confirmLogoutButton"
        );


    if (confirmLogoutButton) {

        setButtonLoadingState(
            confirmLogoutButton,
            true,
            "Logging out..."
        );

    }


    window.setTimeout(() => {

        clearUserSession();

        window.location.replace(
            "../login.html"
        );

    }, 450);

}


/* =========================================================
   INITIALIZE GENERIC MODALS
========================================================= */

function initializeGenericModals() {

    /*
        Any element with data-close-modal can close
        the modal whose ID is stored in the attribute.

        Example:
        data-close-modal="addAlumniModal"
    */

    const modalCloseElements =
        document.querySelectorAll(
            "[data-close-modal]"
        );


    modalCloseElements.forEach(
        (closeElement) => {

            closeElement.addEventListener(
                "click",
                function handleModalClose() {

                    const modalId =
                        closeElement.getAttribute(
                            "data-close-modal"
                        );


                    if (modalId) {

                        closeModal(modalId);

                    }

                }
            );

        }
    );


    /*
        Close a modal when its overlay is clicked.
    */

    const modalOverlays =
        document.querySelectorAll(
            ".modal-overlay"
        );


    modalOverlays.forEach(
        (modalOverlay) => {

            modalOverlay.addEventListener(
                "click",
                function closeOverlayModal() {

                    const parentModal =
                        modalOverlay.closest(
                            ".modal"
                        );


                    if (parentModal?.id) {

                        closeModal(
                            parentModal.id
                        );

                    }

                }
            );

        }
    );


    /*
        Close the active modal using Escape.
    */

    document.addEventListener(
        "keydown",
        function handleModalEscape(event) {

            if (event.key !== "Escape") {

                return;

            }


            const activeModals =
                document.querySelectorAll(
                    ".modal.active"
                );


            if (!activeModals.length) {

                return;

            }


            const latestActiveModal =
                activeModals[
                    activeModals.length - 1
                ];


            closeModal(
                latestActiveModal.id
            );

        }
    );

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(modalId) {

    const modal =
        document.getElementById(modalId);


    if (!modal) {

        console.warn(
            `Modal not found: ${modalId}`
        );

        return;

    }


    closeAllHeaderDropdowns();

    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    updateBodyScrollLock();


    /*
        Focus the first available interactive control.
    */

    window.setTimeout(() => {

        const firstFocusableElement =
            modal.querySelector(
                `
                input:not([disabled]),
                select:not([disabled]),
                textarea:not([disabled]),
                button:not([disabled]),
                a[href]
                `
            );


        if (firstFocusableElement) {

            firstFocusableElement.focus();

        }

    }, 100);

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(modalId) {

    const modal =
        document.getElementById(modalId);


    if (!modal) {

        return;

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    updateBodyScrollLock();

}


/* =========================================================
   CLOSE ALL MODALS
========================================================= */

function closeAllModals() {

    const activeModals =
        document.querySelectorAll(
            ".modal.active"
        );


    activeModals.forEach((modal) => {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    });


    updateBodyScrollLock();

}


/* =========================================================
   BODY SCROLL LOCK
========================================================= */

function updateBodyScrollLock() {

    const activeModal =
        document.querySelector(
            ".modal.active"
        );

    const activeSidebar =
        document
            .getElementById("sidebar")
            ?.classList
            .contains("active");


    if (
        activeModal ||
        activeSidebar
    ) {

        document.body.style.overflow =
            "hidden";

    } else {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   TOAST NOTIFICATION SYSTEM
========================================================= */

function showToast(
    type = "info",
    title = "Notification",
    message = "",
    duration = 3500
) {

    const toastContainer =
        getToastContainer();


    const normalizedType =
        normalizeToastType(type);


    const toast =
        document.createElement("div");


    toast.className =
        `toast toast-${normalizedType}`;


    toast.setAttribute(
        "role",
        normalizedType === "error"
            ? "alert"
            : "status"
    );


    const toastIcon =
        document.createElement("div");

    toastIcon.className =
        "toast-icon";


    const icon =
        document.createElement("i");

    icon.className =
        getToastIconClass(
            normalizedType
        );


    toastIcon.appendChild(icon);


    const toastContent =
        document.createElement("div");

    toastContent.className =
        "toast-content";


    const toastTitle =
        document.createElement("strong");

    toastTitle.textContent =
        getSafeText(
            title,
            "Notification"
        );


    const toastMessage =
        document.createElement("p");

    toastMessage.textContent =
        getSafeText(
            message,
            ""
        );


    toastContent.appendChild(
        toastTitle
    );


    if (message) {

        toastContent.appendChild(
            toastMessage
        );

    }


    const toastCloseButton =
        document.createElement("button");

    toastCloseButton.type =
        "button";

    toastCloseButton.className =
        "toast-close";

    toastCloseButton.setAttribute(
        "aria-label",
        "Close notification"
    );


    const closeIcon =
        document.createElement("i");

    closeIcon.className =
        "bx bx-x";


    toastCloseButton.appendChild(
        closeIcon
    );


    toast.appendChild(
        toastIcon
    );

    toast.appendChild(
        toastContent
    );

    toast.appendChild(
        toastCloseButton
    );


    toastContainer.appendChild(
        toast
    );


    window.requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    let removalTimer =
        window.setTimeout(() => {

            removeToast(toast);

        }, duration);


    toastCloseButton.addEventListener(
        "click",
        function closeCurrentToast() {

            window.clearTimeout(
                removalTimer
            );

            removeToast(toast);

        }
    );


    toast.addEventListener(
        "mouseenter",
        function pauseToastTimer() {

            window.clearTimeout(
                removalTimer
            );

        }
    );


    toast.addEventListener(
        "mouseleave",
        function restartToastTimer() {

            removalTimer =
                window.setTimeout(() => {

                    removeToast(toast);

                }, 1800);

        }
    );


    return toast;

}


/* =========================================================
   GET OR CREATE TOAST CONTAINER
========================================================= */

function getToastContainer() {

    let toastContainer =
        document.getElementById(
            "toastContainer"
        );


    if (toastContainer) {

        return toastContainer;

    }


    toastContainer =
        document.createElement("div");

    toastContainer.id =
        "toastContainer";

    toastContainer.className =
        "toast-container";

    toastContainer.setAttribute(
        "aria-live",
        "polite"
    );


    document.body.appendChild(
        toastContainer
    );


    return toastContainer;

}


/* =========================================================
   REMOVE TOAST
========================================================= */

function removeToast(toast) {

    if (!toast) {

        return;

    }


    toast.classList.remove("show");


    window.setTimeout(() => {

        toast.remove();

    }, 280);

}


/* =========================================================
   NORMALIZE TOAST TYPE
========================================================= */

function normalizeToastType(type) {

    const supportedTypes = [

        "success",

        "warning",

        "error",

        "info"

    ];


    const normalizedType =
        String(type)
            .trim()
            .toLowerCase();


    return supportedTypes.includes(
        normalizedType
    )
        ? normalizedType
        : "info";

}


/* =========================================================
   TOAST ICON
========================================================= */

function getToastIconClass(type) {

    const toastIcons = {

        success:
            "bx bx-check-circle",

        warning:
            "bx bx-error",

        error:
            "bx bx-x-circle",

        info:
            "bx bx-info-circle"

    };


    return toastIcons[type] ||
        toastIcons.info;

}


/* =========================================================
   BUTTON LOADING STATE
========================================================= */

function setButtonLoadingState(
    button,
    isLoading,
    loadingText = "Please wait..."
) {

    if (!button) {

        return;

    }


    if (isLoading) {

        if (
            !button.dataset.originalHtml
        ) {

            button.dataset.originalHtml =
                button.innerHTML;

        }


        button.disabled = true;


        button.innerHTML = `
            <i class="bx bx-loader-alt bx-spin"></i>
            <span>${escapeHTML(loadingText)}</span>
        `;


        return;

    }


    button.disabled = false;


    if (
        button.dataset.originalHtml
    ) {

        button.innerHTML =
            button.dataset.originalHtml;

        delete button.dataset.originalHtml;

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    dateValue,
    options = {}
) {

    if (!dateValue) {

        return "—";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    const defaultOptions = {

        year: "numeric",

        month: "short",

        day: "numeric"

    };


    return new Intl.DateTimeFormat(
        "en-US",
        {
            ...defaultOptions,
            ...options
        }
    ).format(date);

}


/* =========================================================
   FORMAT DATE AND TIME
========================================================= */

function formatDateTime(
    dateValue
) {

    return formatDate(
        dateValue,
        {
            year: "numeric",

            month: "short",

            day: "numeric",

            hour: "numeric",

            minute: "2-digit"
        }
    );

}


/* =========================================================
   FORMAT PHONE NUMBER
========================================================= */

function formatPhoneNumber(
    phoneNumber
) {

    const value =
        getSafeText(
            phoneNumber,
            ""
        );


    if (!value) {

        return "—";

    }


    return value;

}


/* =========================================================
   NORMALIZE BOOLEAN
========================================================= */

function normalizeBoolean(value) {

    return (

        value === true ||

        value === 1 ||

        value === "1" ||

        value === "true"

    );

}


/* =========================================================
   CREATE FULL NAME
========================================================= */

function createFullName(record) {

    if (!record) {

        return "Unnamed Alumni";

    }


    if (
        record.full_name &&
        String(record.full_name).trim()
    ) {

        return String(
            record.full_name
        ).trim();

    }


    const nameParts = [

        record.first_name,

        record.middle_name,

        record.last_name

    ];


    const fullName =
        nameParts

            .filter((namePart) => {

                return (
                    namePart !== null &&
                    namePart !== undefined &&
                    String(namePart).trim()
                );

            })

            .map((namePart) => {

                return String(
                    namePart
                ).trim();

            })

            .join(" ");


    return fullName ||
        "Unnamed Alumni";

}


/* =========================================================
   CREATE INITIALS FROM NAME
========================================================= */

function createInitialsFromName(
    name
) {

    const cleanName =
        getSafeText(
            name,
            ""
        );


    if (!cleanName) {

        return "AL";

    }


    const nameParts =
        cleanName
            .split(/\s+/)
            .filter(Boolean);


    if (
        nameParts.length >= 2
    ) {

        return (
            nameParts[0].charAt(0) +
            nameParts[
                nameParts.length - 1
            ].charAt(0)
        ).toUpperCase();

    }


    return nameParts[0]
        .substring(0, 2)
        .toUpperCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
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
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   DEBOUNCE
========================================================= */

function debounce(
    callback,
    delay = 300
) {

    let timeoutId;


    return function debouncedFunction(
        ...argumentsList
    ) {

        window.clearTimeout(
            timeoutId
        );


        timeoutId =
            window.setTimeout(() => {

                callback.apply(
                    this,
                    argumentsList
                );

            }, delay);

    };

}


/* =========================================================
   GENERATE UNIQUE ID
========================================================= */

function generateUniqueId(
    prefix = "item"
) {

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 9);


    const timePart =
        Date.now()
            .toString(36);


    return `${prefix}-${timePart}-${randomPart}`;

}


/* =========================================================
   SAFE NUMBER
========================================================= */

function getSafeNumber(
    value,
    fallback = 0
) {

    const numericValue =
        Number(value);


    return Number.isFinite(
        numericValue
    )
        ? numericValue
        : fallback;

}
/* =========================================================
   ALUMNI RECORDS — PART 2A

   Included:
   - Alumni API connection
   - Load alumni records
   - Normalize API response
   - Render alumni table
   - Update summary cards
   - Populate filter options
   - Loading state
   - Empty state
   - Error state
   - Refresh records
========================================================= */


/* =========================================================
   ALUMNI API ENDPOINT
========================================================= */

const ALUMNI_API_URL =
    `${API_BASE_URL}/alumni`;


/* =========================================================
   INITIALIZE PART 2A
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart2A
);


async function initializeAlumniRecordsPart2A() {

    initializeRefreshRecords();

    await loadAlumniRecords();

}


/* =========================================================
   LOAD ALUMNI RECORDS
========================================================= */

async function loadAlumniRecords(
    showSuccessMessage = false
) {

    if (alumniRecordsState.isLoading) {

        return;

    }


    alumniRecordsState.isLoading = true;

    showRecordsLoadingState();


    try {

        const response =
            await fetch(
                ALUMNI_API_URL,
                {
                    method: "GET",

                    headers: {

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        /*
            Expired or invalid authentication.
        */

        if (
            response.status === 401
        ) {

            clearUserSession();

            redirectToLogin();

            return;

        }


        /*
            The logged-in account does not have permission.
        */

        if (
            response.status === 403
        ) {

            throw new Error(
                "You do not have permission to view alumni records."
            );

        }


        const responseData =
            await parseJSONResponse(response);


        if (!response.ok) {

            throw new Error(
                responseData?.message ||
                responseData?.error ||
                `Unable to load alumni records. Status: ${response.status}`
            );

        }


        const alumniRecords =
            extractAlumniRecords(
                responseData
            );


        alumniRecordsState.records =
            alumniRecords.map(
                normalizeAlumniRecord
            );


        alumniRecordsState.filteredRecords =
            [
                ...alumniRecordsState.records
            ];


        alumniRecordsState.currentPage = 1;

        alumniRecordsState
            .selectedRecords
            .clear();


        renderAlumniRecords();

        updateAlumniSummaryCards();

        populateAlumniFilterOptions();

        updateRecordsResultInformation();

        updateActiveBatchSummaryCard();


        if (showSuccessMessage) {

            showToast(
                "success",
                "Records refreshed",
                `${alumniRecordsState.records.length} alumni record${
                    alumniRecordsState.records.length === 1
                        ? ""
                        : "s"
                } loaded successfully.`
            );

        }

    } catch (error) {

        console.error(
            "Unable to load alumni records:",
            error
        );


        alumniRecordsState.records = [];

        alumniRecordsState.filteredRecords = [];

        alumniRecordsState
            .selectedRecords
            .clear();


        showRecordsErrorState(
            error.message
        );

        updateAlumniSummaryCards();

        updateRecordsResultInformation();


        showToast(
            "error",
            "Unable to load records",
            error.message ||
            "An unexpected error occurred."
        );

    } finally {

        alumniRecordsState.isLoading = false;

        setRefreshButtonLoading(false);

    }

}


/* =========================================================
   PARSE JSON RESPONSE
========================================================= */

async function parseJSONResponse(response) {

    const responseText =
        await response.text();


    if (!responseText) {

        return {};

    }


    try {

        return JSON.parse(
            responseText
        );

    } catch (error) {

        console.error(
            "Invalid JSON response:",
            responseText
        );


        throw new Error(
            "The server returned an invalid response."
        );

    }

}


/* =========================================================
   EXTRACT ALUMNI RECORDS FROM API RESPONSE
========================================================= */

function extractAlumniRecords(
    responseData
) {

    /*
        Supported response formats:

        1. [ ...records ]

        2. {
               success: true,
               alumni: [ ...records ]
           }

        3. {
               success: true,
               records: [ ...records ]
           }

        4. {
               success: true,
               data: [ ...records ]
           }

        5. {
               success: true,
               data: {
                   alumni: [ ...records ]
               }
           }
    */


    if (
        Array.isArray(responseData)
    ) {

        return responseData;

    }


    if (
        Array.isArray(
            responseData?.alumni
        )
    ) {

        return responseData.alumni;

    }


    if (
        Array.isArray(
            responseData?.records
        )
    ) {

        return responseData.records;

    }


    if (
        Array.isArray(
            responseData?.data
        )
    ) {

        return responseData.data;

    }


    if (
        Array.isArray(
            responseData?.data?.alumni
        )
    ) {

        return responseData.data.alumni;

    }


    if (
        Array.isArray(
            responseData?.data?.records
        )
    ) {

        return responseData.data.records;

    }


    return [];

}


/* =========================================================
   NORMALIZE ALUMNI RECORD
========================================================= */

function normalizeAlumniRecord(
    record
) {

    const normalizedRecord = {

        ...record

    };


    /*
        Record ID
    */

    normalizedRecord.id =
        record.profile_id ??
        record.alumni_id ??
        record.user_id ??
        record.id ??
        generateUniqueId("alumni");


    normalizedRecord.profile_id =
        record.profile_id ??
        record.alumni_id ??
        null;


    normalizedRecord.user_id =
        record.user_id ??
        null;


    /*
        Name
    */

    normalizedRecord.first_name =
        getSafeText(
            record.first_name,
            ""
        );


    normalizedRecord.middle_name =
        getSafeText(
            record.middle_name,
            ""
        );


    normalizedRecord.last_name =
        getSafeText(
            record.last_name,
            ""
        );


    normalizedRecord.full_name =
        createFullName(record);


    /*
        Basic alumni information
    */

    normalizedRecord.student_number =
        getSafeText(
            record.student_number ??
            record.student_id,
            "Not provided"
        );


    normalizedRecord.program =
        getSafeText(
            record.program ??
            record.course ??
            record.degree_program,
            "Not specified"
        );


    normalizedRecord.batch_year =
        getSafeText(
            record.batch_year ??
            record.graduation_year ??
            record.year_graduated,
            "Not specified"
        );


    /*
        Contact details
    */

    normalizedRecord.email =
        getSafeText(
            record.email,
            "No email"
        );


    normalizedRecord.phone_number =
        getSafeText(
            record.phone_number ??
            record.phone,
            "Not provided"
        );


    normalizedRecord.address =
        getSafeText(
            record.address,
            "Not provided"
        );


    /*
        Employment information
    */

    normalizedRecord.current_job =
        getSafeText(
            record.current_job ??
            record.job_title ??
            record.position,
            ""
        );


    normalizedRecord.company =
        getSafeText(
            record.company ??
            record.company_name ??
            record.employer,
            ""
        );


    normalizedRecord.employment_status =
        normalizeEmploymentStatus(
            record
        );


    normalizedRecord.is_employed =
        normalizedRecord.employment_status ===
        "employed";


    /*
        Verification information
    */

    normalizedRecord.is_verified =
        normalizeBoolean(
            record.is_verified ??
            record.verified ??
            record.verification_status ===
                "verified"
        );


    normalizedRecord.verification_status =
        normalizedRecord.is_verified
            ? "verified"
            : "pending";


    /*
        Account information
    */

    normalizedRecord.is_active =
        record.is_active === undefined
            ? true
            : normalizeBoolean(
                record.is_active
            );


    normalizedRecord.profile_picture =
        record.profile_picture ??
        record.profile_image ??
        record.avatar ??
        "";


    normalizedRecord.linkedin_url =
        getSafeText(
            record.linkedin_url ??
            record.linkedin,
            ""
        );


    /*
        Date information
    */

    normalizedRecord.created_at =
        record.created_at ??
        record.registered_at ??
        null;


    normalizedRecord.updated_at =
        record.updated_at ??
        record.modified_at ??
        record.created_at ??
        null;


    return normalizedRecord;

}


/* =========================================================
   NORMALIZE EMPLOYMENT STATUS
========================================================= */

function normalizeEmploymentStatus(
    record
) {

    const rawStatus =
        String(
            record.employment_status ??
            record.status ??
            ""
        )
            .trim()
            .toLowerCase();


    if (
        [
            "employed",
            "self-employed",
            "self employed",
            "working",
            "business owner"
        ].includes(rawStatus)
    ) {

        return "employed";

    }


    if (
        [
            "unemployed",
            "not employed",
            "seeking",
            "job seeking"
        ].includes(rawStatus)
    ) {

        return "unemployed";

    }


    if (
        [
            "student",
            "studying",
            "further studies"
        ].includes(rawStatus)
    ) {

        return "student";

    }


    if (
        normalizeBoolean(
            record.is_employed
        )
    ) {

        return "employed";

    }


    if (
        record.current_job ||
        record.job_title ||
        record.company ||
        record.company_name
    ) {

        return "employed";

    }


    return "unemployed";

}


/* =========================================================
   RENDER ALUMNI RECORDS
========================================================= */

function renderAlumniRecords() {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        console.warn(
            "Alumni records table body was not found."
        );

        return;

    }


    tableBody.innerHTML = "";


    const records =
        alumniRecordsState.filteredRecords;


    if (!records.length) {

        showRecordsEmptyState();

        return;

    }


    const tableFragment =
        document.createDocumentFragment();


    records.forEach(
        (record) => {

            const tableRow =
                createAlumniTableRow(
                    record
                );


            tableFragment.appendChild(
                tableRow
            );

        }
    );


    tableBody.appendChild(
        tableFragment
    );


    updateSelectAllCheckbox();

}


/* =========================================================
   GET ALUMNI TABLE BODY
========================================================= */

function getAlumniTableBody() {

    return (

        document.getElementById(
            "alumniRecordsBody"
        ) ||

        document.getElementById(
            "alumniRecordsBody"
        ) ||

        document.querySelector(
            "#alumniRecordsTable tbody"
        ) ||

        document.querySelector(
            ".alumni-records-table tbody"
        )

    );

}


/* =========================================================
   CREATE ALUMNI TABLE ROW
========================================================= */

function createAlumniTableRow(
    record
) {

    const tableRow =
        document.createElement("tr");


    tableRow.dataset.alumniId =
        String(record.id);


    const isSelected =
        alumniRecordsState
            .selectedRecords
            .has(
                String(record.id)
            );


    if (isSelected) {

        tableRow.classList.add(
            "selected"
        );

    }


    const employmentInformation =
        getEmploymentDisplayInformation(
            record
        );


    const verificationInformation =
        getVerificationDisplayInformation(
            record
        );


    const profilePicture =
        resolveAlumniProfilePicture(
            record.profile_picture
        );


    const initials =
        createInitialsFromName(
            record.full_name
        );


    tableRow.innerHTML = `

        <td class="checkbox-column">

            <label class="custom-checkbox">

                <input
                    type="checkbox"
                    class="record-checkbox"
                    value="${escapeHTML(record.id)}"
                    aria-label="Select ${escapeHTML(record.full_name)}"
                    ${isSelected ? "checked" : ""}
                >

                <span class="checkmark"></span>

            </label>

        </td>


        <td>

            <div class="alumni-person">

                <div class="alumni-avatar">

                    ${
                        profilePicture
                            ? `
                                <img
                                    src="${escapeHTML(profilePicture)}"
                                    alt="${escapeHTML(record.full_name)}"
                                    class="alumni-avatar-image"
                                    loading="lazy"
                                >
                            `
                            : ""
                    }

                    <span class="alumni-avatar-initials">
                        ${escapeHTML(initials)}
                    </span>

                </div>


                <div class="alumni-person-info">

                    <strong class="alumni-name">
                        ${escapeHTML(record.full_name)}
                    </strong>

                    <span class="alumni-email">
                        ${escapeHTML(record.email)}
                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="student-number">
                ${escapeHTML(record.student_number)}
            </span>

        </td>


        <td>

            <span class="program-name">
                ${escapeHTML(record.program)}
            </span>

        </td>


        <td>

            <span class="batch-year">
                ${escapeHTML(record.batch_year)}
            </span>

        </td>


        <td>

            <div class="employment-cell">

                <span class="${escapeHTML(
                    employmentInformation.badgeClass
                )}">

                    <i class="${escapeHTML(
                        employmentInformation.icon
                    )}"></i>

                    ${escapeHTML(
                        employmentInformation.label
                    )}

                </span>

                ${
                    employmentInformation.description
                        ? `
                            <small>
                                ${escapeHTML(
                                    employmentInformation.description
                                )}
                            </small>
                        `
                        : ""
                }

            </div>

        </td>


        <td>

            <span class="${escapeHTML(
                verificationInformation.badgeClass
            )}">

                <i class="${escapeHTML(
                    verificationInformation.icon
                )}"></i>

                ${escapeHTML(
                    verificationInformation.label
                )}

            </span>

        </td>


        <td>

            <span
                class="updated-date"
                title="${escapeHTML(
                    formatDateTime(
                        record.updated_at
                    )
                )}"
            >

                ${escapeHTML(
                    formatDate(
                        record.updated_at
                    )
                )}

            </span>

        </td>


        <td>

            <div class="table-actions">

                <button
                    type="button"
                    class="table-action-button view-action"
                    data-action="view"
                    data-alumni-id="${escapeHTML(record.id)}"
                    aria-label="View ${escapeHTML(record.full_name)}"
                    title="View record"
                >

                    <i class="bx bx-show"></i>

                </button>


                <button
                    type="button"
                    class="table-action-button edit-action"
                    data-action="edit"
                    data-alumni-id="${escapeHTML(record.id)}"
                    aria-label="Edit ${escapeHTML(record.full_name)}"
                    title="Edit record"
                >

                    <i class="bx bx-edit"></i>

                </button>


                <button
                    type="button"
                    class="table-action-button delete-action"
                    data-action="delete"
                    data-alumni-id="${escapeHTML(record.id)}"
                    aria-label="Delete ${escapeHTML(record.full_name)}"
                    title="Delete record"
                >

                    <i class="bx bx-trash"></i>

                </button>

            </div>

        </td>

    `;


    initializeAlumniRowImageFallback(
        tableRow
    );


    return tableRow;

}


/* =========================================================
   ALUMNI PROFILE PICTURE PATH
========================================================= */

function resolveAlumniProfilePicture(
    profilePicture
) {

    if (!profilePicture) {

        return "";

    }


    return resolveProfileImagePath(
        profilePicture
    );

}


/* =========================================================
   ALUMNI ROW IMAGE FALLBACK
========================================================= */

function initializeAlumniRowImageFallback(
    tableRow
) {

    const profileImage =
        tableRow.querySelector(
            ".alumni-avatar-image"
        );


    if (!profileImage) {

        return;

    }


    profileImage.addEventListener(
        "load",
        function showProfileImage() {

            profileImage.classList.add(
                "loaded"
            );

        },
        {
            once: true
        }
    );


    profileImage.addEventListener(
        "error",
        function hideBrokenProfileImage() {

            profileImage.remove();

        },
        {
            once: true
        }
    );

}


/* =========================================================
   EMPLOYMENT DISPLAY INFORMATION
========================================================= */

function getEmploymentDisplayInformation(
    record
) {

    switch (
        record.employment_status
    ) {

        case "employed":

            return {

                label:
                    "Employed",

                badgeClass:
                    "status-badge employment-employed",

                icon:
                    "bx bx-briefcase",

                description:
                    record.current_job ||
                    record.company ||
                    ""

            };


        case "student":

            return {

                label:
                    "Further Studies",

                badgeClass:
                    "status-badge employment-student",

                icon:
                    "bx bx-book-reader",

                description:
                    record.company ||
                    ""

            };


        default:

            return {

                label:
                    "Unemployed",

                badgeClass:
                    "status-badge employment-unemployed",

                icon:
                    "bx bx-user-x",

                description:
                    ""

            };

    }

}


/* =========================================================
   VERIFICATION DISPLAY INFORMATION
========================================================= */

function getVerificationDisplayInformation(
    record
) {

    if (record.is_verified) {

        return {

            label:
                "Verified",

            badgeClass:
                "status-badge verification-verified",

            icon:
                "bx bx-check-circle"

        };

    }


    return {

        label:
            "Pending",

        badgeClass:
            "status-badge verification-pending",

        icon:
            "bx bx-time-five"

    };

}


/* =========================================================
   RECORDS LOADING STATE
========================================================= */

function showRecordsLoadingState() {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = `

        <tr class="table-state-row">

            <td colspan="9">

                <div class="records-state loading-state">

                    <div class="records-loader">

                        <i class="bx bx-loader-alt bx-spin"></i>

                    </div>

                    <h3>Loading alumni records</h3>

                    <p>
                        Please wait while the records are being retrieved.
                    </p>

                </div>

            </td>

        </tr>

    `;


    setRefreshButtonLoading(true);

}


/* =========================================================
   RECORDS EMPTY STATE
========================================================= */

function showRecordsEmptyState() {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        return;

    }


    const hasOriginalRecords =
        alumniRecordsState.records.length > 0;


    const title =
        hasOriginalRecords
            ? "No matching records"
            : "No alumni records yet";


    const description =
        hasOriginalRecords
            ? "Try changing or resetting the current search and filters."
            : "Alumni records will appear here after they are added to the system.";


    tableBody.innerHTML = `

        <tr class="table-state-row">

            <td colspan="9">

                <div class="records-state empty-state">

                    <div class="state-icon">

                        <i class="${
                            hasOriginalRecords
                                ? "bx bx-search-alt"
                                : "bx bx-user-plus"
                        }"></i>

                    </div>

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   RECORDS ERROR STATE
========================================================= */

function showRecordsErrorState(
    errorMessage
) {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = `

        <tr class="table-state-row">

            <td colspan="9">

                <div class="records-state error-state">

                    <div class="state-icon">

                        <i class="bx bx-error-circle"></i>

                    </div>

                    <h3>
                        Unable to load alumni records
                    </h3>

                    <p>
                        ${escapeHTML(
                            errorMessage ||
                            "Please check your server connection and try again."
                        )}
                    </p>

                    <button
                        type="button"
                        class="primary-button retry-records-button"
                        id="retryRecordsButton"
                    >

                        <i class="bx bx-refresh"></i>

                        <span>
                            Try Again
                        </span>

                    </button>

                </div>

            </td>

        </tr>

    `;


    const retryButton =
        document.getElementById(
            "retryRecordsButton"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            function retryRecords() {

                loadAlumniRecords();

            }
        );

    }

}


/* =========================================================
   UPDATE SUMMARY CARDS
========================================================= */

function updateAlumniSummaryCards() {

    const records =
        alumniRecordsState.records;


    const totalAlumni =
        records.length;


    const verifiedAlumni =
        records.filter(
            (record) =>
                record.is_verified
        ).length;


    const employedAlumni =
        records.filter(
            (record) =>
                record.employment_status ===
                "employed"
        ).length;


    const activeBatches =
        new Set(

            records

                .map(
                    (record) =>
                        String(
                            record.batch_year
                        ).trim()
                )

                .filter(
                    (batchYear) =>
                        batchYear &&
                        batchYear !==
                            "Not specified"
                )

        ).size;


    setSummaryCardValue(
        [
            "totalAlumniCount",
            "totalAlumni"
        ],
        totalAlumni
    );


    setSummaryCardValue(
        [
            "verifiedAlumniCount",
            "verifiedAlumni"
        ],
        verifiedAlumni
    );


    setSummaryCardValue(
        [
            "employedAlumniCount",
            "employedAlumni"
        ],
        employedAlumni
    );


    setSummaryCardValue(
        [
            "activeBatchesCount",
            "activeBatches"
        ],
        activeBatches
    );

}


/* =========================================================
   SET SUMMARY CARD VALUE
========================================================= */

function setSummaryCardValue(
    possibleIds,
    value
) {

    const element =
        findElementByPossibleIds(
            possibleIds
        );


    if (!element) {

        return;

    }


    animateNumberValue(
        element,
        getSafeNumber(value)
    );

}


/* =========================================================
   ANIMATE NUMBER VALUE
========================================================= */

function animateNumberValue(
    element,
    targetValue
) {

    const previousValue =
        getSafeNumber(
            element.dataset.value ??
            element.textContent
        );


    const finalValue =
        Math.max(
            0,
            Math.round(targetValue)
        );


    element.dataset.value =
        String(finalValue);


    if (
        previousValue === finalValue
    ) {

        element.textContent =
            String(finalValue);

        return;

    }


    const duration = 450;

    const startingTime =
        performance.now();


    function updateNumber(
        currentTime
    ) {

        const elapsedTime =
            currentTime -
            startingTime;


        const progress =
            Math.min(
                elapsedTime / duration,
                1
            );


        const easedProgress =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const currentValue =
            Math.round(
                previousValue +
                (
                    finalValue -
                    previousValue
                ) *
                easedProgress
            );


        element.textContent =
            String(currentValue);


        if (progress < 1) {

            window.requestAnimationFrame(
                updateNumber
            );

        }

    }


    window.requestAnimationFrame(
        updateNumber
    );

}


/* =========================================================
   POPULATE FILTER OPTIONS
========================================================= */

function populateAlumniFilterOptions() {

    populateProgramFilter();

    populateBatchFilter();

}


/* =========================================================
   POPULATE PROGRAM FILTER
========================================================= */

function populateProgramFilter() {

    const programFilter =
        findElementByPossibleIds(
            [
                "programFilter",
                "filterProgram"
            ]
        );


    if (!programFilter) {

        return;

    }


    const currentValue =
        programFilter.value;


    const programs =
        [

            ...new Set(

                alumniRecordsState.records

                    .map(
                        (record) =>
                            record.program
                    )

                    .filter(
                        (program) =>
                            program &&
                            program !==
                                "Not specified"
                    )

            )

        ].sort(
            (firstProgram, secondProgram) =>

                firstProgram.localeCompare(
                    secondProgram
                )

        );


    programFilter.innerHTML = `

        <option value="">
            All Programs
        </option>

    `;


    programs.forEach(
        (program) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                program;

            option.textContent =
                program;


            programFilter.appendChild(
                option
            );

        }
    );


    if (
        programs.includes(
            currentValue
        )
    ) {

        programFilter.value =
            currentValue;

    }

}


/* =========================================================
   POPULATE BATCH FILTER
========================================================= */

function populateBatchFilter() {

    const batchFilter =
        findElementByPossibleIds(
            [
                "batchFilter",
                "filterBatch"
            ]
        );


    if (!batchFilter) {

        return;

    }


    const currentValue =
        batchFilter.value;


    const batches =
        [

            ...new Set(

                alumniRecordsState.records

                    .map(
                        (record) =>
                            String(
                                record.batch_year
                            ).trim()
                    )

                    .filter(
                        (batchYear) =>
                            batchYear &&
                            batchYear !==
                                "Not specified"
                    )

            )

        ].sort(
            (firstBatch, secondBatch) =>

                getSafeNumber(
                    secondBatch
                ) -
                getSafeNumber(
                    firstBatch
                )

        );


    batchFilter.innerHTML = `

        <option value="">
            All Batches
        </option>

    `;


    batches.forEach(
        (batchYear) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                batchYear;

            option.textContent =
                `Batch ${batchYear}`;


            batchFilter.appendChild(
                option
            );

        }
    );


    if (
        batches.includes(
            currentValue
        )
    ) {

        batchFilter.value =
            currentValue;

    }

}


/* =========================================================
   UPDATE RESULT INFORMATION
========================================================= */

function updateRecordsResultInformation() {

    const totalRecords =
        alumniRecordsState.records.length;


    const filteredRecords =
        alumniRecordsState
            .filteredRecords
            .length;


    const recordsResultText =
        findElementByPossibleIds(
            [
                "recordsResultText",
                "recordCountText",
                "recordsShowingText",
                "resultsCount"
            ]
        );


    if (recordsResultText) {

        if (
            totalRecords ===
            filteredRecords
        ) {

            recordsResultText.textContent =
                `${totalRecords} alumni record${
                    totalRecords === 1
                        ? ""
                        : "s"
                }`;

        } else {

            recordsResultText.textContent =
                `${filteredRecords} of ${totalRecords} records`;

        }

    }


    const tableRecordCount =
        findElementByPossibleIds(
            [
                "tableRecordCount",
                "recordCount"
            ]
        );


    if (tableRecordCount) {

        tableRecordCount.textContent =
            String(filteredRecords);

    }

}


/* =========================================================
   INITIALIZE REFRESH RECORDS
========================================================= */

function initializeRefreshRecords() {

    const refreshButton =
        getRefreshRecordsButton();


    if (!refreshButton) {

        return;

    }


    refreshButton.addEventListener(
        "click",
        async function refreshRecords() {

            if (
                alumniRecordsState.isLoading
            ) {

                return;

            }


            await loadAlumniRecords(true);

        }
    );

}


/* =========================================================
   GET REFRESH RECORDS BUTTON
========================================================= */

function getRefreshRecordsButton() {

    return findElementByPossibleIds(
        [
            "refreshRecordsButton",
            "refreshRecordsBtn",
            "refreshButton"
        ]
    );

}


/* =========================================================
   SET REFRESH BUTTON LOADING
========================================================= */

function setRefreshButtonLoading(
    isLoading
) {

    const refreshButton =
        getRefreshRecordsButton();


    if (!refreshButton) {

        return;

    }


    setButtonLoadingState(
        refreshButton,
        isLoading,
        "Refreshing..."
    );

}


/* =========================================================
   UPDATE SELECT ALL CHECKBOX
========================================================= */

function updateSelectAllCheckbox() {

    const selectAllCheckbox =
        findElementByPossibleIds(
            [
                "selectAllRecords",
                "selectAllCheckbox",
                "selectAllAlumni"
            ]
        );


    if (!selectAllCheckbox) {

        return;

    }


    const visibleRecordCheckboxes =
        Array.from(
            document.querySelectorAll(
                ".record-checkbox"
            )
        );


    const checkedCheckboxes =
        visibleRecordCheckboxes.filter(
            (checkbox) =>
                checkbox.checked
        );


    selectAllCheckbox.checked =
        visibleRecordCheckboxes.length > 0 &&
        checkedCheckboxes.length ===
            visibleRecordCheckboxes.length;


    selectAllCheckbox.indeterminate =
        checkedCheckboxes.length > 0 &&
        checkedCheckboxes.length <
            visibleRecordCheckboxes.length;

}


/* =========================================================
   FIND ELEMENT USING POSSIBLE IDs
========================================================= */

function findElementByPossibleIds(
    possibleIds
) {

    for (
        const elementId of possibleIds
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (element) {

            return element;

        }

    }


    return null;

}

/* =========================================================
   FINAL DARK MODE FIX
   Shared theme for Dashboard and Alumni Records
========================================================= */

(function setupSharedDarkMode() {

    const THEME_KEYS = [
        "theme",
        "savedTheme",
        "darkMode"
    ];


    function getSavedTheme() {

        const theme =
            localStorage.getItem("theme") ||
            localStorage.getItem("savedTheme");

        const darkMode =
            localStorage.getItem("darkMode");


        if (
            theme === "dark" ||
            darkMode === "true"
        ) {

            return "dark";

        }


        if (
            theme === "light" ||
            darkMode === "false"
        ) {

            return "light";

        }


        return "light";

    }


    function applySharedTheme(theme) {

        const isDark =
            theme === "dark";


        document.body.classList.toggle(
            "dark",
            isDark
        );

        document.body.classList.toggle(
            "dark-mode",
            isDark
        );


        document.documentElement.classList.toggle(
            "dark",
            isDark
        );

        document.documentElement.classList.toggle(
            "dark-mode",
            isDark
        );


        document.documentElement.setAttribute(
            "data-theme",
            isDark
                ? "dark"
                : "light"
        );


        const themeIcon =
            document.getElementById("themeIcon") ||
            document.querySelector(
                "#themeToggle i"
            );


        if (themeIcon) {

            themeIcon.className =
                isDark
                    ? "bx bx-sun"
                    : "bx bx-moon";

        }

    }


    function saveSharedTheme(theme) {

        localStorage.setItem(
            "theme",
            theme
        );

        localStorage.setItem(
            "savedTheme",
            theme
        );

        localStorage.setItem(
            "darkMode",
            theme === "dark"
                ? "true"
                : "false"
        );

    }


    function initializeSharedTheme() {

        applySharedTheme(
            getSavedTheme()
        );


        const oldThemeButton =
            document.getElementById(
                "themeToggle"
            );


        if (!oldThemeButton) {

            console.warn(
                "Dark mode button with id='themeToggle' was not found."
            );

            return;

        }


        /*
            Clone para matanggal ang lumang duplicate
            click listeners.
        */

        const newThemeButton =
            oldThemeButton.cloneNode(true);


        oldThemeButton.replaceWith(
            newThemeButton
        );


        newThemeButton.addEventListener(
            "click",
            function () {

                const currentlyDark =

                    document.body.classList.contains(
                        "dark"
                    ) ||

                    document.body.classList.contains(
                        "dark-mode"
                    );


                const nextTheme =
                    currentlyDark
                        ? "light"
                        : "dark";


                saveSharedTheme(
                    nextTheme
                );

                applySharedTheme(
                    nextTheme
                );

            }
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSharedTheme
        );

    } else {

        initializeSharedTheme();

    }


    window.addEventListener(
        "storage",
        function (event) {

            if (
                THEME_KEYS.includes(
                    event.key
                )
            ) {

                applySharedTheme(
                    getSavedTheme()
                );

            }

        }
    );

})();
/* =========================================================
   ALUMNI RECORDS — PART 2B

   Included:
   - Search records
   - Program filter
   - Batch filter
   - Employment filter
   - Verification filter
   - Reset filters
   - Pagination
   - Rows per page
   - Individual record selection
   - Select all records
   - Bulk action bar
   - Correct pagination information
========================================================= */


/* =========================================================
   INITIALIZE PART 2B
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart2B
);


function initializeAlumniRecordsPart2B() {

    initializeRecordsSearch();

    initializeRecordsFilters();

    initializeResetFilters();

    initializeRowsPerPage();

    initializePaginationButtons();

    initializeRecordSelection();

    initializeClearSelection();

}


/* =========================================================
   INITIALIZE RECORD SEARCH
========================================================= */

function initializeRecordsSearch() {

    const searchInput =
        document.getElementById(
            "recordSearchInput"
        );


    const clearSearchButton =
        document.getElementById(
            "clearSearchButton"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            debounce(
                function handleRecordSearch() {

                    alumniRecordsState.currentPage = 1;

                    applyAlumniFilters();

                },
                250
            )
        );

    }


    if (
        clearSearchButton &&
        searchInput
    ) {

        clearSearchButton.addEventListener(
            "click",
            function clearRecordSearch() {

                searchInput.value = "";


                const globalSearch =
                    document.getElementById(
                        "globalSearch"
                    );


                if (globalSearch) {

                    globalSearch.value = "";

                }


                alumniRecordsState.currentPage = 1;

                applyAlumniFilters();

                searchInput.focus();

            }
        );

    }

}


/* =========================================================
   INITIALIZE FILTER CONTROLS
========================================================= */

function initializeRecordsFilters() {

    const filterIds = [

        "programFilter",

        "batchFilter",

        "employmentFilter",

        "verificationFilter"

    ];


    filterIds.forEach(
        (filterId) => {

            const filterElement =
                document.getElementById(
                    filterId
                );


            if (!filterElement) {

                return;

            }


            filterElement.addEventListener(
                "change",
                function handleFilterChange() {

                    alumniRecordsState.currentPage = 1;

                    applyAlumniFilters();

                }
            );

        }
    );

}


/* =========================================================
   APPLY SEARCH AND FILTERS
========================================================= */

function applyAlumniFilters() {

    const searchValue =
        getFilterValue(
            "recordSearchInput"
        ).toLowerCase();


    const selectedProgram =
        getFilterValue(
            "programFilter"
        );


    const selectedBatch =
        getFilterValue(
            "batchFilter"
        );


    const selectedEmployment =
        getFilterValue(
            "employmentFilter"
        ).toLowerCase();


    const selectedVerification =
        getFilterValue(
            "verificationFilter"
        ).toLowerCase();


    alumniRecordsState.filteredRecords =
        alumniRecordsState.records.filter(
            (record) => {

                const searchableValues = [

                    record.full_name,

                    record.first_name,

                    record.middle_name,

                    record.last_name,

                    record.email,

                    record.student_number,

                    record.program,

                    record.batch_year,

                    record.current_job,

                    record.company

                ]
                    .map(
                        (value) =>
                            String(
                                value ?? ""
                            ).toLowerCase()
                    )
                    .join(" ");


                const matchesSearch =
                    !searchValue ||
                    searchableValues.includes(
                        searchValue
                    );


                const matchesProgram =
                    !selectedProgram ||
                    String(record.program) ===
                        selectedProgram;


                const matchesBatch =
                    !selectedBatch ||
                    String(record.batch_year) ===
                        selectedBatch;


                const matchesEmployment =
                    checkEmploymentFilter(
                        record,
                        selectedEmployment
                    );


                const matchesVerification =
                    checkVerificationFilter(
                        record,
                        selectedVerification
                    );


                return (

                    matchesSearch &&

                    matchesProgram &&

                    matchesBatch &&

                    matchesEmployment &&

                    matchesVerification

                );

            }
        );


    ensureCurrentPageIsValid();

    renderAlumniRecords();

}


/* =========================================================
   GET FILTER VALUE
========================================================= */

function getFilterValue(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return "";

    }


    return String(
        element.value ?? ""
    ).trim();

}


/* =========================================================
   CHECK EMPLOYMENT FILTER
========================================================= */

function checkEmploymentFilter(
    record,
    selectedEmployment
) {

    if (!selectedEmployment) {

        return true;

    }


    const employmentStatus =
        String(
            record.employment_status ?? ""
        )
            .trim()
            .toLowerCase();


    if (
        selectedEmployment ===
        "self-employed"
    ) {

        const rawStatus =
            String(
                record.status ??
                record.original_employment_status ??
                ""
            )
                .trim()
                .toLowerCase();


        return (

            rawStatus === "self-employed" ||

            rawStatus === "self employed"

        );

    }


    if (
        selectedEmployment ===
        "not-specified"
    ) {

        return (

            !employmentStatus ||

            employmentStatus ===
                "not-specified"

        );

    }


    return (
        employmentStatus ===
        selectedEmployment
    );

}


/* =========================================================
   CHECK VERIFICATION FILTER
========================================================= */

function checkVerificationFilter(
    record,
    selectedVerification
) {

    if (!selectedVerification) {

        return true;

    }


    const verificationStatus =
        String(
            record.verification_status ??
            (
                record.is_verified
                    ? "verified"
                    : "pending"
            )
        )
            .trim()
            .toLowerCase();


    return (
        verificationStatus ===
        selectedVerification
    );

}


/* =========================================================
   INITIALIZE RESET FILTERS
========================================================= */

function initializeResetFilters() {

    const resetFiltersButton =
        document.getElementById(
            "resetFiltersButton"
        );


    const emptyStateResetButton =
        document.getElementById(
            "emptyStateResetButton"
        );


    if (resetFiltersButton) {

        resetFiltersButton.addEventListener(
            "click",
            resetAlumniFilters
        );

    }


    if (emptyStateResetButton) {

        emptyStateResetButton.addEventListener(
            "click",
            resetAlumniFilters
        );

    }

}


/* =========================================================
   RESET ALL FILTERS
========================================================= */

function resetAlumniFilters() {

    const controlIds = [

        "recordSearchInput",

        "globalSearch",

        "programFilter",

        "batchFilter",

        "employmentFilter",

        "verificationFilter"

    ];


    controlIds.forEach(
        (controlId) => {

            const control =
                document.getElementById(
                    controlId
                );


            if (control) {

                control.value = "";

            }

        }
    );


    alumniRecordsState.filteredRecords = [

        ...alumniRecordsState.records

    ];


    alumniRecordsState.currentPage = 1;

    renderAlumniRecords();


    if (
        typeof showToast ===
        "function"
    ) {

        showToast(
            "info",
            "Filters reset",
            "All alumni records are now displayed."
        );

    }

}


/* =========================================================
   INITIALIZE ROWS PER PAGE
========================================================= */

function initializeRowsPerPage() {

    const recordsPerPageSelect =
        document.getElementById(
            "recordsPerPage"
        );


    if (!recordsPerPageSelect) {

        return;

    }


    alumniRecordsState.recordsPerPage =
        getSafeNumber(
            recordsPerPageSelect.value,
            10
        );


    recordsPerPageSelect.addEventListener(
        "change",
        function changeRowsPerPage() {

            alumniRecordsState.recordsPerPage =
                Math.max(
                    1,
                    getSafeNumber(
                        recordsPerPageSelect.value,
                        10
                    )
                );


            alumniRecordsState.currentPage = 1;

            renderAlumniRecords();

        }
    );

}


/* =========================================================
   INITIALIZE PAGINATION BUTTONS
========================================================= */

function initializePaginationButtons() {

    const previousPageButton =
        document.getElementById(
            "previousPageButton"
        );


    const nextPageButton =
        document.getElementById(
            "nextPageButton"
        );


    if (previousPageButton) {

        previousPageButton.addEventListener(
            "click",
            function goToPreviousPage() {

                if (
                    alumniRecordsState.currentPage <= 1
                ) {

                    return;

                }


                alumniRecordsState.currentPage -= 1;

                renderAlumniRecords();

            }
        );

    }


    if (nextPageButton) {

        nextPageButton.addEventListener(
            "click",
            function goToNextPage() {

                const totalPages =
                    getTotalAlumniPages();


                if (
                    alumniRecordsState.currentPage >=
                    totalPages
                ) {

                    return;

                }


                alumniRecordsState.currentPage += 1;

                renderAlumniRecords();

            }
        );

    }

}


/* =========================================================
   GET TOTAL PAGES
========================================================= */

function getTotalAlumniPages() {

    const totalRecords =
        alumniRecordsState
            .filteredRecords
            .length;


    const recordsPerPage =
        Math.max(
            1,
            alumniRecordsState.recordsPerPage
        );


    return Math.max(
        1,
        Math.ceil(
            totalRecords /
            recordsPerPage
        )
    );

}


/* =========================================================
   ENSURE CURRENT PAGE IS VALID
========================================================= */

function ensureCurrentPageIsValid() {

    const totalPages =
        getTotalAlumniPages();


    alumniRecordsState.currentPage =
        Math.min(
            Math.max(
                1,
                alumniRecordsState.currentPage
            ),
            totalPages
        );

}


/* =========================================================
   GET RECORDS FOR CURRENT PAGE
========================================================= */

function getCurrentPageRecords() {

    ensureCurrentPageIsValid();


    const startIndex =
        (
            alumniRecordsState.currentPage -
            1
        ) *
        alumniRecordsState.recordsPerPage;


    const endIndex =
        startIndex +
        alumniRecordsState.recordsPerPage;


    return alumniRecordsState
        .filteredRecords
        .slice(
            startIndex,
            endIndex
        );

}


/* =========================================================
   RENDER ALUMNI RECORDS WITH PAGINATION

   This replaces the earlier renderAlumniRecords()
   behavior from Part 2A.
========================================================= */

function renderAlumniRecords() {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        console.warn(
            "Alumni records table body was not found."
        );

        return;

    }


    tableBody.innerHTML = "";


    const records =
        getCurrentPageRecords();


    if (
        !alumniRecordsState
            .filteredRecords
            .length
    ) {

        showRecordsEmptyState();

        updatePaginationInformation();

        renderPaginationNumbers();

        updateSelectAllCheckbox();

        updateBulkActionBar();

        updateRecordsResultInformation();

        return;

    }


    const tableFragment =
        document.createDocumentFragment();


    records.forEach(
        (record) => {

            const tableRow =
                createAlumniTableRow(
                    record
                );


            tableFragment.appendChild(
                tableRow
            );

        }
    );


    tableBody.appendChild(
        tableFragment
    );


    updatePaginationInformation();

    renderPaginationNumbers();

    updatePaginationButtons();

    updateSelectAllCheckbox();

    updateBulkActionBar();

    updateRecordsResultInformation();

}


/* =========================================================
   UPDATE PAGINATION INFORMATION
========================================================= */

function updatePaginationInformation() {

    const totalRecords =
        alumniRecordsState
            .filteredRecords
            .length;


    let startRecord = 0;

    let endRecord = 0;


    if (totalRecords > 0) {

        startRecord =
            (
                alumniRecordsState.currentPage -
                1
            ) *
            alumniRecordsState.recordsPerPage +
            1;


        endRecord =
            Math.min(
                startRecord +
                alumniRecordsState.recordsPerPage -
                1,
                totalRecords
            );

    }


    setElementText(
        "paginationStart",
        startRecord
    );


    setElementText(
        "paginationEnd",
        endRecord
    );


    setElementText(
        "paginationTotal",
        totalRecords
    );

}


/* =========================================================
   UPDATE PAGINATION BUTTONS
========================================================= */

function updatePaginationButtons() {

    const previousPageButton =
        document.getElementById(
            "previousPageButton"
        );


    const nextPageButton =
        document.getElementById(
            "nextPageButton"
        );


    const totalPages =
        getTotalAlumniPages();


    if (previousPageButton) {

        previousPageButton.disabled =
            alumniRecordsState.currentPage <= 1;

    }


    if (nextPageButton) {

        nextPageButton.disabled =
            alumniRecordsState.currentPage >=
            totalPages ||

            alumniRecordsState
                .filteredRecords
                .length === 0;

    }

}


/* =========================================================
   RENDER PAGINATION NUMBERS
========================================================= */

function renderPaginationNumbers() {

    const paginationNumbers =
        document.getElementById(
            "paginationNumbers"
        );


    if (!paginationNumbers) {

        return;

    }


    paginationNumbers.innerHTML = "";


    const totalPages =
        getTotalAlumniPages();


    const pageNumbers =
        getVisiblePageNumbers(
            totalPages,
            alumniRecordsState.currentPage
        );


    pageNumbers.forEach(
        (pageNumber) => {

            if (
                pageNumber === "ellipsis"
            ) {

                const ellipsis =
                    document.createElement(
                        "span"
                    );


                ellipsis.className =
                    "pagination-ellipsis";

                ellipsis.textContent =
                    "…";


                paginationNumbers.appendChild(
                    ellipsis
                );

                return;

            }


            const pageButton =
                document.createElement(
                    "button"
                );


            pageButton.type =
                "button";

            pageButton.className =
                "pagination-number";

            pageButton.textContent =
                String(pageNumber);


            if (
                pageNumber ===
                alumniRecordsState.currentPage
            ) {

                pageButton.classList.add(
                    "active"
                );

                pageButton.setAttribute(
                    "aria-current",
                    "page"
                );

            }


            pageButton.addEventListener(
                "click",
                function goToSelectedPage() {

                    alumniRecordsState.currentPage =
                        pageNumber;

                    renderAlumniRecords();

                }
            );


            paginationNumbers.appendChild(
                pageButton
            );

        }
    );


    updatePaginationButtons();

}


/* =========================================================
   GET VISIBLE PAGE NUMBERS
========================================================= */

function getVisiblePageNumbers(
    totalPages,
    currentPage
) {

    if (totalPages <= 7) {

        return Array.from(
            {
                length: totalPages
            },
            (
                unusedValue,
                index
            ) => index + 1
        );

    }


    if (currentPage <= 4) {

        return [

            1,

            2,

            3,

            4,

            5,

            "ellipsis",

            totalPages

        ];

    }


    if (
        currentPage >=
        totalPages - 3
    ) {

        return [

            1,

            "ellipsis",

            totalPages - 4,

            totalPages - 3,

            totalPages - 2,

            totalPages - 1,

            totalPages

        ];

    }


    return [

        1,

        "ellipsis",

        currentPage - 1,

        currentPage,

        currentPage + 1,

        "ellipsis",

        totalPages

    ];

}


/* =========================================================
   INITIALIZE RECORD SELECTION
========================================================= */

function initializeRecordSelection() {

    const tableBody =
        getAlumniTableBody();


    const selectAllCheckbox =
        document.getElementById(
            "selectAllRecords"
        );


    if (tableBody) {

        tableBody.addEventListener(
            "change",
            function handleRecordSelection(
                event
            ) {

                const recordCheckbox =
                    event.target.closest(
                        ".record-checkbox"
                    );


                if (!recordCheckbox) {

                    return;

                }


                const recordId =
                    String(
                        recordCheckbox.value
                    );


                if (
                    recordCheckbox.checked
                ) {

                    alumniRecordsState
                        .selectedRecords
                        .add(recordId);

                } else {

                    alumniRecordsState
                        .selectedRecords
                        .delete(recordId);

                }


                const tableRow =
                    recordCheckbox.closest(
                        "tr"
                    );


                if (tableRow) {

                    tableRow.classList.toggle(
                        "selected",
                        recordCheckbox.checked
                    );

                }


                updateSelectAllCheckbox();

                updateBulkActionBar();

            }
        );

    }


    if (selectAllCheckbox) {

        selectAllCheckbox.addEventListener(
            "change",
            function selectVisibleRecords() {

                const visibleCheckboxes =
                    Array.from(
                        document.querySelectorAll(
                            "#alumniRecordsBody .record-checkbox"
                        )
                    );


                visibleCheckboxes.forEach(
                    (checkbox) => {

                        checkbox.checked =
                            selectAllCheckbox.checked;


                        const recordId =
                            String(
                                checkbox.value
                            );


                        if (
                            selectAllCheckbox.checked
                        ) {

                            alumniRecordsState
                                .selectedRecords
                                .add(recordId);

                        } else {

                            alumniRecordsState
                                .selectedRecords
                                .delete(recordId);

                        }


                        const tableRow =
                            checkbox.closest("tr");


                        if (tableRow) {

                            tableRow.classList.toggle(
                                "selected",
                                selectAllCheckbox.checked
                            );

                        }

                    }
                );


                updateSelectAllCheckbox();

                updateBulkActionBar();

            }
        );

    }

}


/* =========================================================
   UPDATE BULK ACTION BAR
========================================================= */

function updateBulkActionBar() {

    const bulkActionBar =
        document.getElementById(
            "bulkActionBar"
        );


    const selectedRecordCount =
        document.getElementById(
            "selectedRecordCount"
        );


    const selectedCount =
        alumniRecordsState
            .selectedRecords
            .size;


    if (selectedRecordCount) {

        selectedRecordCount.textContent =
            String(selectedCount);

    }


    if (bulkActionBar) {

        bulkActionBar.classList.toggle(
            "active",
            selectedCount > 0
        );

    }

}


/* =========================================================
   INITIALIZE CLEAR SELECTION
========================================================= */

function initializeClearSelection() {

    const clearSelectionButton =
        document.getElementById(
            "clearSelectionButton"
        );


    if (!clearSelectionButton) {

        return;

    }


    clearSelectionButton.addEventListener(
        "click",
        clearSelectedAlumniRecords
    );

}


/* =========================================================
   CLEAR SELECTED RECORDS
========================================================= */

function clearSelectedAlumniRecords() {

    alumniRecordsState
        .selectedRecords
        .clear();


    document
        .querySelectorAll(
            ".record-checkbox"
        )
        .forEach(
            (checkbox) => {

                checkbox.checked = false;

            }
        );


    document
        .querySelectorAll(
            ".records-table tbody tr.selected"
        )
        .forEach(
            (tableRow) => {

                tableRow.classList.remove(
                    "selected"
                );

            }
        );


    updateSelectAllCheckbox();

    updateBulkActionBar();

}


/* =========================================================
   FIX ACTIVE BATCH SUMMARY CARD
========================================================= */

function updateActiveBatchSummaryCard() {

    const activeBatches =
        new Set(

            alumniRecordsState.records

                .map(
                    (record) =>
                        String(
                            record.batch_year ?? ""
                        ).trim()
                )

                .filter(
                    (batchYear) =>

                        batchYear &&

                        batchYear !==
                            "Not specified"

                )

        ).size;


    setElementText(
        "activeBatchCount",
        activeBatches
    );

}
/* =========================================================
   ALUMNI RECORDS — PART 2C

   Included:
   - Row action buttons
   - View alumni profile
   - Populate view modal
   - Open edit alumni modal
   - Populate edit form
   - Open delete confirmation
   - Edit from View button
   - Safe record lookup
========================================================= */


/* =========================================================
   INITIALIZE PART 2C
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart2C
);


function initializeAlumniRecordsPart2C() {

    initializeAlumniRowActions();

    initializeEditFromViewButton();

}


/* =========================================================
   INITIALIZE ROW ACTION BUTTONS
========================================================= */

function initializeAlumniRowActions() {

    const tableBody =
        getAlumniTableBody();


    if (!tableBody) {

        return;

    }


    /*
        Event delegation is used because table rows are
        recreated whenever records are filtered or paginated.
    */

    tableBody.addEventListener(
        "click",
        function handleAlumniRowAction(event) {

            const actionButton =
                event.target.closest(
                    "[data-action][data-alumni-id]"
                );


            if (!actionButton) {

                return;

            }


            const action =
                actionButton.dataset.action;


            const alumniId =
                actionButton.dataset.alumniId;


            const alumniRecord =
                findAlumniRecordById(
                    alumniId
                );


            if (!alumniRecord) {

                showToast(
                    "error",
                    "Record not found",
                    "The selected alumni record could not be found."
                );

                return;

            }


            switch (action) {

                case "view":

                    openAlumniViewModal(
                        alumniRecord
                    );

                    break;


                case "edit":

                    openAlumniEditModal(
                        alumniRecord
                    );

                    break;


                case "delete":

                    openAlumniDeleteModal(
                        alumniRecord
                    );

                    break;


                default:

                    console.warn(
                        `Unknown alumni action: ${action}`
                    );

                    break;

            }

        }
    );

}


/* =========================================================
   FIND ALUMNI RECORD BY ID
========================================================= */

function findAlumniRecordById(
    alumniId
) {

    const normalizedId =
        String(alumniId);


    return alumniRecordsState.records.find(
        (record) => {

            const possibleIds = [

                record.id,

                record.profile_id,

                record.user_id,

                record.alumni_id

            ];


            return possibleIds.some(
                (recordId) =>

                    recordId !== null &&

                    recordId !== undefined &&

                    String(recordId) ===
                        normalizedId

            );

        }
    ) || null;

}


/* =========================================================
   OPEN VIEW ALUMNI MODAL
========================================================= */

function openAlumniViewModal(
    alumniRecord
) {

    alumniRecordsState.currentAlumni =
        alumniRecord;


    populateAlumniViewModal(
        alumniRecord
    );


    openModal(
        "viewAlumniModal"
    );

}


/* =========================================================
   POPULATE VIEW ALUMNI MODAL
========================================================= */

function populateAlumniViewModal(
    alumniRecord
) {

    if (!alumniRecord) {

        return;

    }


    const fullName =
        getSafeText(
            alumniRecord.full_name,
            "Unnamed Alumni"
        );


    const initials =
        createInitialsFromName(
            fullName
        );


    const employmentInformation =
        getEmploymentDisplayInformation(
            alumniRecord
        );


    const verificationInformation =
        getVerificationDisplayInformation(
            alumniRecord
        );


    setElementText(
        "viewFullName",
        fullName
    );


    setElementText(
        "viewEmail",
        alumniRecord.email
    );


    setElementText(
        "viewProfileInitials",
        initials
    );


    setElementText(
        "viewStudentNumber",
        alumniRecord.student_number
    );


    setElementText(
        "viewBirthDate",
        formatDate(
            alumniRecord.birth_date
        )
    );


    setElementText(
        "viewGender",
        alumniRecord.gender
    );


    setElementText(
        "viewPhoneNumber",
        formatPhoneNumber(
            alumniRecord.phone_number
        )
    );


    setElementText(
        "viewAddress",
        alumniRecord.address
    );


    setElementText(
        "viewProgram",
        alumniRecord.program
    );


    setElementText(
        "viewBatchYear",
        alumniRecord.batch_year
    );


    setElementText(
        "viewEmploymentStatus",
        employmentInformation.label
    );


    setElementText(
        "viewCurrentJob",
        alumniRecord.current_job
    );


    setElementText(
        "viewCompany",
        alumniRecord.company
    );


    configureViewProfileImage(
        alumniRecord.profile_picture,
        fullName
    );


    configureViewVerificationBadge(
        verificationInformation
    );


    configureViewLinkedIn(
        alumniRecord.linkedin_url
    );

}


/* =========================================================
   CONFIGURE VIEW PROFILE IMAGE
========================================================= */

function configureViewProfileImage(
    profilePicture,
    fullName
) {

    const profileImage =
        document.getElementById(
            "viewProfileImage"
        );


    if (!profileImage) {

        return;

    }


    const resolvedImage =
        resolveAlumniProfilePicture(
            profilePicture
        );


    profileImage.alt =
        `${fullName} profile picture`;


    profileImage.onerror =
        function handleViewImageError() {

            profileImage.style.display =
                "none";

        };


    if (!resolvedImage) {

        profileImage.style.display =
            "none";

        profileImage.removeAttribute(
            "src"
        );

        return;

    }


    profileImage.style.display =
        "block";

    profileImage.src =
        resolvedImage;

}


/* =========================================================
   CONFIGURE VIEW VERIFICATION BADGE
========================================================= */

function configureViewVerificationBadge(
    verificationInformation
) {

    const verificationBadge =
        document.getElementById(
            "viewVerificationBadge"
        );


    if (!verificationBadge) {

        return;

    }


    verificationBadge.className =
        verificationInformation.badgeClass;


    verificationBadge.innerHTML = `

        <i class="${escapeHTML(
            verificationInformation.icon
        )}"></i>

        ${escapeHTML(
            verificationInformation.label
        )}

    `;

}


/* =========================================================
   CONFIGURE LINKEDIN LINK
========================================================= */

function configureViewLinkedIn(
    linkedInUrl
) {

    const linkedInElement =
        document.getElementById(
            "viewLinkedIn"
        );


    if (!linkedInElement) {

        return;

    }


    const safeLinkedInUrl =
        normalizeExternalUrl(
            linkedInUrl
        );


    if (!safeLinkedInUrl) {

        linkedInElement.textContent =
            "Not provided";

        linkedInElement.removeAttribute(
            "href"
        );

        linkedInElement.removeAttribute(
            "target"
        );

        return;

    }


    linkedInElement.textContent =
        safeLinkedInUrl;


    linkedInElement.href =
        safeLinkedInUrl;


    linkedInElement.target =
        "_blank";


    linkedInElement.rel =
        "noopener noreferrer";

}


/* =========================================================
   NORMALIZE EXTERNAL URL
========================================================= */

function normalizeExternalUrl(
    urlValue
) {

    const cleanUrl =
        getSafeText(
            urlValue,
            ""
        );


    if (!cleanUrl) {

        return "";

    }


    const completeUrl =
        /^https?:\/\//i.test(cleanUrl)
            ? cleanUrl
            : `https://${cleanUrl}`;


    try {

        const parsedUrl =
            new URL(
                completeUrl
            );


        if (
            ![
                "http:",
                "https:"
            ].includes(parsedUrl.protocol)
        ) {

            return "";

        }


        return parsedUrl.href;

    } catch (error) {

        return "";

    }

}


/* =========================================================
   OPEN EDIT ALUMNI MODAL
========================================================= */

function openAlumniEditModal(
    alumniRecord
) {

    alumniRecordsState.currentAlumni =
        alumniRecord;


    populateAlumniEditForm(
        alumniRecord
    );


    openModal(
        "editAlumniModal"
    );

}


/* =========================================================
   POPULATE EDIT ALUMNI FORM
========================================================= */

function populateAlumniEditForm(
    alumniRecord
) {

    if (!alumniRecord) {

        return;

    }


    setFormControlValue(
        "editUserId",
        alumniRecord.user_id
    );


    setFormControlValue(
        "editProfileId",
        alumniRecord.profile_id
    );


    setFormControlValue(
        "editFirstName",
        alumniRecord.first_name
    );


    setFormControlValue(
        "editMiddleName",
        alumniRecord.middle_name
    );


    setFormControlValue(
        "editLastName",
        alumniRecord.last_name
    );


    setFormControlValue(
        "editEmail",
        alumniRecord.email
    );


    setFormControlValue(
        "editStudentNumber",
        alumniRecord.student_number
    );


    setFormControlValue(
        "editBirthDate",
        formatDateForInput(
            alumniRecord.birth_date
        )
    );


    setFormControlValue(
        "editGender",
        alumniRecord.gender
    );


    setFormControlValue(
        "editPhoneNumber",
        alumniRecord.phone_number
    );


    setFormControlValue(
        "editAddress",
        alumniRecord.address
    );


    setFormControlValue(
        "editProgram",
        alumniRecord.program
    );


    setFormControlValue(
        "editBatchYear",
        alumniRecord.batch_year
    );


    setFormControlValue(
        "editEmploymentStatus",
        getEmploymentSelectValue(
            alumniRecord
        )
    );


    setFormControlValue(
        "editCurrentJob",
        alumniRecord.current_job
    );


    setFormControlValue(
        "editCompany",
        alumniRecord.company
    );


    setFormControlValue(
        "editLinkedIn",
        alumniRecord.linkedin_url
    );


    setFormControlValue(
        "editVerificationStatus",
        alumniRecord.verification_status
    );


    setFormControlValue(
        "editAccountStatus",
        alumniRecord.is_active
            ? "active"
            : "inactive"
    );

}


/* =========================================================
   SET FORM CONTROL VALUE
========================================================= */

function setFormControlValue(
    elementId,
    value
) {

    const formControl =
        document.getElementById(
            elementId
        );


    if (!formControl) {

        return;

    }


    const cleanValue =

        value === null ||

        value === undefined ||

        value === "Not provided" ||

        value === "Not specified" ||

        value === "No email"

            ? ""

            : String(value);


    formControl.value =
        cleanValue;

}


/* =========================================================
   FORMAT DATE FOR DATE INPUT
========================================================= */

function formatDateForInput(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   GET EMPLOYMENT SELECT VALUE
========================================================= */

function getEmploymentSelectValue(
    alumniRecord
) {

    const employmentStatus =
        String(
            alumniRecord.employment_status ??
            ""
        )
            .trim()
            .toLowerCase();


    switch (employmentStatus) {

        case "employed":

            return "Employed";


        case "self-employed":

        case "self employed":

            return "Self-employed";


        case "student":

            return "Student";


        case "unemployed":

            return "Unemployed";


        default:

            return "";

    }

}


/* =========================================================
   OPEN DELETE ALUMNI MODAL
========================================================= */

function openAlumniDeleteModal(
    alumniRecord
) {

    alumniRecordsState.currentAlumni =
        alumniRecord;


    setElementText(
        "deleteAlumniName",
        alumniRecord.full_name
    );


    /*
        Prefer user_id for backend deletion.
        Fall back to record ID if user_id is unavailable.
    */

    setFormControlValue(
        "deleteAlumniUserId",
        alumniRecord.user_id ??
        alumniRecord.id
    );


    openModal(
        "deleteAlumniModal"
    );

}


/* =========================================================
   INITIALIZE EDIT FROM VIEW BUTTON
========================================================= */

function initializeEditFromViewButton() {

    const editFromViewButton =
        document.getElementById(
            "editFromViewButton"
        );


    if (!editFromViewButton) {

        return;

    }


    editFromViewButton.addEventListener(
        "click",
        function editCurrentViewedAlumni() {

            const currentAlumni =
                alumniRecordsState.currentAlumni;


            if (!currentAlumni) {

                showToast(
                    "error",
                    "Record unavailable",
                    "No alumni record is currently selected."
                );

                return;

            }


            closeModal(
                "viewAlumniModal"
            );


            window.setTimeout(
                function openEditAfterView() {

                    openAlumniEditModal(
                        currentAlumni
                    );

                },
                120
            );

        }
    );

}
/* =========================================================
   ALUMNI RECORDS — PART 2D

   Included:
   - Submit edit alumni form
   - Update alumni through API
   - Confirm delete alumni
   - Delete alumni through API
   - Refresh table after changes
   - Form payload helpers
   - API error handling
========================================================= */


/* =========================================================
   INITIALIZE PART 2D
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAlumniRecordsPart2D
);


function initializeAlumniRecordsPart2D() {

    initializeEditAlumniForm();

    initializeDeleteAlumniAction();

}


/* =========================================================
   INITIALIZE EDIT ALUMNI FORM
========================================================= */

function initializeEditAlumniForm() {

    const editAlumniForm =
        document.getElementById(
            "editAlumniForm"
        );


    if (!editAlumniForm) {

        return;

    }


    editAlumniForm.addEventListener(
        "submit",
        handleEditAlumniSubmit
    );

}


/* =========================================================
   HANDLE EDIT ALUMNI SUBMIT
========================================================= */

async function handleEditAlumniSubmit(
    event
) {

    event.preventDefault();


    const editAlumniForm =
        event.currentTarget;


    const updateButton =
        document.getElementById(
            "updateAlumniButton"
        );


    if (
        !editAlumniForm.checkValidity()
    ) {

        editAlumniForm.reportValidity();

        return;

    }


    const currentAlumni =
        alumniRecordsState.currentAlumni;


    if (!currentAlumni) {

        showToast(
            "error",
            "Record unavailable",
            "No alumni record is currently selected."
        );

        return;

    }


    const userId =
        getFormControlValue(
            "editUserId"
        ) ||
        currentAlumni.user_id ||
        currentAlumni.id;


    if (!userId) {

        showToast(
            "error",
            "Missing record ID",
            "The alumni account ID could not be determined."
        );

        return;

    }


    const updatePayload =
        createEditAlumniPayload();


    try {

        setButtonLoadingState(
            updateButton,
            true,
            "Saving changes..."
        );


        const response =
            await fetch(
                `${ALUMNI_API_URL}/${encodeURIComponent(userId)}`,
                {
                    method: "PUT",

                    headers: {

                        Accept:
                            "application/json",

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            updatePayload
                        )

                }
            );


        if (
            response.status === 401
        ) {

            clearUserSession();

            redirectToLogin();

            return;

        }


        if (
            response.status === 403
        ) {

            throw new Error(
                "You do not have permission to update this alumni record."
            );

        }


        const responseData =
            await parseJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(

                responseData?.message ||

                responseData?.error ||

                `Unable to update the alumni record. Status: ${response.status}`

            );

        }


        closeModal(
            "editAlumniModal"
        );


        showToast(
            "success",
            "Record updated",
            `${createFullName(updatePayload)} was updated successfully.`
        );


        alumniRecordsState.currentAlumni =
            null;


        await loadAlumniRecords();

    } catch (error) {

        console.error(
            "Unable to update alumni record:",
            error
        );


        showToast(
            "error",
            "Update failed",
            error.message ||
            "An unexpected error occurred while updating the record."
        );

    } finally {

        setButtonLoadingState(
            updateButton,
            false
        );

    }

}


/* =========================================================
   CREATE EDIT ALUMNI PAYLOAD
========================================================= */

function createEditAlumniPayload() {

    const verificationStatus =
        getFormControlValue(
            "editVerificationStatus"
        );


    const accountStatus =
        getFormControlValue(
            "editAccountStatus"
        );


    return {

        first_name:
            getFormControlValue(
                "editFirstName"
            ),

        middle_name:
            getFormControlValue(
                "editMiddleName"
            ),

        last_name:
            getFormControlValue(
                "editLastName"
            ),

        email:
            getFormControlValue(
                "editEmail"
            ),

        student_number:
            getFormControlValue(
                "editStudentNumber"
            ),

        birth_date:
            getNullableFormValue(
                "editBirthDate"
            ),

        gender:
            getNullableFormValue(
                "editGender"
            ),

        phone_number:
            getNullableFormValue(
                "editPhoneNumber"
            ),

        address:
            getNullableFormValue(
                "editAddress"
            ),

        program:
            getFormControlValue(
                "editProgram"
            ),

        batch_year:
            getNullableNumberValue(
                "editBatchYear"
            ),

        employment_status:
            getNullableFormValue(
                "editEmploymentStatus"
            ),

        current_job:
            getNullableFormValue(
                "editCurrentJob"
            ),

        company:
            getNullableFormValue(
                "editCompany"
            ),

        linkedin_url:
            getNullableFormValue(
                "editLinkedIn"
            ),

        verification_status:
            verificationStatus,

        is_verified:
            verificationStatus ===
            "verified",

        is_active:
            accountStatus ===
            "active"

    };

}


/* =========================================================
   INITIALIZE DELETE ALUMNI ACTION
========================================================= */

function initializeDeleteAlumniAction() {

    const confirmDeleteButton =
        document.getElementById(
            "confirmDeleteAlumniButton"
        );


    if (!confirmDeleteButton) {

        return;

    }


    confirmDeleteButton.addEventListener(
        "click",
        handleDeleteAlumni
    );

}


/* =========================================================
   HANDLE DELETE ALUMNI
========================================================= */

async function handleDeleteAlumni() {

    const confirmDeleteButton =
        document.getElementById(
            "confirmDeleteAlumniButton"
        );


    const currentAlumni =
        alumniRecordsState.currentAlumni;


    const hiddenUserId =
        getFormControlValue(
            "deleteAlumniUserId"
        );


    const userId =
        hiddenUserId ||
        currentAlumni?.user_id ||
        currentAlumni?.id;


    if (!currentAlumni) {

        showToast(
            "error",
            "Record unavailable",
            "No alumni record is currently selected."
        );

        return;

    }


    if (!userId) {

        showToast(
            "error",
            "Missing record ID",
            "The alumni account ID could not be determined."
        );

        return;

    }


    const alumniName =
        getSafeText(
            currentAlumni.full_name,
            "The alumni record"
        );


    try {

        setButtonLoadingState(
            confirmDeleteButton,
            true,
            "Deleting..."
        );


        const response =
            await fetch(
                `${ALUMNI_API_URL}/${encodeURIComponent(userId)}`,
                {
                    method:
                        "DELETE",

                    headers: {

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401
        ) {

            clearUserSession();

            redirectToLogin();

            return;

        }


        if (
            response.status === 403
        ) {

            throw new Error(
                "You do not have permission to delete this alumni record."
            );

        }


        const responseData =
            await parseJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(

                responseData?.message ||

                responseData?.error ||

                `Unable to delete the alumni record. Status: ${response.status}`

            );

        }


        closeModal(
            "deleteAlumniModal"
        );


        alumniRecordsState
            .selectedRecords
            .delete(
                String(
                    currentAlumni.id
                )
            );


        alumniRecordsState.currentAlumni =
            null;


        showToast(
            "success",
            "Record deleted",
            `${alumniName} was removed successfully.`
        );


        await loadAlumniRecords();

    } catch (error) {

        console.error(
            "Unable to delete alumni record:",
            error
        );


        showToast(
            "error",
            "Delete failed",
            error.message ||
            "An unexpected error occurred while deleting the record."
        );

    } finally {

        setButtonLoadingState(
            confirmDeleteButton,
            false
        );

    }

}


/* =========================================================
   GET FORM CONTROL VALUE
========================================================= */

function getFormControlValue(
    elementId
) {

    const formControl =
        document.getElementById(
            elementId
        );


    if (!formControl) {

        return "";

    }


    return String(
        formControl.value ?? ""
    ).trim();

}


/* =========================================================
   GET NULLABLE FORM VALUE
========================================================= */

function getNullableFormValue(
    elementId
) {

    const value =
        getFormControlValue(
            elementId
        );


    return value || null;

}


/* =========================================================
   GET NULLABLE NUMBER VALUE
========================================================= */

function getNullableNumberValue(
    elementId
) {

    const value =
        getFormControlValue(
            elementId
        );


    if (!value) {

        return null;

    }


    const numericValue =
        Number(value);


    return Number.isFinite(
        numericValue
    )
        ? numericValue
        : null;

}
/* ==========================================================
   ADD ALUMNI
========================================================== */

const addAlumniForm =
document.getElementById("addAlumniForm");

const saveAlumniButton =
document.getElementById("saveAlumniButton");


if(addAlumniForm){

addAlumniForm.addEventListener(
"submit",
createAlumniRecord
);

}


async function createAlumniRecord(e){

e.preventDefault();

saveAlumniButton.disabled = true;

saveAlumniButton.innerHTML = `
<i class="bx bx-loader-alt bx-spin"></i>
Creating...
`;

const payload={

first_name:
document.getElementById("addFirstName").value.trim(),

middle_name:
document.getElementById("addMiddleName").value.trim(),

last_name:
document.getElementById("addLastName").value.trim(),

email:
document.getElementById("addEmail").value.trim(),

password:
document.getElementById("addPassword").value,

student_number:
document.getElementById("addStudentNumber").value.trim(),

program:
document.getElementById("addProgram").value,

batch_year:
document.getElementById("addBatchYear").value,

birth_date:
document.getElementById("addBirthDate").value,

gender:
document.getElementById("addGender").value,

phone_number:
document.getElementById("addPhoneNumber").value.trim(),

address:
document.getElementById("addAddress").value.trim(),

employment_status:
document.getElementById("addEmploymentStatus").value,

current_job:
document.getElementById("addCurrentJob").value.trim(),

company:
document.getElementById("addCompany").value.trim(),

linkedin_url:
document.getElementById("addLinkedIn").value.trim(),

verify_immediately:
document.getElementById("addVerifyImmediately").checked

};

try{

const response =
await fetch(
"http://localhost:5000/api/alumni/admin/create",
{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify(payload)

}
);

const data =
await response.json();

if(!response.ok){

throw new Error(
data.message || "Unable to create alumni."
);

}

showToast(
"success",
"Alumni record created successfully."
);

closeModal("addAlumniModal");

addAlumniForm.reset();

await loadAlumniRecords();

}
catch(error){

showToast(
"error",
error.message
);

}
finally{

saveAlumniButton.disabled=false;

saveAlumniButton.innerHTML=`
<i class="bx bx-save"></i>
Create Alumni Record
`;

}

}
/* ==========================================================
   OPEN ADD ALUMNI MODAL
========================================================== */

const addAlumniButton =
document.getElementById("addAlumniButton");

if(addAlumniButton){

    addAlumniButton.addEventListener("click", function(){

        openModal("addAlumniModal");

    });

}
const loggedInUser =
JSON.parse(localStorage.getItem("user") || "{}");

const verifyImmediatelyCheckbox =
document.getElementById("addVerifyImmediately");

const verifyImmediatelySection =
verifyImmediatelyCheckbox?.closest(".form-section");

if(
    Number(loggedInUser.role_id) !== 1 &&
    verifyImmediatelySection
){

    verifyImmediatelySection.style.display = "none";

    verifyImmediatelyCheckbox.checked = false;

}