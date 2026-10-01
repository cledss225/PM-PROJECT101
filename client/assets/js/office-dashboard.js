/* =========================================================
   ALUMNIHUB — OFFICE DASHBOARD
   File: office-dashboard.js
   PART 1: Core dashboard functions
========================================================= */

"use strict";


/* =========================================================
   GLOBAL DATA
========================================================= */

const token =
localStorage.getItem("token");


let currentUser = null;


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboard();

    }
);


function initializeDashboard() {

    currentUser =
    getStoredUser();


    initializeTheme();

    initializeSidebar();

    initializeDropdowns();

    initializeLogout();

    // initializeKeyboardShortcuts();

    setCurrentDate();

    setCurrentYear();

    updateGreeting();


    const hasAccess =
    checkOfficeAccess();


    if (!hasAccess) {

        return;

    }


    displayCurrentUser();

    hidePageLoader();

}


/* =========================================================
   READ USER FROM LOCAL STORAGE
========================================================= */

function getStoredUser() {

    try {

        const storedUser =
        localStorage.getItem("user");


        if (!storedUser) {

            return null;

        }


        return JSON.parse(
            storedUser
        );

    } catch (error) {

        console.error(
            "Unable to read user data:",
            error
        );


        localStorage.removeItem(
            "user"
        );


        return null;

    }

}


/* =========================================================
   OFFICE ROLE PROTECTION
========================================================= */

function checkOfficeAccess() {

    if (!token || !currentUser) {

        redirectToLogin();

        return false;

    }


    const roleId =
    Number(
        currentUser.role_id
    );


    if (roleId !== 3) {

        hidePageLoader();


        showToast(
            "You are not authorized to access the Alumni Office Portal.",
            "error"
        );


        setTimeout(
            function () {

                redirectUserByRole(
                    roleId
                );

            },
            1200
        );


        return false;

    }


    return true;

}


function redirectUserByRole(roleId) {

    if (roleId === 1) {

        window.location.href =
        "../dashboard.html";

        return;

    }


    if (roleId === 2) {

        window.location.href =
        "../alumni/alumni-dashboard.html";

        return;

    }


    redirectToLogin();

}


function redirectToLogin() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
    "../pages/login.html";

}


/* =========================================================
   DISPLAY CURRENT USER
========================================================= */

function displayCurrentUser() {

    const fullName =
    getFullName(
        currentUser
    );


    const firstName =
    currentUser?.first_name ||
    "Office Staff";


    const initials =
    getInitials(
        currentUser
    );


    setTextContent(
        "sidebarUserName",
        fullName
    );


    setTextContent(
        "headerUserName",
        fullName
    );


    setTextContent(
        "welcomeUserName",
        firstName
    );


    setTextContent(
        "sidebarInitials",
        initials
    );


    setTextContent(
        "headerInitials",
        initials
    );


    const profilePicture =
    currentUser?.profile_picture;


    if (profilePicture) {

        setProfileImage(
            "sidebarProfileImage",
            profilePicture
        );


        setProfileImage(
            "headerProfileImage",
            profilePicture
        );

    }

}


function getFullName(user) {

    if (!user) {

        return "Alumni Office Staff";

    }


    const nameParts = [

        user.first_name,

        user.middle_name,

        user.last_name

    ]
    .filter(Boolean)
    .map(
        function (name) {

            return String(name).trim();

        }
    )
    .filter(Boolean);


    if (!nameParts.length) {

        return "Alumni Office Staff";

    }


    return nameParts.join(" ");

}


function getInitials(user) {

    const firstName =
    user?.first_name || "";


    const lastName =
    user?.last_name || "";


    const initials =
    (
        firstName.charAt(0) +
        lastName.charAt(0)
    )
    .toUpperCase();


    return initials || "AO";

}


function setProfileImage(
    elementId,
    imagePath
) {

    const image =
    document.getElementById(
        elementId
    );


    if (!image || !imagePath) {

        return;

    }


    image.src =
    normalizeImagePath(
        imagePath
    );


    image.style.display =
    "block";

}


function normalizeImagePath(imagePath) {

    const path =
    String(imagePath);


    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:")
    ) {

        return path;

    }


    if (path.startsWith("/")) {

        return path;

    }


    return `../${path}`;

}


