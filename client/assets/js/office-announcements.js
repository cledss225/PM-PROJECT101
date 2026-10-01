"use strict";

const API_BASE_URL = "http://localhost:5000/api";
const ANNOUNCEMENTS_ENDPOINT = `${API_BASE_URL}/announcements`;
const PAGE_SIZE = 6;

const state = {
    announcements: [],
    filteredAnnouncements: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    selectedAnnouncement: null,
    deleteTarget: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    initializeProfile();
    bindEvents();
    setCurrentYear();
    updateTargetValueVisibility();
    loadAnnouncements();

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
        "createAnnouncementButton",
        "emptyCreateAnnouncementButton",

        "totalAnnouncementsCount",
        "publishedAnnouncementsCount",
        "draftAnnouncementsCount",
        "archivedAnnouncementsCount",

        "resultCount",

        "announcementSearch",
        "clearSearchButton",
        "statusFilter",
        "categoryFilter",
        "resetFiltersButton",

        "announcementsLoading",
        "announcementsErrorState",
        "announcementsErrorMessage",
        "retryButton",
        "announcementsEmptyState",
        "announcementsGrid",

        "paginationContainer",
        "paginationStart",
        "paginationEnd",
        "paginationTotal",
        "paginationPages",
        "previousPageButton",
        "nextPageButton",

        "announcementFormModal",
        "announcementForm",
        "announcementFormModalTitle",
        "announcementId",

        "announcementTitle",
        "announcementCategory",
        "announcementPriority",
        "targetAudience",
        "targetValueGroup",
        "targetValue",
        "announcementStatus",
        "publishDate",
        "expiryDate",
        "announcementContent",

        "saveAnnouncementButton",
        "saveAnnouncementButtonText",

        "announcementDetailsModal",
        "detailsAnnouncementTitle",
        "detailsAnnouncementStatus",
        "detailsAnnouncementCategory",
        "detailsAnnouncementPriority",
        "detailsAnnouncementContent",
        "detailsTargetAudience",
        "detailsTargetValue",
        "detailsPublishDate",
        "detailsExpiryDate",
        "editAnnouncementFromDetailsButton",

        "deleteAnnouncementModal",
        "deleteAnnouncementName",
        "confirmDeleteAnnouncementButton",

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
        () => loadAnnouncements(true)
    );


    el.retryButton?.addEventListener(
        "click",
        () => loadAnnouncements(true)
    );


    el.createAnnouncementButton?.addEventListener(
        "click",
        openCreateAnnouncementModal
    );


    el.emptyCreateAnnouncementButton?.addEventListener(
        "click",
        openCreateAnnouncementModal
    );


    el.targetAudience?.addEventListener(
        "change",
        updateTargetValueVisibility
    );


    el.announcementSearch?.addEventListener(
        "input",
        () => {

            if (el.clearSearchButton) {

                el.clearSearchButton.hidden =
                    !el.announcementSearch.value.trim();

            }

            state.currentPage = 1;

            applyFilters();

        }
    );


    el.globalSearch?.addEventListener(
        "input",
        () => {

            if (el.announcementSearch) {

                el.announcementSearch.value =
                    el.globalSearch.value;

            }

            if (el.clearSearchButton) {

                el.clearSearchButton.hidden =
                    !el.globalSearch.value.trim();

            }

            state.currentPage = 1;

            applyFilters();

        }
    );


    el.clearSearchButton?.addEventListener(
        "click",
        () => {

            if (el.announcementSearch) {
                el.announcementSearch.value = "";
            }

            if (el.globalSearch) {
                el.globalSearch.value = "";
            }

            el.clearSearchButton.hidden = true;

            state.currentPage = 1;

            applyFilters();

            el.announcementSearch?.focus();

        }
    );


    [
        el.statusFilter,
        el.categoryFilter

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


    el.announcementsGrid?.addEventListener(
        "click",
        handleAnnouncementAction
    );


    el.announcementForm?.addEventListener(
        "submit",
        handleAnnouncementSubmit
    );


    el.editAnnouncementFromDetailsButton?.addEventListener(
        "click",
        () => {

            if (!state.selectedAnnouncement) {
                return;
            }

            closeModal(
                "announcementDetailsModal"
            );

            openEditAnnouncementModal(
                state.selectedAnnouncement
            );

        }
    );


    el.confirmDeleteAnnouncementButton?.addEventListener(
        "click",
        deleteSelectedAnnouncement
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
                    el.announcementSearch
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


async function loadAnnouncements(
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
                ANNOUNCEMENTS_ENDPOINT,
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
                "Your account is not authorized to manage announcements."
            );

        }


        if (!response.ok) {

            let message =
                `Unable to retrieve announcements (${response.status}).`;


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


        const rawAnnouncements =
            extractAnnouncementArray(
                payload
            );


        state.announcements =
            rawAnnouncements.map(
                normalizeAnnouncement
            );


        state.currentPage = 1;


        updateSummaryCards();

        applyFilters();


        if (showToastMessage) {

            showToast(
                "Announcements updated",
                "Latest announcement records loaded successfully.",
                "success"
            );

        }


    } catch (error) {

        console.error(
            "LOAD ANNOUNCEMENTS ERROR:",
            error
        );


        showErrorState(
            error.message ||
            "Unable to load announcements."
        );

    }

}


