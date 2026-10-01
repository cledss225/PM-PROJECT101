"use strict";

const API_BASE_URL = "http://localhost:5000/api";
const JOBS_ENDPOINT = `${API_BASE_URL}/jobs`;
const PAGE_SIZE = 6;

const state = {
    jobs: [],
    filteredJobs: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    selectedJob: null,
    deleteTarget: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    initializeProfile();
    bindEvents();
    setCurrentYear();
    loadJobs();

    window.setTimeout(() => {
        el.pageLoader?.classList.add("hide");
    }, 250);
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
        "createJobButton",

        "totalJobsCount",
        "activeJobsCount",
        "draftJobsCount",
        "closedJobsCount",

        "resultCount",

        "jobSearch",
        "clearSearchButton",
        "statusFilter",
        "employmentTypeFilter",
        "resetFiltersButton",

        "jobsLoading",
        "jobsErrorState",
        "jobsErrorMessage",
        "retryButton",
        "jobsEmptyState",
        "jobsGrid",

        "paginationContainer",
        "paginationStart",
        "paginationEnd",
        "paginationTotal",
        "paginationPages",
        "previousPageButton",
        "nextPageButton",

        "jobFormModal",
        "jobForm",
        "jobFormModalTitle",
        "jobId",

        "jobTitle",
        "companyName",
        "employmentType",
        "jobLocation",
        "workSetup",

        "salaryMin",
        "salaryMax",
        "salaryCurrency",

        "jobStatus",
        "jobDescription",
        "jobRequirements",
        "applicationDeadline",
        "contactEmail",
        "applicationLink",
        "companyLogo",

        "saveJobButton",
        "saveJobButtonText",

        "jobDetailsModal",
        "detailsJobTitle",
        "detailsCompanyLogo",
        "detailsCompanyInitials",
        "detailsJobStatus",
        "detailsCompanyName",
        "detailsEmploymentType",
        "detailsJobDescription",
        "detailsJobLocation",
        "detailsWorkSetup",
        "detailsSalary",
        "detailsApplicationDeadline",
        "detailsJobRequirements",
        "detailsContactEmail",
        "detailsApplicationLink",
        "editJobFromDetailsButton",

        "deleteJobModal",
        "deleteJobName",
        "confirmDeleteJobButton",

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
        () => loadJobs(true)
    );


    el.retryButton?.addEventListener(
        "click",
        () => loadJobs(true)
    );


    el.createJobButton?.addEventListener(
        "click",
        openCreateJobModal
    );


    el.jobSearch?.addEventListener(
        "input",
        () => {

            if (el.clearSearchButton) {

                el.clearSearchButton.hidden =
                    !el.jobSearch.value.trim();

            }

            state.currentPage = 1;

            applyFilters();

        }
    );


    


    el.clearSearchButton?.addEventListener(
        "click",
        () => {

            if (el.jobSearch) {
                el.jobSearch.value = "";
            }

            if (el.globalSearch) {
                el.globalSearch.value = "";
            }

            el.clearSearchButton.hidden = true;

            state.currentPage = 1;

            applyFilters();

            el.jobSearch?.focus();

        }
    );


    [
        el.statusFilter,
        el.employmentTypeFilter

    ].forEach(select => {

        select?.addEventListener(
            "change",
            () => {

                state.currentPage = 1;

                applyFilters();

            }
        );

    });


    el.resetFiltersButton?.addEventListener(
        "click",
        resetFilters
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


    el.jobsGrid?.addEventListener(
        "click",
        handleJobAction
    );


    el.jobForm?.addEventListener(
        "submit",
        handleJobSubmit
    );


    el.editJobFromDetailsButton?.addEventListener(
        "click",
        () => {

            if (!state.selectedJob) {
                return;
            }

            closeModal(
                "jobDetailsModal"
            );

            openEditJobModal(
                state.selectedJob
            );

        }
    );


    el.confirmDeleteJobButton?.addEventListener(
        "click",
        deleteSelectedJob
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
                    el.jobSearch
                )?.focus();

            }


            if (event.key === "Escape") {

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
                window.innerWidth > 960
            ) {

                closeSidebar();

            }

        }
    );

}


