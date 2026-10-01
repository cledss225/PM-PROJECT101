/* =========================================================
   ALUMNIHUB ADMIN GLOBAL HEADER
   Notifications • Help • Profile Menu
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* =====================================================
   SIDEBAR MENU TOGGLE
   Desktop: expanded <-> mini icon sidebar
   Mobile: off-canvas drawer
===================================================== */

const menuButton =
    document.querySelector(".topbar-menu-button");

const dashboardShell =
    document.querySelector(".dashboard-shell");


if (menuButton && dashboardShell) {

    menuButton.addEventListener(
        "click",
        () => {

            if (window.innerWidth <= 900) {

                document.body.classList.toggle(
                    "sidebar-open"
                );

            } else {

                dashboardShell.classList.toggle(
                    "sidebar-collapsed"
                );

                localStorage.setItem(
                    "adminSidebarCollapsed",
                    dashboardShell.classList.contains(
                        "sidebar-collapsed"
                    )
                        ? "true"
                        : "false"
                );

            }

        }
    );


    /* Restore desktop sidebar preference */
    if (
        window.innerWidth > 900 &&
        localStorage.getItem(
            "adminSidebarCollapsed"
        ) === "true"
    ) {

        dashboardShell.classList.add(
            "sidebar-collapsed"
        );

    }

}


/* Add tooltip labels automatically */
document
    .querySelectorAll(
        ".menu a, .support-link"
    )
    .forEach(link => {

        const label =
            link.querySelector("span")
                ?.textContent
                ?.trim();

        if (label) {
            link.dataset.label = label;
        }

    });


/* =====================================================
   GLOBAL SYSTEM SEARCH
   Searches Alumni, Approvals, Events, Jobs, Announcements
===================================================== */

const sidebarSearch =
    document.querySelector(".sidebar-search");

const sidebarSearchInput =
    sidebarSearch?.querySelector("input");

let globalSearchTimer = null;
let globalSearchRequest = null;
let activeGlobalSearchIndex = -1;


const globalSearchDropdown =
    document.createElement("div");

globalSearchDropdown.className =
    "global-search-dropdown";

globalSearchDropdown.setAttribute(
    "aria-live",
    "polite"
);

document.body.appendChild(
    globalSearchDropdown
);


if (
    sidebarSearch &&
    sidebarSearchInput &&
    dashboardShell
) {

    sidebarSearchInput.placeholder =
        "Search...";


    /* ------------------------------------------
       Click search icon while collapsed
       -> expand sidebar -> focus input
    ------------------------------------------ */

    sidebarSearch.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth > 900 &&
                dashboardShell.classList.contains(
                    "sidebar-collapsed"
                )
            ) {

                dashboardShell.classList.remove(
                    "sidebar-collapsed"
                );

                localStorage.setItem(
                    "adminSidebarCollapsed",
                    "false"
                );

                setTimeout(
                    () => {

                        sidebarSearchInput.focus();
                        positionGlobalSearchDropdown();

                    },
                    180
                );

            }

        }
    );


    /* ------------------------------------------
       Ctrl + K / Cmd + K
    ------------------------------------------ */

    document.addEventListener(
        "keydown",
        event => {

            const shortcutPressed =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k";


            if (!shortcutPressed) {
                return;
            }


            event.preventDefault();


            if (
                window.innerWidth > 900 &&
                dashboardShell.classList.contains(
                    "sidebar-collapsed"
                )
            ) {

                dashboardShell.classList.remove(
                    "sidebar-collapsed"
                );

                localStorage.setItem(
                    "adminSidebarCollapsed",
                    "false"
                );

            }


            setTimeout(
                () => {

                    sidebarSearchInput.focus();
                    sidebarSearchInput.select();

                    if (
                        sidebarSearchInput.value
                            .trim()
                            .length >= 2
                    ) {

                        globalSearchDropdown.classList.add(
                            "show"
                        );

                        positionGlobalSearchDropdown();

                    }

                },
                180
            );

        }
    );


    /* ------------------------------------------
       Search as user types
    ------------------------------------------ */

    sidebarSearchInput.addEventListener(
        "input",
        () => {

            const query =
                sidebarSearchInput.value.trim();


            activeGlobalSearchIndex = -1;


            clearTimeout(
                globalSearchTimer
            );


            if (query.length < 2) {

                hideGlobalSearchDropdown();

                return;

            }


            globalSearchTimer =
                setTimeout(
                    () => {

                        runGlobalSystemSearch(
                            query
                        );

                    },
                    260
                );

        }
    );


    /* ------------------------------------------
       Keyboard navigation
    ------------------------------------------ */

    sidebarSearchInput.addEventListener(
        "keydown",
        event => {

            const items =
                Array.from(
                    globalSearchDropdown
                        .querySelectorAll(
                            ".global-search-result"
                        )
                );


            if (event.key === "Escape") {

                event.preventDefault();

                sidebarSearchInput.value = "";

                hideGlobalSearchDropdown();

                sidebarSearchInput.blur();

                return;

            }


            if (!items.length) {
                return;
            }


            if (event.key === "ArrowDown") {

                event.preventDefault();

                activeGlobalSearchIndex =
                    Math.min(
                        activeGlobalSearchIndex + 1,
                        items.length - 1
                    );

                updateGlobalSearchKeyboardState(
                    items
                );

            }


            if (event.key === "ArrowUp") {

                event.preventDefault();

                activeGlobalSearchIndex =
                    Math.max(
                        activeGlobalSearchIndex - 1,
                        0
                    );

                updateGlobalSearchKeyboardState(
                    items
                );

            }


            if (
                event.key === "Enter" &&
                activeGlobalSearchIndex >= 0
            ) {

                event.preventDefault();

                items[
                    activeGlobalSearchIndex
                ].click();

            }

        }
    );


    sidebarSearchInput.addEventListener(
        "focus",
        () => {

            if (
                sidebarSearchInput.value
                    .trim()
                    .length >= 2 &&
                globalSearchDropdown
                    .children
                    .length
            ) {

                globalSearchDropdown.classList.add(
                    "show"
                );

                positionGlobalSearchDropdown();

            }

        }
    );

}


