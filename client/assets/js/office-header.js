/* =========================================================
   ALUMNIHUB — OFFICE SHARED HEADER / GLOBAL SEARCH
   File: office-header.js
========================================================= */

"use strict";

const officeHeaderToken = localStorage.getItem("token");

let officeHeaderSearchTimer = null;
let officeHeaderSearchController = null;
let officeHeaderSearchIndex = [];
let officeHeaderSearchIndexPromise = null;
let officeHeaderActiveResult = -1;

document.addEventListener("DOMContentLoaded", function () {
    initializeOfficeGlobalSearch();
    initializeOfficeSharedAvatar();
});

function initializeOfficeGlobalSearch() {
    const searchInput = document.getElementById("globalSearch");

    if (!searchInput) return;

    if (searchInput.dataset.officeGlobalSearchReady === "true") return;

    searchInput.dataset.officeGlobalSearchReady = "true";

    createOfficeGlobalSearchDropdown();
    buildOfficeSearchIndex();

    document.addEventListener("keydown", function (event) {
        const shortcut =
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k";

        if (!shortcut) return;

        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    });

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();

        officeHeaderActiveResult = -1;
        clearTimeout(officeHeaderSearchTimer);

        if (query.length < 2) {
            closeOfficeGlobalSearch();
            return;
        }

        officeHeaderSearchTimer = setTimeout(function () {
            runOfficeGlobalSearch(query);
        }, 220);
    });

    searchInput.addEventListener("keydown", function (event) {
        const dropdown =
            document.getElementById("officeGlobalSearchDropdown");

        const items = Array.from(
            dropdown?.querySelectorAll(".office-global-search-result") || []
        );

        if (event.key === "Escape") {
            closeOfficeGlobalSearch();
            searchInput.blur();
            return;
        }

        if (!items.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();

            officeHeaderActiveResult = Math.min(
                officeHeaderActiveResult + 1,
                items.length - 1
            );

            updateOfficeGlobalSearchKeyboard(items);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            officeHeaderActiveResult = Math.max(
                officeHeaderActiveResult - 1,
                0
            );

            updateOfficeGlobalSearchKeyboard(items);
            return;
        }

        if (
            event.key === "Enter" &&
            officeHeaderActiveResult >= 0
        ) {
            event.preventDefault();
            items[officeHeaderActiveResult].click();
        }
    });

    document.addEventListener("click", function (event) {
        const dropdown =
            document.getElementById("officeGlobalSearchDropdown");

        if (
            searchInput.contains(event.target) ||
            dropdown?.contains(event.target)
        ) {
            return;
        }

        closeOfficeGlobalSearch();
    });

    window.addEventListener("resize", positionOfficeGlobalSearch);
    window.addEventListener("scroll", positionOfficeGlobalSearch, true);
}

function buildOfficeSearchIndex() {
    if (officeHeaderSearchIndexPromise) {
        return officeHeaderSearchIndexPromise;
    }

    officeHeaderSearchIndexPromise = (async function () {
        const links = getOfficeSidebarLinks();

        const navigationItems = links.map(function (item) {
            return {
                section: "Navigation",
                type: "navigation",
                title: item.label,
                description: `Open ${item.label} section`,
                url: item.href,
                icon: item.icon,
                searchText: [
                    item.label,
                    ...getOfficeSearchAliases(item.label)
                ].join(" ").toLowerCase()
            };
        });

        const pageContentItems = [];

        for (const item of links) {
            try {
                const response = await fetch(item.href, {
                    method: "GET",
                    credentials: "same-origin"
                });

                if (!response.ok) continue;

                const html = await response.text();
                const parser = new DOMParser();
                const pageDocument = parser.parseFromString(
                    html,
                    "text/html"
                );

                pageContentItems.push(
                    ...extractOfficePageContent(
                        pageDocument,
                        item
                    )
                );

            } catch (error) {
                console.warn(
                    "OFFICE PAGE INDEX ERROR:",
                    item.href,
                    error
                );
            }
        }

        officeHeaderSearchIndex =
            removeDuplicateOfficeGlobalSearchResults([
                ...navigationItems,
                ...pageContentItems
            ]);

        return officeHeaderSearchIndex;
    })();

    return officeHeaderSearchIndexPromise;
}

