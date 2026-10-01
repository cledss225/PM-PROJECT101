"use strict";


/* =========================================================
   ALUMNIHUB
   ALUMNI ANNOUNCEMENTS
========================================================= */


const API_BASE_URL = "/api";


const state = {

    user: null,

    announcements: [],

    filteredAnnouncements: [],

    selectedAnnouncement: null

};


const el = {};



/* =========================================================
   INITIALIZE
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    initializePage
);


async function initializePage() {

    cacheElements();

    initializeTheme();

    bindEvents();


    const token =
        getToken();


    if (!token) {

        redirectToLogin();

        return;

    }


    await loadPageData();

}



/* =========================================================
   CACHE ELEMENTS
========================================================= */


function cacheElements() {


    const ids = [

        "sidebar",

        "sidebarProfileAvatar",
        "sidebarProfileName",

        "menuToggle",
        "sidebarOverlay",

        "topbarAvatar",
        "topbarUserName",

        "refreshAnnouncementsBtn",

        "themeToggle",
        "themeIcon",

        "logoutBtn",

        "publishedCount",
        "highPriorityCount",
        "recentCount",

        "announcementSearchInput",
        "clearAnnouncementSearchBtn",

        "categoryFilter",
        "priorityFilter",
        "announcementSort",

        "resetAnnouncementFiltersBtn",

        "announcementResultText",

        "announcementsLoadingState",

        "announcementsErrorState",
        "announcementsErrorMessage",
        "retryAnnouncementsBtn",

        "announcementsEmptyState",
        "emptyResetAnnouncementsBtn",

        "announcementsGrid",

        "announcementDetailsModal",

        "modalAnnouncementIcon",

        "modalCategory",
        "modalPriority",

        "announcementModalTitle",

        "closeAnnouncementModalBtn",

        "modalPublishDate",
        "modalCreatedDate",
        "modalAudience",
        "modalExpiryDate",

        "modalAnnouncementContent",

        "modalCloseAnnouncementFooterBtn",

        "toastContainer"

    ];


    ids.forEach(
        id => {

            el[id] =
                document.getElementById(id);

        }
    );

}



/* =========================================================
   BIND EVENTS
========================================================= */


