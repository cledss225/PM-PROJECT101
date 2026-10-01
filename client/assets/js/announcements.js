/* =========================================================
   ALUMNIHUB - ADMIN ANNOUNCEMENTS
   DATABASE-BACKED VERSION

   API:
   GET    /api/announcements
   GET    /api/announcements/:id
   POST   /api/announcements
   PUT    /api/announcements/:id
   DELETE /api/announcements/:id
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


/* =========================================================
   DATA
========================================================= */

let announcements = [];

let announcementToDeleteId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const announcementsContainer =
    document.getElementById("announcementsContainer");

const announcementEmptyState =
    document.getElementById("announcementEmptyState");

const announcementResultText =
    document.getElementById("announcementResultText");

const announcementSearch =
    document.getElementById("announcementSearch");

const announcementCategoryFilter =
    document.getElementById("announcementCategoryFilter");

const announcementStatusFilter =
    document.getElementById("announcementStatusFilter");

const announcementAudienceFilter =
    document.getElementById("announcementAudienceFilter");

const announcementFormModal =
    document.getElementById("announcementFormModal");

const viewAnnouncementModal =
    document.getElementById("viewAnnouncementModal");

const deleteAnnouncementModal =
    document.getElementById("deleteAnnouncementModal");

const announcementForm =
    document.getElementById("announcementForm");

const announcementModalTitle =
    document.getElementById("announcementModalTitle");

const announcementSubmitText =
    document.getElementById("announcementSubmitText");


/* =========================================================
   API HELPERS
========================================================= */

function getAuthHeaders() {

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

}


async function safeJson(response) {

    try {
        return await response.json();
    } catch {
        return null;
    }

}


function handleAuthError(response) {

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

        return true;

    }

    return false;

}


/* =========================================================
   DATABASE → ADMIN UI MAPPING
========================================================= */

function mapAnnouncementFromDatabase(row) {

    return {

        id: row.announcement_id,

        title:
            row.title || "",

        category:
            databaseCategoryToUI(
                row.category
            ),

        audience:
            databaseAudienceToUI(
                row.target_audience
            ),

        priority:
            databasePriorityToUI(
                row.priority
            ),

        status:
            databaseStatusToUI(
                row.status
            ),

        date:
            toDateInputValue(
                row.publish_date
            ),

        expiryDate:
            toDateInputValue(
                row.expiry_date
            ),

        author:
            "AlumniHub Staff",

        content:
            row.content || "",

        createdAt:
            row.created_at,

        updatedAt:
            row.updated_at

    };

}


/* =========================================================
   ADMIN UI → DATABASE MAPPING
========================================================= */

function buildAnnouncementPayload() {

    const priorityElement =
        document.getElementById(
            "announcementPriority"
        );

    const expiryElement =
        document.getElementById(
            "announcementExpiryDate"
        );


    return {

        title:
            document
                .getElementById(
                    "announcementTitle"
                )
                .value
                .trim(),

        category:
            uiCategoryToDatabase(
                document
                    .getElementById(
                        "announcementCategory"
                    )
                    .value
            ),

        priority:
            uiPriorityToDatabase(
                priorityElement
                    ? priorityElement.value
                    : "Normal"
            ),

        target_audience:
            uiAudienceToDatabase(
                document
                    .getElementById(
                        "announcementAudience"
                    )
                    .value
            ),

        target_value:
            null,

        status:
            uiStatusToDatabase(
                document
                    .getElementById(
                        "announcementStatus"
                    )
                    .value
            ),

        publish_date:
            document
                .getElementById(
                    "announcementDate"
                )
                .value || null,

        expiry_date:
            expiryElement
                ? expiryElement.value || null
                : null,

        content:
            document
                .getElementById(
                    "announcementContent"
                )
                .value
                .trim()

    };

}


/* =========================================================
   VALUE MAPPERS
========================================================= */