/* =====================================================
   EXECUTE GLOBAL SEARCH
===================================================== */

async function runGlobalSystemSearch(query) {

    const token =
        localStorage.getItem("token");


    /*
     * Always search the links that actually exist
     * in the CURRENT sidebar first.
     *
     * This automatically makes the feature work
     * on Admin, Alumni Office, and Alumni pages
     * without hard-coding every role's menu.
     */
    const navigationResults =
        getSidebarNavigationResults(
            query
        );


    /*
     * If there is no token, navigation search can
     * still show matching sidebar destinations.
     */
    if (!token) {

        if (navigationResults.length) {

            renderGlobalSearchResults(
                navigationResults,
                query
            );

        } else {

            renderGlobalSearchMessage(
                "Session expired. Please log in again.",
                "bx-lock-alt"
            );

        }

        return;

    }


    if (globalSearchRequest) {

        globalSearchRequest.abort();

    }


    globalSearchRequest =
        new AbortController();


    renderGlobalSearchLoading();

    positionGlobalSearchDropdown();


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
                        globalSearchRequest.signal
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to search."
            );

        }


        const databaseResults =
            Array.isArray(data.results)
                ? data.results
                : [];


        /*
         * Navigation results come first,
         * followed by matching database records.
         */
        const combinedResults =
            removeDuplicateGlobalSearchResults(
                [
                    ...navigationResults,
                    ...databaseResults
                ]
            );


        renderGlobalSearchResults(
            combinedResults,
            query
        );


    } catch (error) {

        if (
            error.name === "AbortError"
        ) {
            return;
        }


        console.error(
            "GLOBAL SEARCH FRONTEND ERROR:",
            error
        );


        /*
         * If the API has a temporary problem,
         * sidebar navigation should still work.
         */
        if (navigationResults.length) {

            renderGlobalSearchResults(
                navigationResults,
                query
            );

            return;

        }


        renderGlobalSearchMessage(
            "Unable to load search results.",
            "bx-error-circle"
        );

    }

}


/* =====================================================
   SIDEBAR NAVIGATION SEARCH
   Automatically reads the CURRENT portal sidebar.
===================================================== */

function getSidebarNavigationResults(query) {

    const normalizedQuery =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {
        return [];
    }


    const links =
        Array.from(
            document.querySelectorAll(
                ".sidebar .menu a, .sidebar .support-link"
            )
        );


    return links
        .map(link => {

            const label =
                link.querySelector("span")
                    ?.textContent
                    ?.trim() ||
                link.textContent
                    ?.trim() ||
                "";


            const href =
                link.getAttribute("href") ||
                "";


            const iconElement =
                link.querySelector("i");


            const iconClass =
                Array.from(
                    iconElement?.classList || []
                )
                    .find(
                        className =>
                            className.startsWith("bx-")
                    ) ||
                "bx-link";


            const keywords =
                getNavigationSearchKeywords(
                    label
                );


            const searchableText =
                [
                    label,
                    ...keywords
                ]
                    .join(" ")
                    .toLowerCase();


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

                icon:
                    iconClass,

                _matches:
                    Boolean(href) &&
                    searchableText.includes(
                        normalizedQuery
                    )

            };

        })
        .filter(
            result =>
                result._matches
        )
        .map(
            ({
                _matches,
                ...result
            }) => result
        );

}


/* =====================================================
   NAVIGATION SEARCH ALIASES
===================================================== */

function getNavigationSearchKeywords(label) {

    const key =
        String(label || "")
            .trim()
            .toLowerCase();


    const aliases = {

        "overview": [
            "dashboard",
            "home",
            "summary"
        ],

        "alumni directory": [
            "alumni",
            "graduates",
            "records",
            "directory"
        ],

        "alumni records": [
            "alumni",
            "graduates",
            "records",
            "directory"
        ],

        "account approvals": [
            "approval",
            "approvals",
            "verify",
            "verification",
            "pending",
            "accounts"
        ],

        "account verification": [
            "approval",
            "verify",
            "verification",
            "pending",
            "accounts"
        ],

        "my profile": [
            "profile",
            "account",
            "personal"
        ],

        "events": [
            "event",
            "activities",
            "calendar"
        ],

        "jobs": [
            "job",
            "career",
            "employment",
            "opportunities"
        ],

        "job opportunities": [
            "job",
            "career",
            "employment",
            "opportunities"
        ],

        "announcements": [
            "announcement",
            "news",
            "updates",
            "notice"
        ],

        "reports": [
            "report",
            "analytics",
            "statistics",
            "data"
        ],

        "settings": [
            "setting",
            "settings",
            "preferences",
            "configuration"
        ]

    };


    return aliases[key] || [];

}


