"use strict";


/* =========================================================
   ALUMNIHUB
   ALUMNI DIRECTORY
========================================================= */

const API_BASE_URL = "/api";


const state = {

    user: null,

    alumni: [],

    filteredAlumni: [],

    selectedAlumni: null,

    page: 1,

    limit: 20,

    total: 0,

    totalPages: 1,

    directoryMeta: {
        summary: {
            total: 0,
            verified: 0,
            employed: 0
        },
        filters: {
            programs: [],
            batches: []
        }
    }

};


const el = {};



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDirectory
);


async function initializeDirectory() {

    cacheElements();

    initializeTheme();

    bindEvents();


    if (!getToken()) {

        redirectToLogin();

        return;

    }


    await loadDirectoryPage();

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

        "refreshDirectoryBtn",

        "themeToggle",
        "themeIcon",

        "topbarAvatar",
        "topbarUserName",

        "logoutBtn",

        "totalAlumniCount",
        "verifiedAlumniCount",
        "employedAlumniCount",

        "directorySearchInput",
        "clearDirectorySearchBtn",

        "programFilter",
        "batchFilter",
        "verificationFilter",

        "resetDirectoryFiltersBtn",

        "directoryResultText",
        "directorySort",

        "directoryLoadingState",

        "directoryErrorState",
        "directoryErrorMessage",
        "retryDirectoryBtn",

        "directoryEmptyState",
        "emptyResetDirectoryBtn",

        "alumniGrid",

        "alumniDetailsModal",

        "modalAlumniAvatar",
        "modalAlumniName",
        "modalVerifiedBadge",
        "modalAlumniEmail",

        "closeAlumniModalBtn",

        "modalStudentNumber",
        "modalProgram",
        "modalBatchYear",
        "modalCurrentJob",
        "modalCompany",
        "modalVerificationStatus",

        "modalCloseFooterBtn",

        "toastContainer",
        "directoryPagination",
        "paginationInfo",
        "paginationPageInfo",
        "previousPageBtn",
        "nextPageBtn"

    ];


    ids.forEach(id => {

        el[id] =
            document.getElementById(id);

    });

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
   EVENTS
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


    el.refreshDirectoryBtn
        ?.addEventListener(
            "click",
            refreshDirectory
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


    el.directorySearchInput
    ?.addEventListener(
        "input",
        debounce(
            () => {
                state.page = 1;
                loadAlumni();
            },
            350
        )
    );


el.clearDirectorySearchBtn
    ?.addEventListener(
        "click",
        clearSearch
    );


el.programFilter
    ?.addEventListener(
        "change",
        () => {
            state.page = 1;
            loadAlumni();
        }
    );


el.batchFilter
    ?.addEventListener(
        "change",
        () => {
            state.page = 1;
            loadAlumni();
        }
    );


el.verificationFilter
    ?.addEventListener(
        "change",
        () => {
            state.page = 1;
            loadAlumni();
        }
    );


el.directorySort
    ?.addEventListener(
        "change",
        () => {
            state.page = 1;
            loadAlumni();
        }
    );


el.previousPageBtn
    ?.addEventListener(
        "click",
        previousPage
    );


el.nextPageBtn
    ?.addEventListener(
        "click",
        nextPage
    );


    el.resetDirectoryFiltersBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.emptyResetDirectoryBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.retryDirectoryBtn
        ?.addEventListener(
            "click",
            loadDirectoryPage
        );


    el.alumniGrid
        ?.addEventListener(
            "click",
            handleAlumniGridClick
        );


    el.closeAlumniModalBtn
        ?.addEventListener(
            "click",
            closeAlumniModal
        );


    el.modalCloseFooterBtn
        ?.addEventListener(
            "click",
            closeAlumniModal
        );


    el.alumniDetailsModal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    el.alumniDetailsModal
                ) {

                    closeAlumniModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}



/* =========================================================
   LOAD PAGE
========================================================= */

async function loadDirectoryPage() {

    showLoadingState();


    try {

        await loadCurrentUser();

        await Promise.all([
            loadDirectoryMeta(),
            loadAlumni()
        ]);


        populateFilters();

        updateSummary();


    } catch (error) {

        console.error(
            "LOAD ALUMNI DIRECTORY ERROR:",
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
            "Unable to load alumni directory."
        );

    }

}