function uiCategoryToDatabase(value) {

    return String(value || "General")
        .trim()
        .toLowerCase();

}


function databaseCategoryToUI(value) {

    const category =
        String(value || "general")
            .trim()
            .toLowerCase();

    const map = {
        general: "General",
        academic: "Academic",
        events: "Events",
        event: "Events",
        jobs: "Jobs",
        job: "Jobs",
        career: "Jobs",
        alumni: "Alumni"
    };

    return (
        map[category] ||
        capitalizeWords(category)
    );

}


function uiAudienceToDatabase(value) {

    const audience =
        String(value || "")
            .trim()
            .toLowerCase();

    const map = {
        everyone: "all",
        alumni: "alumni",
        students: "students",
        administrators: "administrators"
    };

    return map[audience] || "all";

}


function databaseAudienceToUI(value) {

    const audience =
        String(value || "all")
            .trim()
            .toLowerCase();

    const map = {
        all: "Everyone",
        everyone: "Everyone",
        alumni: "Alumni",
        student: "Students",
        students: "Students",
        administrator: "Administrators",
        administrators: "Administrators",
        admin: "Administrators"
    };

    return (
        map[audience] ||
        capitalizeWords(audience)
    );

}


function uiStatusToDatabase(value) {

    return String(value || "Published")
        .trim()
        .toLowerCase();

}


function databaseStatusToUI(value) {

    const status =
        String(value || "published")
            .trim()
            .toLowerCase();

    const map = {
        published: "Published",
        draft: "Draft",
        archived: "Archived"
    };

    return (
        map[status] ||
        capitalizeWords(status)
    );

}


function uiPriorityToDatabase(value) {

    return String(value || "Normal")
        .trim()
        .toLowerCase();

}


function databasePriorityToUI(value) {

    const priority =
        String(value || "normal")
            .trim()
            .toLowerCase();

    const map = {
        normal: "Normal",
        high: "High",
        urgent: "Urgent"
    };

    return (
        map[priority] ||
        capitalizeWords(priority)
    );

}


/* =========================================================
   HELPERS
========================================================= */

function formatAnnouncementDate(dateValue) {

    if (!dateValue) {
        return "No date";
    }


    const date =
        parseDateValue(dateValue);


    if (!date) {
        return "No date";
    }


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);

}


function parseDateValue(value) {

    if (!value) {
        return null;
    }


    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const [year, month, day] =
            value
                .split("-")
                .map(Number);


        return new Date(
            year,
            month - 1,
            day
        );

    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return null;
    }


    return date;

}