/* =====================================================
   REMOVE DUPLICATE SEARCH RESULTS
===================================================== */

function removeDuplicateGlobalSearchResults(
    results
) {

    const seen =
        new Set();


    return results.filter(
        result => {

            const key =
                [
                    result.type || "",
                    result.section || "",
                    result.title || "",
                    result.url || ""
                ]
                    .join("|")
                    .toLowerCase();


            if (seen.has(key)) {
                return false;
            }


            seen.add(key);

            return true;

        }
    );

}


/* =====================================================
   RENDER GLOBAL RESULTS
===================================================== */

function renderGlobalSearchResults(
    results,
    query
) {

    activeGlobalSearchIndex = -1;


    if (!results.length) {

        renderGlobalSearchMessage(
            `No results found for "${query}".`,
            "bx-search-alt"
        );

        return;

    }


    const safeResults =
        results.slice(0, 20);


    globalSearchDropdown.innerHTML = `

        <div class="global-search-header">

            <div>
                <span>
                    Global Search
                </span>

                <strong>
                    ${safeResults.length}
                    ${safeResults.length === 1
                        ? "result"
                        : "results"}
                </strong>
            </div>

            <small>
                Enter to open
            </small>

        </div>


        <div class="global-search-list">

            ${safeResults
                .map(
                    (result, index) => {

                        const icon =
                            result.icon ||
                            "bx-search";

                        return `

                            <button
                                type="button"
                                class="global-search-result"
                                data-search-index="${index}"
                                data-search-url="${escapeGlobalSearchHtml(
                                    result.url || ""
                                )}"
                            >

                                <span class="global-search-result-icon">

                                    <i class="bx ${escapeGlobalSearchHtml(
                                        icon
                                    )}"></i>

                                </span>


                                <span class="global-search-result-copy">

                                    <span class="global-search-result-section">
                                        ${escapeGlobalSearchHtml(
                                            result.section ||
                                            "Search Result"
                                        )}
                                    </span>

                                    <strong>
                                        ${highlightGlobalSearchText(
                                            result.title ||
                                            "Untitled",
                                            query
                                        )}
                                    </strong>

                                    <small>
                                        ${highlightGlobalSearchText(
                                            result.description ||
                                            "",
                                            query
                                        )}
                                    </small>

                                </span>


                                <i class="bx bx-chevron-right global-search-result-arrow"></i>

                            </button>

                        `;

                    }
                )
                .join("")}

        </div>

    `;


    globalSearchDropdown
        .querySelectorAll(
            ".global-search-result"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetUrl =
                        button.dataset.searchUrl;


                    if (!targetUrl) {
                        return;
                    }


                    window.location.href =
                        resolveGlobalSearchUrl(
                            targetUrl
                        );

                }
            );

        });


    globalSearchDropdown.classList.add(
        "show"
    );

    positionGlobalSearchDropdown();

}


/* =====================================================
   SEARCH STATES
===================================================== */

function renderGlobalSearchLoading() {

    globalSearchDropdown.innerHTML = `

        <div class="global-search-state">

            <span class="global-search-spinner"></span>

            <div>
                <strong>Searching AlumniHub...</strong>
                <small>Checking matching system records</small>
            </div>

        </div>

    `;


    globalSearchDropdown.classList.add(
        "show"
    );

}


function renderGlobalSearchMessage(
    message,
    icon
) {

    globalSearchDropdown.innerHTML = `

        <div class="global-search-state">

            <span class="global-search-empty-icon">

                <i class="bx ${icon}"></i>

            </span>

            <div>
                <strong>
                    ${escapeGlobalSearchHtml(
                        message
                    )}
                </strong>

                <small>
                    Try another keyword.
                </small>
            </div>

        </div>

    `;


    globalSearchDropdown.classList.add(
        "show"
    );

    positionGlobalSearchDropdown();

}


/* =====================================================
   POSITION + CLOSE
===================================================== */

function positionGlobalSearchDropdown() {

    if (
        !sidebarSearch ||
        !globalSearchDropdown
            .classList
            .contains("show")
    ) {
        return;
    }


    const rect =
        sidebarSearch
            .getBoundingClientRect();


    const width =
        Math.min(
            390,
            window.innerWidth - 24
        );


    let left =
        rect.left;


    if (
        left + width >
        window.innerWidth - 12
    ) {

        left =
            window.innerWidth -
            width -
            12;

    }


    globalSearchDropdown.style.width =
        `${width}px`;

    globalSearchDropdown.style.left =
        `${Math.max(12, left)}px`;

    globalSearchDropdown.style.top =
        `${rect.bottom + 8}px`;

}


function hideGlobalSearchDropdown() {

    globalSearchDropdown.classList.remove(
        "show"
    );

    globalSearchDropdown.innerHTML = "";

    activeGlobalSearchIndex = -1;

}