async function loadJobs(
    showToastMessage = false
) {

    showLoadingState();

    const token =
        localStorage.getItem("token");


    if (!token) {

        showErrorState(
            "Your login session was not found. Please sign in again."
        );

        return;

    }


    try {

        const response =
            await fetch(
                JOBS_ENDPOINT,
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


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            throw new Error(
                "Your account is not authorized to manage job opportunities."
            );

        }


        if (!response.ok) {

            let message =
                `Unable to retrieve jobs (${response.status}).`;


            try {

                const body =
                    await response.json();

                message =
                    body.message ||
                    body.error ||
                    message;

            } catch (_) {}


            throw new Error(
                message
            );

        }


        const payload =
            await response.json();


        const rawJobs =
            extractJobArray(
                payload
            );


        state.jobs =
            rawJobs.map(
                normalizeJob
            );


        state.currentPage = 1;


        updateSummaryCards();

        applyFilters();


        if (showToastMessage) {

            showToast(
                "Jobs updated",
                "Latest job opportunity records loaded successfully.",
                "success"
            );

        }


    } catch (error) {

        console.error(
            "LOAD JOBS ERROR:",
            error
        );


        showErrorState(
            error.message ||
            "Unable to load jobs."
        );

    }

}


function extractJobArray(payload) {

    if (
        Array.isArray(payload)
    ) {
        return payload;
    }

    if (
        Array.isArray(
            payload?.jobs
        )
    ) {
        return payload.jobs;
    }

    if (
        Array.isArray(
            payload?.data
        )
    ) {
        return payload.data;
    }

    if (
        Array.isArray(
            payload?.records
        )
    ) {
        return payload.records;
    }

    return [];

}


function normalizeJob(job) {

    return {

        id:
            job.job_id ??
            job.jobId ??
            job.id,

        title:
            job.title ??
            job.job_title ??
            "Untitled Job",

        company:
            job.company_name ??
            job.company ??
            "Company not specified",

        employmentType:
            String(
                job.employment_type ??
                job.employmentType ??
                "full-time"
            ).toLowerCase(),

        location:
            job.location ??
            job.job_location ??
            "",

        workSetup:
            String(
                job.work_setup ??
                job.workSetup ??
                "onsite"
            ).toLowerCase(),

        salaryMin:
            job.salary_min ??
            job.salaryMin ??
            null,

        salaryMax:
            job.salary_max ??
            job.salaryMax ??
            null,

        salaryCurrency:
            job.salary_currency ??
            job.salaryCurrency ??
            "PHP",

        status:
            String(
                job.status ??
                "active"
            ).toLowerCase(),

        description:
            job.description ??
            "",

        requirements:
            job.requirements ??
            "",

        applicationDeadline:
            job.application_deadline ??
            job.applicationDeadline ??
            null,

        contactEmail:
            job.contact_email ??
            job.contactEmail ??
            "",

        applicationLink:
            job.application_link ??
            job.applicationLink ??
            "",

        companyLogo:
            job.company_logo ??
            job.logo ??
            job.job_image ??
            "",

        createdBy:
            job.created_by ??
            job.createdBy ??
            null,

        createdAt:
            job.created_at ??
            job.createdAt ??
            null,

        updatedAt:
            job.updated_at ??
            job.updatedAt ??
            null

    };

}


function applyFilters() {

    const search =
        (
            el.jobSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const status =
        el.statusFilter?.value ||
        "all";


    const employmentType =
        el.employmentTypeFilter?.value ||
        "all";


    state.filteredJobs =
        state.jobs.filter(job => {

            const searchable = [

                job.title,
                job.company,
                job.location,
                job.description,
                job.requirements,
                job.employmentType,
                job.workSetup,
                job.status

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(
                    search
                );


            const matchesStatus =
                status === "all" ||
                job.status === status;


            const matchesEmploymentType =
                employmentType === "all" ||
                job.employmentType ===
                    employmentType;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesEmploymentType
            );

        });


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                state.filteredJobs.length /
                state.pageSize
            )
        );


    if (
        state.currentPage >
        totalPages
    ) {

        state.currentPage =
            totalPages;

    }


    renderJobs();

}