function toDateInputValue(value) {

    if (!value) {
        return "";
    }


    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        return value;

    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function capitalizeWords(value) {

    return String(value || "")
        .replace(/[_-]+/g, " ")
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


function getAnnouncementStatusClass(status) {

    if (status === "Draft") {

        return "announcement-status-draft";

    }


    if (status === "Archived") {

        return "announcement-status-archived";

    }


    return "announcement-status-published";

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LOAD ANNOUNCEMENTS FROM POSTGRESQL
========================================================= */

async function loadAnnouncements() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/announcements`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        if (handleAuthError(response)) {
            return;
        }


        const data =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Unable to load announcements."
            );

        }


        const rows =
            Array.isArray(data?.announcements)
                ? data.announcements
                : [];


        announcements =
            rows.map(
                mapAnnouncementFromDatabase
            );


        updateAnnouncementStatistics();

        filterAnnouncements();


    } catch (error) {

        console.error(
            "LOAD ANNOUNCEMENTS ERROR:",
            error
        );


        announcements = [];


        updateAnnouncementStatistics();

        renderAnnouncements(
            announcements
        );


        showAnnouncementToast(
            error.message ||
            "Unable to load announcements."
        );

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateAnnouncementStatistics() {

    const published =
        announcements.filter(
            announcement =>
                announcement.status ===
                "Published"
        ).length;


    const drafts =
        announcements.filter(
            announcement =>
                announcement.status ===
                "Draft"
        ).length;


    const archived =
        announcements.filter(
            announcement =>
                announcement.status ===
                "Archived"
        ).length;


    document
        .getElementById(
            "totalAnnouncements"
        )
        .textContent =
        announcements.length;


    document
        .getElementById(
            "publishedAnnouncements"
        )
        .textContent =
        published;


    document
        .getElementById(
            "draftAnnouncements"
        )
        .textContent =
        drafts;


    document
        .getElementById(
            "archivedAnnouncements"
        )
        .textContent =
        archived;

}


/* =========================================================
   RENDER ANNOUNCEMENTS
   ORIGINAL ADMIN DESIGN PRESERVED
========================================================= */

function renderAnnouncements(
    announcementList = announcements
) {

    announcementsContainer.innerHTML =
        "";


    if (announcementList.length === 0) {

        announcementsContainer
            .classList
            .add("hidden");


        announcementEmptyState
            .classList
            .remove("hidden");


        announcementResultText.textContent =
            "No matching announcements were found.";


        return;

    }


    announcementsContainer
        .classList
        .remove("hidden");


    announcementEmptyState
        .classList
        .add("hidden");


    announcementResultText.textContent =
        `Showing ${announcementList.length} ${
            announcementList.length === 1
                ? "announcement"
                : "announcements"
        }.`;


    announcementList.forEach(
        announcement => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "announcement-card";


            card.innerHTML = `

                <div class="announcement-card-accent"></div>

                <div class="announcement-card-body">

                    <div class="announcement-card-top">

                        <div>

                            <div class="announcement-category">

                                <i class="bx bx-category"></i>

                                ${escapeHTML(
                                    announcement.category
                                )}

                            </div>


                            <h3 class="announcement-card-title">

                                ${escapeHTML(
                                    announcement.title
                                )}

                            </h3>

                        </div>


                        <span
                            class="
                                announcement-status
                                ${getAnnouncementStatusClass(
                                    announcement.status
                                )}
                            "
                        >

                            ${escapeHTML(
                                announcement.status
                            )}

                        </span>

                    </div>


                    <p class="announcement-card-content">

                        ${escapeHTML(
                            announcement.content
                        )}

                    </p>


                    <div class="announcement-detail-grid">


                        <div class="announcement-detail-item">

                            <div class="announcement-detail-icon">
                                <i class="bx bx-calendar"></i>
                            </div>

                            <div class="announcement-detail-text">

                                <span>
                                    Publish Date
                                </span>

                                <strong>

                                    ${formatAnnouncementDate(
                                        announcement.date
                                    )}

                                </strong>

                            </div>

                        </div>


                        <div class="announcement-detail-item">

                            <div class="announcement-detail-icon">
                                <i class="bx bx-group"></i>
                            </div>

                            <div class="announcement-detail-text">

                                <span>
                                    Audience
                                </span>

                                <strong>

                                    ${escapeHTML(
                                        announcement.audience
                                    )}

                                </strong>

                            </div>

                        </div>

                    </div>


                    <div class="announcement-card-footer">

                        <div class="announcement-posted-by">

                            <i class="bx bx-user-circle"></i>

                            <span>

                                Posted by
                                ${escapeHTML(
                                    announcement.author
                                )}

                            </span>

                        </div>


                        <div class="announcement-card-actions">

                            <button
                                class="
                                    announcement-action-button
                                    announcement-view-button
                                "
                                data-action="view"
                                data-id="${announcement.id}"
                                type="button"
                                title="View announcement"
                            >
                                <i class="bx bx-show"></i>
                            </button>


                            <button
                                class="
                                    announcement-action-button
                                    announcement-edit-button
                                "
                                data-action="edit"
                                data-id="${announcement.id}"
                                type="button"
                                title="Edit announcement"
                            >
                                <i class="bx bx-edit"></i>
                            </button>


                            <button
                                class="
                                    announcement-action-button
                                    announcement-delete-button
                                "
                                data-action="delete"
                                data-id="${announcement.id}"
                                type="button"
                                title="Delete announcement"
                            >
                                <i class="bx bx-trash"></i>
                            </button>

                        </div>

                    </div>

                </div>
            `;


            announcementsContainer
                .appendChild(card);

        }
    );

}


/* =========================================================
   FILTER
========================================================= */

function filterAnnouncements() {

    const searchValue =
        announcementSearch.value
            .trim()
            .toLowerCase();


    const categoryValue =
        announcementCategoryFilter.value;


    const statusValue =
        announcementStatusFilter.value;


    const audienceValue =
        announcementAudienceFilter.value;


    const filtered =
        announcements.filter(
            announcement => {

                const searchableText = `
                    ${announcement.title}
                    ${announcement.category}
                    ${announcement.content}
                    ${announcement.author}
                    ${announcement.priority}
                `.toLowerCase();


                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );


                const matchesCategory =
                    categoryValue === "all" ||
                    announcement.category ===
                        categoryValue;


                const matchesStatus =
                    statusValue === "all" ||
                    announcement.status ===
                        statusValue;


                const matchesAudience =
                    audienceValue === "all" ||
                    announcement.audience ===
                        audienceValue;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus &&
                    matchesAudience
                );

            }
        );


    renderAnnouncements(filtered);

}


/* =========================================================
   MODALS
   ORIGINAL .show BEHAVIOR PRESERVED
========================================================= */

function openModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.add("show");


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove("show");


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   CREATE
========================================================= */

function openCreateAnnouncementModal() {

    announcementForm.reset();


    document
        .getElementById(
            "announcementId"
        )
        .value =
        "";


    document
        .getElementById(
            "announcementStatus"
        )
        .value =
        "Published";


    const priority =
        document.getElementById(
            "announcementPriority"
        );


    if (priority) {

        priority.value =
            "Normal";

    }


    const expiryDate =
        document.getElementById(
            "announcementExpiryDate"
        );


    if (expiryDate) {

        expiryDate.value =
            "";

    }


    setTodayAsPublishDate();


    announcementModalTitle.textContent =
        "Create Announcement";


    announcementSubmitText.textContent =
        "Save Announcement";


    openModal(
        announcementFormModal
    );

}


/* =========================================================
   EDIT
========================================================= */

function openEditAnnouncementModal(
    announcementId
) {

    const selected =
        announcements.find(
            announcement =>
                Number(announcement.id) ===
                Number(announcementId)
        );


    if (!selected) {

        showAnnouncementToast(
            "Announcement not found."
        );

        return;

    }


    document
        .getElementById(
            "announcementId"
        )
        .value =
        selected.id;


    document
        .getElementById(
            "announcementTitle"
        )
        .value =
        selected.title;


    document
        .getElementById(
            "announcementCategory"
        )
        .value =
        selected.category;


    document
        .getElementById(
            "announcementAudience"
        )
        .value =
        selected.audience;


    document
        .getElementById(
            "announcementStatus"
        )
        .value =
        selected.status;


    document
        .getElementById(
            "announcementDate"
        )
        .value =
        selected.date || "";


    const priority =
        document.getElementById(
            "announcementPriority"
        );


    if (priority) {

        priority.value =
            selected.priority ||
            "Normal";

    }


    const expiryDate =
        document.getElementById(
            "announcementExpiryDate"
        );


    if (expiryDate) {

        expiryDate.value =
            selected.expiryDate || "";

    }


    document
        .getElementById(
            "announcementContent"
        )
        .value =
        selected.content;


    announcementModalTitle.textContent =
        "Edit Announcement";


    announcementSubmitText.textContent =
        "Update Announcement";


    openModal(
        announcementFormModal
    );

}


/* =========================================================
   VIEW
========================================================= */

function openViewAnnouncementModal(
    announcementId
) {

    const selected =
        announcements.find(
            announcement =>
                Number(announcement.id) ===
                Number(announcementId)
        );


    if (!selected) {

        showAnnouncementToast(
            "Announcement not found."
        );

        return;

    }


    document
        .getElementById(
            "viewAnnouncementTitle"
        )
        .textContent =
        selected.title;


    document
        .getElementById(
            "viewAnnouncementContent"
        )
        .innerHTML = `

            <div class="announcement-view-banner">

                <span>
                    ${escapeHTML(
                        selected.category
                    )}
                </span>

                <h3>
                    ${escapeHTML(
                        selected.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        selected.content
                    )}
                </p>

            </div>


            <div class="announcement-view-detail-grid">


                <div class="announcement-view-detail">

                    <i class="bx bx-calendar"></i>

                    <div>

                        <span>
                            Publish Date
                        </span>

                        <strong>

                            ${formatAnnouncementDate(
                                selected.date
                            )}

                        </strong>

                    </div>

                </div>


                <div class="announcement-view-detail">

                    <i class="bx bx-group"></i>

                    <div>

                        <span>
                            Audience
                        </span>

                        <strong>

                            ${escapeHTML(
                                selected.audience
                            )}

                        </strong>

                    </div>

                </div>


                <div class="announcement-view-detail">

                    <i class="bx bx-check-circle"></i>

                    <div>

                        <span>
                            Status
                        </span>

                        <strong>

                            ${escapeHTML(
                                selected.status
                            )}

                        </strong>

                    </div>

                </div>


                <div class="announcement-view-detail">

                    <i class="bx bx-error-circle"></i>

                    <div>

                        <span>
                            Priority
                        </span>

                        <strong>

                            ${escapeHTML(
                                selected.priority ||
                                "Normal"
                            )}

                        </strong>

                    </div>

                </div>


                <div class="announcement-view-detail">

                    <i class="bx bx-calendar-x"></i>

                    <div>

                        <span>
                            Expiry Date
                        </span>

                        <strong>

                            ${
                                selected.expiryDate
                                    ? formatAnnouncementDate(
                                        selected.expiryDate
                                    )
                                    : "No expiration"
                            }

                        </strong>

                    </div>

                </div>


                <div class="announcement-view-detail">

                    <i class="bx bx-user"></i>

                    <div>

                        <span>
                            Published By
                        </span>

                        <strong>

                            ${escapeHTML(
                                selected.author
                            )}

                        </strong>

                    </div>

                </div>

            </div>
        `;


    openModal(
        viewAnnouncementModal
    );

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteAnnouncementModal(
    announcementId
) {

    announcementToDeleteId =
        Number(announcementId);


    openModal(
        deleteAnnouncementModal
    );

}


/* =========================================================
   DELETE FROM DATABASE
========================================================= */

async function deleteSelectedAnnouncement() {

    if (
        announcementToDeleteId === null
    ) {

        return;

    }


    const deleteButton =
        document.getElementById(
            "confirmDeleteAnnouncement"
        );


    const originalHTML =
        deleteButton
            ? deleteButton.innerHTML
            : "";


    try {

        if (deleteButton) {

            deleteButton.disabled =
                true;


            deleteButton.innerHTML = `
                <i class="bx bx-loader-alt bx-spin"></i>
                Deleting...
            `;

        }


        const response =
            await fetch(
                `${API_BASE_URL}/api/announcements/${announcementToDeleteId}`,
                {
                    method: "DELETE",
                    headers:
                        getAuthHeaders()
                }
            );


        if (handleAuthError(response)) {
            return;
        }


        const data =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Unable to delete announcement."
            );

        }


        announcementToDeleteId =
            null;


        closeModal(
            deleteAnnouncementModal
        );


        await loadAnnouncements();


        showAnnouncementToast(
            "Announcement deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE ANNOUNCEMENT ERROR:",
            error
        );


        showAnnouncementToast(
            error.message ||
            "Unable to delete announcement."
        );


    } finally {

        if (deleteButton) {

            deleteButton.disabled =
                false;


            deleteButton.innerHTML =
                originalHTML;

        }

    }

}


/* =========================================================
   CREATE / UPDATE DATABASE
========================================================= */

announcementForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const announcementIdValue =
            document
                .getElementById(
                    "announcementId"
                )
                .value;


        const payload =
            buildAnnouncementPayload();


        if (
            !payload.title ||
            !payload.content
        ) {

            showAnnouncementToast(
                "Title and content are required."
            );

            return;

        }


        if (
            payload.publish_date &&
            payload.expiry_date &&
            payload.expiry_date <
                payload.publish_date
        ) {

            showAnnouncementToast(
                "Expiry date cannot be earlier than the publish date."
            );

            return;

        }


        const isEditing =
            Boolean(
                announcementIdValue
            );


        const url =
            isEditing
                ? `${API_BASE_URL}/api/announcements/${announcementIdValue}`
                : `${API_BASE_URL}/api/announcements`;


        const method =
            isEditing
                ? "PUT"
                : "POST";


        const submitButton =
            announcementForm
                .querySelector(
                    'button[type="submit"]'
                );


        const originalHTML =
            submitButton.innerHTML;


        try {

            submitButton.disabled =
                true;


            submitButton.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                <span>
                    ${
                        isEditing
                            ? "Updating..."
                            : "Saving..."
                    }
                </span>
            `;


            const response =
                await fetch(
                    url,
                    {
                        method,
                        headers:
                            getAuthHeaders(),

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            if (handleAuthError(response)) {
                return;
            }


            const data =
                await safeJson(response);


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    (
                        isEditing
                            ? "Unable to update announcement."
                            : "Unable to create announcement."
                    )
                );

            }


            closeModal(
                announcementFormModal
            );


            announcementForm.reset();


            await loadAnnouncements();


            showAnnouncementToast(
                isEditing
                    ? "Announcement updated successfully."
                    : "Announcement created successfully."
            );


        } catch (error) {

            console.error(
                "SAVE ANNOUNCEMENT ERROR:",
                error
            );


            showAnnouncementToast(
                error.message ||
                "Unable to save announcement."
            );


        } finally {

            submitButton.disabled =
                false;


            submitButton.innerHTML =
                originalHTML;

        }

    }
);