function bindEvents() {


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


    el.refreshAnnouncementsBtn
        ?.addEventListener(
            "click",
            refreshAnnouncements
        );


    el.themeToggle
        ?.addEventListener(
            "click",
            toggleTheme
        );


    el.logoutBtn
        ?.addEventListener(
            "click",
            logout
        );


    el.announcementSearchInput
        ?.addEventListener(
            "input",
            applyFilters
        );


    el.clearAnnouncementSearchBtn
        ?.addEventListener(
            "click",
            clearSearch
        );


    el.categoryFilter
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.priorityFilter
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.announcementSort
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.resetAnnouncementFiltersBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.emptyResetAnnouncementsBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.retryAnnouncementsBtn
        ?.addEventListener(
            "click",
            loadPageData
        );


    el.announcementsGrid
        ?.addEventListener(
            "click",
            handleGridClick
        );


    el.closeAnnouncementModalBtn
        ?.addEventListener(
            "click",
            closeAnnouncementModal
        );


    el.modalCloseAnnouncementFooterBtn
        ?.addEventListener(
            "click",
            closeAnnouncementModal
        );


    el.announcementDetailsModal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    el.announcementDetailsModal
                ) {

                    closeAnnouncementModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

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
   LOAD PAGE DATA
========================================================= */


async function loadPageData() {


    showLoadingState();


    try {


        await loadCurrentUser();

        await loadAnnouncements();


        updateSummary();

        applyFilters();


    } catch (error) {


        console.error(
            "LOAD ALUMNI ANNOUNCEMENTS ERROR:",
            error
        );


        if (
            error.status === 401
        ) {

            clearSession();

            redirectToLogin();

            return;

        }


        showErrorState(
            error.message ||
            "Unable to load announcements."
        );

    }

}



/* =========================================================
   LOAD CURRENT USER
========================================================= */


async function loadCurrentUser() {


    const response =
        await apiRequest(
            "/auth/me",
            {
                method: "GET"
            }
        );


    state.user =
        response.user ||
        response.data ||
        response;


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


    renderCurrentUser();

}



/* =========================================================
   RENDER CURRENT USER
========================================================= */


function renderCurrentUser() {


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
   LOAD ANNOUNCEMENTS
========================================================= */


async function loadAnnouncements() {


    const response =
        await apiRequest(
            "/announcements",
            {
                method: "GET"
            }
        );


    const rawAnnouncements =
        extractArray(
            response,
            [

                "announcements",
                "data",
                "records"

            ]
        );


    state.announcements =
        rawAnnouncements
            .map(
                normalizeAnnouncement
            )
            .filter(
                shouldDisplayAnnouncement
            );

}



/* =========================================================
   NORMALIZE ANNOUNCEMENT
========================================================= */


function normalizeAnnouncement(
    announcement
) {


    return {


        id:
            announcement.announcement_id ??
            announcement.id ??
            null,


        title:
            announcement.title ??
            "Untitled Announcement",


        content:
            announcement.content ??
            announcement.description ??
            announcement.message ??
            "",


        category:
            normalizeText(
                announcement.category ||
                "general"
            ),


        priority:
            normalizeText(
                announcement.priority ||
                "normal"
            ),


        status:
            normalizeText(
                announcement.status ||
                "published"
            ),


        audience:
            normalizeText(
                announcement.target_audience ??
                announcement.audience ??
                "all"
            ),


        publishDate:
            announcement.publish_date ??
            announcement.published_at ??
            announcement.created_at ??
            null,


        expiryDate:
            announcement.expiry_date ??
            announcement.expires_at ??
            null,


        createdAt:
            announcement.created_at ??
            null,


        updatedAt:
            announcement.updated_at ??
            null

    };

}



/* =========================================================
   DISPLAY CHECK
========================================================= */


function shouldDisplayAnnouncement(
    announcement
) {


    if (
        [

            "draft",
            "archived",
            "deleted",
            "inactive"

        ]
            .includes(
                announcement.status
            )
    ) {

        return false;

    }


    if (
        announcement.expiryDate
    ) {


        const expiry =
            parseDate(
                announcement.expiryDate
            );


        if (
            expiry &&
            expiry <
            startOfToday(
                new Date()
            )
        ) {

            return false;

        }

    }


    if (
        announcement.publishDate
    ) {


        const publish =
            parseDate(
                announcement.publishDate
            );


        if (
            publish &&
            publish >
            new Date()
        ) {

            return false;

        }

    }


    return true;

}



/* =========================================================
   SUMMARY
========================================================= */


function updateSummary() {


    const published =
        state.announcements.length;


    const highPriority =
        state.announcements
            .filter(
                announcement => {

                    return [

                        "high",
                        "urgent",
                        "important"

                    ]
                        .includes(
                            announcement.priority
                        );

                }
            )
            .length;


    const sevenDaysAgo =
        new Date();


    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );


    const recent =
        state.announcements
            .filter(
                announcement => {


                    const date =
                        parseDate(
                            announcement.publishDate ||
                            announcement.createdAt
                        );


                    return (
                        date &&
                        date >= sevenDaysAgo
                    );

                }
            )
            .length;


    setText(
        el.publishedCount,
        published
    );


    setText(
        el.highPriorityCount,
        highPriority
    );


    setText(
        el.recentCount,
        recent
    );

}



/* =========================================================
   FILTERS
========================================================= */


function applyFilters() {


    const search =
        normalizeText(
            el.announcementSearchInput
                ?.value
        );


    const category =
        normalizeText(
            el.categoryFilter
                ?.value
        );


    const priority =
        normalizeText(
            el.priorityFilter
                ?.value
        );


    state.filteredAnnouncements =
        state.announcements.filter(
            announcement => {


                const searchable =
                    normalizeText(
                        [

                            announcement.title,
                            announcement.content,
                            announcement.category,
                            announcement.priority

                        ]
                            .join(" ")
                    );


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesCategory =
                    !category ||
                    announcement.category ===
                    category;


                const matchesPriority =
                    !priority ||
                    announcement.priority ===
                    priority;


                return (

                    matchesSearch &&
                    matchesCategory &&
                    matchesPriority

                );

            }
        );


    sortAnnouncements();

    renderAnnouncements();

}



/* =========================================================
   SORT
========================================================= */


function sortAnnouncements() {


    const sort =
        el.announcementSort
            ?.value ||
        "newest";


    state.filteredAnnouncements.sort(
        (a, b) => {


            switch (
                sort
            ) {


                case "oldest":

                    return (
                        dateTimestamp(
                            a.publishDate ||
                            a.createdAt
                        ) -
                        dateTimestamp(
                            b.publishDate ||
                            b.createdAt
                        )
                    );


                case "priority":

                    return (
                        getPriorityWeight(
                            b.priority
                        ) -
                        getPriorityWeight(
                            a.priority
                        )
                    );


                case "title":

                    return String(
                        a.title
                    )
                        .localeCompare(
                            String(
                                b.title
                            )
                        );


                case "newest":
                default:

                    return (
                        dateTimestamp(
                            b.publishDate ||
                            b.createdAt
                        ) -
                        dateTimestamp(
                            a.publishDate ||
                            a.createdAt
                        )
                    );

            }

        }
    );

}



/* =========================================================
   RENDER
========================================================= */


function renderAnnouncements() {


    hideAllStates();


    const announcements =
        state.filteredAnnouncements;


    setText(
        el.announcementResultText,
        `${announcements.length} announcement${
            announcements.length === 1
                ? ""
                : "s"
        } found`
    );


    if (
        announcements.length === 0
    ) {


        el.announcementsEmptyState
            ?.classList
            .remove("hidden");


        return;

    }


    if (
        !el.announcementsGrid
    ) {

        return;

    }


    el.announcementsGrid
        .classList
        .remove("hidden");


    el.announcementsGrid.innerHTML =
        announcements
            .map(
                createAnnouncementCard
            )
            .join("");

}



/* =========================================================
   CARD
========================================================= */


function createAnnouncementCard(
    announcement
) {


    const icon =
        getAnnouncementIcon(
            announcement.category
        );


    const date =
        announcement.publishDate
            ? formatDate(
                announcement.publishDate
            )
            : "Recently posted";


    const priorityClass =
        normalizeText(
            announcement.priority
        );


    return `
        <article
            class="announcement-card ${escapeHtml(
                priorityClass
            )}"
        >

            <div class="announcement-card-header">

                <div class="announcement-icon">

                    <i class="bx ${escapeHtml(
                        icon
                    )}"></i>

                </div>


                <div class="announcement-card-badges">

                    <span class="announcement-category">

                        ${escapeHtml(
                            formatLabel(
                                announcement.category
                            )
                        )}

                    </span>


                    ${
                        announcement.priority !==
                        "normal"

                            ? `
                                <span
                                    class="announcement-priority ${escapeHtml(
                                        priorityClass
                                    )}"
                                >
                                    ${escapeHtml(
                                        formatLabel(
                                            announcement.priority
                                        )
                                    )}
                                </span>
                            `

                            : ""
                    }

                </div>

            </div>


            <div class="announcement-card-body">

                <h3>
                    ${escapeHtml(
                        announcement.title
                    )}
                </h3>


                <p>
                    ${escapeHtml(
                        truncateText(
                            announcement.content ||
                            "No announcement details provided.",
                            170
                        )
                    )}
                </p>

            </div>


            <div class="announcement-card-footer">

                <span class="announcement-date">

                    <i class="bx bx-calendar"></i>

                    ${escapeHtml(
                        date
                    )}

                </span>


                <button
                    type="button"
                    class="announcement-view-button"
                    data-announcement-id="${escapeHtml(
                        announcement.id
                    )}"
                >

                    Read More

                </button>

            </div>

        </article>
    `;

}