/* =========================================================
   CURRENT DATE AND GREETING
========================================================= */

function setCurrentDate() {

    const dateElement =
    document.getElementById(
        "currentDate"
    );


    if (!dateElement) {

        return;

    }


    const currentDate =
    new Date();


    dateElement.textContent =
    currentDate.toLocaleDateString(
        "en-US",
        {

            weekday: "long",

            month: "long",

            day: "numeric",

            year: "numeric"

        }
    );

}


function setCurrentYear() {

    setTextContent(
        "currentYear",
        new Date().getFullYear()
    );

}


function updateGreeting() {

    const currentHour =
    new Date().getHours();


    let greeting =
    "Welcome back";


    if (
        currentHour >= 5 &&
        currentHour < 12
    ) {

        greeting =
        "Good morning";

    } else if (
        currentHour >= 12 &&
        currentHour < 18
    ) {

        greeting =
        "Good afternoon";

    } else {

        greeting =
        "Good evening";

    }


    setTextContent(
        "greetingText",
        greeting
    );

}


/* =========================================================
   PAGE LOADER
========================================================= */

function hidePageLoader() {

    const pageLoader =
    document.getElementById(
        "pageLoader"
    );


    if (!pageLoader) {

        return;

    }


    setTimeout(
        function () {

            pageLoader.classList.add(
                "hidden"
            );


            setTimeout(
                function () {

                    pageLoader.style.display =
                    "none";

                },
                500
            );

        },
        700
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

function initializeSidebar() {

    const sidebar =
    document.getElementById(
        "sidebar"
    );


    const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


    const menuToggle =
    document.getElementById(
        "menuToggle"
    );


    const sidebarClose =
    document.getElementById(
        "sidebarClose"
    );


    function openSidebar() {

        sidebar?.classList.add(
            "active"
        );


        sidebarOverlay?.classList.add(
            "active"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "active"
        );


        sidebarOverlay?.classList.remove(
            "active"
        );

    }


    menuToggle?.addEventListener(
        "click",
        openSidebar
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
    .querySelectorAll(
        ".sidebar-link"
    )
    .forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    if (window.innerWidth <= 1024) {

                        closeSidebar();

                    }

                }
            );

        }
    );


    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 1024) {

                closeSidebar();

            }

        }
    );

}


/* =========================================================
   DARK MODE
========================================================= */

function initializeTheme() {

    const savedTheme =
    localStorage.getItem(
        "officeTheme"
    );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

    }


    updateThemeIcon();


    const themeToggle =
    document.getElementById(
        "themeToggle"
    );


    themeToggle?.addEventListener(
        "click",
        toggleTheme
    );

}


function toggleTheme() {

    const darkModeEnabled =
    document.body.classList.toggle(
        "dark-mode"
    );


    localStorage.setItem(
        "officeTheme",
        darkModeEnabled
            ? "dark"
            : "light"
    );


    updateThemeIcon();


    showToast(
        darkModeEnabled
            ? "Dark mode enabled."
            : "Light mode enabled.",
        "success"
    );

}


function updateThemeIcon() {

    const themeIcon =
    document.getElementById(
        "themeIcon"
    );


    if (!themeIcon) {

        return;

    }


    const darkModeEnabled =
    document.body.classList.contains(
        "dark-mode"
    );


    themeIcon.className =
    darkModeEnabled
        ? "bx bx-sun"
        : "bx bx-moon";

}


/* =========================================================
   HEADER DROPDOWNS
========================================================= */

function initializeDropdowns() {

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


    notificationButton?.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const isOpen =
            notificationDropdown
            ?.classList
            .toggle(
                "active"
            );


            profileDropdown
            ?.classList
            .remove(
                "active"
            );


            notificationButton.setAttribute(
                "aria-expanded",
                String(Boolean(isOpen))
            );


            headerProfileButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );


    headerProfileButton?.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const isOpen =
            profileDropdown
            ?.classList
            .toggle(
                "active"
            );


            notificationDropdown
            ?.classList
            .remove(
                "active"
            );


            headerProfileButton.setAttribute(
                "aria-expanded",
                String(Boolean(isOpen))
            );


            notificationButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );


    notificationDropdown?.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    profileDropdown?.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        function () {

            notificationDropdown
            ?.classList
            .remove(
                "active"
            );


            profileDropdown
            ?.classList
            .remove(
                "active"
            );


            notificationButton?.setAttribute(
                "aria-expanded",
                "false"
            );


            headerProfileButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );


    initializeMarkAllRead();

}