function extractAnnouncementArray(payload) {

    if (
        Array.isArray(payload)
    ) {
        return payload;
    }

    if (
        Array.isArray(
            payload?.announcements
        )
    ) {
        return payload.announcements;
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


function normalizeAnnouncement(item) {

    return {

        id:
            item.announcement_id ??
            item.announcementId ??
            item.id,

        title:
            item.title ??
            item.announcement_title ??
            "Untitled Announcement",

        category:
            String(
                item.category ??
                "general"
            ).toLowerCase(),

        priority:
            String(
                item.priority ??
                "normal"
            ).toLowerCase(),

        targetAudience:
            String(
                item.target_audience ??
                item.targetAudience ??
                "all"
            ).toLowerCase(),

        targetValue:
            item.target_value ??
            item.targetValue ??
            "",

        status:
            String(
                item.status ??
                "published"
            ).toLowerCase(),

        publishDate:
            item.publish_date ??
            item.publishDate ??
            null,

        expiryDate:
            item.expiry_date ??
            item.expiryDate ??
            null,

        content:
            item.content ??
            item.message ??
            "",

        createdBy:
            item.created_by ??
            item.createdBy ??
            null,

        createdAt:
            item.created_at ??
            item.createdAt ??
            null,

        updatedAt:
            item.updated_at ??
            item.updatedAt ??
            null

    };

}


function applyFilters() {

    const search =
        (
            el.announcementSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const status =
        el.statusFilter?.value ||
        "all";


    const category =
        el.categoryFilter?.value ||
        "all";


    state.filteredAnnouncements =
        state.announcements.filter(
            announcement => {

                const searchable = [

                    announcement.title,
                    announcement.category,
                    announcement.priority,
                    announcement.targetAudience,
                    announcement.targetValue,
                    announcement.status,
                    announcement.content

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
                    announcement.status ===
                        status;


                const matchesCategory =
                    category === "all" ||
                    announcement.category ===
                        category;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesCategory
                );

            }
        );


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                state.filteredAnnouncements.length /
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


    renderAnnouncements();

}


function renderAnnouncements() {

    hideAllStates();


    const total =
        state.filteredAnnouncements.length;


    if (el.resultCount) {

        el.resultCount.textContent =
            total;

    }


    if (!total) {

        if (
            el.announcementsEmptyState
        ) {

            el.announcementsEmptyState.hidden =
                false;

        }


        if (
            el.paginationContainer
        ) {

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


    const pageAnnouncements =
        state.filteredAnnouncements.slice(
            start,
            end
        );


    if (
        el.announcementsGrid
    ) {

        el.announcementsGrid.hidden =
            false;


        el.announcementsGrid.innerHTML =
            pageAnnouncements
                .map(
                    createAnnouncementCard
                )
                .join("");

    }


    renderPagination(
        start,
        end,
        total
    );

}


function createAnnouncementCard(
    announcement
) {

    return `

        <article class="announcement-card">


            <div class="announcement-card-header">

                <div class="announcement-icon">
                    <i class="bx ${escapeAttribute(
                        getCategoryIcon(
                            announcement.category
                        )
                    )}"></i>
                </div>


                <div class="announcement-card-heading">

                    <h3 class="announcement-card-title">
                        ${escapeHtml(
                            announcement.title
                        )}
                    </h3>

                    <p class="announcement-category">
                        ${escapeHtml(
                            formatCategory(
                                announcement.category
                            )
                        )}
                    </p>

                </div>


                <span
                    class="announcement-status-badge ${escapeAttribute(
                        announcement.status
                    )}"
                >
                    ${escapeHtml(
                        capitalize(
                            announcement.status
                        )
                    )}
                </span>

            </div>


            <div class="announcement-card-body">

                <p class="announcement-card-content">
                    ${escapeHtml(
                        announcement.content ||
                        "No announcement content provided."
                    )}
                </p>


                <div class="announcement-meta">

                    <span>

                        <i class="bx bx-group"></i>

                        ${escapeHtml(
                            formatAudience(
                                announcement.targetAudience
                            )
                        )}

                    </span>


                    <span>

                        <i class="bx bx-calendar"></i>

                        Publish:
                        ${escapeHtml(
                            formatDate(
                                announcement.publishDate
                            )
                        )}

                    </span>

                </div>


                <span
                    class="priority-badge ${escapeAttribute(
                        announcement.priority
                    )}"
                >

                    <i class="bx bx-flag"></i>

                    ${escapeHtml(
                        `${capitalize(
                            announcement.priority
                        )} Priority`
                    )}

                </span>

            </div>


            <div class="announcement-card-footer">

                <span class="announcement-dates">

                    ${
                        announcement.expiryDate
                            ? `Expires: ${escapeHtml(
                                formatDate(
                                    announcement.expiryDate
                                )
                              )}`
                            : "No expiry date"
                    }

                </span>


                <div class="announcement-actions">

                    <button
                        class="announcement-action-button"
                        type="button"
                        title="View announcement"
                        data-action="view"
                        data-id="${escapeAttribute(
                            String(
                                announcement.id
                            )
                        )}"
                    >
                        <i class="bx bx-show"></i>
                    </button>


                    <button
                        class="announcement-action-button"
                        type="button"
                        title="Edit announcement"
                        data-action="edit"
                        data-id="${escapeAttribute(
                            String(
                                announcement.id
                            )
                        )}"
                    >
                        <i class="bx bx-edit"></i>
                    </button>


                    <button
                        class="announcement-action-button danger"
                        type="button"
                        title="Delete announcement"
                        data-action="delete"
                        data-id="${escapeAttribute(
                            String(
                                announcement.id
                            )
                        )}"
                    >
                        <i class="bx bx-trash"></i>
                    </button>

                </div>

            </div>


        </article>

    `;

}


function handleAnnouncementAction(event) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const selected =
        state.announcements.find(
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

        state.selectedAnnouncement =
            selected;


        populateDetailsModal(
            selected
        );


        openModal(
            "announcementDetailsModal"
        );


        return;

    }


    if (
        action === "edit"
    ) {

        openEditAnnouncementModal(
            selected
        );


        return;

    }


    if (
        action === "delete"
    ) {

        state.deleteTarget =
            selected;


        if (
            el.deleteAnnouncementName
        ) {

            el.deleteAnnouncementName.textContent =
                selected.title;

        }


        openModal(
            "deleteAnnouncementModal"
        );

    }

}


function openCreateAnnouncementModal() {

    state.selectedAnnouncement =
        null;


    resetAnnouncementForm();


    if (
        el.announcementId
    ) {

        el.announcementId.value =
            "";

    }


    if (
        el.announcementFormModalTitle
    ) {

        el.announcementFormModalTitle.textContent =
            "Create Announcement";

    }


    if (
        el.saveAnnouncementButtonText
    ) {

        el.saveAnnouncementButtonText.textContent =
            "Publish Announcement";

    }


    updateTargetValueVisibility();


    openModal(
        "announcementFormModal"
    );

}


function openEditAnnouncementModal(
    announcement
) {

    state.selectedAnnouncement =
        announcement;


    resetAnnouncementForm();


    if (
        el.announcementFormModalTitle
    ) {

        el.announcementFormModalTitle.textContent =
            "Edit Announcement";

    }


    if (
        el.saveAnnouncementButtonText
    ) {

        el.saveAnnouncementButtonText.textContent =
            "Save Changes";

    }


    setValue(
        el.announcementId,
        announcement.id
    );

    setValue(
        el.announcementTitle,
        announcement.title
    );

    setValue(
        el.announcementCategory,
        announcement.category
    );

    setValue(
        el.announcementPriority,
        announcement.priority
    );

    setValue(
        el.targetAudience,
        announcement.targetAudience
    );

    setValue(
        el.targetValue,
        announcement.targetValue
    );

    setValue(
        el.announcementStatus,
        announcement.status
    );

    setValue(
        el.publishDate,
        normalizeDateInput(
            announcement.publishDate
        )
    );

    setValue(
        el.expiryDate,
        normalizeDateInput(
            announcement.expiryDate
        )
    );

    setValue(
        el.announcementContent,
        announcement.content
    );


    updateTargetValueVisibility();


    openModal(
        "announcementFormModal"
    );

}


function resetAnnouncementForm() {

    el.announcementForm?.reset();


    if (
        el.announcementId
    ) {

        el.announcementId.value =
            "";

    }


    if (
        el.announcementPriority
    ) {

        el.announcementPriority.value =
            "normal";

    }


    if (
        el.targetAudience
    ) {

        el.targetAudience.value =
            "all";

    }


    if (
        el.announcementStatus
    ) {

        el.announcementStatus.value =
            "published";

    }


    if (
        el.targetValue
    ) {

        el.targetValue.value =
            "";

    }


    updateTargetValueVisibility();

}


function updateTargetValueVisibility() {

    if (
        !el.targetValueGroup ||
        !el.targetAudience
    ) {

        return;

    }


    const audience =
        el.targetAudience.value;


    const needsTarget =
        audience === "specific_batch" ||
        audience === "specific_program";


    el.targetValueGroup.hidden =
        !needsTarget;


    if (
        !needsTarget &&
        el.targetValue
    ) {

        el.targetValue.value =
            "";

    }

}


async function handleAnnouncementSubmit(event) {

    event.preventDefault();


    const payload =
        collectAnnouncementPayload();


    const validation =
        validateAnnouncementPayload(
            payload
        );


    if (
        !validation.valid
    ) {

        showToast(
            "Check announcement",
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
            el.announcementId?.value
        );


    const url =
        isEditing
            ? `${ANNOUNCEMENTS_ENDPOINT}/${encodeURIComponent(
                el.announcementId.value
              )}`
            : ANNOUNCEMENTS_ENDPOINT;


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
                "Unable to save announcement."

            );

        }


        closeModal(
            "announcementFormModal"
        );


        showToast(
            isEditing
                ? "Announcement updated"
                : "Announcement created",

            isEditing
                ? "The announcement was updated successfully."
                : "The announcement was created successfully.",

            "success"
        );


        await loadAnnouncements();


    } catch (error) {

        console.error(
            "SAVE ANNOUNCEMENT ERROR:",
            error
        );


        showToast(
            "Unable to save announcement",
            error.message,
            "error"
        );


    } finally {

        setSaveButtonLoading(
            false
        );

    }

}


function collectAnnouncementPayload() {

    return {

        title:
            el.announcementTitle?.value.trim() ||
            "",

        category:
            el.announcementCategory?.value ||
            "",

        priority:
            el.announcementPriority?.value ||
            "normal",

        target_audience:
            el.targetAudience?.value ||
            "all",

        target_value:
            el.targetValue?.value.trim() ||
            null,

        status:
            el.announcementStatus?.value ||
            "published",

        publish_date:
            el.publishDate?.value ||
            null,

        expiry_date:
            el.expiryDate?.value ||
            null,

        content:
            el.announcementContent?.value.trim() ||
            ""

    };

}


function validateAnnouncementPayload(
    payload
) {

    if (
        !payload.title
    ) {

        return {
            valid: false,
            message:
                "Announcement title is required."
        };

    }


    if (
        !payload.category
    ) {

        return {
            valid: false,
            message:
                "Please select an announcement category."
        };

    }


    if (
        !payload.content
    ) {

        return {
            valid: false,
            message:
                "Announcement content is required."
        };

    }


    if (
        (
            payload.target_audience ===
                "specific_batch" ||
            payload.target_audience ===
                "specific_program"
        ) &&
        !payload.target_value
    ) {

        return {
            valid: false,
            message:
                "Please specify the target batch or program."
        };

    }


    if (
        payload.publish_date &&
        payload.expiry_date &&
        payload.expiry_date <
            payload.publish_date
    ) {

        return {
            valid: false,
            message:
                "Expiry date cannot be before the publish date."
        };

    }


    return {
        valid: true
    };

}


async function deleteSelectedAnnouncement() {

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
            el.confirmDeleteAnnouncementButton
        ) {

            el.confirmDeleteAnnouncementButton.disabled =
                true;


            el.confirmDeleteAnnouncementButton.textContent =
                "Deleting...";

        }


        const response =
            await fetch(

                `${ANNOUNCEMENTS_ENDPOINT}/${encodeURIComponent(
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
                "Unable to delete announcement."

            );

        }


        closeModal(
            "deleteAnnouncementModal"
        );


        showToast(
            "Announcement deleted",
            `"${state.deleteTarget.title}" was removed successfully.`,
            "success"
        );


        state.deleteTarget =
            null;


        await loadAnnouncements();


    } catch (error) {

        console.error(
            "DELETE ANNOUNCEMENT ERROR:",
            error
        );


        showToast(
            "Unable to delete announcement",
            error.message,
            "error"
        );


    } finally {

        if (
            el.confirmDeleteAnnouncementButton
        ) {

            el.confirmDeleteAnnouncementButton.disabled =
                false;


            el.confirmDeleteAnnouncementButton.textContent =
                "Delete";

        }

    }

}


function populateDetailsModal(
    announcement
) {

    setText(
        el.detailsAnnouncementTitle,
        announcement.title
    );


    setText(
        el.detailsAnnouncementCategory,
        formatCategory(
            announcement.category
        )
    );


    setText(
        el.detailsAnnouncementPriority,
        `${capitalize(
            announcement.priority
        )} Priority`
    );


    setText(
        el.detailsAnnouncementContent,
        announcement.content ||
        "No content provided."
    );


    setText(
        el.detailsTargetAudience,
        formatAudience(
            announcement.targetAudience
        )
    );


    setText(
        el.detailsTargetValue,
        announcement.targetValue ||
        "All applicable alumni"
    );


    setText(
        el.detailsPublishDate,
        formatDate(
            announcement.publishDate
        )
    );


    setText(
        el.detailsExpiryDate,
        announcement.expiryDate
            ? formatDate(
                announcement.expiryDate
              )
            : "No expiry date"
    );


    if (
        el.detailsAnnouncementStatus
    ) {

        el.detailsAnnouncementStatus.textContent =
            capitalize(
                announcement.status
            );


        el.detailsAnnouncementStatus.className =
            "";


        el.detailsAnnouncementStatus.classList.add(
            "announcement-status-badge",
            announcement.status
        );

    }

}


function updateSummaryCards() {

    const counts =
        state.announcements.reduce(

            (acc, announcement) => {

                acc.total += 1;


                if (
                    announcement.status ===
                    "published"
                ) {

                    acc.published += 1;

                }


                if (
                    announcement.status ===
                    "draft"
                ) {

                    acc.draft += 1;

                }


                if (
                    announcement.status ===
                    "archived"
                ) {

                    acc.archived += 1;

                }


                return acc;

            },

            {
                total: 0,
                published: 0,
                draft: 0,
                archived: 0
            }

        );


    setText(
        el.totalAnnouncementsCount,
        counts.total
    );


    setText(
        el.publishedAnnouncementsCount,
        counts.published
    );


    setText(
        el.draftAnnouncementsCount,
        counts.draft
    );


    setText(
        el.archivedAnnouncementsCount,
        counts.archived
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
                state.filteredAnnouncements.length /
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


    renderAnnouncements();


    el.announcementsGrid?.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "start"
        }
    );

}


function resetFilters() {

    if (
        el.announcementSearch
    ) {

        el.announcementSearch.value =
            "";

    }


    if (
        el.globalSearch
    ) {

        el.globalSearch.value =
            "";

    }


    if (
        el.clearSearchButton
    ) {

        el.clearSearchButton.hidden =
            true;

    }


    if (
        el.statusFilter
    ) {

        el.statusFilter.value =
            "all";

    }


    if (
        el.categoryFilter
    ) {

        el.categoryFilter.value =
            "all";

    }


    state.currentPage =
        1;


    applyFilters();

}


function showLoadingState() {

    hideAllStates();


    if (
        el.announcementsLoading
    ) {

        el.announcementsLoading.hidden =
            false;

    }


    if (
        el.resultCount
    ) {

        el.resultCount.textContent =
            "0";

    }

}


function showErrorState(message) {

    hideAllStates();


    if (
        el.announcementsErrorState
    ) {

        el.announcementsErrorState.hidden =
            false;

    }


    if (
        el.announcementsErrorMessage
    ) {

        el.announcementsErrorMessage.textContent =
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
        el.announcementsLoading
    ) {

        el.announcementsLoading.hidden =
            true;

    }


    if (
        el.announcementsErrorState
    ) {

        el.announcementsErrorState.hidden =
            true;

    }


    if (
        el.announcementsEmptyState
    ) {

        el.announcementsEmptyState.hidden =
            true;

    }


    if (
        el.announcementsGrid
    ) {

        el.announcementsGrid.hidden =
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
        !el.saveAnnouncementButton
    ) {
        return;
    }


    el.saveAnnouncementButton.disabled =
        loading;


    if (
        el.saveAnnouncementButtonText
    ) {

        el.saveAnnouncementButtonText.textContent =
            loading
                ? "Saving..."
                : (
                    el.announcementId?.value
                        ? "Save Changes"
                        : "Publish Announcement"
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


function formatCategory(category) {

    const map = {

        general:
            "General",

        event:
            "Event",

        career:
            "Career",

        academic:
            "Academic",

        community:
            "Community",

        important:
            "Important Notice"

    };


    return (
        map[category] ||
        capitalize(
            category
        )
    );

}


function getCategoryIcon(category) {

    const map = {

        general:
            "bxs-megaphone",

        event:
            "bxs-calendar-event",

        career:
            "bxs-briefcase-alt-2",

        academic:
            "bxs-graduation",

        community:
            "bxs-group",

        important:
            "bxs-error-circle"

    };


    return (
        map[category] ||
        "bxs-megaphone"
    );

}


function formatAudience(audience) {

    const map = {

        all:
            "All Alumni",

        specific_batch:
            "Specific Batch",

        specific_program:
            "Specific Program"

    };


    return (
        map[audience] ||
        capitalize(
            audience
        )
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