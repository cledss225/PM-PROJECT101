const token = localStorage.getItem("token");


if (!token) {

    window.location.href = "login.html";

}


/* =========================================================
   SAMPLE JOB DATA
========================================================= */

let jobs = [

    {
        id: 1,
        title: "Junior Web Developer",
        company: "Innovatech Solutions",
        location: "Makati City",
        type: "Full-time",
        status: "Active",
        salary: "₱25,000 - ₱35,000",
        deadline: "2026-08-30",
        email: "careers@innovatech.com",
        description:
            "Develop and maintain responsive web applications while collaborating with the design and backend development teams.",
        requirements:
            "Bachelor's degree in Information Technology or related field.\nKnowledge of HTML, CSS, JavaScript, and basic backend development.\nFresh graduates are welcome to apply."
    },

    {
        id: 2,
        title: "IT Support Specialist",
        company: "Prime Business Systems",
        location: "Quezon City",
        type: "Full-time",
        status: "Active",
        salary: "₱22,000 - ₱30,000",
        deadline: "2026-09-15",
        email: "hr@primebusiness.ph",
        description:
            "Provide technical assistance to employees and maintain company hardware, software, and network systems.",
        requirements:
            "Knowledge of computer troubleshooting and network fundamentals.\nStrong communication and customer service skills.\nRelevant certifications are an advantage."
    },

    {
        id: 3,
        title: "Software Development Intern",
        company: "Cloudworks Digital",
        location: "Remote",
        type: "Internship",
        status: "Active",
        salary: "₱8,000 Monthly Allowance",
        deadline: "2026-08-20",
        email: "internships@cloudworks.io",
        description:
            "Assist the software team in developing, testing, and documenting web-based business applications.",
        requirements:
            "Currently enrolled in an IT or Computer Science program.\nBasic programming knowledge.\nWillingness to learn modern development tools."
    },

    {
        id: 4,
        title: "Database Assistant",
        company: "DataCore Philippines",
        location: "Pasig City",
        type: "Contract",
        status: "Closed",
        salary: "₱28,000 - ₱38,000",
        deadline: "2026-06-30",
        email: "jobs@datacore.ph",
        description:
            "Support database maintenance, data validation, report generation, and system backup operations.",
        requirements:
            "Knowledge of SQL and relational databases.\nStrong attention to detail.\nExperience with PostgreSQL or MySQL is preferred."
    }

];


let jobToDeleteId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const jobsContainer =
    document.getElementById("jobsContainer");

const jobEmptyState =
    document.getElementById("jobEmptyState");

const jobResultText =
    document.getElementById("jobResultText");

const jobSearch =
    document.getElementById("jobSearch");

const jobTypeFilter =
    document.getElementById("jobTypeFilter");

const jobStatusFilter =
    document.getElementById("jobStatusFilter");

const resetJobFilters =
    document.getElementById("resetJobFilters");

const jobFormModal =
    document.getElementById("jobFormModal");

const viewJobModal =
    document.getElementById("viewJobModal");

const deleteJobModal =
    document.getElementById("deleteJobModal");

const jobForm =
    document.getElementById("jobForm");

const jobModalTitle =
    document.getElementById("jobModalTitle");

const jobSubmitText =
    document.getElementById("jobSubmitText");


/* =========================================================
   HELPERS
========================================================= */

function formatJobDate(dateValue) {

    if (!dateValue) {

        return "No deadline";

    }


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(
        new Date(`${dateValue}T00:00:00`)
    );

}