function initializeMarkAllRead() {

    const markAllReadButton =
    document.getElementById(
        "markAllReadButton"
    );


    markAllReadButton?.addEventListener(
        "click",
        function () {

            document
            .querySelectorAll(
                ".notification-item.unread"
            )
            .forEach(
                function (notification) {

                    notification.classList.remove(
                        "unread"
                    );

                }
            );


            const notificationDot =
            document.getElementById(
                "notificationDot"
            );


            if (notificationDot) {

                notificationDot.style.display =
                "none";

            }


            showToast(
                "Notifications marked as read.",
                "success"
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButton =
    document.getElementById(
        "logoutButton"
    );


    const profileLogoutButton =
    document.getElementById(
        "profileLogoutButton"
    );


    const confirmLogoutButton =
    document.getElementById(
        "confirmLogoutButton"
    );


    logoutButton?.addEventListener(
        "click",
        openLogoutModal
    );


    profileLogoutButton?.addEventListener(
        "click",
        openLogoutModal
    );


    confirmLogoutButton?.addEventListener(
        "click",
        performLogout
    );


    document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        function (element) {

            element.addEventListener(
                "click",
                function () {

                    closeModal(
                        element.dataset.closeModal
                    );

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeModal(
                    "logoutModal"
                );

            }

        }
    );

}


function openLogoutModal() {

    const logoutModal =
    document.getElementById(
        "logoutModal"
    );


    logoutModal?.classList.add(
        "active"
    );


    logoutModal?.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModal(modalId) {

    const modal =
    document.getElementById(
        modalId
    );


    modal?.classList.remove(
        "active"
    );


    modal?.setAttribute(
        "aria-hidden",
        "true"
    );

}


function performLogout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    showToast(
        "Logging out of the Office Portal...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
            "../pages/login.html";

        },
        650
    );

}

/* =========================================================
   OFFICE GLOBAL SEARCH
========================================================= */

let officeSearchTimer = null;
let officeSearchController = null;
let officeSearchActiveIndex = -1;


/* =========================================================
   INITIALIZE SEARCH
========================================================= */

function initializeKeyboardShortcuts() {

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    if (!globalSearch) {

        return;

    }


    createOfficeSearchDropdown();


    /* CTRL + K */

    document.addEventListener(
        "keydown",
        function (event) {

            const searchShortcut =
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() === "k";


            if (!searchShortcut) {

                return;

            }


            event.preventDefault();


            globalSearch.focus();
            globalSearch.select();

        }
    );


    /* SEARCH WHILE TYPING */

    globalSearch.addEventListener(
        "input",
        function () {

            const query =
                globalSearch.value.trim();


            officeSearchActiveIndex =
                -1;


            clearTimeout(
                officeSearchTimer
            );


            if (query.length < 2) {

                closeOfficeSearchDropdown();

                return;

            }


            officeSearchTimer =
                setTimeout(
                    function () {

                        performOfficeGlobalSearch(
                            query
                        );

                    },
                    250
                );

        }
    );


    /* KEYBOARD CONTROLS */

    globalSearch.addEventListener(
        "keydown",
        function (event) {

            const dropdown =
                document.getElementById(
                    "officeGlobalSearchDropdown"
                );


            const items =
                Array.from(
                    dropdown?.querySelectorAll(
                        ".office-search-result"
                    ) || []
                );


            if (event.key === "Escape") {

                closeOfficeSearchDropdown();

                globalSearch.blur();

                return;

            }


            if (!items.length) {

                return;

            }


            if (event.key === "ArrowDown") {

                event.preventDefault();


                officeSearchActiveIndex =
                    Math.min(
                        officeSearchActiveIndex + 1,
                        items.length - 1
                    );


                updateOfficeSearchKeyboardState(
                    items
                );

            }


            if (event.key === "ArrowUp") {

                event.preventDefault();


                officeSearchActiveIndex =
                    Math.max(
                        officeSearchActiveIndex - 1,
                        0
                    );


                updateOfficeSearchKeyboardState(
                    items
                );

            }


            if (
                event.key === "Enter" &&
                officeSearchActiveIndex >= 0
            ) {

                event.preventDefault();


                items[
                    officeSearchActiveIndex
                ].click();

            }

        }
    );


    /* CLICK OUTSIDE */

    document.addEventListener(
        "click",
        function (event) {

            const dropdown =
                document.getElementById(
                    "officeGlobalSearchDropdown"
                );


            if (
                globalSearch.contains(
                    event.target
                ) ||
                dropdown?.contains(
                    event.target
                )
            ) {

                return;

            }


            closeOfficeSearchDropdown();

        }
    );

}


/* =========================================================
   CREATE DROPDOWN
========================================================= */

function createOfficeSearchDropdown() {

    if (
        document.getElementById(
            "officeGlobalSearchDropdown"
        )
    ) {

        return;

    }


    const dropdown =
        document.createElement(
            "div"
        );


    dropdown.id =
        "officeGlobalSearchDropdown";


    dropdown.className =
        "office-global-search-dropdown";


    document.body.appendChild(
        dropdown
    );


    injectOfficeSearchStyles();

}


/* =========================================================
   PERFORM SEARCH
========================================================= */

async function performOfficeGlobalSearch(
    query
) {

    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );


    if (!dropdown) {

        return;

    }


    const navigationResults =
        getOfficeNavigationResults(
            query
        );


    dropdown.innerHTML = `

        <div class="office-search-state">

            <i class="bx bx-loader-alt bx-spin"></i>

            <div>

                <strong>
                    Searching AlumniHub...
                </strong>

                <small>
                    Looking across Office records
                </small>

            </div>

        </div>

    `;


    showOfficeSearchDropdown();


    if (officeSearchController) {

        officeSearchController.abort();

    }


    officeSearchController =
        new AbortController();


    try {

        const response =
            await fetch(
                `/api/search?q=${encodeURIComponent(query)}`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    },

                    signal:
                        officeSearchController.signal

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
                "Unable to search."
            );

        }


        const databaseResults =
            Array.isArray(
                data.results
            )
                ? data.results
                : [];


        const correctedDatabaseResults =
            databaseResults.map(
                function (result) {

                    return resolveOfficeSearchResult(
                        result
                    );

                }
            );


        const combinedResults =
            removeDuplicateOfficeResults(
                [
                    ...navigationResults,
                    ...correctedDatabaseResults
                ]
            );


        renderOfficeSearchResults(
            combinedResults,
            query
        );


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return;

        }


        console.error(
            "OFFICE GLOBAL SEARCH ERROR:",
            error
        );


        /*
         * Sidebar navigation remains usable
         * even if API search fails.
         */

        renderOfficeSearchResults(
            navigationResults,
            query
        );

    }

}