/* =========================================================
   CURRENT USER
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
        Number(state.user.role_id) !== 2
    ) {

        throw new Error(
            "This page is only available to alumni accounts."
        );

    }


    renderCurrentUser();

}



function renderCurrentUser() {

    const user =
        state.user || {};


    const fullName =
        getFullName(user) ||
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
   LOAD DIRECTORY META
========================================================= */

async function loadDirectoryMeta() {

    const response =
        await apiRequest(
            "/alumni/meta",
            {
                method: "GET"
            }
        );


    const summary =
        response.summary || {};


    const filters =
        response.filters || {};


    state.directoryMeta = {

        summary: {

            total:
                Number(summary.total) || 0,

            verified:
                Number(summary.verified) || 0,

            employed:
                Number(summary.employed) || 0

        },

        filters: {

            programs:
                Array.isArray(filters.programs)
                    ? filters.programs
                    : [],

            batches:
                Array.isArray(filters.batches)
                    ? filters.batches
                    : []

        }

    };

}



/* =========================================================
   LOAD ALUMNI
========================================================= */

async function loadAlumni() {

    const params =
        new URLSearchParams();


    params.set(
        "page",
        state.page
    );

    params.set(
        "limit",
        state.limit
    );


    const search =
        el.directorySearchInput
            ?.value
            ?.trim();

    const program =
        el.programFilter
            ?.value;

    const batch =
        el.batchFilter
            ?.value;

    const verification =
        el.verificationFilter
            ?.value;

    const sort =
        el.directorySort
            ?.value ||
        "name";


    if (search) {
        params.set(
            "search",
            search
        );
    }


    if (program) {
        params.set(
            "program",
            program
        );
    }


    if (batch) {
        params.set(
            "batch",
            batch
        );
    }


    if (verification) {
        params.set(
            "verification",
            verification
        );
    }


    params.set(
        "sort",
        sort
    );


    const response =
        await apiRequest(
            `/alumni?${params.toString()}`,
            {
                method: "GET"
            }
        );


    const records =
        extractArray(
            response,
            [
                "alumni",
                "data",
                "records",
                "users"
            ]
        );


    state.alumni =
        records
            .map(normalizeAlumni)
            .filter(shouldDisplayAlumni);


    state.filteredAlumni =
        [...state.alumni];


    state.total =
        Number(response.total) || 0;


    state.page =
        Number(response.page) || 1;


    state.limit =
        Number(response.limit) || 20;


    state.totalPages =
        Math.max(
            Number(response.totalPages) || 1,
            1
        );


    renderAlumni();

    renderPagination();

}



/* =========================================================
   NORMALIZE ALUMNI
========================================================= */

function normalizeAlumni(person) {

    return {

        userId:
            person.user_id ??
            person.id ??
            null,


        firstName:
            person.first_name ??
            "",


        middleName:
            person.middle_name ??
            "",


        lastName:
            person.last_name ??
            "",


        email:
            person.email ??
            "",


        studentNumber:
            person.student_number ??
            "",


        program:
            person.program ??
            person.course ??
            "",


        batchYear:
            person.batch_year ??
            person.batch ??
            "",


        currentJob:
            person.current_job ??
            person.job_title ??
            person.position ??
            "",


        company:
            person.company ??
            person.company_name ??
            "",


        isVerified:
            isVerifiedUser(person),


        isActive:
            person.is_active !== false &&
            person.is_active !== 0 &&
            person.is_active !== "false",


        verificationStatus:
            person.verification_status ??
            (
                isVerifiedUser(person)
                    ? "verified"
                    : "pending"
            )

    };

}



/* =========================================================
   DIRECTORY VISIBILITY
========================================================= */

function shouldDisplayAlumni(person) {

    /*
        Alumni Directory should only show active
        alumni accounts.

        Verification can still be filtered separately.
    */

    return person.isActive;

}



/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const summary =
        state.directoryMeta?.summary || {};


    setText(
        el.totalAlumniCount,
        Number(summary.total) || 0
    );


    setText(
        el.verifiedAlumniCount,
        Number(summary.verified) || 0
    );


    setText(
        el.employedAlumniCount,
        Number(summary.employed) || 0
    );

}



/* =========================================================
   POPULATE FILTER OPTIONS
========================================================= */

function populateFilters() {

    populateProgramFilter();

    populateBatchFilter();

}