/* Close search when clicking elsewhere */

document.addEventListener(
    "click",
    event => {

        if (
            sidebarSearch?.contains(
                event.target
            ) ||
            globalSearchDropdown.contains(
                event.target
            )
        ) {
            return;
        }


        hideGlobalSearchDropdown();

    }
);


window.addEventListener(
    "resize",
    positionGlobalSearchDropdown
);


window.addEventListener(
    "scroll",
    positionGlobalSearchDropdown,
    true
);


/* =====================================================
   KEYBOARD STATE
===================================================== */

function updateGlobalSearchKeyboardState(
    items
) {

    items.forEach(
        (item, index) => {

            item.classList.toggle(
                "keyboard-active",
                index ===
                    activeGlobalSearchIndex
            );

        }
    );


    items[
        activeGlobalSearchIndex
    ]?.scrollIntoView(
        {
            block: "nearest"
        }
    );

}


/* =====================================================
   URL RESOLVER
   Keeps Admin results working in /pages/.
   Also prepares role-specific portal paths.
===================================================== */

function resolveGlobalSearchUrl(url) {

    if (
        /^https?:\/\//i.test(url)
    ) {
        return url;
    }


    const currentPath =
        window.location.pathname
            .toLowerCase();


    const user =
        getStoredGlobalSearchUser();


    const roleId =
        Number(
            user?.role_id
        );


    /*
     * Admin pages already use the filenames
     * returned by the API.
     */
    if (
        roleId === 1 ||
        currentPath.includes("/pages/")
    ) {

        return url;

    }


    /*
     * For Office/Alumni, keep same-folder URLs.
     * Specific filename mapping can be extended
     * later if those portals use different names.
     */
    return url;

}


function getStoredGlobalSearchUser() {

    try {

        return JSON.parse(
            localStorage.getItem("user") ||
            "null"
        );

    } catch {

        return null;

    }

}


/* =====================================================
   SAFE HTML + HIGHLIGHT
===================================================== */

function escapeGlobalSearchHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeGlobalSearchRegex(value) {

    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

}


function highlightGlobalSearchText(
    value,
    query
) {

    const safeValue =
        escapeGlobalSearchHtml(
            value
        );


    if (!query) {
        return safeValue;
    }


    const safeQuery =
        escapeGlobalSearchRegex(
            escapeGlobalSearchHtml(
                query
            )
        );


    return safeValue.replace(
        new RegExp(
            `(${safeQuery})`,
            "ig"
        ),
        "<mark>$1</mark>"
    );

}