/* =========================================================
   SEARCH SIDEBAR NAVIGATION
========================================================= */

function getOfficeNavigationResults(
    query
) {

    const normalizedQuery =
        String(query)
            .trim()
            .toLowerCase();


    const links =
        Array.from(
            document.querySelectorAll(
                ".sidebar-link, .sidebar a"
            )
        );


    return links

        .map(
            function (link) {

                const label =
                    link.querySelector(
                        "span"
                    )
                    ?.textContent
                    ?.trim() ||

                    link.textContent
                        ?.trim() ||

                    "";


                const href =
                    link.getAttribute(
                        "href"
                    ) || "";


                if (
                    !label ||
                    !href ||
                    href === "#"
                ) {

                    return null;

                }


                const aliases =
                    getOfficeNavigationAliases(
                        label
                    );


                const searchable =
                    [
                        label,
                        ...aliases
                    ]
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchable.includes(
                        normalizedQuery
                    )
                ) {

                    return null;

                }


                const iconElement =
                    link.querySelector(
                        "i"
                    );


                const icon =
                    Array.from(
                        iconElement?.classList ||
                        []
                    )
                    .find(
                        function (className) {

                            return className
                                .startsWith(
                                    "bx-"
                                );

                        }
                    ) ||
                    "bx-link";


                return {

                    section:
                        "Navigation",

                    type:
                        "navigation",

                    title:
                        label,

                    description:
                        `Open ${label} section`,

                    url:
                        href,

                    icon

                };

            }
        )

        .filter(Boolean);

}