function renderJobs() {

    hideAllStates();


    const total =
        state.filteredJobs.length;


    if (el.resultCount) {

        el.resultCount.textContent =
            total;

    }


    if (!total) {

        if (el.jobsEmptyState) {

            el.jobsEmptyState.hidden =
                false;

        }

        if (el.paginationContainer) {

            el.paginationContainer.hidden =
                true;

        }

        return;

    }


    const start =
        (
            state.currentPage - 1
        ) *
        state.pageSize;


    const end =
        Math.min(
            start +
            state.pageSize,
            total
        );


    const pageJobs =
        state.filteredJobs.slice(
            start,
            end
        );


    if (el.jobsGrid) {

        el.jobsGrid.hidden =
            false;

        el.jobsGrid.innerHTML =
            pageJobs
                .map(
                    createJobCard
                )
                .join("");

    }


    renderPagination(
        start,
        end,
        total
    );

}


function createJobCard(job) {

    const companyInitials =
        getInitials(
            job.company
        );


    const logoHtml =
        job.companyLogo
            ? `
                <img
                    src="${escapeAttribute(
                        resolveImageUrl(
                            job.companyLogo
                        )
                    )}"
                    alt="${escapeAttribute(
                        job.company
                    )}"
                >
              `
            : escapeHtml(
                companyInitials
            );


    return `

        <article class="job-card">


            <div class="job-card-header">

                <div class="job-company-logo">
                    ${logoHtml}
                </div>


                <div class="job-card-heading">

                    <h3 class="job-card-title">
                        ${escapeHtml(
                            job.title
                        )}
                    </h3>

                    <p class="job-company-name">
                        ${escapeHtml(
                            job.company
                        )}
                    </p>

                </div>


                <span
                    class="job-status-badge ${escapeAttribute(
                        job.status
                    )}"
                >
                    ${escapeHtml(
                        capitalize(
                            job.status
                        )
                    )}
                </span>

            </div>


            <div class="job-card-body">

                <p class="job-card-description">
                    ${escapeHtml(
                        job.description ||
                        "No description provided."
                    )}
                </p>


                <div class="job-meta">

                    <span>
                        <i class="bx bx-map"></i>
                        ${escapeHtml(
                            job.location ||
                            "Location not specified"
                        )}
                    </span>


                    <span>
                        <i class="bx bx-briefcase"></i>
                        ${escapeHtml(
                            formatEmploymentType(
                                job.employmentType
                            )
                        )}
                    </span>


                    <span>
                        <i class="bx bx-building-house"></i>
                        ${escapeHtml(
                            formatWorkSetup(
                                job.workSetup
                            )
                        )}
                    </span>


                    <span>
                        <i class="bx bx-calendar"></i>
                        ${escapeHtml(
                            formatDeadline(
                                job.applicationDeadline
                            )
                        )}
                    </span>

                </div>


                <div class="job-salary">

                    <i class="bx bx-money"></i>

                    ${escapeHtml(
                        formatSalary(
                            job
                        )
                    )}

                </div>

            </div>


            <div class="job-card-footer">

                <span class="job-deadline">

                    ${
                        job.applicationDeadline
                            ? `Deadline: ${escapeHtml(
                                formatDeadline(
                                    job.applicationDeadline
                                )
                              )}`
                            : "No deadline"
                    }

                </span>


                <div class="job-actions">

                    <button
                        class="job-action-button"
                        type="button"
                        title="View details"
                        data-action="view"
                        data-id="${escapeAttribute(
                            String(job.id)
                        )}"
                    >
                        <i class="bx bx-show"></i>
                    </button>


                    <button
                        class="job-action-button"
                        type="button"
                        title="Edit job"
                        data-action="edit"
                        data-id="${escapeAttribute(
                            String(job.id)
                        )}"
                    >
                        <i class="bx bx-edit"></i>
                    </button>


                    <button
                        class="job-action-button danger"
                        type="button"
                        title="Delete job"
                        data-action="delete"
                        data-id="${escapeAttribute(
                            String(job.id)
                        )}"
                    >
                        <i class="bx bx-trash"></i>
                    </button>

                </div>

            </div>


        </article>

    `;

}


