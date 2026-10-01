"use strict";

const API_BASE_URL = "http://localhost:5000/api";

const ALUMNI_ENDPOINT = `${API_BASE_URL}/alumni`;
const EVENTS_ENDPOINT = `${API_BASE_URL}/events`;

const PAGE_SIZE = 10;

const state = {
    alumni: [],
    events: [],
    currentReportRows: [],
    filteredReportRows: [],
    currentColumns: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    reportType: "alumni"
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    initializeProfile();
    bindEvents();
    setCurrentYear();

    window.setTimeout(() => {
        el.pageLoader?.classList.add("hide");
    }, 250);

    loadInitialData();
});


function cacheElements() {

    [
        "sidebar",
        "sidebarOverlay",
        "sidebarClose",
        "menuToggle",

        "globalSearch",
        "themeToggle",
        "themeIcon",

        "headerProfileButton",
        "profileDropdown",

        "logoutButton",
        "profileLogoutButton",
        "confirmLogoutButton",

        "refreshButton",
        "printReportButton",
        "exportCsvButton",

        "totalAlumniCount",
        "verifiedAlumniCount",
        "employedAlumniCount",
        "totalEventsCount",

        "reportType",
        "programFilter",
        "batchFilter",
        "employmentFilter",
        "verificationFilter",
        "startDateFilter",
        "endDateFilter",
        "resetFiltersButton",
        "generateReportButton",

        "reportPreviewTitle",
        "reportPreviewDescription",
        "reportResultCount",

        "reportSearch",
        "clearReportSearchButton",
        "generatedTime",

        "reportsLoading",
        "reportsErrorState",
        "reportsErrorMessage",
        "retryButton",
        "reportsEmptyState",

        "reportTableWrapper",
        "reportTableHead",
        "reportTableBody",

        "paginationContainer",
        "paginationStart",
        "paginationEnd",
        "paginationTotal",
        "paginationPages",
        "previousPageButton",
        "nextPageButton",

        "logoutModal",
        "pageLoader",
        "toastContainer",
        "currentYear",

        "sidebarUserName",
        "headerUserName",
        "sidebarInitials",
        "headerInitials",
        "sidebarProfileImage",
        "headerProfileImage"

    ].forEach(id => {
        el[id] = document.getElementById(id);
    });

}


function bindEvents() {

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


    el.themeToggle?.addEventListener(
        "click",
        toggleTheme
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


    el.refreshButton?.addEventListener(
        "click",
        async () => {

            await loadInitialData(true);

        }
    );


    el.generateReportButton?.addEventListener(
        "click",
        generateReport
    );


    el.resetFiltersButton?.addEventListener(
        "click",
        resetReportFilters
    );


    el.reportSearch?.addEventListener(
        "input",
        () => {

            if (
                el.clearReportSearchButton
            ) {

                el.clearReportSearchButton.hidden =
                    !el.reportSearch.value.trim();

            }

            state.currentPage = 1;

            applyReportSearch();

        }
    );


    el.globalSearch?.addEventListener(
        "input",
        () => {

            if (
                el.reportSearch
            ) {

                el.reportSearch.value =
                    el.globalSearch.value;

            }

            if (
                el.clearReportSearchButton
            ) {

                el.clearReportSearchButton.hidden =
                    !el.globalSearch.value.trim();

            }

            state.currentPage = 1;

            applyReportSearch();

        }
    );


    el.clearReportSearchButton?.addEventListener(
        "click",
        () => {

            if (
                el.reportSearch
            ) {

                el.reportSearch.value =
                    "";

            }


            if (
                el.globalSearch
            ) {

                el.globalSearch.value =
                    "";

            }


            el.clearReportSearchButton.hidden =
                true;


            state.currentPage =
                1;


            applyReportSearch();


            el.reportSearch?.focus();

        }
    );


    el.previousPageButton?.addEventListener(
        "click",
        () => changePage(
            state.currentPage - 1
        )
    );


    el.nextPageButton?.addEventListener(
        "click",
        () => changePage(
            state.currentPage + 1
        )
    );


    el.exportCsvButton?.addEventListener(
        "click",
        exportCurrentReportToCsv
    );


    el.printReportButton?.addEventListener(
        "click",
        printCurrentReport
    );


    el.retryButton?.addEventListener(
        "click",
        generateReport
    );


    el.reportType?.addEventListener(
        "change",
        () => {

            updateReportFilterAvailability();

        }
    );


    [
        el.logoutButton,
        el.profileLogoutButton

    ].forEach(button => {

        button?.addEventListener(
            "click",
            () => openModal(
                "logoutModal"
            )
        );

    });


    el.confirmLogoutButton?.addEventListener(
        "click",
        performLogout
    );


    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.closeModal
                    );

                }
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

                (
                    el.globalSearch ||
                    el.reportSearch
                )?.focus();

            }


            if (
                event.key === "Escape"
            ) {

                closeSidebar();

                document
                    .querySelectorAll(
                        ".modal.show"
                    )
                    .forEach(modal => {

                        closeModal(
                            modal.id
                        );

                    });

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                960
            ) {

                closeSidebar();

            }

        }
    );

}