/* =========================================================
   NAVIGATION ALIASES
========================================================= */

function getOfficeNavigationAliases(
    label
) {

    const key =
        String(label)
            .trim()
            .toLowerCase();


    const aliases = {

        "dashboard": [
            "overview",
            "home",
            "summary"
        ],

        "overview": [
            "dashboard",
            "home",
            "summary"
        ],

        "alumni records": [
            "alumni",
            "graduates",
            "directory",
            "records"
        ],

        "events": [
            "event",
            "calendar",
            "activities"
        ],

        "jobs": [
            "job",
            "career",
            "employment",
            "opportunity"
        ],

        "job opportunities": [
            "job",
            "career",
            "employment"
        ],

        "announcements": [
            "announcement",
            "news",
            "notice",
            "updates"
        ],

        "reports": [
            "report",
            "analytics",
            "statistics"
        ],

        "profile": [
            "profile",
            "account",
            "personal"
        ],

        "my profile": [
            "profile",
            "account",
            "personal"
        ],

        "settings": [
            "setting",
            "preferences",
            "configuration"
        ]

    };


    return aliases[key] || [];

}


/* =========================================================
   CORRECT DATABASE RESULT URL FOR OFFICE
========================================================= */

function resolveOfficeSearchResult(
    result
) {

    const updatedResult = {
        ...result
    };


    const section =
        String(
            result.section || ""
        )
        .toLowerCase();


    const sidebarLinks =
        Array.from(
            document.querySelectorAll(
                ".sidebar-link, .sidebar a"
            )
        );


    let matchingLink = null;


    /*
     * Match backend result to actual
     * Office sidebar item.
     */

    if (
        result.type === "alumni" ||
        section.includes("alumni")
    ) {

        matchingLink =
            findOfficeSidebarLink(
                sidebarLinks,
                [
                    "alumni records",
                    "alumni"
                ]
            );

    }


    if (
        result.type === "event" ||
        section.includes("event")
    ) {

        matchingLink =
            findOfficeSidebarLink(
                sidebarLinks,
                [
                    "events",
                    "event"
                ]
            );

    }


    if (
        result.type === "job" ||
        section.includes("job")
    ) {

        matchingLink =
            findOfficeSidebarLink(
                sidebarLinks,
                [
                    "jobs",
                    "job opportunities"
                ]
            );

    }


    if (
        result.type ===
            "announcement" ||
        section.includes(
            "announcement"
        )
    ) {

        matchingLink =
            findOfficeSidebarLink(
                sidebarLinks,
                [
                    "announcements",
                    "announcement"
                ]
            );

    }


    if (matchingLink) {

        const href =
            matchingLink.getAttribute(
                "href"
            );


        if (href) {

            const searchValue =
                result.title || "";


            const separator =
                href.includes("?")
                    ? "&"
                    : "?";


            updatedResult.url =
                `${href}${separator}search=${encodeURIComponent(searchValue)}`;

        }

    }


    return updatedResult;

}


/* =========================================================
   FIND SIDEBAR LINK
========================================================= */