window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 900) {

            document.body.classList.remove(
                "sidebar-open"
            );

        }

    }
);


    /* =====================================================
       FIND EXISTING TOPBAR ELEMENTS
    ===================================================== */

    const topbarActions =
        document.querySelector(".topbar-actions");

    if (!topbarActions) {
        return;
    }


    const buttons =
        topbarActions.querySelectorAll(".topbar-icon");


    let notificationButton =
        topbarActions.querySelector(
            ".notification-button"
        );


    /*
       Some Admin pages currently do not have the
       notification-button class.

       Theme is normally the first icon button.
       Notification is normally the second.
       Help is normally the third.
    */

    if (!notificationButton && buttons.length >= 2) {

        notificationButton = buttons[1];

        notificationButton.classList.add(
            "notification-button"
        );

    }


    let helpButton =
        topbarActions.querySelector(
            '[aria-label="Help"]'
        );


    if (!helpButton && buttons.length >= 3) {

        helpButton = buttons[2];

        helpButton.setAttribute(
            "aria-label",
            "Help"
        );

    }


    const avatar =
        topbarActions.querySelector(
            ".topbar-avatar"
        );


    /* =====================================================
       PREPARE BUTTONS
    ===================================================== */

    if (notificationButton) {

        notificationButton.id =
            "adminNotificationButton";

        notificationButton.setAttribute(
            "title",
            "Notifications"
        );

        notificationButton.setAttribute(
            "aria-label",
            "Notifications"
        );

        notificationButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if (helpButton) {

        helpButton.id =
            "adminHelpButton";

        helpButton.setAttribute(
            "title",
            "Help & Support"
        );

        helpButton.setAttribute(
            "aria-label",
            "Help & Support"
        );

    }


    if (avatar) {

        avatar.id =
            "adminProfileButton";

        avatar.setAttribute(
            "role",
            "button"
        );

        avatar.setAttribute(
            "tabindex",
            "0"
        );

        avatar.setAttribute(
            "title",
            "Account menu"
        );

        avatar.setAttribute(
            "aria-label",
            "Open account menu"
        );

        avatar.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    /* =====================================================
       CREATE HEADER UI
    ===================================================== */

    createAdminHeaderStyles();

    const notificationDropdown =
        createNotificationDropdown();

    const profileDropdown =
        createProfileDropdown();

    const helpModal =
        createHelpModal();


    document.body.appendChild(
        notificationDropdown
    );

    document.body.appendChild(
        profileDropdown
    );

    document.body.appendChild(
        helpModal
    );


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const shouldOpen =
                    !notificationDropdown
                        .classList
                        .contains("show");

                closeHeaderMenus();

                if (shouldOpen) {

                    positionDropdown(
                        notificationButton,
                        notificationDropdown
                    );

                    notificationDropdown
                        .classList
                        .add("show");

                    notificationButton
                        .setAttribute(
                            "aria-expanded",
                            "true"
                        );

                }

            }
        );

    }


    /* =====================================================
       PROFILE MENU
    ===================================================== */

    if (avatar) {

        const toggleProfileMenu = event => {

            event.stopPropagation();

            const shouldOpen =
                !profileDropdown
                    .classList
                    .contains("show");

            closeHeaderMenus();

            if (shouldOpen) {

                positionDropdown(
                    avatar,
                    profileDropdown
                );

                profileDropdown
                    .classList
                    .add("show");

                avatar.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        };


        avatar.addEventListener(
            "click",
            toggleProfileMenu
        );


        avatar.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    toggleProfileMenu(event);

                }

            }
        );

    }


    /* =====================================================
       HELP MODAL
    ===================================================== */

    if (helpButton) {

        helpButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                closeHeaderMenus();

                helpModal.classList.add(
                    "show"
                );

                document.body.classList.add(
                    "admin-modal-open"
                );

            }
        );

    }


    /* =====================================================
       CLOSE HELP
    ===================================================== */

    helpModal
        .querySelectorAll(
            "[data-close-admin-help]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeHelpModal();

                }
            );

        });


    /* =====================================================
       PROFILE LINKS
    ===================================================== */

    const profileLink =
        profileDropdown.querySelector(
            "#adminGoToProfile"
        );

    const settingsLink =
        profileDropdown.querySelector(
            "#adminGoToSettings"
        );

    const logoutButton =
        profileDropdown.querySelector(
            "#adminHeaderLogout"
        );


    profileLink?.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile.html";

        }
    );


    settingsLink?.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html";

        }
    );


    logoutButton?.addEventListener(
        "click",
        () => {

            performAdminLogout();

        }
    );


    /* =====================================================
       MARK ALL NOTIFICATIONS AS READ
    ===================================================== */

    const markReadButton =
        notificationDropdown.querySelector(
            "#markAllAdminNotifications"
        );


    markReadButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            notificationDropdown
                .querySelectorAll(
                    ".admin-notification-item.unread"
                )
                .forEach(item => {

                    item.classList.remove(
                        "unread"
                    );

                });


            document
                .querySelectorAll(
                    ".notification-dot"
                )
                .forEach(dot => {

                    dot.style.display =
                        "none";

                });


            markReadButton.textContent =
                "All caught up";

        }
    );


    /* =====================================================
       GLOBAL CLICK
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                !notificationDropdown
                    .contains(event.target) &&
                !profileDropdown
                    .contains(event.target)
            ) {

                closeHeaderMenus();

            }

        }
    );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeHeaderMenus();
            closeHelpModal();

        }
    );


    /* =====================================================
       WINDOW RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        closeHeaderMenus
    );


    /* =====================================================
       LOAD CURRENT USER
    ===================================================== */

    loadAdminHeaderUser();


    /* =====================================================
       FUNCTIONS
    ===================================================== */

    function closeHeaderMenus() {

        notificationDropdown
            .classList
            .remove("show");

        profileDropdown
            .classList
            .remove("show");


        notificationButton
            ?.setAttribute(
                "aria-expanded",
                "false"
            );

        avatar
            ?.setAttribute(
                "aria-expanded",
                "false"
            );

    }


    function closeHelpModal() {

        helpModal.classList.remove(
            "show"
        );

        document.body.classList.remove(
            "admin-modal-open"
        );

    }

});


/* =========================================================
   POSITION DROPDOWN
========================================================= */

function positionDropdown(
    trigger,
    dropdown
) {

    const rect =
        trigger.getBoundingClientRect();


    const dropdownWidth =
        Math.min(
            360,
            window.innerWidth - 24
        );


    let left =
        rect.right -
        dropdownWidth;


    if (left < 12) {
        left = 12;
    }


    dropdown.style.width =
        `${dropdownWidth}px`;

    dropdown.style.left =
        `${left}px`;

    dropdown.style.top =
        `${rect.bottom + 12}px`;

}


/* =========================================================
   CREATE NOTIFICATION DROPDOWN
========================================================= */

function createNotificationDropdown() {

    const dropdown =
        document.createElement("div");


    dropdown.className =
        "admin-header-dropdown admin-notification-dropdown";


    dropdown.innerHTML = `

        <div class="admin-dropdown-header">

            <div>

                <span class="admin-dropdown-eyebrow">
                    AlumniHub
                </span>

                <h3>
                    Notifications
                </h3>

            </div>

            <button
                id="markAllAdminNotifications"
                type="button"
            >
                Mark all read
            </button>

        </div>


        <div class="admin-notification-list">

            <div class="admin-notification-item unread">

                <div class="admin-notification-icon">
                    <i class="bx bx-user-plus"></i>
                </div>

                <div>

                    <strong>
                        New alumni registration
                    </strong>

                    <p>
                        A new alumni account may require review.
                    </p>

                    <small>
                        Account Management
                    </small>

                </div>

            </div>


            <div class="admin-notification-item unread">

                <div class="admin-notification-icon">
                    <i class="bx bx-calendar-event"></i>
                </div>

                <div>

                    <strong>
                        Events Center
                    </strong>

                    <p>
                        Review your latest alumni events and activities.
                    </p>

                    <small>
                        Events
                    </small>

                </div>

            </div>


            <div class="admin-notification-item">

                <div class="admin-notification-icon">
                    <i class="bx bx-bar-chart-alt-2"></i>
                </div>

                <div>

                    <strong>
                        Reports available
                    </strong>

                    <p>
                        Alumni statistics are available in Reports.
                    </p>

                    <small>
                        Reports
                    </small>

                </div>

            </div>

        </div>


        <button
            class="admin-dropdown-footer"
            type="button"
            onclick="window.location.href='account-approvals.html'"
        >
            View Account Approvals

            <i class="bx bx-right-arrow-alt"></i>
        </button>

    `;


    return dropdown;

}