/* =========================================================
   CARD ACTIONS
========================================================= */

announcementsContainer.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const announcementId =
            Number(
                button.dataset.id
            );


        const action =
            button.dataset.action;


        if (action === "view") {

            openViewAnnouncementModal(
                announcementId
            );

        }


        if (action === "edit") {

            openEditAnnouncementModal(
                announcementId
            );

        }


        if (action === "delete") {

            openDeleteAnnouncementModal(
                announcementId
            );

        }

    }
);


/* =========================================================
   FILTER LISTENERS
========================================================= */

announcementSearch.addEventListener(
    "input",
    filterAnnouncements
);


announcementCategoryFilter.addEventListener(
    "change",
    filterAnnouncements
);


announcementStatusFilter.addEventListener(
    "change",
    filterAnnouncements
);


announcementAudienceFilter.addEventListener(
    "change",
    filterAnnouncements
);


document
    .getElementById(
        "resetAnnouncementFilters"
    )
    .addEventListener(
        "click",
        function () {

            announcementSearch.value =
                "";


            announcementCategoryFilter.value =
                "all";


            announcementStatusFilter.value =
                "all";


            announcementAudienceFilter.value =
                "all";


            filterAnnouncements();

        }
    );


/* =========================================================
   CREATE BUTTON
   ACTUAL HTML ID
========================================================= */