function populateProgramFilter() {

    if (!el.programFilter) {

        return;

    }


    const selectedValue =
        el.programFilter.value;


    const programs =
        [
            ...new Set(
                (
                    state.directoryMeta
                        ?.filters
                        ?.programs ||
                    []
                )
                    .map(
                        program =>
                            String(
                                program || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


    el.programFilter.innerHTML =
        `
            <option value="">
                All Programs
            </option>

            ${
                programs
                    .map(
                        program => `
                            <option value="${escapeHtml(program)}">
                                ${escapeHtml(program)}
                            </option>
                        `
                    )
                    .join("")
            }
        `;


    if (
        programs.includes(
            selectedValue
        )
    ) {

        el.programFilter.value =
            selectedValue;

    }

}



function populateBatchFilter() {

    if (!el.batchFilter) {

        return;

    }


    const selectedValue =
        String(
            el.batchFilter.value || ""
        );


    const batches =
        [
            ...new Set(
                (
                    state.directoryMeta
                        ?.filters
                        ?.batches ||
                    []
                )
                    .map(
                        batch =>
                            String(
                                batch ?? ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a, b) =>
                    Number(b) -
                    Number(a)
            );


    el.batchFilter.innerHTML =
        `
            <option value="">
                All Batches
            </option>

            ${
                batches
                    .map(
                        batch => `
                            <option value="${escapeHtml(batch)}">
                                ${escapeHtml(batch)}
                            </option>
                        `
                    )
                    .join("")
            }
        `;


    if (
        batches.includes(
            selectedValue
        )
    ) {

        el.batchFilter.value =
            selectedValue;

    }

}



/* =========================================================
   FILTER DIRECTORY
========================================================= */

async function applyFilters() {

    state.page = 1;

    try {

        await loadAlumni();

    } catch (error) {

        console.error(
            "FILTER DIRECTORY ERROR:",
            error
        );

        showToast(
            "Unable to filter directory",
            error.message ||
                "Please try again.",
            "error"
        );

    }

}



/* =========================================================
   SORT
========================================================= */

function sortAlumni() {

    const sort =
        el.directorySort
            ?.value ||
        "name";


    state.filteredAlumni.sort(
        (a, b) => {

            switch (sort) {


                case "batch-newest":

                    return (
                        Number(
                            b.batchYear || 0
                        ) -
                        Number(
                            a.batchYear || 0
                        )
                    );


                case "batch-oldest":

                    return (
                        Number(
                            a.batchYear || 0
                        ) -
                        Number(
                            b.batchYear || 0
                        )
                    );


                case "program":

                    return String(
                        a.program || ""
                    ).localeCompare(
                        String(
                            b.program || ""
                        )
                    );


                case "name":
                default:

                    return getFullName(a)
                        .localeCompare(
                            getFullName(b)
                        );

            }

        }
    );

}



/* =========================================================
   RENDER DIRECTORY
========================================================= */

function renderAlumni() {

    hideAllStates();


    const alumni =
        state.filteredAlumni;


    setText(
        el.directoryResultText,
        `${state.total} alumni member${
            state.total === 1
                ? ""
                : "s"
        } found`
    );


    if (
        alumni.length === 0
    ) {

        el.directoryEmptyState
            ?.classList
            .remove("hidden");


        return;

    }


    if (!el.alumniGrid) {

        return;

    }


    el.alumniGrid
        .classList
        .remove("hidden");


    el.alumniGrid.innerHTML =
        alumni
            .map(
                createAlumniCard
            )
            .join("");

}


function renderPagination() {

    if (!el.directoryPagination) {
        return;
    }


    if (
        state.total === 0 ||
        state.alumni.length === 0
    ) {

        el.directoryPagination
            .classList
            .add("hidden");

        return;

    }


    const start =
        ((state.page - 1) * state.limit) + 1;


    const end =
        Math.min(
            state.page * state.limit,
            state.total
        );


    setText(
        el.paginationInfo,
        `Showing ${start}–${end} of ${state.total} alumni`
    );


    setText(
        el.paginationPageInfo,
        `Page ${state.page} of ${state.totalPages}`
    );


    if (el.previousPageBtn) {

        el.previousPageBtn.disabled =
            state.page <= 1;

    }


    if (el.nextPageBtn) {

        el.nextPageBtn.disabled =
            state.page >= state.totalPages;

    }


    el.directoryPagination
        .classList
        .remove("hidden");

}


async function previousPage() {

    if (state.page <= 1) {
        return;
    }


    state.page--;


    try {

        await loadAlumni();

        scrollToDirectory();

    } catch (error) {

        state.page++;

        showToast(
            "Unable to change page",
            error.message ||
                "Please try again.",
            "error"
        );

    }

}


async function nextPage() {

    if (
        state.page >=
        state.totalPages
    ) {
        return;
    }


    state.page++;


    try {

        await loadAlumni();

        scrollToDirectory();

    } catch (error) {

        state.page--;

        showToast(
            "Unable to change page",
            error.message ||
                "Please try again.",
            "error"
        );

    }

}


function scrollToDirectory() {

    el.directoryResultText
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}



/* =========================================================
   ALUMNI CARD
========================================================= */

function createAlumniCard(person) {

    const fullName =
        getFullName(person) ||
        "Alumni Member";


    const initials =
        getInitials(
            person.firstName,
            person.lastName
        );


    const program =
        person.program ||
        "Program not specified";


    const batch =
        person.batchYear
            ? `Batch ${person.batchYear}`
            : "Batch not specified";


    const job =
        person.currentJob ||
        "Career information not provided";


    const company =
        person.company ||
        "";


    return `
        <article class="alumni-card">

            <div class="alumni-card-header">

                <div class="alumni-avatar">
                    ${escapeHtml(initials)}
                </div>


                ${
                    person.isVerified

                        ? `
                            <span class="verified-badge">
                                <i class="bx bxs-check-circle"></i>
                                Verified
                            </span>
                        `

                        : ""
                }

            </div>


            <div class="alumni-card-body">

                <h3>
                    ${escapeHtml(fullName)}
                </h3>


                <p class="alumni-email">
                    ${escapeHtml(
                        person.email ||
                        "Email not available"
                    )}
                </p>


                <div class="alumni-academic-info">

                    <span>
                        <i class="bx bxs-graduation"></i>

                        ${escapeHtml(program)}
                    </span>


                    <span>
                        <i class="bx bx-calendar"></i>

                        ${escapeHtml(batch)}
                    </span>

                </div>


                <div class="alumni-career-info">

                    <i class="bx bx-briefcase"></i>

                    <div>

                        <strong>
                            ${escapeHtml(job)}
                        </strong>

                        ${
                            company

                                ? `
                                    <span>
                                        ${escapeHtml(company)}
                                    </span>
                                `

                                : ""
                        }

                    </div>

                </div>

            </div>


            <div class="alumni-card-footer">

                <button
                    type="button"
                    class="view-alumni-btn"
                    data-user-id="${escapeHtml(
                        person.userId
                    )}"
                >

                    <i class="bx bx-user"></i>

                    View Profile

                </button>

            </div>

        </article>
    `;

}



/* =========================================================
   CARD CLICK
========================================================= */

function handleAlumniGridClick(event) {

    const button =
        event.target.closest(
            "[data-user-id]"
        );


    if (!button) {

        return;

    }


    const person =
        state.alumni.find(
            alumni =>
                String(
                    alumni.userId
                ) ===
                String(
                    button.dataset.userId
                )
        );


    if (!person) {

        showToast(
            "Profile unavailable",
            "Unable to find this alumni profile.",
            "error"
        );

        return;

    }


    openAlumniModal(person);

}



/* =========================================================
   OPEN ALUMNI MODAL
========================================================= */

function openAlumniModal(person) {

    state.selectedAlumni =
        person;


    const fullName =
        getFullName(person) ||
        "Alumni Member";


    setText(
        el.modalAlumniAvatar,
        getInitials(
            person.firstName,
            person.lastName
        )
    );


    setText(
        el.modalAlumniName,
        fullName
    );


    setText(
        el.modalAlumniEmail,
        person.email ||
        "Email not available"
    );


    setText(
        el.modalStudentNumber,
        person.studentNumber ||
        "Not provided"
    );


    setText(
        el.modalProgram,
        person.program ||
        "Not provided"
    );


    setText(
        el.modalBatchYear,
        person.batchYear ||
        "Not provided"
    );


    setText(
        el.modalCurrentJob,
        person.currentJob ||
        "Not provided"
    );


    setText(
        el.modalCompany,
        person.company ||
        "Not provided"
    );


    setText(
        el.modalVerificationStatus,
        person.isVerified
            ? "Verified Alumni"
            : formatLabel(
                person.verificationStatus ||
                "Pending"
            )
    );


    el.modalVerifiedBadge
        ?.classList
        .toggle(
            "hidden",
            !person.isVerified
        );


    el.alumniDetailsModal
        ?.classList
        .remove("hidden");


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAlumniModal() {

    el.alumniDetailsModal
        ?.classList
        .add("hidden");


    document.body.style.overflow =
        "";


    state.selectedAlumni =
        null;

}



/* =========================================================
   REFRESH
========================================================= */

async function refreshDirectory() {

    const icon =
        el.refreshDirectoryBtn
            ?.querySelector("i");


    icon
        ?.classList
        .add("bx-spin");


    try {

        await Promise.all([
            loadDirectoryMeta(),
            loadAlumni()
        ]);


        populateFilters();

        updateSummary();


        showToast(
            "Directory refreshed",
            "Latest alumni records have been loaded.",
            "success"
        );


    } catch (error) {

        console.error(
            "REFRESH DIRECTORY ERROR:",
            error
        );


        if (
            error.status === 401
        ) {

            clearSession();

            redirectToLogin();

            return;

        }


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
        el.directorySearchInput
    ) {

        el.directorySearchInput.value =
            "";


        el.directorySearchInput.focus();

    }


    state.page = 1;
    loadAlumni();

}



/* =========================================================
   RESET FILTERS
========================================================= */

function resetFilters() {

    if (
        el.directorySearchInput
    ) {

        el.directorySearchInput.value =
            "";

    }


    if (
        el.programFilter
    ) {

        el.programFilter.value =
            "";

    }


    if (
        el.batchFilter
    ) {

        el.batchFilter.value =
            "";

    }


    if (
        el.verificationFilter
    ) {

        el.verificationFilter.value =
            "";

    }


    if (
        el.directorySort
    ) {

        el.directorySort.value =
            "name";

    }


    state.page = 1;
    loadAlumni();

}



/* =========================================================
   PAGE STATES
========================================================= */

function hideAllStates() {

    el.directoryLoadingState
        ?.classList
        .add("hidden");


    el.directoryErrorState
        ?.classList
        .add("hidden");


    el.directoryEmptyState
        ?.classList
        .add("hidden");


    el.alumniGrid
        ?.classList
        .add("hidden");


    el.directoryPagination
        ?.classList
        .add("hidden");

}



function showLoadingState() {

    hideAllStates();


    el.directoryLoadingState
        ?.classList
        .remove("hidden");


    setText(
        el.directoryResultText,
        "Loading alumni records..."
    );

}



function showErrorState(message) {

    hideAllStates();


    el.directoryErrorState
        ?.classList
        .remove("hidden");


    setText(
        el.directoryErrorMessage,
        message
    );


    setText(
        el.directoryResultText,
        "Unable to load alumni records"
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


    applyTheme(savedTheme);

}



function toggleTheme() {

    const nextTheme =

        document.body
            .classList
            .contains("dark-mode")

            ? "light"

            : "dark";


    applyTheme(nextTheme);

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

}



/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(event) {

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


        el.directorySearchInput
            ?.focus();

    }


    if (
        event.key === "Escape"
    ) {

        closeAlumniModal();

        closeSidebar();

    }

}



/* =========================================================
   API REQUEST
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
                JSON.parse(rawText);

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
        Array.isArray(payload)
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



function getFullName(person) {

    const firstName =
        person.firstName ??
        person.first_name ??
        "";


    const middleName =
        person.middleName ??
        person.middle_name ??
        "";


    const lastName =
        person.lastName ??
        person.last_name ??
        "";


    return [
        firstName,
        middleName,
        lastName
    ]
        .filter(Boolean)
        .join(" ")
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}



function getInitials(
    firstName,
    lastName
) {

    const first =
        String(
            firstName || ""
        ).trim();


    const last =
        String(
            lastName || ""
        ).trim();


    const initials =
        `${
            first.charAt(0)
        }${
            last.charAt(0)
        }`
            .toUpperCase();


    return initials || "AL";

}



function isVerifiedUser(person) {

    return (

        person?.is_verified === true ||

        person?.is_verified === 1 ||

        person?.is_verified === "true" ||

        normalizeText(
            person?.verification_status
        ) === "verified" ||

        normalizeText(
            person?.verification_status
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



function formatLabel(value) {

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
        .appendChild(toast);


    window.setTimeout(
        () =>
            toast.remove(),
        4000
    );

}



function debounce(
    callback,
    delay = 350
) {

    let timer;


    return (...args) => {

        clearTimeout(timer);


        timer =
            setTimeout(
                () => {
                    callback(...args);
                },
                delay
            );

    };

}



/* =========================================================
   ESCAPE HTML
========================================================= */

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