function getJobStatusClass(status) {

    if (status === "Closed") {

        return "job-status-closed";

    }


    if (status === "Draft") {

        return "job-status-draft";

    }


    return "job-status-active";

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   STATISTICS
========================================================= */

function updateJobStatistics() {

    const activeJobs =
        jobs.filter(
            job => job.status === "Active"
        ).length;


    const closedJobs =
        jobs.filter(
            job => job.status === "Closed"
        ).length;


    const companies =
        new Set(
            jobs.map(job =>
                job.company
                    .trim()
                    .toLowerCase()
            )
        );


    document
        .getElementById("totalJobs")
        .textContent =
        jobs.length;


    document
        .getElementById("activeJobs")
        .textContent =
        activeJobs;


    document
        .getElementById("closedJobs")
        .textContent =
        closedJobs;


    document
        .getElementById("totalCompanies")
        .textContent =
        companies.size;

}


/* =========================================================
   RENDER JOBS
========================================================= */

function renderJobs(jobList = jobs) {

    jobsContainer.innerHTML = "";


    if (jobList.length === 0) {

        jobsContainer.classList.add("hidden");

        jobEmptyState.classList.remove("hidden");

        jobResultText.textContent =
            "No matching job postings were found.";

        return;

    }


    jobsContainer.classList.remove("hidden");

    jobEmptyState.classList.add("hidden");


    jobResultText.textContent =
        `Showing ${jobList.length} ${
            jobList.length === 1
                ? "job posting"
                : "job postings"
        }.`;


    jobList.forEach(job => {

        const jobCard =
            document.createElement("article");


        jobCard.className =
            "job-card";


        jobCard.innerHTML = `

            <div class="job-card-accent"></div>

            <div class="job-card-body">

                <div class="job-card-top">

                    <div>

                        <div class="job-company-row">

                            <i class="bx bx-buildings"></i>

                            ${escapeHTML(job.company)}

                        </div>

                        <h3 class="job-card-title">

                            ${escapeHTML(job.title)}

                        </h3>

                    </div>

                    <span
                        class="
                            job-status
                            ${getJobStatusClass(job.status)}
                        "
                    >

                        ${escapeHTML(job.status)}

                    </span>

                </div>


                <p class="job-card-description">

                    ${escapeHTML(job.description)}

                </p>


                <div class="job-detail-grid">

                    <div class="job-detail-item">

                        <div class="job-detail-icon">
                            <i class="bx bx-map"></i>
                        </div>

                        <div class="job-detail-text">

                            <span>Location</span>

                            <strong>
                                ${escapeHTML(job.location)}
                            </strong>

                        </div>

                    </div>


                    <div class="job-detail-item">

                        <div class="job-detail-icon">
                            <i class="bx bx-time-five"></i>
                        </div>

                        <div class="job-detail-text">

                            <span>Employment Type</span>

                            <strong>
                                ${escapeHTML(job.type)}
                            </strong>

                        </div>

                    </div>


                    <div class="job-detail-item">

                        <div class="job-detail-icon">
                            <i class="bx bx-money"></i>
                        </div>

                        <div class="job-detail-text">

                            <span>Salary</span>

                            <strong>
                                ${escapeHTML(job.salary)}
                            </strong>

                        </div>

                    </div>


                    <div class="job-detail-item">

                        <div class="job-detail-icon">
                            <i class="bx bx-envelope"></i>
                        </div>

                        <div class="job-detail-text">

                            <span>Contact</span>

                            <strong>
                                ${escapeHTML(job.email)}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="job-card-footer">

                    <div class="job-deadline">

                        <i class="bx bx-calendar"></i>

                        <span>

                            Deadline:
                            ${formatJobDate(job.deadline)}

                        </span>

                    </div>


                    <div class="job-card-actions">

                        <button
                            class="
                                job-action-button
                                job-view-button
                            "
                            data-action="view"
                            data-id="${job.id}"
                            type="button"
                            title="View job"
                        >
                            <i class="bx bx-show"></i>
                        </button>


                        <button
                            class="
                                job-action-button
                                job-edit-button
                            "
                            data-action="edit"
                            data-id="${job.id}"
                            type="button"
                            title="Edit job"
                        >
                            <i class="bx bx-edit"></i>
                        </button>


                        <button
                            class="
                                job-action-button
                                job-delete-button
                            "
                            data-action="delete"
                            data-id="${job.id}"
                            type="button"
                            title="Delete job"
                        >
                            <i class="bx bx-trash"></i>
                        </button>

                    </div>

                </div>

            </div>

        `;


        jobsContainer.appendChild(jobCard);

    });

}


/* =========================================================
   FILTER JOBS
========================================================= */

function filterJobs() {

    const searchValue =
        jobSearch.value
            .trim()
            .toLowerCase();


    const typeValue =
        jobTypeFilter.value;


    const statusValue =
        jobStatusFilter.value;


    const filteredJobs =
        jobs.filter(job => {

            const searchableText = `
                ${job.title}
                ${job.company}
                ${job.location}
                ${job.description}
                ${job.requirements}
            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(searchValue);


            const matchesType =
                typeValue === "all" ||
                job.type === typeValue;


            const matchesStatus =
                statusValue === "all" ||
                job.status === statusValue;


            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );

        });


    renderJobs(filteredJobs);

}


/* =========================================================
   MODALS
========================================================= */

function openModal(modalElement) {

    modalElement.classList.add("show");

    modalElement.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(modalElement) {

    modalElement.classList.remove("show");

    modalElement.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   CREATE JOB
========================================================= */

function openCreateJobModal() {

    jobForm.reset();


    document
        .getElementById("jobId")
        .value =
        "";


    document
        .getElementById("jobStatus")
        .value =
        "Active";


    jobModalTitle.textContent =
        "Post New Job";


    jobSubmitText.textContent =
        "Save Job";


    openModal(jobFormModal);

}


/* =========================================================
   EDIT JOB
========================================================= */

function openEditJobModal(jobId) {

    const selectedJob =
        jobs.find(
            job => job.id === jobId
        );


    if (!selectedJob) {

        return;

    }


    document
        .getElementById("jobId")
        .value =
        selectedJob.id;


    document
        .getElementById("jobTitle")
        .value =
        selectedJob.title;


    document
        .getElementById("jobCompany")
        .value =
        selectedJob.company;


    document
        .getElementById("jobLocation")
        .value =
        selectedJob.location;


    document
        .getElementById("jobType")
        .value =
        selectedJob.type;


    document
        .getElementById("jobStatus")
        .value =
        selectedJob.status;


    document
        .getElementById("jobSalary")
        .value =
        selectedJob.salary;


    document
        .getElementById("jobDeadline")
        .value =
        selectedJob.deadline;


    document
        .getElementById("jobContactEmail")
        .value =
        selectedJob.email;


    document
        .getElementById("jobDescription")
        .value =
        selectedJob.description;


    document
        .getElementById("jobRequirements")
        .value =
        selectedJob.requirements;


    jobModalTitle.textContent =
        "Edit Job Posting";


    jobSubmitText.textContent =
        "Update Job";


    openModal(jobFormModal);

}


/* =========================================================
   VIEW JOB
========================================================= */

function openViewJobModal(jobId) {

    const selectedJob =
        jobs.find(
            job => job.id === jobId
        );


    if (!selectedJob) {

        return;

    }


    document
        .getElementById("viewJobTitle")
        .textContent =
        selectedJob.title;


    document
        .getElementById("viewJobContent")
        .innerHTML = `

            <div class="job-view-banner">

                <span>
                    ${escapeHTML(selectedJob.company)}
                </span>

                <h3>
                    ${escapeHTML(selectedJob.title)}
                </h3>

                <p>
                    ${escapeHTML(selectedJob.description)}
                </p>

            </div>


            <div class="job-view-detail-grid">

                <div class="job-view-detail">

                    <i class="bx bx-map"></i>

                    <div>
                        <span>Location</span>

                        <strong>
                            ${escapeHTML(selectedJob.location)}
                        </strong>
                    </div>

                </div>


                <div class="job-view-detail">

                    <i class="bx bx-time-five"></i>

                    <div>
                        <span>Employment Type</span>

                        <strong>
                            ${escapeHTML(selectedJob.type)}
                        </strong>
                    </div>

                </div>


                <div class="job-view-detail">

                    <i class="bx bx-money"></i>

                    <div>
                        <span>Salary Range</span>

                        <strong>
                            ${escapeHTML(selectedJob.salary)}
                        </strong>
                    </div>

                </div>


                <div class="job-view-detail">

                    <i class="bx bx-calendar"></i>

                    <div>
                        <span>Deadline</span>

                        <strong>
                            ${formatJobDate(selectedJob.deadline)}
                        </strong>
                    </div>

                </div>


                <div class="job-view-detail">

                    <i class="bx bx-envelope"></i>

                    <div>
                        <span>Contact Email</span>

                        <strong>
                            ${escapeHTML(selectedJob.email)}
                        </strong>
                    </div>

                </div>


                <div class="job-view-detail">

                    <i class="bx bx-check-circle"></i>

                    <div>
                        <span>Status</span>

                        <strong>
                            ${escapeHTML(selectedJob.status)}
                        </strong>
                    </div>

                </div>

            </div>


            <div class="job-view-section">

                <h4>Job Requirements</h4>

                <p>
                    ${escapeHTML(selectedJob.requirements)}
                </p>

            </div>

        `;


    openModal(viewJobModal);

}


/* =========================================================
   DELETE JOB
========================================================= */

function openDeleteJobModal(jobId) {

    jobToDeleteId =
        jobId;


    openModal(deleteJobModal);

}


function deleteSelectedJob() {

    if (jobToDeleteId === null) {

        return;

    }


    jobs =
        jobs.filter(
            job =>
                job.id !== jobToDeleteId
        );


    jobToDeleteId =
        null;


    closeModal(deleteJobModal);


    updateJobStatistics();

    filterJobs();


    showJobToast(
        "Job posting deleted successfully."
    );

}


/* =========================================================
   CREATE / UPDATE JOB
========================================================= */

jobForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const jobIdValue =
            document
                .getElementById("jobId")
                .value;


        const jobData = {

            id:
                jobIdValue
                    ? Number(jobIdValue)
                    : Date.now(),

            title:
                document
                    .getElementById("jobTitle")
                    .value
                    .trim(),

            company:
                document
                    .getElementById("jobCompany")
                    .value
                    .trim(),

            location:
                document
                    .getElementById("jobLocation")
                    .value
                    .trim(),

            type:
                document
                    .getElementById("jobType")
                    .value,

            status:
                document
                    .getElementById("jobStatus")
                    .value,

            salary:
                document
                    .getElementById("jobSalary")
                    .value
                    .trim(),

            deadline:
                document
                    .getElementById("jobDeadline")
                    .value,

            email:
                document
                    .getElementById("jobContactEmail")
                    .value
                    .trim(),

            description:
                document
                    .getElementById("jobDescription")
                    .value
                    .trim(),

            requirements:
                document
                    .getElementById("jobRequirements")
                    .value
                    .trim()

        };


        if (jobIdValue) {

            jobs =
                jobs.map(
                    job =>
                        job.id === jobData.id
                            ? jobData
                            : job
                );


            showJobToast(
                "Job posting updated successfully."
            );

        } else {

            jobs.unshift(jobData);


            showJobToast(
                "New job posted successfully."
            );

        }


        closeModal(jobFormModal);


        updateJobStatistics();

        filterJobs();

    }
);


/* =========================================================
   JOB CARD ACTIONS
========================================================= */

jobsContainer.addEventListener(
    "click",
    function (event) {

        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (!actionButton) {

            return;

        }


        const jobId =
            Number(
                actionButton.dataset.id
            );


        const action =
            actionButton.dataset.action;


        if (action === "view") {

            openViewJobModal(jobId);

        }


        if (action === "edit") {

            openEditJobModal(jobId);

        }


        if (action === "delete") {

            openDeleteJobModal(jobId);

        }

    }
);


/* =========================================================
   FILTER LISTENERS
========================================================= */

jobSearch.addEventListener(
    "input",
    filterJobs
);


jobTypeFilter.addEventListener(
    "change",
    filterJobs
);


jobStatusFilter.addEventListener(
    "change",
    filterJobs
);


resetJobFilters.addEventListener(
    "click",
    function () {

        jobSearch.value =
            "";


        jobTypeFilter.value =
            "all";


        jobStatusFilter.value =
            "all";


        renderJobs(jobs);

    }
);


/* =========================================================
   BUTTON LISTENERS
========================================================= */

document
    .getElementById("openJobModal")
    .addEventListener(
        "click",
        openCreateJobModal
    );


document
    .getElementById("confirmDeleteJob")
    .addEventListener(
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
            function () {

                const modal =
                    document.getElementById(
                        button.dataset.closeModal
                    );


                if (modal) {

                    closeModal(modal);

                }

            }
        );

    });


document
    .querySelectorAll(
        ".job-modal-backdrop"
    )
    .forEach(backdrop => {

        backdrop.addEventListener(
            "click",
            function () {

                const modal =
                    backdrop.closest(
                        ".job-modal"
                    );


                closeModal(modal);

            }
        );

    });


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {

            return;

        }


        document
            .querySelectorAll(
                ".job-modal.show"
            )
            .forEach(closeModal);

    }
);


/* =========================================================
   TOAST
========================================================= */

let jobToastTimer;


function showJobToast(message) {

    const toast =
        document.getElementById(
            "jobToast"
        );


    const toastMessage =
        document.getElementById(
            "jobToastMessage"
        );


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(jobToastTimer);


    jobToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   CURRENT USER
========================================================= */

function loadCurrentUser() {

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("user")
            );


        if (!storedUser) {

            return;

        }


        const fullName =
            [
                storedUser.first_name,
                storedUser.last_name
            ]
                .filter(Boolean)
                .join(" ");


        const initials =
            [
                storedUser.first_name,
                storedUser.last_name
            ]
                .filter(Boolean)
                .map(name =>
                    name.charAt(0).toUpperCase()
                )
                .join("") || "A";


        document
            .getElementById("sidebarName")
            .textContent =
            fullName || "Administrator";


        document
            .getElementById("sidebarEmail")
            .textContent =
            storedUser.email ||
            "admin@alumnihub.com";


        document
            .getElementById("sidebarAvatar")
            .textContent =
            initials;


        document
            .getElementById("topbarAvatar")
            .textContent =
            initials;

    } catch (error) {

        console.error(
            "Unable to load current user:",
            error
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("logout")
    .addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem("token");

            localStorage.removeItem("user");


            window.location.href =
                "login.html";

        }
    );


/* =========================================================
   INITIAL LOAD
========================================================= */

loadCurrentUser();

updateJobStatistics();

renderJobs(jobs);