document
    .getElementById(
        "openAnnouncementModal"
    )
    .addEventListener(
        "click",
        openCreateAnnouncementModal
    );


/* =========================================================
   DELETE BUTTON
========================================================= */

document
    .getElementById(
        "confirmDeleteAnnouncement"
    )
    .addEventListener(
        "click",
        deleteSelectedAnnouncement
    );


/* =========================================================
   MODAL CLOSE BUTTONS
========================================================= */

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


/* =========================================================
   BACKDROP CLOSE
========================================================= */

document
    .querySelectorAll(
        ".announcement-modal-backdrop"
    )
    .forEach(backdrop => {

        backdrop.addEventListener(
            "click",
            function () {

                const modal =
                    backdrop.closest(
                        ".announcement-modal"
                    );


                closeModal(modal);

            }
        );

    });


/* =========================================================
   ESCAPE CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        document
            .querySelectorAll(
                ".announcement-modal.show"
            )
            .forEach(
                modal =>
                    closeModal(modal)
            );

    }
);


/* =========================================================
   TOAST
========================================================= */

let announcementToastTimer;


function showAnnouncementToast(message) {

    const toast =
        document.getElementById(
            "announcementToast"
        );


    const toastMessage =
        document.getElementById(
            "announcementToastMessage"
        );


    if (!toast || !toastMessage) {

        console.log(
            "ANNOUNCEMENT:",
            message
        );

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        announcementToastTimer
    );


    announcementToastTimer =
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
   USER INFORMATION
========================================================= */

function loadCurrentUser() {

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem(
                    "user"
                )
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
                .map(
                    name =>
                        name
                            .charAt(0)
                            .toUpperCase()
                )
                .join("") ||
            "A";


        document
            .getElementById(
                "sidebarName"
            )
            .textContent =
            fullName ||
            "Administrator";


        document
            .getElementById(
                "sidebarEmail"
            )
            .textContent =
            storedUser.email ||
            "admin@alumnihub.com";


        document
            .getElementById(
                "sidebarAvatar"
            )
            .textContent =
            initials;


        document
            .getElementById(
                "topbarAvatar"
            )
            .textContent =
            initials;


    } catch (error) {

        console.error(
            "Unable to load user:",
            error
        );

    }

}