function handleJobAction(event) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const selected =
        state.jobs.find(
            item =>
                String(item.id) ===
                String(
                    button.dataset.id
                )
        );


    if (!selected) {
        return;
    }


    const action =
        button.dataset.action;


    if (
        action === "view"
    ) {

        state.selectedJob =
            selected;

        populateDetailsModal(
            selected
        );

        openModal(
            "jobDetailsModal"
        );

        return;

    }


    if (
        action === "edit"
    ) {

        openEditJobModal(
            selected
        );

        return;

    }


    if (
        action === "delete"
    ) {

        state.deleteTarget =
            selected;


        if (el.deleteJobName) {

            el.deleteJobName.textContent =
                selected.title;

        }


        openModal(
            "deleteJobModal"
        );

    }

}


function openCreateJobModal() {

    state.selectedJob = null;

    resetJobForm();


    if (el.jobId) {
        el.jobId.value = "";
    }


    if (el.jobFormModalTitle) {

        el.jobFormModalTitle.textContent =
            "Post New Job";

    }


    if (el.saveJobButtonText) {

        el.saveJobButtonText.textContent =
            "Post Job";

    }


    openModal(
        "jobFormModal"
    );

}


function openEditJobModal(job) {

    state.selectedJob =
        job;


    resetJobForm();


    if (el.jobFormModalTitle) {

        el.jobFormModalTitle.textContent =
            "Edit Job Opportunity";

    }


    if (el.saveJobButtonText) {

        el.saveJobButtonText.textContent =
            "Save Changes";

    }


    setValue(
        el.jobId,
        job.id
    );

    setValue(
        el.jobTitle,
        job.title
    );

    setValue(
        el.companyName,
        job.company
    );

    setValue(
        el.employmentType,
        job.employmentType
    );

    setValue(
        el.jobLocation,
        job.location
    );

    setValue(
        el.workSetup,
        job.workSetup
    );

    setValue(
        el.salaryMin,
        job.salaryMin ??
        ""
    );

    setValue(
        el.salaryMax,
        job.salaryMax ??
        ""
    );

    setValue(
        el.salaryCurrency,
        job.salaryCurrency
    );

    setValue(
        el.jobStatus,
        job.status
    );

    setValue(
        el.jobDescription,
        job.description
    );

    setValue(
        el.jobRequirements,
        job.requirements
    );

    setValue(
        el.applicationDeadline,
        normalizeDateInput(
            job.applicationDeadline
        )
    );

    setValue(
        el.contactEmail,
        job.contactEmail
    );

    setValue(
        el.applicationLink,
        job.applicationLink
    );


    openModal(
        "jobFormModal"
    );

}


function resetJobForm() {

    el.jobForm?.reset();


    if (el.jobId) {

        el.jobId.value = "";

    }


    if (el.jobStatus) {

        el.jobStatus.value =
            "active";

    }


    if (el.workSetup) {

        el.workSetup.value =
            "onsite";

    }


    if (el.salaryCurrency) {

        el.salaryCurrency.value =
            "PHP";

    }

}