function getOfficeSidebarLinks() {
    const anchors = Array.from(
        document.querySelectorAll(
            "#sidebar a[href], .sidebar a[href]"
        )
    );

    const results = [];

    anchors.forEach(function (link) {
        const rawHref = link.getAttribute("href") || "";

        if (
            !rawHref ||
            rawHref === "#" ||
            rawHref.startsWith("javascript:")
        ) {
            return;
        }

        const label =
            link.querySelector("span")?.textContent?.trim() ||
            link.textContent?.trim() ||
            "";

        if (!label) return;

        const iconElement = link.querySelector("i");

        const icon =
            Array.from(iconElement?.classList || [])
                .find(function (className) {
                    return className.startsWith("bx-");
                }) ||
            "bx-link";

        results.push({
            label: cleanOfficeSearchText(label),
            href: rawHref,
            icon
        });
    });

    return removeDuplicateOfficeSidebarLinks(results);
}

function extractOfficePageContent(pageDocument, pageInfo) {
    const selectors = [
        "main h1",
        "main h2",
        "main h3",
        "main h4",
        ".main-content h1",
        ".main-content h2",
        ".main-content h3",
        ".main-content h4",
        "main button",
        ".main-content button",
        "main label",
        ".main-content label",
        "main .card-title",
        ".main-content .card-title",
        "main .section-title",
        ".main-content .section-title",
        "main .settings-nav-item strong",
        ".main-content .settings-nav-item strong",
        "main .profile-tab",
        ".main-content .profile-tab"
    ];

    const elements = Array.from(
        pageDocument.querySelectorAll(
            selectors.join(",")
        )
    );

    const results = [];

    elements.forEach(function (element) {
        if (
            element.closest(
                "aside, .sidebar, nav.menu"
            )
        ) {
            return;
        }

        const title = cleanOfficeSearchText(
            element.textContent
        );

        if (
            !title ||
            title.length < 2 ||
            title.length > 90
        ) {
            return;
        }

        const ignored = [
            "close",
            "cancel",
            "save",
            "submit",
            "ok",
            "yes",
            "no"
        ];

        if (
            ignored.includes(
                title.toLowerCase()
            )
        ) {
            return;
        }

        const context =
            getOfficePageElementContext(element);

        results.push({
            section: pageInfo.label,
            type: "page-content",
            title,
            description:
                context ||
                `Found in ${pageInfo.label}`,
            url: pageInfo.href,
            icon: pageInfo.icon,
            searchText: [
                pageInfo.label,
                title,
                context,
                ...getOfficeSearchAliases(
                    pageInfo.label
                )
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
        });
    });

    return removeDuplicateOfficeGlobalSearchResults(
        results
    );
}

function getOfficePageElementContext(element) {
    const parent = element.closest(
        "section, article, .card, .panel, .settings-section, .content-card"
    );

    if (!parent) return "";

    const description =
        parent.querySelector(
            "p, small, .subtitle, .description"
        )?.textContent?.trim() || "";

    const cleaned =
        cleanOfficeSearchText(description);

    return cleaned.length <= 120
        ? cleaned
        : `${cleaned.slice(0, 117)}...`;
}

async function runOfficeGlobalSearch(query) {
    const normalizedQuery =
        cleanOfficeSearchText(query).toLowerCase();

    if (!normalizedQuery) {
        closeOfficeGlobalSearch();
        return;
    }

    renderOfficeGlobalSearchLoading();

    await buildOfficeSearchIndex();

    const localResults =
        officeHeaderSearchIndex.filter(
            function (result) {
                const searchable =
                    result.searchText ||
                    [
                        result.section,
                        result.title,
                        result.description
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                return searchable.includes(
                    normalizedQuery
                );
            }
        );

    let databaseResults = [];

    if (officeHeaderToken) {
        if (officeHeaderSearchController) {
            officeHeaderSearchController.abort();
        }

        officeHeaderSearchController =
            new AbortController();

        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${officeHeaderToken}`
                    },
                    signal:
                        officeHeaderSearchController.signal
                }
            );

            const data = await response.json();

            if (
                response.ok &&
                data.success &&
                Array.isArray(data.results)
            ) {
                databaseResults =
                    data.results.map(
                        normalizeOfficeDatabaseResult
                    );
            }

        } catch (error) {
            if (error.name !== "AbortError") {
                console.warn(
                    "OFFICE DATABASE SEARCH ERROR:",
                    error
                );
            }
        }
    }

    const combinedResults =
        rankOfficeGlobalSearchResults(
            removeDuplicateOfficeGlobalSearchResults([
                ...localResults,
                ...databaseResults
            ]),
            normalizedQuery
        );

    renderOfficeGlobalSearchResults(
        combinedResults,
        query
    );
}

function normalizeOfficeDatabaseResult(result) {
    const updated = { ...result };
    const links = getOfficeSidebarLinks();

    const type =
        String(result.type || "").toLowerCase();

    let targetLink = null;

    if (type === "alumni") {
        targetLink = findOfficeLinkByKeywords(
            links,
            ["alumni records", "alumni"]
        );
    } else if (type === "event") {
        targetLink = findOfficeLinkByKeywords(
            links,
            ["events management", "events"]
        );
    } else if (type === "job") {
        targetLink = findOfficeLinkByKeywords(
            links,
            ["job opportunities", "jobs"]
        );
    } else if (type === "announcement") {
        targetLink = findOfficeLinkByKeywords(
            links,
            ["announcements"]
        );
    }

    if (targetLink) {
        const searchValue =
            result.title || "";

        const separator =
            targetLink.href.includes("?")
                ? "&"
                : "?";

        updated.url =
            `${targetLink.href}${separator}search=${encodeURIComponent(searchValue)}`;
    }

    updated.searchText = [
        updated.section,
        updated.title,
        updated.description
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return updated;
}

function findOfficeLinkByKeywords(links, keywords) {
    return links.find(function (link) {
        const label =
            link.label.toLowerCase();

        return keywords.some(function (keyword) {
            return label.includes(keyword);
        });
    });
}

function getOfficeSearchAliases(label) {
    const key =
        String(label || "")
            .trim()
            .toLowerCase();

    const aliases = {
        "dashboard": [
            "overview",
            "home",
            "summary",
            "statistics",
            "recent activity"
        ],

        "alumni records": [
            "alumni",
            "graduates",
            "directory",
            "records",
            "add alumni",
            "edit alumni",
            "search alumni"
        ],

        "account verification": [
            "verification",
            "verify",
            "approval",
            "pending accounts",
            "approve",
            "reject"
        ],

        "events management": [
            "events",
            "event",
            "calendar",
            "create event",
            "attendees",
            "rsvp"
        ],

        "job opportunities": [
            "jobs",
            "job",
            "career",
            "employment",
            "post job",
            "vacancy"
        ],

        "announcements": [
            "announcement",
            "news",
            "notice",
            "publish announcement",
            "updates"
        ],

        "reports": [
            "report",
            "analytics",
            "statistics",
            "export",
            "generate report",
            "download"
        ],

        "profile": [
            "my profile",
            "personal information",
            "account",
            "profile picture"
        ],

        "settings": [
            "setting",
            "preferences",
            "password",
            "change password",
            "notifications",
            "appearance",
            "theme",
            "security",
            "language"
        ]
    };

    return aliases[key] || [];
}

function rankOfficeGlobalSearchResults(
    results,
    query
) {
    return [...results]
        .map(function (result) {
            const title =
                String(result.title || "")
                    .toLowerCase();

            const section =
                String(result.section || "")
                    .toLowerCase();

            let score = 0;

            if (title === query) {
                score += 100;
            } else if (
                title.startsWith(query)
            ) {
                score += 70;
            } else if (
                title.includes(query)
            ) {
                score += 50;
            }

            if (section.includes(query)) {
                score += 25;
            }

            if (
                result.type === "navigation"
            ) {
                score += 15;
            }

            return {
                ...result,
                _score: score
            };
        })
        .sort(function (a, b) {
            return b._score - a._score;
        })
        .map(function ({
            _score,
            ...result
        }) {
            return result;
        });
}

function createOfficeGlobalSearchDropdown() {
    if (
        document.getElementById(
            "officeGlobalSearchDropdown"
        )
    ) {
        return;
    }

    const dropdown =
        document.createElement("div");

    dropdown.id =
        "officeGlobalSearchDropdown";

    dropdown.className =
        "office-global-search-dropdown";

    document.body.appendChild(dropdown);

    injectOfficeGlobalSearchStyles();
}

function renderOfficeGlobalSearchLoading() {
    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );

    if (!dropdown) return;

    dropdown.innerHTML = `
        <div class="office-search-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <div>
                <strong>Searching Office Portal...</strong>
                <small>Checking sections, features, and records</small>
            </div>
        </div>
    `;

    showOfficeGlobalSearch();
}

function renderOfficeGlobalSearchResults(
    results,
    query
) {
    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );

    if (!dropdown) return;

    officeHeaderActiveResult = -1;

    const visibleResults =
        results.slice(0, 30);

    if (!visibleResults.length) {
        dropdown.innerHTML = `
            <div class="office-search-state">
                <i class="bx bx-search-alt"></i>
                <div>
                    <strong>
                        No results found for
                        "${escapeOfficeGlobalSearchHTML(query)}"
                    </strong>
                    <small>Try another keyword.</small>
                </div>
            </div>
        `;

        showOfficeGlobalSearch();
        return;
    }

    dropdown.innerHTML = `
        <div class="office-global-search-header">
            <div>
                <span>Global Search</span>
                <strong>
                    ${visibleResults.length}
                    ${
                        visibleResults.length === 1
                            ? "result"
                            : "results"
                    }
                </strong>
            </div>
            <small>Entire Office Portal</small>
        </div>

        <div class="office-global-search-list">
            ${visibleResults
                .map(function (result, index) {
                    return `
                        <button
                            type="button"
                            class="office-global-search-result"
                            data-result-index="${index}"
                            data-result-url="${escapeOfficeGlobalSearchHTML(
                                result.url || ""
                            )}"
                        >
                            <span class="office-global-search-result-icon">
                                <i class="bx ${escapeOfficeGlobalSearchHTML(
                                    result.icon || "bx-search"
                                )}"></i>
                            </span>

                            <span class="office-global-search-result-copy">
                                <span class="office-global-search-result-section">
                                    ${escapeOfficeGlobalSearchHTML(
                                        result.section || "Result"
                                    )}
                                </span>

                                <strong>
                                    ${highlightOfficeGlobalSearchText(
                                        result.title || "Untitled",
                                        query
                                    )}
                                </strong>

                                <small>
                                    ${highlightOfficeGlobalSearchText(
                                        result.description || "",
                                        query
                                    )}
                                </small>
                            </span>

                            <i class="bx bx-chevron-right"></i>
                        </button>
                    `;
                })
                .join("")}
        </div>
    `;

    dropdown
        .querySelectorAll(
            ".office-global-search-result"
        )
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    const target =
                        button.dataset.resultUrl;

                    if (!target) return;

                    window.location.href =
                        target;
                }
            );
        });

    showOfficeGlobalSearch();
}

function showOfficeGlobalSearch() {
    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );

    if (!dropdown) return;

    dropdown.classList.add("active");
    positionOfficeGlobalSearch();
}

function positionOfficeGlobalSearch() {
    const searchInput =
        document.getElementById(
            "globalSearch"
        );

    const dropdown =
        document.getElementById(
            "officeGlobalSearchDropdown"
        );

    if (
        !searchInput ||
        !dropdown ||
        !dropdown.classList.contains("active")
    ) {
        return;
    }

    const rect =
        searchInput.getBoundingClientRect();

    const width =
        Math.min(
            520,
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

    dropdown.style.width =
        `${width}px`;

    dropdown.style.left =
        `${Math.max(12, left)}px`;

    dropdown.style.top =
        `${rect.bottom + 8}px`;
}

function closeOfficeGlobalSearch() {
    document
        .getElementById(
            "officeGlobalSearchDropdown"
        )
        ?.classList
        .remove("active");
}

function updateOfficeGlobalSearchKeyboard(
    items
) {
    items.forEach(function (item, index) {
        item.classList.toggle(
            "keyboard-active",
            index ===
                officeHeaderActiveResult
        );
    });

    items[
        officeHeaderActiveResult
    ]?.scrollIntoView({
        block: "nearest"
    });
}

function removeDuplicateOfficeGlobalSearchResults(
    results
) {
    const seen = new Set();

    return results.filter(function (result) {
        const key = [
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
    });
}

function removeDuplicateOfficeSidebarLinks(
    links
) {
    const seen = new Set();

    return links.filter(function (link) {
        const key =
            `${link.label}|${link.href}`
                .toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function cleanOfficeSearchText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeOfficeGlobalSearchHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeOfficeGlobalSearchRegex(value) {
    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
}

function highlightOfficeGlobalSearchText(
    value,
    query
) {
    const safeValue =
        escapeOfficeGlobalSearchHTML(value);

    if (!query) return safeValue;

    const safeQuery =
        escapeOfficeGlobalSearchRegex(
            escapeOfficeGlobalSearchHTML(query)
        );

    return safeValue.replace(
        new RegExp(
            `(${safeQuery})`,
            "ig"
        ),
        "<mark>$1</mark>"
    );
}

function injectOfficeGlobalSearchStyles() {
    if (
        document.getElementById(
            "officeGlobalSearchStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "officeGlobalSearchStyles";

    style.textContent = `
        .office-global-search-dropdown {
            position: fixed;
            z-index: 120000;
            display: none;
            max-height: min(600px, calc(100vh - 120px));
            overflow: hidden;
            border: 1px solid rgba(148, 163, 184, 0.16);
            border-radius: 16px;
            background: rgba(9, 14, 24, 0.985);
            color: #f8fafc;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
            backdrop-filter: blur(22px);
        }

        .office-global-search-dropdown.active {
            display: block;
        }

        .office-global-search-header {
            min-height: 58px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .office-global-search-header span,
        .office-global-search-header strong {
            display: block;
        }

        .office-global-search-header span {
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .office-global-search-header strong {
            margin-top: 2px;
            font-size: 12px;
        }

        .office-global-search-header small {
            color: #64748b;
            font-size: 9px;
        }

        .office-global-search-list {
            max-height: min(530px, calc(100vh - 190px));
            padding: 7px;
            overflow-y: auto;
        }

        .office-global-search-result {
            width: 100%;
            min-height: 66px;
            padding: 9px 10px;
            border: 0;
            border-radius: 11px;
            display: grid;
            grid-template-columns: 36px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 10px;
            background: transparent;
            color: inherit;
            text-align: left;
            cursor: pointer;
            transition: background 0.16s ease, transform 0.16s ease;
        }

        .office-global-search-result:hover,
        .office-global-search-result.keyboard-active {
            background:
                linear-gradient(
                    90deg,
                    rgba(45, 212, 191, 0.12),
                    rgba(59, 130, 246, 0.08)
                );
            transform: translateX(2px);
        }

        .office-global-search-result-icon {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 10px;
            background: rgba(45, 212, 191, 0.11);
            color: #2dd4bf;
            font-size: 17px;
        }

        .office-global-search-result-copy {
            min-width: 0;
        }

        .office-global-search-result-section,
        .office-global-search-result-copy strong,
        .office-global-search-result-copy small {
            display: block;
        }

        .office-global-search-result-section {
            margin-bottom: 2px;
            color: #2dd4bf;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .office-global-search-result-copy strong {
            overflow: hidden;
            color: #f8fafc;
            font-size: 11px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .office-global-search-result-copy small {
            margin-top: 3px;
            overflow: hidden;
            color: #94a3b8;
            font-size: 9px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .office-global-search-result-copy mark {
            padding: 0 1px;
            border-radius: 2px;
            background: rgba(45, 212, 191, 0.18);
            color: #99f6e4;
        }

        .office-search-state {
            min-height: 88px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .office-search-state > i {
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 10px;
            background: rgba(45, 212, 191, 0.11);
            color: #2dd4bf;
            font-size: 18px;
        }

        .office-search-state strong,
        .office-search-state small {
            display: block;
        }

        .office-search-state strong {
            color: #f8fafc;
            font-size: 11px;
        }

        .office-search-state small {
            margin-top: 3px;
            color: #94a3b8;
            font-size: 9px;
        }
    `;

    document.head.appendChild(style);
}

/* =========================================================
   OFFICE SHARED AVATAR
   One avatar across every Office page
========================================================= */

const OFFICE_PROFILE_IMAGE_KEY =
    "officeProfileImage";


function initializeOfficeSharedAvatar() {

    applyOfficeSharedAvatar();


    /*
        Some page-specific scripts load profile data
        asynchronously and may overwrite the image.
        Re-apply the shared avatar after those scripts finish.
    */
    window.setTimeout(
        applyOfficeSharedAvatar,
        150
    );

    window.setTimeout(
        applyOfficeSharedAvatar,
        500
    );

    window.setTimeout(
        applyOfficeSharedAvatar,
        1200
    );


    window.addEventListener(
        "officeProfileImageChanged",
        (event) => {

            if (
                event.detail?.image
            ) {

                applyOfficeSharedAvatar(
                    event.detail.image
                );

            } else {

                applyOfficeSharedAvatar();

            }

        }
    );


    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key ===
                OFFICE_PROFILE_IMAGE_KEY
            ) {

                applyOfficeSharedAvatar(
                    event.newValue
                );

            }

        }
    );

}


function applyOfficeSharedAvatar(
    imageSource = null
) {

    const savedProfileImage =
        imageSource ||
        localStorage.getItem(
            OFFICE_PROFILE_IMAGE_KEY
        );


    if (!savedProfileImage) {
        return;
    }


    const imageIds = [
        "sidebarProfileImage",
        "headerProfileImage",
        "profileImage",
        "settingsProfileImage",
        "settingsProfilePreview"
    ];


    imageIds.forEach(
        (id) => {

            const image =
                document.getElementById(
                    id
                );


            if (!image) {
                return;
            }


            /*
                Some pages use an IMG, while others may use
                an avatar DIV. Handle both.
            */
            if (
                image.tagName ===
                "IMG"
            ) {

                image.src =
                    savedProfileImage;

                image.style.display =
                    "block";

            } else {

                let avatarImage =
                    image.querySelector(
                        "img.office-shared-avatar-image"
                    );


                if (!avatarImage) {

                    avatarImage =
                        document.createElement(
                            "img"
                        );

                    avatarImage.className =
                        "office-shared-avatar-image";

                    avatarImage.alt =
                        "Office profile";

                    avatarImage.style.width =
                        "100%";

                    avatarImage.style.height =
                        "100%";

                    avatarImage.style.objectFit =
                        "cover";

                    avatarImage.style.borderRadius =
                        "inherit";

                    image.appendChild(
                        avatarImage
                    );

                }


                avatarImage.src =
                    savedProfileImage;

            }

        }
    );


    const initialsIds = [
        "sidebarInitials",
        "headerInitials",
        "profileInitials"
    ];


    initialsIds.forEach(
        (id) => {

            const initials =
                document.getElementById(
                    id
                );


            if (initials) {

                initials.style.display =
                    "none";

            }

        }
    );

}


/*
    Script is normally loaded at the bottom of Office pages.
    Apply immediately too, then DOMContentLoaded initialization
    above will apply it again after page-specific scripts.
*/
applyOfficeSharedAvatar();