/* =========================================================
   PREMIUM LOGOUT CONFIRMATION
========================================================= */

const logoutButton =
    document.getElementById("logout");

const logoutConfirmModal =
    document.getElementById(
        "logoutConfirmModal"
    );

const cancelLogoutButton =
    document.getElementById(
        "cancelLogout"
    );

const confirmLogoutButton =
    document.getElementById(
        "confirmLogout"
    );


function openLogoutConfirmation() {

    if (!logoutConfirmModal) {
        return;
    }

    logoutConfirmModal.classList.add(
        "show"
    );

    logoutConfirmModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function closeLogoutConfirmation() {

    if (!logoutConfirmModal) {
        return;
    }

    logoutConfirmModal.classList.remove(
        "show"
    );

    logoutConfirmModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


logoutButton?.addEventListener(
    "click",
    openLogoutConfirmation
);


cancelLogoutButton?.addEventListener(
    "click",
    closeLogoutConfirmation
);


logoutConfirmModal
    ?.querySelector(
        ".logout-confirm-backdrop"
    )
    ?.addEventListener(
        "click",
        closeLogoutConfirmation
    );


confirmLogoutButton?.addEventListener(
    "click",
    function () {

        confirmLogoutButton.disabled =
            true;

        confirmLogoutButton.innerHTML = `
            <i class="bx bx-loader-alt bx-spin"></i>
            Logging out...
        `;


        setTimeout(
            function () {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

            },
            450
        );

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            logoutConfirmModal
                ?.classList
                .contains("show")
        ) {

            closeLogoutConfirmation();

        }

    }
);


/* =========================================================
   DEFAULT DATE
========================================================= */

function setTodayAsPublishDate() {

    const dateInput =
        document.getElementById(
            "announcementDate"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadCurrentUser();

loadAnnouncements();