function findOfficeSidebarLink(
    links,
    names
) {

    return links.find(
        function (link) {

            const label =
                link.textContent
                    ?.trim()
                    ?.toLowerCase() ||
                "";


            return names.some(
                function (name) {

                    return label.includes(
                        name
                    );

                }
            );

        }
    );

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderOfficeSearchResults(
    results,
    query
) {

    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );


    if (!dropdown) {

        return;

    }


    officeSearchActiveIndex =
        -1;


    if (!results.length) {

        dropdown.innerHTML = `

            <div class="office-search-state">

                <i class="bx bx-search-alt"></i>

                <div>

                    <strong>
                        No results found for
                        "${escapeHTML(query)}"
                    </strong>

                    <small>
                        Try another keyword.
                    </small>

                </div>

            </div>

        `;


        showOfficeSearchDropdown();

        return;

    }


    dropdown.innerHTML = `

        <div class="office-search-header">

            <div>

                <span>
                    Global Search
                </span>

                <strong>
                    ${results.length}
                    ${
                        results.length === 1
                            ? "result"
                            : "results"
                    }
                </strong>

            </div>

            <small>
                Office Portal
            </small>

        </div>


        <div class="office-search-results">

            ${results
                .slice(0, 20)
                .map(
                    function (
                        result,
                        index
                    ) {

                        return `

                            <button
                                type="button"
                                class="office-search-result"
                                data-search-index="${index}"
                                data-search-url="${escapeHTML(
                                    result.url || ""
                                )}"
                            >

                                <span class="office-search-icon">

                                    <i class="bx ${
                                        escapeHTML(
                                            result.icon ||
                                            "bx-search"
                                        )
                                    }"></i>

                                </span>


                                <span class="office-search-copy">

                                    <small>
                                        ${escapeHTML(
                                            result.section ||
                                            "Result"
                                        )}
                                    </small>

                                    <strong>
                                        ${escapeHTML(
                                            result.title ||
                                            "Untitled"
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            result.description ||
                                            ""
                                        )}
                                    </span>

                                </span>


                                <i class="bx bx-chevron-right"></i>

                            </button>

                        `;

                    }
                )
                .join("")}

        </div>

    `;


    dropdown
        .querySelectorAll(
            ".office-search-result"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const target =
                            button.dataset
                                .searchUrl;


                        if (!target) {

                            return;

                        }


                        window.location.href =
                            target;

                    }
                );

            }
        );


    showOfficeSearchDropdown();

}


/* =========================================================
   REMOVE DUPLICATES
========================================================= */

function removeDuplicateOfficeResults(
    results
) {

    const seen =
        new Set();


    return results.filter(
        function (result) {

            const key =
                [
                    result.type || "",
                    result.title || "",
                    result.url || ""
                ]
                .join("|")
                .toLowerCase();


            if (
                seen.has(key)
            ) {

                return false;

            }


            seen.add(key);

            return true;

        }
    );

}


/* =========================================================
   SHOW / CLOSE DROPDOWN
========================================================= */

function showOfficeSearchDropdown() {

    const input =
        document.getElementById(
            "globalSearch"
        );


    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );


    if (
        !input ||
        !dropdown
    ) {

        return;

    }


    const rect =
        input.getBoundingClientRect();


    dropdown.style.top =
        `${rect.bottom + 8}px`;


    dropdown.style.left =
        `${rect.left}px`;


    dropdown.style.width =
        `${Math.max(
            320,
            rect.width
        )}px`;


    dropdown.classList.add(
        "active"
    );

}


function closeOfficeSearchDropdown() {

    document
        .getElementById(
            "officeGlobalSearchDropdown"
        )
        ?.classList
        .remove(
            "active"
        );

}


/* =========================================================
   KEYBOARD ACTIVE RESULT
========================================================= */

function updateOfficeSearchKeyboardState(
    items
) {

    items.forEach(
        function (
            item,
            index
        ) {

            item.classList.toggle(
                "keyboard-active",
                index ===
                officeSearchActiveIndex
            );

        }
    );


    items[
        officeSearchActiveIndex
    ]?.scrollIntoView(
        {
            block:
                "nearest"
        }
    );

}


/* =========================================================
   SEARCH STYLES
========================================================= */