/* =========================================================
   CLICK
========================================================= */


function handleGridClick(
    event
) {


    const button =
        event.target.closest(
            "[data-announcement-id]"
        );


    if (
        !button
    ) {

        return;

    }


    const announcement =
        state.announcements.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    button.dataset.announcementId
                )
        );


    if (
        !announcement
    ) {

        return;

    }


    openAnnouncementModal(
        announcement
    );

}



/* =========================================================
   OPEN MODAL
========================================================= */


function openAnnouncementModal(
    announcement
) {


    state.selectedAnnouncement =
        announcement;


    setText(
        el.announcementModalTitle,
        announcement.title
    );


    setText(
        el.modalCategory,
        formatLabel(
            announcement.category
        )
    );


    setText(
        el.modalPriority,
        formatLabel(
            announcement.priority
        )
    );


    setText(
        el.modalPublishDate,
        announcement.publishDate
            ? formatDate(
                announcement.publishDate
            )
            : "Not specified"
    );


    setText(
        el.modalCreatedDate,
        announcement.createdAt
            ? formatDate(
                announcement.createdAt
            )
            : "Not specified"
    );


    setText(
        el.modalAudience,
        formatLabel(
            announcement.audience ||
            "All"
        )
    );


    setText(
        el.modalExpiryDate,
        announcement.expiryDate
            ? formatDate(
                announcement.expiryDate
            )
            : "No expiry"
    );


    renderModalIcon(
        announcement.category
    );


    setAnnouncementContent(
        announcement.content
    );


    el.announcementDetailsModal
        ?.classList
        .remove("hidden");


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   MODAL ICON
========================================================= */


function renderModalIcon(
    category
) {


    if (
        !el.modalAnnouncementIcon
    ) {

        return;

    }


    el.modalAnnouncementIcon.innerHTML =
        `
            <i class="bx ${escapeHtml(
                getAnnouncementIcon(
                    category
                )
            )}"></i>
        `;

}



/* =========================================================
   CONTENT
========================================================= */


function setAnnouncementContent(
    value
) {


    if (
        !el.modalAnnouncementContent
    ) {

        return;

    }


    const text =
        String(
            value ||
            ""
        )
            .trim();


    if (
        !text
    ) {


        el.modalAnnouncementContent.textContent =
            "No announcement details provided.";


        return;

    }


    const paragraphs =
        text
            .split(
                /\n{2,}/
            )
            .map(
                paragraph =>
                    paragraph.trim()
            )
            .filter(Boolean);


    if (
        paragraphs.length <= 1
    ) {


        el.modalAnnouncementContent.textContent =
            text;


        return;

    }


    el.modalAnnouncementContent.innerHTML =
        paragraphs
            .map(
                paragraph => `
                    <p>
                        ${escapeHtml(
                            paragraph
                        )}
                    </p>
                `
            )
            .join("");

}



/* =========================================================
   CLOSE MODAL
========================================================= */


function closeAnnouncementModal() {


    el.announcementDetailsModal
        ?.classList
        .add("hidden");


    document.body.style.overflow =
        "";


    state.selectedAnnouncement =
        null;

}



/* =========================================================
   REFRESH
========================================================= */


async function refreshAnnouncements() {


    const icon =
        el.refreshAnnouncementsBtn
            ?.querySelector("i");


    icon
        ?.classList
        .add("bx-spin");


    try {


        await loadAnnouncements();


        updateSummary();

        applyFilters();


        showToast(
            "Announcements refreshed",
            "Latest AlumniHub updates have been loaded.",
            "success"
        );


    } catch (error) {


        console.error(
            "REFRESH ANNOUNCEMENTS ERROR:",
            error
        );


        showToast(
            "Unable to refresh",
            error.message ||
            "Please try again.",
            "error"
        );


    } finally {


        icon
            ?.classList
            .remove("bx-spin");

    }

}



/* =========================================================
   CLEAR SEARCH
========================================================= */


function clearSearch() {


    if (
        el.announcementSearchInput
    ) {


        el.announcementSearchInput.value =
            "";


        el.announcementSearchInput.focus();

    }


    applyFilters();

}



/* =========================================================
   RESET
========================================================= */


function resetFilters() {


    if (
        el.announcementSearchInput
    ) {

        el.announcementSearchInput.value =
            "";

    }


    if (
        el.categoryFilter
    ) {

        el.categoryFilter.value =
            "";

    }


    if (
        el.priorityFilter
    ) {

        el.priorityFilter.value =
            "";

    }


    if (
        el.announcementSort
    ) {

        el.announcementSort.value =
            "newest";

    }


    applyFilters();

}



/* =========================================================
   STATES
========================================================= */


function hideAllStates() {


    el.announcementsLoadingState
        ?.classList
        .add("hidden");


    el.announcementsErrorState
        ?.classList
        .add("hidden");


    el.announcementsEmptyState
        ?.classList
        .add("hidden");


    el.announcementsGrid
        ?.classList
        .add("hidden");

}



function showLoadingState() {


    hideAllStates();


    el.announcementsLoadingState
        ?.classList
        .remove("hidden");


    setText(
        el.announcementResultText,
        "Loading announcements..."
    );

}



function showErrorState(
    message
) {


    hideAllStates();


    el.announcementsErrorState
        ?.classList
        .remove("hidden");


    setText(
        el.announcementsErrorMessage,
        message
    );


    setText(
        el.announcementResultText,
        "Unable to load announcements"
    );

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
   THEME
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

}



function toggleTheme() {


    const nextTheme =
        document.body
            .classList
            .contains(
                "dark-mode"
            )

            ? "light"

            : "dark";


    applyTheme(
        nextTheme
    );

}



function applyTheme(
    theme
) {


    const dark =
        theme ===
        "dark";


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

}



/* =========================================================
   KEYBOARD
========================================================= */


function handleKeyboard(
    event
) {


    if (
        (
            event.ctrlKey ||
            event.metaKey
        ) &&
        event.key
            .toLowerCase() ===
        "k"
    ) {


        event.preventDefault();


        el.announcementSearchInput
            ?.focus();

    }


    if (
        event.key ===
        "Escape"
    ) {


        closeAnnouncementModal();

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


    if (
        rawText
    ) {


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
   SESSION
========================================================= */


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



function redirectToLogin() {


    window.location.href =
        "../pages/login.html";

}



/* =========================================================
   HELPERS
========================================================= */


function extractArray(
    payload,
    keys
) {


    if (
        Array.isArray(
            payload
        )
    ) {

        return payload;

    }


    for (
        const key of keys
    ) {


        if (
            Array.isArray(
                payload?.[key]
            )
        ) {

            return payload[key];

        }

    }


    return [];

}



function parseDate(
    value
) {


    if (
        !value
    ) {

        return null;

    }


    const date =
        new Date(
            value
        );


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}



function startOfToday(
    value
) {


    const date =
        new Date(
            value
        );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;

}



function dateTimestamp(
    value
) {


    return (
        parseDate(
            value
        )
            ?.getTime() ||
        0
    );

}



function formatDate(
    value
) {


    const date =
        parseDate(
            value
        );


    if (
        !date
    ) {

        return "Not specified";

    }


    return date
        .toLocaleDateString(
            "en-PH",
            {

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }
        );

}



function getPriorityWeight(
    priority
) {


    switch (
        normalizeText(
            priority
        )
    ) {


        case "urgent":
            return 4;


        case "high":
        case "important":
            return 3;


        case "normal":
        case "medium":
            return 2;


        case "low":
            return 1;


        default:
            return 0;

    }

}



function getAnnouncementIcon(
    category
) {


    switch (
        normalizeText(
            category
        )
    ) {


        case "event":
            return "bx-calendar-event";


        case "career":
            return "bx-briefcase-alt-2";


        case "academic":
            return "bx-book-open";


        case "alumni":
            return "bx-group";


        case "reminder":
            return "bx-bell";


        default:
            return "bxs-megaphone";

    }

}



function formatLabel(
    value
) {


    return String(
        value ||
        ""
    )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



function normalizeText(
    value
) {


    return String(
        value ??
        ""
    )
        .trim()
        .toLowerCase();

}



function truncateText(
    value,
    length
) {


    const text =
        String(
            value ||
            ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    return (
        text.length <= length

            ? text

            : `${text.slice(
                0,
                length - 1
            )}…`
    );

}



function getInitials(
    firstName,
    lastName
) {


    const first =
        String(
            firstName ||
            ""
        )
            .trim();


    const last =
        String(
            lastName ||
            ""
        )
            .trim();


    return (

        `${first.charAt(0)}${last.charAt(0)}`
            .toUpperCase() ||

        "AL"

    );

}



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



/* =========================================================
   TOAST
========================================================= */


function showToast(
    title,
    message,
    type = "info"
) {


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


    toast.innerHTML =
        `
            <i class="bx ${icon}"></i>

            <div>

                <strong>
                    ${escapeHtml(
                        title
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        message
                    )}
                </span>

            </div>
        `;


    el.toastContainer
        .appendChild(
            toast
        );


    window.setTimeout(
        () =>
            toast.remove(),
        4000
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */


function escapeHtml(
    value
) {


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