async function handleJobSubmit(event) {

    event.preventDefault();


    const payload =
        collectJobPayload();


    const validation =
        validateJobPayload(
            payload
        );


    if (
        !validation.valid
    ) {

        showToast(
            "Check job details",
            validation.message,
            "error"
        );

        return;

    }


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


    const isEditing =
        Boolean(
            el.jobId?.value
        );


    const url =
        isEditing
            ? `${JOBS_ENDPOINT}/${encodeURIComponent(
                el.jobId.value
              )}`
            : JOBS_ENDPOINT;


    try {

        setSaveButtonLoading(
            true
        );


        const response =
            await fetch(
                url,
                {
                    method:
                        isEditing
                            ? "PUT"
                            : "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const body =
            await safeJson(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(

                body?.message ||
                body?.error ||
                "Unable to save job opportunity."

            );

        }


        closeModal(
            "jobFormModal"
        );


        showToast(
            isEditing
                ? "Job updated"
                : "Job posted",

            isEditing
                ? "The job opportunity was updated successfully."
                : "The new job opportunity was posted successfully.",

            "success"
        );


        await loadJobs();


    } catch (error) {

        console.error(
            "SAVE JOB ERROR:",
            error
        );


        showToast(
            "Unable to save job",
            error.message,
            "error"
        );


    } finally {

        setSaveButtonLoading(
            false
        );

    }

}


function collectJobPayload() {

    return {

        title:
            el.jobTitle?.value.trim() ||
            "",

        company_name:
            el.companyName?.value.trim() ||
            "",

        employment_type:
            el.employmentType?.value ||
            "",

        location:
            el.jobLocation?.value.trim() ||
            "",

        work_setup:
            el.workSetup?.value ||
            "onsite",

        salary_min:
            el.salaryMin?.value
                ? Number(
                    el.salaryMin.value
                  )
                : null,

        salary_max:
            el.salaryMax?.value
                ? Number(
                    el.salaryMax.value
                  )
                : null,

        salary_currency:
            el.salaryCurrency?.value ||
            "PHP",

        status:
            el.jobStatus?.value ||
            "active",

        description:
            el.jobDescription?.value.trim() ||
            "",

        requirements:
            el.jobRequirements?.value.trim() ||
            null,

        application_deadline:
            el.applicationDeadline?.value ||
            null,

        contact_email:
            el.contactEmail?.value.trim() ||
            null,

        application_link:
            el.applicationLink?.value.trim() ||
            null

    };

}


function validateJobPayload(payload) {

    if (!payload.title) {

        return {
            valid: false,
            message:
                "Job title is required."
        };

    }


    if (!payload.company_name) {

        return {
            valid: false,
            message:
                "Company name is required."
        };

    }


    if (!payload.employment_type) {

        return {
            valid: false,
            message:
                "Please select an employment type."
        };

    }


    if (!payload.location) {

        return {
            valid: false,
            message:
                "Job location is required."
        };

    }


    if (!payload.description) {

        return {
            valid: false,
            message:
                "Job description is required."
        };

    }


    if (
        payload.salary_min !== null &&
        payload.salary_min < 0
    ) {

        return {
            valid: false,
            message:
                "Minimum salary cannot be negative."
        };

    }


    if (
        payload.salary_max !== null &&
        payload.salary_max < 0
    ) {

        return {
            valid: false,
            message:
                "Maximum salary cannot be negative."
        };

    }


    if (
        payload.salary_min !== null &&
        payload.salary_max !== null &&
        payload.salary_max <
            payload.salary_min
    ) {

        return {
            valid: false,
            message:
                "Maximum salary cannot be lower than minimum salary."
        };

    }


    return {
        valid: true
    };

}


async function deleteSelectedJob() {

    if (
        !state.deleteTarget
    ) {
        return;
    }


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
            el.confirmDeleteJobButton
        ) {

            el.confirmDeleteJobButton.disabled =
                true;

            el.confirmDeleteJobButton.textContent =
                "Deleting...";

        }


        const response =
            await fetch(

                `${JOBS_ENDPOINT}/${encodeURIComponent(
                    state.deleteTarget.id
                )}`,

                {
                    method:
                        "DELETE",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    }

                }

            );


        const body =
            await safeJson(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(

                body?.message ||
                body?.error ||
                "Unable to delete job opportunity."

            );

        }


        closeModal(
            "deleteJobModal"
        );


        showToast(
            "Job deleted",
            `"${state.deleteTarget.title}" was removed successfully.`,
            "success"
        );


        state.deleteTarget =
            null;


        await loadJobs();


    } catch (error) {

        console.error(
            "DELETE JOB ERROR:",
            error
        );


        showToast(
            "Unable to delete job",
            error.message,
            "error"
        );


    } finally {

        if (
            el.confirmDeleteJobButton
        ) {

            el.confirmDeleteJobButton.disabled =
                false;

            el.confirmDeleteJobButton.textContent =
                "Delete Job";

        }

    }

}