async function loadInitialData(
    showToastMessage = false
) {

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

        const [
            alumniResponse,
            eventsResponse
        ] = await Promise.all([

            fetch(
                ALUMNI_ENDPOINT,
                {
                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            ),

            fetch(
                EVENTS_ENDPOINT,
                {
                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            )

        ]);


        const alumniBody =
            await safeJson(
                alumniResponse
            );


        const eventsBody =
            await safeJson(
                eventsResponse
            );


        if (
            !alumniResponse.ok
        ) {

            throw new Error(
                alumniBody?.message ||
                "Unable to load alumni records."
            );

        }


        if (
            !eventsResponse.ok
        ) {

            throw new Error(
                eventsBody?.message ||
                "Unable to load event records."
            );

        }


        state.alumni =
            extractArray(
                alumniBody,
                [
                    "alumni",
                    "records",
                    "data"
                ]
            )
                .map(
                    normalizeAlumni
                );


        state.events =
            extractArray(
                eventsBody,
                [
                    "events",
                    "records",
                    "data"
                ]
            )
                .map(
                    normalizeEvent
                );


        updateSummaryCards();

        populateProgramFilter();

        populateBatchFilter();

        updateReportFilterAvailability();


        if (
            showToastMessage
        ) {

            showToast(
                "Reports refreshed",
                "Latest alumni and event information loaded.",
                "success"
            );

        }


    } catch (error) {

        console.error(
            "LOAD REPORT DATA ERROR:",
            error
        );


        showToast(
            "Unable to refresh data",
            error.message ||
            "Something went wrong.",
            "error"
        );

    }

}


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


function normalizeAlumni(item) {

    const fullName = [

        item.first_name,
        item.middle_name,
        item.last_name

    ]
        .filter(Boolean)
        .join(" ");


    const employmentStatus =
        (
            item.current_job ||
            item.company
        )
            ? "employed"
            : "unemployed";


    return {

        userId:
            item.user_id ??
            item.id,

        fullName:
            fullName ||
            item.full_name ||
            "Unnamed Alumni",

        email:
            item.email ||
            "",

        studentNumber:
            item.student_number ||
            "",

        program:
            item.program ||
            "",

        batchYear:
            item.batch_year ??
            "",

        isVerified:
            Boolean(
                item.is_verified
            ),

        isActive:
            item.is_active !==
                false,

        employmentStatus,

        currentJob:
            item.current_job ||
            "",

        company:
            item.company ||
            "",

        createdAt:
            item.created_at ||
            null,

        updatedAt:
            item.updated_at ||
            null

    };

}


function normalizeEvent(item) {

    return {

        id:
            item.event_id ??
            item.id,

        title:
            item.title ||
            "Untitled Event",

        type:
            item.event_type ||
            item.type ||
            "",

        status:
            item.status ||
            "",

        startDate:
            item.start_date ||
            null,

        endDate:
            item.end_date ||
            null,

        venue:
            item.venue ||
            "",

        mode:
            item.event_mode ||
            item.mode ||
            "",

        capacity:
            item.capacity ??
            null,

        rsvpCount:
            Number(
                item.rsvp_count ??
                item.rsvpCount ??
                0
            ),

        createdAt:
            item.created_at ||
            null

    };

}


function updateSummaryCards() {

    const totalAlumni =
        state.alumni.length;


    const verifiedAlumni =
        state.alumni.filter(
            alumni =>
                alumni.isVerified
        ).length;


    const employedAlumni =
        state.alumni.filter(
            alumni =>
                alumni.employmentStatus ===
                "employed"
        ).length;


    const totalEvents =
        state.events.length;


    setText(
        el.totalAlumniCount,
        totalAlumni
    );

    setText(
        el.verifiedAlumniCount,
        verifiedAlumni
    );

    setText(
        el.employedAlumniCount,
        employedAlumni
    );

    setText(
        el.totalEventsCount,
        totalEvents
    );

}


function populateProgramFilter() {

    if (
        !el.programFilter
    ) {
        return;
    }


    const currentValue =
        el.programFilter.value;


    const programs = [
        ...new Set(
            state.alumni
                .map(
                    item =>
                        item.program
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            a.localeCompare(b)
    );


    el.programFilter.innerHTML =
        `<option value="all">All Programs</option>`;


    programs.forEach(
        program => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                program;


            option.textContent =
                program;


            el.programFilter.appendChild(
                option
            );

        }
    );


    if (
        programs.includes(
            currentValue
        )
    ) {

        el.programFilter.value =
            currentValue;

    }

}


function populateBatchFilter() {

    if (
        !el.batchFilter
    ) {
        return;
    }


    const currentValue =
        el.batchFilter.value;


    const batches = [
        ...new Set(
            state.alumni
                .map(
                    item =>
                        String(
                            item.batchYear ||
                            ""
                        )
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            Number(b) -
            Number(a)
    );


    el.batchFilter.innerHTML =
        `<option value="all">All Batches</option>`;


    batches.forEach(
        batch => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                batch;


            option.textContent =
                batch;


            el.batchFilter.appendChild(
                option
            );

        }
    );


    if (
        batches.includes(
            currentValue
        )
    ) {

        el.batchFilter.value =
            currentValue;

    }

}


function updateReportFilterAvailability() {

    const type =
        el.reportType?.value ||
        "alumni";


    const isEvents =
        type === "events";


    [
        el.programFilter,
        el.batchFilter,
        el.employmentFilter,
        el.verificationFilter

    ].forEach(control => {

        if (control) {

            control.disabled =
                isEvents;

        }

    });


    if (
        el.startDateFilter
    ) {

        el.startDateFilter.disabled =
            false;

    }


    if (
        el.endDateFilter
    ) {

        el.endDateFilter.disabled =
            false;

    }

}


function generateReport() {

    try {

        showLoadingState();


        state.reportType =
            el.reportType?.value ||
            "alumni";


        const result =
            buildReport(
                state.reportType
            );


        state.currentColumns =
            result.columns;


        state.currentReportRows =
            result.rows;


        state.filteredReportRows =
            result.rows;


        state.currentPage =
            1;


        setText(
            el.reportPreviewTitle,
            result.title
        );


        setText(
            el.reportPreviewDescription,
            result.description
        );


        setText(
            el.generatedTime,
            `Generated ${formatDateTime(
                new Date()
            )}`
        );


        if (
            el.reportSearch
        ) {

            el.reportSearch.value =
                "";

        }


        if (
            el.globalSearch
        ) {

            el.globalSearch.value =
                "";

        }


        if (
            el.clearReportSearchButton
        ) {

            el.clearReportSearchButton.hidden =
                true;

        }


        renderReport();


    } catch (error) {

        console.error(
            "GENERATE REPORT ERROR:",
            error
        );


        showErrorState(
            error.message ||
            "Unable to generate report."
        );

    }

}


function buildReport(type) {

    switch (type) {

        case "employment":
            return buildEmploymentReport();

        case "batch":
            return buildBatchReport();

        case "program":
            return buildProgramReport();

        case "events":
            return buildEventsReport();

        case "alumni":
        default:
            return buildAlumniReport();

    }

}


function buildAlumniReport() {

    const rows =
        getFilteredAlumni()
            .map(
                item => ({

                    name:
                        item.fullName,

                    email:
                        item.email,

                    studentNumber:
                        item.studentNumber,

                    program:
                        item.program,

                    batch:
                        item.batchYear,

                    verification:
                        item.isVerified
                            ? "Verified"
                            : "Pending",

                    employment:
                        capitalize(
                            item.employmentStatus
                        )

                })
            );


    return {

        title:
            "Alumni Directory Report",

        description:
            "Directory of alumni records based on the selected filters.",

        columns: [

            {
                key:
                    "name",

                label:
                    "Alumni Name"
            },

            {
                key:
                    "email",

                label:
                    "Email"
            },

            {
                key:
                    "studentNumber",

                label:
                    "Student Number"
            },

            {
                key:
                    "program",

                label:
                    "Program"
            },

            {
                key:
                    "batch",

                label:
                    "Batch"
            },

            {
                key:
                    "verification",

                label:
                    "Verification",
                type:
                    "status"
            },

            {
                key:
                    "employment",

                label:
                    "Employment",
                type:
                    "status"
            }

        ],

        rows

    };

}


function buildEmploymentReport() {

    const rows =
        getFilteredAlumni()
            .map(
                item => ({

                    name:
                        item.fullName,

                    program:
                        item.program,

                    batch:
                        item.batchYear,

                    employment:
                        capitalize(
                            item.employmentStatus
                        ),

                    currentJob:
                        item.currentJob ||
                        "—",

                    company:
                        item.company ||
                        "—"

                })
            );


    return {

        title:
            "Employment Report",

        description:
            "Current employment information of alumni based on selected filters.",

        columns: [

            {
                key:
                    "name",

                label:
                    "Alumni Name"
            },

            {
                key:
                    "program",

                label:
                    "Program"
            },

            {
                key:
                    "batch",

                label:
                    "Batch"
            },

            {
                key:
                    "employment",

                label:
                    "Status",
                type:
                    "status"
            },

            {
                key:
                    "currentJob",

                label:
                    "Current Job"
            },

            {
                key:
                    "company",

                label:
                    "Company"
            }

        ],

        rows

    };

}


function buildBatchReport() {

    const filtered =
        getFilteredAlumni();


    const grouped =
        new Map();


    filtered.forEach(
        alumni => {

            const batch =
                String(
                    alumni.batchYear ||
                    "Unspecified"
                );


            if (
                !grouped.has(batch)
            ) {

                grouped.set(
                    batch,
                    {
                        batch,
                        total: 0,
                        verified: 0,
                        employed: 0,
                        unemployed: 0
                    }
                );

            }


            const item =
                grouped.get(
                    batch
                );


            item.total += 1;


            if (
                alumni.isVerified
            ) {

                item.verified += 1;

            }


            if (
                alumni.employmentStatus ===
                "employed"
            ) {

                item.employed += 1;

            } else {

                item.unemployed += 1;

            }

        }
    );


    const rows =
        Array.from(
            grouped.values()
        )
            .sort(
                (a, b) => {

                    if (
                        a.batch ===
                        "Unspecified"
                    ) {

                        return 1;

                    }

                    if (
                        b.batch ===
                        "Unspecified"
                    ) {

                        return -1;

                    }

                    return (
                        Number(b.batch) -
                        Number(a.batch)
                    );

                }
            );


    return {

        title:
            "Alumni by Batch Report",

        description:
            "Summary of alumni counts grouped by graduation batch.",

        columns: [

            {
                key:
                    "batch",

                label:
                    "Batch Year"
            },

            {
                key:
                    "total",

                label:
                    "Total Alumni"
            },

            {
                key:
                    "verified",

                label:
                    "Verified"
            },

            {
                key:
                    "employed",

                label:
                    "Employed"
            },

            {
                key:
                    "unemployed",

                label:
                    "Unemployed"
            }

        ],

        rows

    };

}


function buildProgramReport() {

    const filtered =
        getFilteredAlumni();


    const grouped =
        new Map();


    filtered.forEach(
        alumni => {

            const program =
                alumni.program ||
                "Unspecified";


            if (
                !grouped.has(
                    program
                )
            ) {

                grouped.set(
                    program,
                    {
                        program,
                        total: 0,
                        verified: 0,
                        employed: 0,
                        unemployed: 0
                    }
                );

            }


            const item =
                grouped.get(
                    program
                );


            item.total += 1;


            if (
                alumni.isVerified
            ) {

                item.verified += 1;

            }


            if (
                alumni.employmentStatus ===
                "employed"
            ) {

                item.employed += 1;

            } else {

                item.unemployed += 1;

            }

        }
    );


    const rows =
        Array.from(
            grouped.values()
        )
            .sort(
                (a, b) =>
                    a.program.localeCompare(
                        b.program
                    )
            );


    return {

        title:
            "Alumni by Program Report",

        description:
            "Summary of alumni records grouped by academic program.",

        columns: [

            {
                key:
                    "program",

                label:
                    "Program"
            },

            {
                key:
                    "total",

                label:
                    "Total Alumni"
            },

            {
                key:
                    "verified",

                label:
                    "Verified"
            },

            {
                key:
                    "employed",

                label:
                    "Employed"
            },

            {
                key:
                    "unemployed",

                label:
                    "Unemployed"
            }

        ],

        rows

    };

}


function buildEventsReport() {

    const start =
        el.startDateFilter?.value ||
        null;


    const end =
        el.endDateFilter?.value ||
        null;


    const rows =
        state.events
            .filter(
                event => {

                    const date =
                        normalizeDateString(
                            event.startDate
                        );


                    if (
                        start &&
                        date &&
                        date < start
                    ) {

                        return false;

                    }


                    if (
                        end &&
                        date &&
                        date > end
                    ) {

                        return false;

                    }


                    return true;

                }
            )
            .map(
                event => ({

                    title:
                        event.title,

                    type:
                        formatLabel(
                            event.type
                        ),

                    date:
                        formatDate(
                            event.startDate
                        ),

                    status:
                        capitalize(
                            event.status
                        ),

                    mode:
                        formatLabel(
                            event.mode
                        ),

                    venue:
                        event.venue ||
                        "—",

                    capacity:
                        event.capacity ??
                        "—",

                    rsvp:
                        event.rsvpCount

                })
            );


    return {

        title:
            "Events Report",

        description:
            "Summary of alumni events and RSVP activity.",

        columns: [

            {
                key:
                    "title",

                label:
                    "Event"
            },

            {
                key:
                    "type",

                label:
                    "Type"
            },

            {
                key:
                    "date",

                label:
                    "Date"
            },

            {
                key:
                    "status",

                label:
                    "Status",
                type:
                    "status"
            },

            {
                key:
                    "mode",

                label:
                    "Mode"
            },

            {
                key:
                    "venue",

                label:
                    "Venue"
            },

            {
                key:
                    "capacity",

                label:
                    "Capacity"
            },

            {
                key:
                    "rsvp",

                label:
                    "RSVP"
            }

        ],

        rows

    };

}


function getFilteredAlumni() {

    const program =
        el.programFilter?.value ||
        "all";


    const batch =
        el.batchFilter?.value ||
        "all";


    const employment =
        el.employmentFilter?.value ||
        "all";


    const verification =
        el.verificationFilter?.value ||
        "all";


    const start =
        el.startDateFilter?.value ||
        null;


    const end =
        el.endDateFilter?.value ||
        null;


    return state.alumni.filter(
        alumni => {

            if (
                program !== "all" &&
                alumni.program !==
                    program
            ) {

                return false;

            }


            if (
                batch !== "all" &&
                String(
                    alumni.batchYear
                ) !== batch
            ) {

                return false;

            }


            if (
                employment !==
                    "all" &&
                alumni.employmentStatus !==
                    employment
            ) {

                return false;

            }


            if (
                verification ===
                    "verified" &&
                !alumni.isVerified
            ) {

                return false;

            }


            if (
                verification ===
                    "pending" &&
                alumni.isVerified
            ) {

                return false;

            }


            const createdDate =
                normalizeDateString(
                    alumni.createdAt
                );


            if (
                start &&
                createdDate &&
                createdDate < start
            ) {

                return false;

            }


            if (
                end &&
                createdDate &&
                createdDate > end
            ) {

                return false;

            }


            return true;

        }
    );

}


function applyReportSearch() {

    const search =
        (
            el.reportSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!search) {

        state.filteredReportRows =
            [
                ...state.currentReportRows
            ];

    } else {

        state.filteredReportRows =
            state.currentReportRows.filter(
                row => {

                    const text =
                        state.currentColumns
                            .map(
                                column =>
                                    row[column.key]
                            )
                            .join(" ")
                            .toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    renderReport();

}


function renderReport() {

    hideReportStates();


    const total =
        state.filteredReportRows.length;


    setText(
        el.reportResultCount,
        total
    );


    if (!total) {

        if (
            el.reportsEmptyState
        ) {

            el.reportsEmptyState.hidden =
                false;

        }


        if (
            el.reportTableWrapper
        ) {

            el.reportTableWrapper.hidden =
                true;

        }


        if (
            el.paginationContainer
        ) {

            el.paginationContainer.hidden =
                true;

        }


        return;

    }


    renderReportTableHead();


    const startIndex =
        (
            state.currentPage -
            1
        ) *
        state.pageSize;


    const endIndex =
        Math.min(
            startIndex +
            state.pageSize,
            total
        );


    const pageRows =
        state.filteredReportRows.slice(
            startIndex,
            endIndex
        );


    renderReportTableBody(
        pageRows
    );


    if (
        el.reportTableWrapper
    ) {

        el.reportTableWrapper.hidden =
            false;

    }


    renderPagination(
        startIndex,
        endIndex,
        total
    );

}


function renderReportTableHead() {

    if (
        !el.reportTableHead
    ) {
        return;
    }


    el.reportTableHead.innerHTML = `

        <tr>

            ${
                state.currentColumns
                    .map(
                        column => `

                            <th>
                                ${escapeHtml(
                                    column.label
                                )}
                            </th>

                        `
                    )
                    .join("")
            }

        </tr>

    `;

}


function renderReportTableBody(
    rows
) {

    if (
        !el.reportTableBody
    ) {
        return;
    }


    el.reportTableBody.innerHTML =
        rows
            .map(
                row => `

                    <tr>

                        ${
                            state.currentColumns
                                .map(
                                    column => {

                                        const value =
                                            row[column.key] ??
                                            "—";


                                        if (
                                            column.type ===
                                            "status"
                                        ) {

                                            const className =
                                                String(
                                                    value
                                                )
                                                    .toLowerCase()
                                                    .replaceAll(
                                                        " ",
                                                        "-"
                                                    );


                                            return `

                                                <td>

                                                    <span
                                                        class="table-status ${escapeAttribute(
                                                            className
                                                        )}"
                                                    >
                                                        ${escapeHtml(
                                                            value
                                                        )}
                                                    </span>

                                                </td>

                                            `;

                                        }


                                        return `

                                            <td>
                                                ${escapeHtml(
                                                    value
                                                )}
                                            </td>

                                        `;

                                    }
                                )
                                .join("")
                        }

                    </tr>

                `
            )
            .join("");

}


function renderPagination(
    startIndex,
    endIndex,
    total
) {

    const totalPages =
        Math.ceil(
            total /
            state.pageSize
        );


    if (
        el.paginationContainer
    ) {

        el.paginationContainer.hidden =
            total === 0;

    }


    setText(
        el.paginationStart,
        total
            ? startIndex + 1
            : 0
    );


    setText(
        el.paginationEnd,
        endIndex
    );


    setText(
        el.paginationTotal,
        total
    );


    if (
        el.previousPageButton
    ) {

        el.previousPageButton.disabled =
            state.currentPage <= 1;

    }


    if (
        el.nextPageButton
    ) {

        el.nextPageButton.disabled =
            state.currentPage >=
            totalPages;

    }


    if (
        !el.paginationPages
    ) {
        return;
    }


    el.paginationPages.innerHTML =
        "";


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `pagination-page ${
                page ===
                state.currentPage
                    ? "active"
                    : ""
            }`;


        button.textContent =
            page;


        button.addEventListener(
            "click",
            () => changePage(
                page
            )
        );


        el.paginationPages.appendChild(
            button
        );

    }

}


function changePage(page) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                state.filteredReportRows.length /
                state.pageSize
            )
        );


    if (
        page < 1 ||
        page > totalPages ||
        page === state.currentPage
    ) {

        return;

    }


    state.currentPage =
        page;


    renderReport();


    el.reportTableWrapper?.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "start"
        }
    );

}