/* =========================================================
   CREATE PROFILE DROPDOWN
========================================================= */

function createProfileDropdown() {

    const dropdown =
        document.createElement("div");


    dropdown.className =
        "admin-header-dropdown admin-profile-dropdown";


    dropdown.innerHTML = `

        <div class="admin-profile-summary">

            <div
                class="admin-profile-large-avatar"
                id="adminDropdownAvatar"
            >
                A
            </div>

            <div>

                <strong
                    id="adminDropdownName"
                >
                    Administrator
                </strong>

                <span
                    id="adminDropdownEmail"
                >
                    Admin Account
                </span>

            </div>

        </div>


        <div class="admin-profile-menu">

            <button
                id="adminGoToProfile"
                type="button"
            >
                <i class="bx bx-user"></i>

                <span>
                    My Profile
                </span>
            </button>


            <button
                id="adminGoToSettings"
                type="button"
            >
                <i class="bx bx-cog"></i>

                <span>
                    Settings
                </span>
            </button>


            <div class="admin-profile-divider"></div>


            <button
                id="adminHeaderLogout"
                class="danger"
                type="button"
            >
                <i class="bx bx-log-out"></i>

                <span>
                    Logout
                </span>
            </button>

        </div>

    `;


    return dropdown;

}


/* =========================================================
   CREATE HELP MODAL
========================================================= */

function createHelpModal() {

    const modal =
        document.createElement("div");


    modal.className =
        "admin-help-overlay";


    modal.innerHTML = `

        <div
            class="admin-help-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Help and Support"
        >

            <div class="admin-help-header">

                <div>

                    <span>
                        AlumniHub
                    </span>

                    <h2>
                        Help & Support
                    </h2>

                </div>

                <button
                    type="button"
                    data-close-admin-help
                    aria-label="Close help"
                >
                    <i class="bx bx-x"></i>
                </button>

            </div>


            <p class="admin-help-intro">

                Quick access to the main
                Administrator tools.

            </p>


            <div class="admin-help-grid">

                <a href="alumni-directory.html">

                    <i class="bx bx-group"></i>

                    <div>
                        <strong>
                            Alumni Directory
                        </strong>

                        <span>
                            View and manage alumni records.
                        </span>
                    </div>

                </a>


                <a href="account-approvals.html">

                    <i class="bx bx-user-check"></i>

                    <div>
                        <strong>
                            Account Approvals
                        </strong>

                        <span>
                            Review pending alumni accounts.
                        </span>
                    </div>

                </a>


                <a href="events.html">

                    <i class="bx bx-calendar-event"></i>

                    <div>
                        <strong>
                            Events
                        </strong>

                        <span>
                            Manage alumni events.
                        </span>
                    </div>

                </a>


                <a href="jobs.html">

                    <i class="bx bx-briefcase"></i>

                    <div>
                        <strong>
                            Jobs
                        </strong>

                        <span>
                            Manage job opportunities.
                        </span>
                    </div>

                </a>


                <a href="announcements.html">

                    <i class="bx bx-volume-full"></i>

                    <div>
                        <strong>
                            Announcements
                        </strong>

                        <span>
                            Publish community updates.
                        </span>
                    </div>

                </a>


                <a href="reports.html">

                    <i class="bx bx-bar-chart-alt-2"></i>

                    <div>
                        <strong>
                            Reports
                        </strong>

                        <span>
                            Review alumni statistics.
                        </span>
                    </div>

                </a>

            </div>


            <div class="admin-help-footer">

                <i class="bx bx-info-circle"></i>

                <span>
                    For account and system configuration,
                    open Settings.
                </span>

                <a href="settings.html">
                    Open Settings
                </a>

            </div>

        </div>

    `;


    return modal;

}


/* =========================================================
   LOAD CURRENT ADMIN USER
========================================================= */