function populateDetailsModal(job) {

    setText(
        el.detailsJobTitle,
        job.title
    );


    setText(
        el.detailsCompanyName,
        job.company
    );


    setText(
        el.detailsEmploymentType,
        formatEmploymentType(
            job.employmentType
        )
    );


    setText(
        el.detailsJobDescription,
        job.description ||
        "No description provided."
    );


    setText(
        el.detailsJobLocation,
        job.location ||
        "—"
    );


    setText(
        el.detailsWorkSetup,
        formatWorkSetup(
            job.workSetup
        )
    );


    setText(
        el.detailsSalary,
        formatSalary(
            job
        )
    );


    setText(
        el.detailsApplicationDeadline,
        formatDeadline(
            job.applicationDeadline
        )
    );


    setText(
        el.detailsJobRequirements,
        job.requirements ||
        "No specific requirements provided."
    );


    setText(
        el.detailsContactEmail,
        job.contactEmail ||
        "Not provided"
    );


    if (
        el.detailsApplicationLink
    ) {

        if (
            job.applicationLink
        ) {

            el.detailsApplicationLink.href =
                job.applicationLink;

            el.detailsApplicationLink.textContent =
                job.applicationLink;

        } else {

            el.detailsApplicationLink.href =
                "#";

            el.detailsApplicationLink.textContent =
                "Not provided";

        }

    }


    if (
        el.detailsJobStatus
    ) {

        el.detailsJobStatus.textContent =
            capitalize(
                job.status
            );

        el.detailsJobStatus.className =
            "";

        el.detailsJobStatus.classList.add(
            "job-status-badge",
            job.status
        );

    }


    const companyInitials =
        getInitials(
            job.company
        );


    setText(
        el.detailsCompanyInitials,
        companyInitials
    );


    if (
        el.detailsCompanyLogo
    ) {

        if (
            job.companyLogo
        ) {

            el.detailsCompanyLogo.src =
                resolveImageUrl(
                    job.companyLogo
                );

            el.detailsCompanyLogo.hidden =
                false;

            if (
                el.detailsCompanyInitials
            ) {

                el.detailsCompanyInitials.style.display =
                    "none";

            }

        } else {

            el.detailsCompanyLogo.hidden =
                true;

            if (
                el.detailsCompanyInitials
            ) {

                el.detailsCompanyInitials.style.display =
                    "";

            }

        }

    }

}


function updateSummaryCards() {

    const counts =
        state.jobs.reduce(

            (acc, job) => {

                acc.total += 1;

                if (
                    job.status ===
                    "active"
                ) {
                    acc.active += 1;
                }

                if (
                    job.status ===
                    "draft"
                ) {
                    acc.draft += 1;
                }

                if (
                    job.status ===
                    "closed"
                ) {
                    acc.closed += 1;
                }

                return acc;

            },

            {
                total: 0,
                active: 0,
                draft: 0,
                closed: 0
            }

        );


    setText(
        el.totalJobsCount,
        counts.total
    );

    setText(
        el.activeJobsCount,
        counts.active
    );

    setText(
        el.draftJobsCount,
        counts.draft
    );

    setText(
        el.closedJobsCount,
        counts.closed
    );

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
                state.filteredJobs.length /
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


    renderJobs();


    el.jobsGrid?.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "start"
        }
    );

}