function resetReportFilters() {

    if (
        el.reportType
    ) {
        el.reportType.value =
            "alumni";
    }


    if (
        el.programFilter
    ) {
        el.programFilter.value =
            "all";
    }


    if (
        el.batchFilter
    ) {
        el.batchFilter.value =
            "all";
    }


    if (
        el.employmentFilter
    ) {
        el.employmentFilter.value =
            "all";
    }


    if (
        el.verificationFilter
    ) {
        el.verificationFilter.value =
            "all";
    }


    if (
        el.startDateFilter
    ) {
        el.startDateFilter.value =
            "";
    }


    if (
        el.endDateFilter
    ) {
        el.endDateFilter.value =
            "";
    }


    updateReportFilterAvailability();


    showToast(
        "Filters reset",
        "Report filters were returned to default values.",
        "success"
    );

}


function exportCurrentReportToCsv() {

    if (
        !state.filteredReportRows.length ||
        !state.currentColumns.length
    ) {

        showToast(
            "Nothing to export",
            "Generate a report first.",
            "error"
        );

        return;

    }


    const header =
        state.currentColumns
            .map(
                column =>
                    csvEscape(
                        column.label
                    )
            )
            .join(",");


    const rows =
        state.filteredReportRows
            .map(
                row =>
                    state.currentColumns
                        .map(
                            column =>
                                csvEscape(
                                    row[column.key]
                                )
                        )
                        .join(",")
            );


    const csv =
        [
            header,
            ...rows
        ]
            .join("\r\n");


    const blob =
        new Blob(
            [
                "\uFEFF",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const filename =
        `${state.reportType}-report-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Report exported",
        `${filename} was generated successfully.`,
        "success"
    );

}


function printCurrentReport() {

    if (
        !state.filteredReportRows.length
    ) {

        showToast(
            "Nothing to print",
            "Generate a report first.",
            "error"
        );

        return;

    }


    window.print();

}


function showLoadingState() {

    hideReportStates();


    if (
        el.reportsLoading
    ) {

        el.reportsLoading.hidden =
            false;

    }

}


function showErrorState(message) {

    hideReportStates();


    if (
        el.reportsErrorState
    ) {

        el.reportsErrorState.hidden =
            false;

    }


    if (
        el.reportsErrorMessage
    ) {

        el.reportsErrorMessage.textContent =
            message;

    }


    if (
        el.paginationContainer
    ) {

        el.paginationContainer.hidden =
            true;

    }

}


function hideReportStates() {

    if (
        el.reportsLoading
    ) {

        el.reportsLoading.hidden =
            true;

    }


    if (
        el.reportsErrorState
    ) {

        el.reportsErrorState.hidden =
            true;

    }


    if (
        el.reportsEmptyState
    ) {

        el.reportsEmptyState.hidden =
            true;

    }

}


function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            "savedTheme"
        ) ||
        localStorage.getItem(
            "theme"
        );


    const dark =
        savedTheme ===
        "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    document.body.classList.toggle(
        "dark-mode",
        dark
    );


    updateThemeIcon();

}


function toggleTheme() {

    const isDark =
        !(
            document.body.classList.contains(
                "dark"
            ) ||
            document.body.classList.contains(
                "dark-mode"
            )
        );


    document.body.classList.toggle(
        "dark",
        isDark
    );


    document.body.classList.toggle(
        "dark-mode",
        isDark
    );


    localStorage.setItem(
        "savedTheme",
        isDark
            ? "dark"
            : "light"
    );


    localStorage.setItem(
        "theme",
        isDark
            ? "dark"
            : "light"
    );


    updateThemeIcon();

}


function updateThemeIcon() {

    if (
        !el.themeIcon
    ) {
        return;
    }


    const isDark =
        document.body.classList.contains(
            "dark"
        ) ||
        document.body.classList.contains(
            "dark-mode"
        );


    el.themeIcon.className =
        isDark
            ? "bx bx-sun"
            : "bx bx-moon";

}


function initializeProfile() {

    let user =
        null;


    try {

        user =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "null"
            );

    } catch (_) {}


    if (!user) {
        return;
    }


    const fullName =

        user.full_name ||

        user.fullName ||

        [
            user.first_name ||
            user.firstName,

            user.last_name ||
            user.lastName
        ]
            .filter(Boolean)
            .join(" ") ||

        "Alumni Office Staff";


    const initials =
        getInitials(
            fullName
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


    const photo =
        user.profile_picture ||
        user.profilePicture;


    if (photo) {

        [
            el.sidebarProfileImage,
            el.headerProfileImage

        ].forEach(img => {

            if (!img) {
                return;
            }


            img.src =
                resolveImageUrl(
                    photo
                );


            img.style.display =
                "block";

        });

    }

}


function openSidebar() {

    el.sidebar?.classList.add(
        "open"
    );


    el.sidebarOverlay?.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function closeSidebar() {

    el.sidebar?.classList.remove(
        "open"
    );


    el.sidebarOverlay?.classList.remove(
        "show"
    );


    if (
        !document.querySelector(
            ".modal.show"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


function openModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


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
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !document.querySelector(
            ".modal.show"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function performLogout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    sessionStorage.clear();


    window.location.href =
        "../pages/login.html";

}


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
                ${escapeHtml(
                    title
                )}
            </strong>

            <span
                style="
                    display:block;
                    margin-top:3px;
                    color:var(--muted);
                    font-size:10px;
                "
            >
                ${escapeHtml(
                    message
                )}
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


function normalizeDateString(value) {

    if (!value) {
        return "";
    }


    const match =
        String(value)
            .match(
                /^(\d{4}-\d{2}-\d{2})/
            );


    return (
        match
            ? match[1]
            : ""
    );

}


function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        parseLocalDate(
            value
        );


    if (!date) {
        return "—";
    }


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    ).format(
        date
    );

}


function formatDateTime(value) {

    const date =
        value instanceof Date
            ? value
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
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
    ).format(
        date
    );

}


function parseLocalDate(value) {

    const match =
        String(value)
            .match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


    if (!match) {

        const date =
            new Date(
                value
            );


        return (
            Number.isNaN(
                date.getTime()
            )
                ? null
                : date
        );

    }


    return new Date(

        Number(
            match[1]
        ),

        Number(
            match[2]
        ) - 1,

        Number(
            match[3]
        )

    );

}


function formatLabel(value) {

    if (!value) {
        return "—";
    }


    return String(value)
        .replaceAll(
            "-",
            " "
        )
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


function capitalize(value) {

    const text =
        String(
            value ||
            ""
        );


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function getInitials(name) {

    const parts =
        String(
            name ||
            ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        !parts.length
    ) {

        return "AO";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .slice(0,2)
            .toUpperCase();

    }


    return (
        `${parts[0][0]}${
            parts[
                parts.length - 1
            ][0]
        }`
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


function csvEscape(value) {

    const text =
        String(
            value ??
            ""
        );


    return (
        `"${text.replaceAll(
            '"',
            '""'
        )}"`
    );

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
            value ??
            "—";

    }

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
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHtml(
        value
    );

}


async function safeJson(response) {

    try {

        return await response.json();

    } catch (_) {

        return null;

    }

}