function injectOfficeSearchStyles() {

    if (
        document.getElementById(
            "officeGlobalSearchStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "officeGlobalSearchStyles";


    style.textContent = `

        .office-global-search-dropdown {

            position: fixed;

            z-index: 99999;

            display: none;

            max-height: 520px;

            overflow: hidden;

            border:
                1px solid
                rgba(148, 163, 184, 0.16);

            border-radius: 16px;

            background:
                rgba(9, 12, 20, 0.98);

            box-shadow:
                0 24px 60px
                rgba(0, 0, 0, 0.45);

            color: #ffffff;

        }


        .office-global-search-dropdown.active {

            display: block;

        }


        .office-search-header {

            padding: 13px 14px;

            display: flex;

            justify-content: space-between;

            align-items: center;

            border-bottom:
                1px solid
                rgba(148, 163, 184, 0.12);

        }


        .office-search-header span {

            display: block;

            color: #64748b;

            font-size: 9px;

            text-transform: uppercase;

        }


        .office-search-header strong {

            display: block;

            margin-top: 2px;

            font-size: 12px;

        }


        .office-search-header small {

            color: #64748b;

            font-size: 9px;

        }


        .office-search-results {

            max-height: 440px;

            overflow-y: auto;

            padding: 7px;

        }


        .office-search-result {

            width: 100%;

            min-height: 64px;

            padding: 9px;

            border: none;

            border-radius: 11px;

            display: grid;

            grid-template-columns:
                36px
                minmax(0, 1fr)
                18px;

            align-items: center;

            gap: 10px;

            background:
                transparent;

            color: #ffffff;

            text-align: left;

            cursor: pointer;

        }


        .office-search-result:hover,
        .office-search-result.keyboard-active {

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.12
                );

        }


        .office-search-icon {

            width: 36px;

            height: 36px;

            border-radius: 10px;

            display: grid;

            place-items: center;

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.12
                );

            color: #60a5fa;

            font-size: 17px;

        }


        .office-search-copy {

            min-width: 0;

        }


        .office-search-copy small,
        .office-search-copy strong,
        .office-search-copy span {

            display: block;

            overflow: hidden;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;

        }


        .office-search-copy small {

            color: #60a5fa;

            font-size: 8px;

            text-transform:
                uppercase;

        }


        .office-search-copy strong {

            margin-top: 2px;

            font-size: 11px;

        }


        .office-search-copy span {

            margin-top: 3px;

            color: #94a3b8;

            font-size: 9px;

        }


        .office-search-state {

            min-height: 82px;

            padding: 16px;

            display: flex;

            align-items: center;

            gap: 11px;

        }


        .office-search-state > i {

            width: 35px;

            height: 35px;

            border-radius: 10px;

            display: grid;

            place-items: center;

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.12
                );

            color: #60a5fa;

            font-size: 17px;

        }


        .office-search-state strong,
        .office-search-state small {

            display: block;

        }


        .office-search-state strong {

            font-size: 11px;

        }


        .office-search-state small {

            margin-top: 3px;

            color: #94a3b8;

            font-size: 9px;

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toastContainer =
    document.getElementById(
        "toastContainer"
    );


    if (!toastContainer) {

        return;

    }


    const toastIcons = {

        success:
        "bx-check-circle",

        warning:
        "bx-error",

        error:
        "bx-x-circle",

        info:
        "bx-info-circle"

    };


    const toastTitles = {

        success:
        "Success",

        warning:
        "Notice",

        error:
        "Error",

        info:
        "Information"

    };


    const toast =
    document.createElement(
        "div"
    );


    toast.className =
    `toast toast-${type}`;


    toast.innerHTML = `

        <div class="toast-icon">

            <i class="bx ${toastIcons[type] || toastIcons.info}"></i>

        </div>


        <div class="toast-content">

            <strong>
                ${toastTitles[type] || toastTitles.info}
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>


        <button
            type="button"
            class="toast-close"
            aria-label="Close notification"
        >

            <i class="bx bx-x"></i>

        </button>

    `;


    toastContainer.appendChild(
        toast
    );


    requestAnimationFrame(
        function () {

            toast.classList.add(
                "show"
            );

        }
    );


    function removeToast() {

        toast.classList.remove(
            "show"
        );


        setTimeout(
            function () {

                toast.remove();

            },
            300
        );

    }


    toast
    .querySelector(
        ".toast-close"
    )
    ?.addEventListener(
        "click",
        removeToast
    );


    setTimeout(
        removeToast,
        3500
    );

}


/* =========================================================
   HELPERS
========================================================= */

function setTextContent(
    elementId,
    value
) {

    const element =
    document.getElementById(
        elementId
    );


    if (element) {

        element.textContent =
        value;

    }

}


function escapeHTML(value) {

    const temporaryElement =
    document.createElement(
        "div"
    );


    temporaryElement.textContent =
    String(value ?? "");


    return temporaryElement.innerHTML;

}