function resetFilters() {

    if (el.jobSearch) {
        el.jobSearch.value = "";
    }

    if (el.globalSearch) {
        el.globalSearch.value = "";
    }

    if (el.clearSearchButton) {
        el.clearSearchButton.hidden = true;
    }

    if (el.statusFilter) {
        el.statusFilter.value = "all";
    }

    if (el.employmentTypeFilter) {
        el.employmentTypeFilter.value = "all";
    }


    state.currentPage = 1;


    applyFilters();

}


function showLoadingState() {

    hideAllStates();


    if (el.jobsLoading) {

        el.jobsLoading.hidden =
            false;

    }


    if (el.resultCount) {

        el.resultCount.textContent =
            "0";

    }

}


function showErrorState(message) {

    hideAllStates();


    if (
        el.jobsErrorState
    ) {

        el.jobsErrorState.hidden =
            false;

    }


    if (
        el.jobsErrorMessage
    ) {

        el.jobsErrorMessage.textContent =
            message;

    }


    if (
        el.paginationContainer
    ) {

        el.paginationContainer.hidden =
            true;

    }

}


function hideAllStates() {

    if (
        el.jobsLoading
    ) {

        el.jobsLoading.hidden =
            true;

    }


    if (
        el.jobsErrorState
    ) {

        el.jobsErrorState.hidden =
            true;

    }


    if (
        el.jobsEmptyState
    ) {

        el.jobsEmptyState.hidden =
            true;

    }


    if (
        el.jobsGrid
    ) {

        el.jobsGrid.hidden =
            true;

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


function setSaveButtonLoading(
    loading
) {

    if (
        !el.saveJobButton
    ) {
        return;
    }


    el.saveJobButton.disabled =
        loading;


    if (
        el.saveJobButtonText
    ) {

        el.saveJobButtonText.textContent =
            loading
                ? "Saving..."
                : (
                    el.jobId?.value
                        ? "Save Changes"
                        : "Post Job"
                  );

    }

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


function formatEmploymentType(type) {

    const map = {

        "full-time":
            "Full-time",

        "part-time":
            "Part-time",

        contract:
            "Contract",

        internship:
            "Internship",

        freelance:
            "Freelance"

    };


    return (
        map[type] ||
        capitalize(
            type
        )
    );

}


function formatWorkSetup(setup) {

    const map = {

        onsite:
            "On-site",

        remote:
            "Remote",

        hybrid:
            "Hybrid"

    };


    return (
        map[setup] ||
        capitalize(
            setup
        )
    );

}


function formatSalary(job) {

    const currency =
        job.salaryCurrency ||
        "PHP";


    const symbol =
        currency === "PHP"
            ? "₱"
            : currency === "USD"
            ? "$"
            : `${currency} `;


    const minimum =
        numberOrNull(
            job.salaryMin
        );


    const maximum =
        numberOrNull(
            job.salaryMax
        );


    if (
        minimum === null &&
        maximum === null
    ) {

        return "Salary not specified";

    }


    if (
        minimum !== null &&
        maximum !== null
    ) {

        return `${symbol}${formatNumber(
            minimum
        )} - ${symbol}${formatNumber(
            maximum
        )}`;

    }


    if (
        minimum !== null
    ) {

        return `From ${symbol}${formatNumber(
            minimum
        )}`;

    }


    return `Up to ${symbol}${formatNumber(
        maximum
    )}`;

}


function formatDeadline(value) {

    if (!value) {
        return "No deadline";
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
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);

}


function normalizeDateInput(value) {

    if (!value) {
        return "";
    }


    const text =
        String(value);


    const match =
        text.match(
            /^(\d{4}-\d{2}-\d{2})/
        );


    return (
        match
            ? match[1]
            : ""
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


function numberOrNull(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return (
        Number.isFinite(
            number
        )
            ? number
            : null
    );

}


function formatNumber(value) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            maximumFractionDigits:
                2
        }
    ).format(
        value
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

        return "CO";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .slice(0, 2)
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


function setValue(
    element,
    value
) {

    if (element) {

        element.value =
            value ??
            "";

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