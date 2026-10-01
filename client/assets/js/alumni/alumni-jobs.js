"use strict";


/* =========================================================
   ALUMNIHUB
   ALUMNI JOB OPPORTUNITIES
========================================================= */


const API_BASE_URL = "/api";


const state = {

    user: null,

    jobs: [],

    filteredJobs: [],

    selectedJob: null

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
        "menuToggle",
        "sidebarOverlay",

        "sidebarAvatar",
        "sidebarUserName",

        "topbarAvatar",
        "topbarUserName",

        "refreshJobsBtn",
        "themeToggle",
        "themeIcon",
        "logoutBtn",

        "availableJobsCount",
        "companyCount",
        "flexibleJobsCount",

        "jobSearchInput",
        "clearSearchBtn",

        "employmentTypeFilter",
        "workSetupFilter",
        "jobStatusFilter",
        "resetFiltersBtn",

        "jobResultText",
        "jobSort",

        "jobsLoadingState",

        "jobsErrorState",
        "jobsErrorMessage",
        "retryJobsBtn",

        "jobsEmptyState",
        "emptyResetBtn",

        "jobsGrid",

        "jobDetailsModal",

        "modalCompanyLogo",
        "modalJobStatus",
        "jobModalTitle",
        "modalCompanyName",

        "closeJobModalBtn",

        "modalLocation",
        "modalEmploymentType",
        "modalWorkSetup",
        "modalSalary",
        "modalDeadline",
        "modalPostedDate",

        "modalDescription",
        "modalRequirements",

        "jobContactSection",

        "contactEmailRow",
        "modalContactEmail",

        "applicationLinkRow",
        "modalApplicationLink",

        "modalCloseFooterBtn",

        "applyJobBtn",
        "emailApplicationBtn",

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


    el.refreshJobsBtn
        ?.addEventListener(
            "click",
            refreshJobs
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


    el.jobSearchInput
        ?.addEventListener(
            "input",
            applyFilters
        );


    el.clearSearchBtn
        ?.addEventListener(
            "click",
            clearSearch
        );


    el.employmentTypeFilter
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.workSetupFilter
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.jobStatusFilter
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.jobSort
        ?.addEventListener(
            "change",
            applyFilters
        );


    el.resetFiltersBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.emptyResetBtn
        ?.addEventListener(
            "click",
            resetFilters
        );


    el.retryJobsBtn
        ?.addEventListener(
            "click",
            loadPageData
        );


    el.jobsGrid
        ?.addEventListener(
            "click",
            handleJobGridClick
        );


    el.closeJobModalBtn
        ?.addEventListener(
            "click",
            closeJobModal
        );


    el.modalCloseFooterBtn
        ?.addEventListener(
            "click",
            closeJobModal
        );


    el.jobDetailsModal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    el.jobDetailsModal
                ) {

                    closeJobModal();

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


async function loadPageData() {


    showLoadingState();


    try {


        await loadCurrentUser();

        await loadJobs();


        updateSummary();

        applyFilters();


    } catch (error) {


        console.error(
            "LOAD ALUMNI JOBS ERROR:",
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
            "Unable to load job opportunities."
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
   RENDER USER
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
        el.sidebarUserName,
        fullName
    );


    setText(
        el.topbarUserName,
        fullName
    );


    renderSharedAlumniAvatar(
        el.sidebarAvatar,
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
   LOAD JOBS
========================================================= */


async function loadJobs() {


    const response =
        await apiRequest(
            "/jobs",
            {
                method: "GET"
            }
        );


    const rawJobs =
        extractArray(
            response,
            [

                "jobs",
                "data",
                "records"

            ]
        );


    state.jobs =
        rawJobs
            .map(
                normalizeJob
            )
            .filter(
                shouldDisplayJob
            );

}



/* =========================================================
   NORMALIZE JOB
========================================================= */


function normalizeJob(job) {


    return {


        id:
            job.job_id ??
            job.id ??
            null,


        title:
            job.title ??
            job.job_title ??
            "Untitled Job",


        company:
            job.company ??
            job.company_name ??
            "Company not specified",


        location:
            job.location ??
            job.job_location ??
            "Not specified",


        employmentType:
            job.employment_type ??
            job.job_type ??
            job.type ??
            "",


        workSetup:
            job.work_setup ??
            job.work_mode ??
            job.mode ??
            "",


        salary:
            job.salary ??
            job.salary_range ??
            job.compensation ??
            "",


        description:
            job.description ??
            job.job_description ??
            "",


        requirements:
            job.requirements ??
            job.qualifications ??
            "",


        contactEmail:
            job.contact_email ??
            job.application_email ??
            job.email ??
            "",


        applicationLink:
            job.application_link ??
            job.apply_link ??
            job.external_link ??
            "",


        deadline:
            job.application_deadline ??
            job.deadline ??
            null,


        status:
            normalizeText(
                job.status ||
                "active"
            ),


        createdAt:
            job.created_at ??
            null,


        updatedAt:
            job.updated_at ??
            null

    };

}



/* =========================================================
   VISIBLE JOBS
========================================================= */


function shouldDisplayJob(
    job
) {


    if (
        [

            "draft",
            "archived",
            "deleted",
            "inactive"

        ]
            .includes(
                job.status
            )
    ) {

        return false;

    }


    return true;

}



/* =========================================================
   SUMMARY
========================================================= */


function updateSummary() {


    const availableJobs =
        state.jobs.filter(
            job =>
                isAvailableJob(
                    job
                )
        );


    const companies =
        new Set(
            availableJobs
                .map(
                    job =>
                        normalizeText(
                            job.company
                        )
                )
                .filter(Boolean)
        );


    const flexibleJobs =
        availableJobs.filter(
            job => {

                const setup =
                    normalizeText(
                        job.workSetup
                    );


                return (
                    setup === "remote" ||
                    setup === "hybrid"
                );

            }
        );


    setText(
        el.availableJobsCount,
        availableJobs.length
    );


    setText(
        el.companyCount,
        companies.size
    );


    setText(
        el.flexibleJobsCount,
        flexibleJobs.length
    );

}



/* =========================================================
   AVAILABLE CHECK
========================================================= */


function isAvailableJob(
    job
) {


    if (
        [

            "closed",
            "inactive",
            "archived",
            "draft",
            "deleted"

        ]
            .includes(
                job.status
            )
    ) {

        return false;

    }


    if (
        job.deadline
    ) {


        const deadline =
            parseDate(
                job.deadline
            );


        if (
            deadline &&
            deadline <
            startOfToday(
                new Date()
            )
        ) {

            return false;

        }

    }


    return true;

}



/* =========================================================
   FILTERS
========================================================= */


function applyFilters() {


    const search =
        normalizeText(
            el.jobSearchInput
                ?.value
        );


    const employmentType =
        normalizeText(
            el.employmentTypeFilter
                ?.value
        );


    const workSetup =
        normalizeText(
            el.workSetupFilter
                ?.value
        );


    const status =
        normalizeText(
            el.jobStatusFilter
                ?.value
        );


    state.filteredJobs =
        state.jobs.filter(
            job => {


                const searchableText =
                    normalizeText(
                        [

                            job.title,
                            job.company,
                            job.location,
                            job.description,
                            job.requirements,
                            job.employmentType,
                            job.workSetup

                        ]
                            .join(" ")
                    );


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const matchesEmployment =
                    !employmentType ||
                    normalizeText(
                        job.employmentType
                    ) ===
                    employmentType;


                const matchesSetup =
                    !workSetup ||
                    normalizeText(
                        job.workSetup
                    ) ===
                    workSetup;


                let matchesStatus =
                    true;


                if (
                    status === "active"
                ) {

                    matchesStatus =
                        isAvailableJob(
                            job
                        );

                } else if (
                    status
                ) {

                    matchesStatus =
                        normalizeText(
                            job.status
                        ) ===
                        status;

                }


                return (

                    matchesSearch &&
                    matchesEmployment &&
                    matchesSetup &&
                    matchesStatus

                );

            }
        );


    sortFilteredJobs();

    renderJobs();

}



/* =========================================================
   SORT
========================================================= */


function sortFilteredJobs() {


    const sort =
        el.jobSort
            ?.value ||
        "newest";


    state.filteredJobs.sort(
        (a, b) => {


            switch (
                sort
            ) {


                case "oldest":

                    return (
                        dateTimestamp(
                            a.createdAt
                        ) -
                        dateTimestamp(
                            b.createdAt
                        )
                    );


                case "deadline":

                    return (
                        deadlineTimestamp(
                            a.deadline
                        ) -
                        deadlineTimestamp(
                            b.deadline
                        )
                    );


                case "company":

                    return String(
                        a.company
                    )
                        .localeCompare(
                            String(
                                b.company
                            )
                        );


                case "newest":
                default:

                    return (
                        dateTimestamp(
                            b.createdAt
                        ) -
                        dateTimestamp(
                            a.createdAt
                        )
                    );

            }

        }
    );

}



/* =========================================================
   RENDER JOBS
========================================================= */


function renderJobs() {


    hideAllStates();


    const jobs =
        state.filteredJobs;


    setText(
        el.jobResultText,
        `${jobs.length} job${
            jobs.length === 1
                ? ""
                : "s"
        } found`
    );


    if (
        jobs.length === 0
    ) {


        el.jobsEmptyState
            ?.classList
            .remove("hidden");


        return;

    }


    if (
        !el.jobsGrid
    ) {

        return;

    }


    el.jobsGrid
        .classList
        .remove("hidden");


    el.jobsGrid.innerHTML =
        jobs
            .map(
                createJobCard
            )
            .join("");

}



/* =========================================================
   CREATE CARD
========================================================= */


function createJobCard(
    job
) {


    const companyInitials =
        getCompanyInitials(
            job.company
        );


    const employment =
        formatLabel(
            job.employmentType ||
            "Not specified"
        );


    const setup =
        formatLabel(
            job.workSetup ||
            "Not specified"
        );


    const deadline =
        job.deadline
            ? formatDate(
                job.deadline
            )
            : "No deadline";


    return `
        <article class="job-card">

            <div class="job-card-top">

                <div class="job-company-logo">
                    ${escapeHtml(
                        companyInitials
                    )}
                </div>

                <span class="job-status ${
                    isAvailableJob(job)
                        ? "active"
                        : "closed"
                }">
                    ${
                        isAvailableJob(job)
                            ? "Available"
                            : "Closed"
                    }
                </span>

            </div>


            <div class="job-card-content">

                <span class="job-company-name">
                    ${escapeHtml(
                        job.company
                    )}
                </span>

                <h3>
                    ${escapeHtml(
                        job.title
                    )}
                </h3>


                <div class="job-card-meta">

                    <span>
                        <i class="bx bx-map"></i>

                        ${escapeHtml(
                            job.location
                        )}
                    </span>


                    <span>
                        <i class="bx bx-briefcase"></i>

                        ${escapeHtml(
                            employment
                        )}
                    </span>


                    <span>
                        <i class="bx bx-laptop"></i>

                        ${escapeHtml(
                            setup
                        )}
                    </span>

                </div>


                <p class="job-card-description">

                    ${escapeHtml(
                        truncateText(
                            job.description ||
                            "No job description provided.",
                            150
                        )
                    )}

                </p>


                ${
                    job.salary
                        ? `
                            <div class="job-salary">
                                <i class="bx bx-money"></i>

                                ${escapeHtml(
                                    job.salary
                                )}
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="job-card-footer">

                <div>

                    <span class="job-deadline-label">
                        Deadline
                    </span>

                    <strong>
                        ${escapeHtml(
                            deadline
                        )}
                    </strong>

                </div>


                <button
                    type="button"
                    class="view-job-btn"
                    data-job-id="${escapeHtml(
                        job.id
                    )}"
                >

                    View Details

                </button>

            </div>

        </article>
    `;

}



/* =========================================================
   JOB CLICK
========================================================= */


function handleJobGridClick(
    event
) {


    const button =
        event.target.closest(
            "[data-job-id]"
        );


    if (
        !button
    ) {

        return;

    }


    const job =
        state.jobs.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    button.dataset.jobId
                )
        );


    if (
        !job
    ) {

        return;

    }


    openJobModal(
        job
    );

}



/* =========================================================
   OPEN MODAL
========================================================= */


function openJobModal(
    job
) {


    state.selectedJob =
        job;


    setText(
        el.jobModalTitle,
        job.title
    );


    setText(
        el.modalCompanyName,
        job.company
    );


    setText(
        el.modalJobStatus,
        isAvailableJob(job)
            ? "Available"
            : "Closed"
    );


    setText(
        el.modalLocation,
        job.location ||
        "Not specified"
    );


    setText(
        el.modalEmploymentType,
        formatLabel(
            job.employmentType ||
            "Not specified"
        )
    );


    setText(
        el.modalWorkSetup,
        formatLabel(
            job.workSetup ||
            "Not specified"
        )
    );


    setText(
        el.modalSalary,
        job.salary ||
        "Not specified"
    );


    setText(
        el.modalDeadline,
        job.deadline
            ? formatDate(
                job.deadline
            )
            : "No deadline"
    );


    setText(
        el.modalPostedDate,
        job.createdAt
            ? formatDate(
                job.createdAt
            )
            : "Not specified"
    );


    setText(
        el.modalDescription,
        job.description ||
        "No description provided."
    );


    renderRequirements(
        job.requirements
    );


    renderCompanyLogo(
        job.company
    );


    configureApplicationInfo(
        job
    );


    el.jobDetailsModal
        ?.classList
        .remove("hidden");


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   COMPANY LOGO
========================================================= */


function renderCompanyLogo(
    company
) {


    if (
        !el.modalCompanyLogo
    ) {

        return;

    }


    el.modalCompanyLogo.innerHTML =
        `
            <span>
                ${escapeHtml(
                    getCompanyInitials(
                        company
                    )
                )}
            </span>
        `;

}



/* =========================================================
   REQUIREMENTS
========================================================= */


function renderRequirements(
    requirements
) {


    if (
        !el.modalRequirements
    ) {

        return;

    }


    const text =
        String(
            requirements ||
            ""
        )
            .trim();


    if (
        !text
    ) {


        el.modalRequirements.textContent =
            "No specific requirements provided.";


        return;

    }


    const items =
        text
            .split(
                /\r?\n|•|;/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);


    if (
        items.length <= 1
    ) {


        el.modalRequirements.textContent =
            text;


        return;

    }


    el.modalRequirements.innerHTML =
        `
            <ul>
                ${
                    items
                        .map(
                            item => `
                                <li>
                                    ${escapeHtml(
                                        item
                                    )}
                                </li>
                            `
                        )
                        .join("")
                }
            </ul>
        `;

}



/* =========================================================
   APPLICATION INFORMATION
========================================================= */


function configureApplicationInfo(
    job
) {


    const hasEmail =
        Boolean(
            job.contactEmail
        );


    const hasLink =
        Boolean(
            job.applicationLink
        );


    el.contactEmailRow
        ?.classList
        .toggle(
            "hidden",
            !hasEmail
        );


    el.applicationLinkRow
        ?.classList
        .toggle(
            "hidden",
            !hasLink
        );


    if (
        el.modalContactEmail
    ) {


        if (
            hasEmail
        ) {


            el.modalContactEmail.textContent =
                job.contactEmail;


            el.modalContactEmail.href =
                `mailto:${job.contactEmail}`;


        } else {


            el.modalContactEmail.textContent =
                "—";


            el.modalContactEmail.href =
                "#";

        }

    }


    if (
        el.modalApplicationLink
    ) {


        if (
            hasLink
        ) {


            el.modalApplicationLink.href =
                normalizeUrl(
                    job.applicationLink
                );


        } else {


            el.modalApplicationLink.href =
                "#";

        }

    }


    if (
        el.applyJobBtn
    ) {


        el.applyJobBtn
            .classList
            .toggle(
                "hidden",
                !hasLink
            );


        if (
            hasLink
        ) {


            el.applyJobBtn.href =
                normalizeUrl(
                    job.applicationLink
                );

        }

    }


    if (
        el.emailApplicationBtn
    ) {


        el.emailApplicationBtn
            .classList
            .toggle(
                "hidden",
                !hasEmail ||
                hasLink
            );


        if (
            hasEmail
        ) {


            const subject =
                encodeURIComponent(
                    `Application for ${job.title}`
                );


            el.emailApplicationBtn.href =
                `mailto:${job.contactEmail}?subject=${subject}`;

        }

    }


    if (
        el.jobContactSection
    ) {


        el.jobContactSection
            .classList
            .toggle(
                "hidden",
                !hasEmail &&
                !hasLink
            );

    }

}



/* =========================================================
   CLOSE MODAL
========================================================= */


function closeJobModal() {


    el.jobDetailsModal
        ?.classList
        .add("hidden");


    document.body.style.overflow =
        "";


    state.selectedJob =
        null;

}



/* =========================================================
   REFRESH
========================================================= */


async function refreshJobs() {


    const button =
        el.refreshJobsBtn;


    const icon =
        button
            ?.querySelector("i");


    icon
        ?.classList
        .add("bx-spin");


    try {


        await loadJobs();


        updateSummary();

        applyFilters();


        showToast(
            "Jobs refreshed",
            "Latest job opportunities have been loaded.",
            "success"
        );


    } catch (error) {


        console.error(
            "REFRESH JOBS ERROR:",
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
        el.jobSearchInput
    ) {


        el.jobSearchInput.value =
            "";


        el.jobSearchInput.focus();

    }


    applyFilters();

}



/* =========================================================
   RESET FILTERS
========================================================= */


function resetFilters() {


    if (
        el.jobSearchInput
    ) {

        el.jobSearchInput.value =
            "";

    }


    if (
        el.employmentTypeFilter
    ) {

        el.employmentTypeFilter.value =
            "";

    }


    if (
        el.workSetupFilter
    ) {

        el.workSetupFilter.value =
            "";

    }


    if (
        el.jobStatusFilter
    ) {

        el.jobStatusFilter.value =
            "active";

    }


    if (
        el.jobSort
    ) {

        el.jobSort.value =
            "newest";

    }


    applyFilters();

}



/* =========================================================
   STATES
========================================================= */


function hideAllStates() {


    el.jobsLoadingState
        ?.classList
        .add("hidden");


    el.jobsErrorState
        ?.classList
        .add("hidden");


    el.jobsEmptyState
        ?.classList
        .add("hidden");


    el.jobsGrid
        ?.classList
        .add("hidden");

}



function showLoadingState() {


    hideAllStates();


    el.jobsLoadingState
        ?.classList
        .remove("hidden");


    setText(
        el.jobResultText,
        "Loading job opportunities..."
    );

}



function showErrorState(
    message
) {


    hideAllStates();


    el.jobsErrorState
        ?.classList
        .remove("hidden");


    setText(
        el.jobsErrorMessage,
        message
    );


    setText(
        el.jobResultText,
        "Unable to load jobs"
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


        el.jobSearchInput
            ?.focus();

    }


    if (
        event.key ===
        "Escape"
    ) {


        closeJobModal();

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



function deadlineTimestamp(
    value
) {


    return (
        parseDate(
            value
        )
            ?.getTime() ||
        Number.MAX_SAFE_INTEGER
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
                    "short",

                day:
                    "numeric"

            }
        );

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



function getCompanyInitials(
    company
) {


    const words =
        String(
            company ||
            "Company"
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(Boolean);


    if (
        words.length === 1
    ) {

        return words[0]
            .slice(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        `${
            words[0]
                ?.charAt(0) ||
            ""
        }${
            words[1]
                ?.charAt(0) ||
            ""
        }`
    )
        .toUpperCase();

}



function normalizeUrl(
    value
) {


    const url =
        String(
            value ||
            ""
        )
            .trim();


    if (
        /^https?:\/\//i
            .test(
                url
            )
    ) {

        return url;

    }


    return (
        url
            ? `https://${url}`
            : "#"
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