async function loadAdminHeaderUser() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const user =
            data.user;


        if (!user) {
            return;
        }


        const firstName =
            user.first_name || "";


        const lastName =
            user.last_name || "";


        const fullName =
            `${firstName} ${lastName}`
                .trim() ||
            "Administrator";


        const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`
                .toUpperCase() ||
            "A";


        document
            .querySelectorAll(
                ".topbar-avatar"
            )
            .forEach(element => {

                element.textContent =
                    initials;

            });


        const dropdownAvatar =
            document.getElementById(
                "adminDropdownAvatar"
            );


        const dropdownName =
            document.getElementById(
                "adminDropdownName"
            );


        const dropdownEmail =
            document.getElementById(
                "adminDropdownEmail"
            );


        if (dropdownAvatar) {

            dropdownAvatar.textContent =
                initials;

        }


        if (dropdownName) {

            dropdownName.textContent =
                fullName;

        }


        if (dropdownEmail) {

            dropdownEmail.textContent =
                user.email ||
                "Administrator";

        }


    } catch (error) {

        console.error(
            "ADMIN HEADER USER ERROR:",
            error
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function performAdminLogout() {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   GLOBAL ADMIN HEADER CSS
   Injected so we do not need to duplicate CSS per page.
========================================================= */

function createAdminHeaderStyles() {

    if (
        document.getElementById(
            "adminHeaderGlobalStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "adminHeaderGlobalStyles";


    style.textContent = `
                .topbar-avatar {
            cursor: pointer;
            user-select: none;
        }


        .admin-header-dropdown {
            position: fixed;
            z-index: 99999;

            display: none;

            background: #ffffff;
            color: #111827;

            border: 1px solid rgba(15, 23, 42, 0.10);
            border-radius: 18px;

            box-shadow:
                0 20px 60px rgba(15, 23, 42, 0.18);

            overflow: hidden;
        }


        .admin-header-dropdown.show {
            display: block;

            animation:
                adminHeaderDropdownIn
                0.18s ease;
        }


        @keyframes adminHeaderDropdownIn {

            from {
                opacity: 0;
                transform: translateY(-6px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }

        }


        .admin-dropdown-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;

            padding: 18px 18px 14px;
        }


        .admin-dropdown-eyebrow {
            display: block;

            margin-bottom: 2px;

            font-size: 11px;
            font-weight: 700;

            text-transform: uppercase;
            letter-spacing: 0.08em;

            color: #6366f1;
        }


        .admin-dropdown-header h3 {
            margin: 0;

            font-size: 17px;
            font-weight: 700;
        }


        .admin-dropdown-header button {
            border: 0;
            background: transparent;

            color: #6366f1;

            font-family: inherit;
            font-size: 12px;
            font-weight: 600;

            cursor: pointer;
        }


        .admin-notification-list {
            max-height: 360px;
            overflow-y: auto;
        }


        .admin-notification-item {
            position: relative;

            display: grid;
            grid-template-columns: 42px 1fr;
            gap: 12px;

            padding: 14px 18px;

            border-top:
                1px solid rgba(15, 23, 42, 0.06);
        }


        .admin-notification-item.unread {
            background:
                rgba(99, 102, 241, 0.06);
        }


        .admin-notification-item.unread::after {
            content: "";

            position: absolute;
            right: 14px;
            top: 18px;

            width: 7px;
            height: 7px;

            border-radius: 50%;

            background: #6366f1;
        }


        .admin-notification-icon {
            width: 42px;
            height: 42px;

            display: grid;
            place-items: center;

            border-radius: 12px;

            background:
                rgba(99, 102, 241, 0.10);

            color: #6366f1;

            font-size: 20px;
        }


        .admin-notification-item strong {
            display: block;

            padding-right: 12px;

            font-size: 13px;
        }


        .admin-notification-item p {
            margin: 4px 0;

            color: #6b7280;

            font-size: 12px;
            line-height: 1.5;
        }


        .admin-notification-item small {
            color: #9ca3af;
            font-size: 11px;
        }


        .admin-dropdown-footer {
            width: 100%;

            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;

            padding: 14px;

            border: 0;
            border-top:
                1px solid rgba(15, 23, 42, 0.08);

            background: transparent;

            color: #6366f1;

            font-family: inherit;
            font-weight: 600;

            cursor: pointer;
        }


        .admin-profile-summary {
            display: flex;
            align-items: center;
            gap: 12px;

            padding: 18px;
        }


        .admin-profile-large-avatar {
            width: 44px;
            height: 44px;

            flex-shrink: 0;

            display: grid;
            place-items: center;

            border-radius: 14px;

            background:
                linear-gradient(
                    135deg,
                    #6366f1,
                    #8b5cf6
                );

            color: white;

            font-weight: 700;
        }


        .admin-profile-summary strong,
        .admin-profile-summary span {
            display: block;
        }


        .admin-profile-summary strong {
            font-size: 13px;
        }


        .admin-profile-summary span {
            margin-top: 2px;

            color: #6b7280;

            font-size: 11px;
        }


        .admin-profile-menu {
            padding: 8px;

            border-top:
                1px solid rgba(15, 23, 42, 0.08);
        }


        .admin-profile-menu button {
            width: 100%;

            display: flex;
            align-items: center;
            gap: 10px;

            padding: 11px 12px;

            border: 0;
            border-radius: 10px;

            background: transparent;

            color: #374151;

            font-family: inherit;
            text-align: left;

            cursor: pointer;
        }


        .admin-profile-menu button:hover {
            background: #f3f4f6;
        }


        .admin-profile-menu button i {
            font-size: 18px;
        }


        .admin-profile-menu button.danger {
            color: #dc2626;
        }


        .admin-profile-divider {
            height: 1px;

            margin: 6px 4px;

            background:
                rgba(15, 23, 42, 0.08);
        }


        .admin-help-overlay {
            position: fixed;
            inset: 0;

            z-index: 100000;

            display: none;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
                rgba(2, 6, 23, 0.64);

            backdrop-filter: blur(8px);
        }


        .admin-help-overlay.show {
            display: flex;
        }


        .admin-help-modal {
            width: min(720px, 100%);
            max-height: 90vh;

            overflow-y: auto;

            padding: 24px;

            border-radius: 24px;

            background: #ffffff;
            color: #111827;

            box-shadow:
                0 30px 90px rgba(0, 0, 0, 0.28);

            animation:
                adminHelpIn
                0.2s ease;
        }


        @keyframes adminHelpIn {

            from {
                opacity: 0;
                transform:
                    translateY(10px)
                    scale(0.98);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }

        }


        .admin-help-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }


        .admin-help-header span {
            color: #6366f1;

            font-size: 11px;
            font-weight: 700;

            text-transform: uppercase;
            letter-spacing: 0.08em;
        }


        .admin-help-header h2 {
            margin: 2px 0 0;

            font-size: 24px;
        }


        .admin-help-header button {
            width: 40px;
            height: 40px;

            display: grid;
            place-items: center;

            border: 0;
            border-radius: 12px;

            background: #f3f4f6;

            color: #111827;

            font-size: 22px;

            cursor: pointer;
        }


        .admin-help-intro {
            margin: 10px 0 20px;

            color: #6b7280;
            font-size: 13px;
        }


        .admin-help-grid {
            display: grid;
            grid-template-columns:
                repeat(2, minmax(0, 1fr));

            gap: 12px;
        }


        .admin-help-grid a {
            display: flex;
            align-items: flex-start;
            gap: 12px;

            padding: 15px;

            border:
                1px solid rgba(15, 23, 42, 0.08);
            border-radius: 14px;

            color: inherit;
            text-decoration: none;

            transition:
                transform 0.18s ease,
                background 0.18s ease;
        }


        .admin-help-grid a:hover {
            transform: translateY(-2px);
            background: #f8fafc;
        }


        .admin-help-grid a > i {
            margin-top: 2px;

            color: #6366f1;
            font-size: 22px;
        }


        .admin-help-grid strong,
        .admin-help-grid span {
            display: block;
        }


        .admin-help-grid strong {
            margin-bottom: 3px;
            font-size: 13px;
        }


        .admin-help-grid span {
            color: #6b7280;

            font-size: 11px;
            line-height: 1.5;
        }


        .admin-help-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            margin-top: 18px;
            padding: 14px;

            border-radius: 14px;

            background: #f8fafc;

            color: #6b7280;

            font-size: 11px;
        }


        .admin-help-footer i {
            color: #6366f1;
            font-size: 17px;
        }


        .admin-help-footer a {
            margin-left: auto;

            color: #6366f1;

            font-weight: 600;
            text-decoration: none;
        }


        .admin-modal-open {
            overflow: hidden;
        }


        body.dark .admin-header-dropdown,
        body.dark-mode .admin-header-dropdown,
        body.dark .admin-help-modal,
        body.dark-mode .admin-help-modal {

            background: #0b0b0f;
            color: #f9fafb;

            border-color:
                rgba(255, 255, 255, 0.09);
        }


        body.dark .admin-notification-item,
        body.dark-mode .admin-notification-item,
        body.dark .admin-profile-menu,
        body.dark-mode .admin-profile-menu {

            border-color:
                rgba(255, 255, 255, 0.07);
        }


        body.dark .admin-notification-item.unread,
        body.dark-mode .admin-notification-item.unread {

            background:
                rgba(99, 102, 241, 0.11);
        }


        body.dark .admin-notification-item p,
        body.dark-mode .admin-notification-item p,
        body.dark .admin-profile-summary span,
        body.dark-mode .admin-profile-summary span,
        body.dark .admin-help-intro,
        body.dark-mode .admin-help-intro,
        body.dark .admin-help-grid span,
        body.dark-mode .admin-help-grid span {

            color: #9ca3af;
        }


        body.dark .admin-profile-menu button,
        body.dark-mode .admin-profile-menu button {

            color: #e5e7eb;
        }


        body.dark .admin-profile-menu button:hover,
        body.dark-mode .admin-profile-menu button:hover,
        body.dark .admin-help-header button,
        body.dark-mode .admin-help-header button,
        body.dark .admin-help-grid a:hover,
        body.dark-mode .admin-help-grid a:hover,
        body.dark .admin-help-footer,
        body.dark-mode .admin-help-footer {

            background: #15151b;
        }


        body.dark .admin-profile-menu button.danger,
        body.dark-mode .admin-profile-menu button.danger {

            color: #f87171;
        }


        body.dark .admin-help-grid a,
        body.dark-mode .admin-help-grid a {

            border-color:
                rgba(255, 255, 255, 0.08);
        }


        @media (max-width: 620px) {

            .admin-help-grid {
                grid-template-columns: 1fr;
            }

            .admin-help-modal {
                padding: 18px;
                border-radius: 18px;
            }

            .admin-help-footer a {
                width: 100%;
                margin-left: 25px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}