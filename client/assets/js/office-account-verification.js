
"use strict";

/*
 * AlumniHub Office - Account Verification Monitoring
 * Read-only frontend. Final approve/reject actions remain on the Admin side.
 *
 * IMPORTANT:
 * This page needs a backend endpoint that returns verification records visible
 * to the Alumni Office. The preferred endpoint below is:
 *   GET /api/accounts/verification-records
 *
 * If your backend uses a different route, change VERIFICATION_ENDPOINT only.
 */

const API_BASE_URL = "http://localhost:5000/api";
const VERIFICATION_ENDPOINT = `${API_BASE_URL}/accounts/verification-records`;
const PAGE_SIZE = 8;

const state = {
    records: [],
    filteredRecords: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    selectedRecord: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    initializeProfile();
    bindEvents();
    setCurrentYear();
    loadVerificationRecords();
    window.setTimeout(() => el.pageLoader?.classList.add("hide"), 250);
});

function cacheElements() {
    const ids = [
        "sidebar", "sidebarOverlay", "sidebarClose", "menuToggle",
        "globalSearch", "themeToggle", "themeIcon",
        "notificationButton", "notificationDropdown", "notificationDot",
        "notificationList", "markAllReadButton",
        "headerProfileButton", "profileDropdown",
        "logoutButton", "profileLogoutButton", "confirmLogoutButton",
        "refreshButton", "verificationMenuBadge",
        "pendingCount", "verifiedCount", "rejectedCount", "totalCount",
        "resultCount", "verificationSearch", "clearSearchButton",
        "statusFilter", "programFilter", "batchFilter",
        "resetFiltersButton", "clearFiltersButton",
        "verificationLoading", "verificationErrorState",
        "verificationErrorMessage", "retryButton",
        "verificationEmptyState", "verificationTableWrapper",
        "verificationTableBody", "verificationMobileList",
        "paginationContainer", "paginationStart", "paginationEnd",
        "paginationTotal", "paginationPages",
        "previousPageButton", "nextPageButton",
        "detailsModal", "detailsProfileImage", "detailsAvatarInitials",
        "detailsFullName", "detailsEmail", "detailsStatusBadge",
        "verificationStatusMessage", "verificationMessageIcon",
        "verificationMessageTitle", "verificationMessageText",
        "detailsStudentNumber", "detailsEmailAddress", "detailsPhoneNumber",
        "detailsGender", "detailsAddress", "detailsProgram",
        "detailsBatchYear", "detailsCurrentJob", "detailsCompany",
        "detailsLinkedIn", "detailsCreatedAt", "detailsUpdatedAt",
        "rejectionReasonContainer", "detailsRejectionReason",
        "logoutModal", "pageLoader", "toastContainer", "currentYear",
        "sidebarUserName", "headerUserName", "sidebarInitials",
        "headerInitials", "sidebarProfileImage", "headerProfileImage"
    ];

    ids.forEach(id => {
        el[id] = document.getElementById(id);
    });
}

function bindEvents() {
    el.menuToggle?.addEventListener("click", openSidebar);
    el.sidebarClose?.addEventListener("click", closeSidebar);
    el.sidebarOverlay?.addEventListener("click", closeSidebar);

    el.themeToggle?.addEventListener("click", toggleTheme);

    el.notificationButton?.addEventListener("click", event => {
        event.stopPropagation();
        toggleDropdown(el.notificationDropdown, el.notificationButton);
        closeDropdown(el.profileDropdown, el.headerProfileButton);
    });

    el.headerProfileButton?.addEventListener("click", event => {
        event.stopPropagation();
        toggleDropdown(el.profileDropdown, el.headerProfileButton);
        closeDropdown(el.notificationDropdown, el.notificationButton);
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".notification-wrapper")) {
            closeDropdown(el.notificationDropdown, el.notificationButton);
        }
        if (!event.target.closest(".header-profile-wrapper")) {
            closeDropdown(el.profileDropdown, el.headerProfileButton);
        }
    });

    el.markAllReadButton?.addEventListener("click", () => {
        if (el.notificationDot) el.notificationDot.style.display = "none";
        showToast("Notifications cleared", "All verification notifications were marked as read.", "success");
    });

    el.refreshButton?.addEventListener("click", () => loadVerificationRecords(true));
    el.retryButton?.addEventListener("click", () => loadVerificationRecords(true));

    el.verificationSearch?.addEventListener("input", () => {
        if (el.clearSearchButton) el.clearSearchButton.hidden = !el.verificationSearch.value.trim();
        state.currentPage = 1;
        applyFilters();
    });

    el.globalSearch?.addEventListener("input", () => {
        if (el.verificationSearch) el.verificationSearch.value = el.globalSearch.value;
        if (el.clearSearchButton) el.clearSearchButton.hidden = !el.globalSearch.value.trim();
        state.currentPage = 1;
        applyFilters();
    });

    el.clearSearchButton?.addEventListener("click", () => {
        el.verificationSearch.value = "";
        if (el.globalSearch) el.globalSearch.value = "";
        el.clearSearchButton.hidden = true;
        state.currentPage = 1;
        applyFilters();
        el.verificationSearch.focus();
    });

    [el.statusFilter, el.programFilter, el.batchFilter].forEach(select => {
        select?.addEventListener("change", () => {
            state.currentPage = 1;
            applyFilters();
        });
    });

    el.resetFiltersButton?.addEventListener("click", resetFilters);
    el.clearFiltersButton?.addEventListener("click", resetFilters);

    el.previousPageButton?.addEventListener("click", () => changePage(state.currentPage - 1));
    el.nextPageButton?.addEventListener("click", () => changePage(state.currentPage + 1));

    el.verificationTableBody?.addEventListener("click", handleRecordAction);
    el.verificationMobileList?.addEventListener("click", handleRecordAction);

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", () => closeModal(button.dataset.closeModal));
    });

    [el.logoutButton, el.profileLogoutButton].forEach(button => {
        button?.addEventListener("click", () => openModal("logoutModal"));
    });

    el.confirmLogoutButton?.addEventListener("click", performLogout);

    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            (el.globalSearch || el.verificationSearch)?.focus();
        }

        if (event.key === "Escape") {
            closeSidebar();
            document.querySelectorAll(".modal.show").forEach(modal => closeModal(modal.id));
            closeDropdown(el.notificationDropdown, el.notificationButton);
            closeDropdown(el.profileDropdown, el.headerProfileButton);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) closeSidebar();
        renderRecords();
    });
}

async function loadVerificationRecords(showRefreshToast = false) {
    showLoadingState();

    const token = localStorage.getItem("token");

    if (!token) {
        showErrorState("Your login session was not found. Please sign in again.");
        return;
    }

    try {
        const response = await fetch(VERIFICATION_ENDPOINT, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Your account is not authorized to view verification records.");
        }

        if (!response.ok) {
            let message = `Unable to retrieve verification records (${response.status}).`;
            try {
                const body = await response.json();
                message = body.message || body.error || message;
            } catch (_) {}
            throw new Error(message);
        }

        const payload = await response.json();
        const rawRecords = extractRecordArray(payload);

        state.records = rawRecords.map(normalizeRecord);
        state.currentPage = 1;

        populateDynamicFilters();
        updateSummaryCards();
        updateNotifications();
        applyFilters();

        if (showRefreshToast) {
            showToast("Records updated", "The latest verification records have been loaded.", "success");
        }
    } catch (error) {
        console.error("Account verification load error:", error);
        showErrorState(error.message || "Something went wrong while retrieving account records.");
    }
}

function extractRecordArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.accounts)) return payload.accounts;
    if (Array.isArray(payload?.alumni)) return payload.alumni;
    return [];
}

function normalizeRecord(record) {
    const firstName = record.first_name ?? record.firstName ?? "";
    const middleName = record.middle_name ?? record.middleName ?? "";
    const lastName = record.last_name ?? record.lastName ?? "";
    const fullName =
        record.full_name ??
        record.fullName ??
        ([firstName, middleName, lastName].filter(Boolean).join(" ").trim() || "Unnamed Alumni");

    const status = normalizeStatus(
        record.verification_status ??
        record.verificationStatus ??
        record.status ??
        (record.is_verified === true ? "verified" : "pending")
    );

    return {
        id: record.user_id ?? record.userId ?? record.id ?? record.profile_id ?? cryptoRandomId(),
        fullName,
        firstName,
        middleName,
        lastName,
        email: record.email ?? "—",
        studentNumber: record.student_number ?? record.studentNumber ?? "—",
        program: record.program ?? record.course ?? "Not specified",
        batchYear: String(record.batch_year ?? record.batchYear ?? record.batch ?? "—"),
        phoneNumber: record.phone_number ?? record.phoneNumber ?? "—",
        gender: record.gender ?? "—",
        address: record.address ?? "—",
        currentJob: record.current_job ?? record.currentJob ?? "—",
        company: record.company ?? "—",
        linkedinUrl: record.linkedin_url ?? record.linkedinUrl ?? "",
        profilePicture: record.profile_picture ?? record.profilePicture ?? "",
        status,
        rejectionReason:
            record.rejection_reason ??
            record.rejectionReason ??
            record.verification_remarks ??
            record.remarks ??
            "",
        createdAt: record.created_at ?? record.createdAt ?? null,
        updatedAt: record.updated_at ?? record.updatedAt ?? null
    };
}

function normalizeStatus(value) {
    const status = String(value || "pending").trim().toLowerCase();

    if (["approved", "active", "verified"].includes(status)) return "verified";
    if (["declined", "denied", "rejected"].includes(status)) return "rejected";
    return "pending";
}

function applyFilters() {
    const search = (el.verificationSearch?.value || "").trim().toLowerCase();
    const status = el.statusFilter?.value || "all";
    const program = el.programFilter?.value || "all";
    const batch = el.batchFilter?.value || "all";

    state.filteredRecords = state.records.filter(record => {
        const searchable = [
            record.fullName,
            record.email,
            record.studentNumber,
            record.program,
            record.batchYear
        ].join(" ").toLowerCase();

        const searchMatch = !search || searchable.includes(search);
        const statusMatch = status === "all" || record.status === status;
        const programMatch = program === "all" || record.program === program;
        const batchMatch = batch === "all" || record.batchYear === batch;

        return searchMatch && statusMatch && programMatch && batchMatch;
    });

    const totalPages = Math.max(1, Math.ceil(state.filteredRecords.length / state.pageSize));
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    renderRecords();
}

function renderRecords() {
    hideAllDataStates();

    const total = state.filteredRecords.length;
    if (el.resultCount) el.resultCount.textContent = total;

    if (!total) {
        if (el.verificationEmptyState) el.verificationEmptyState.hidden = false;
        if (el.paginationContainer) el.paginationContainer.hidden = true;
        return;
    }

    const start = (state.currentPage - 1) * state.pageSize;
    const end = Math.min(start + state.pageSize, total);
    const pageRecords = state.filteredRecords.slice(start, end);

    if (window.innerWidth <= 760) {
        if (el.verificationMobileList) {
            el.verificationMobileList.hidden = false;
            el.verificationMobileList.innerHTML = pageRecords.map(createMobileRecordCard).join("");
        }
        if (el.verificationTableWrapper) el.verificationTableWrapper.hidden = true;
    } else {
        if (el.verificationTableWrapper) {
            el.verificationTableWrapper.hidden = false;
            el.verificationTableBody.innerHTML = pageRecords.map(createTableRow).join("");
        }
        if (el.verificationMobileList) el.verificationMobileList.hidden = true;
    }

    renderPagination(start, end, total);
}

function createTableRow(record) {
    const initials = getInitials(record.fullName);
    const avatar = record.profilePicture
        ? `<img src="${escapeAttribute(resolveImageUrl(record.profilePicture))}" alt="${escapeAttribute(record.fullName)}" onerror="this.remove()">`
        : escapeHtml(initials);

    return `
        <tr>
            <td>
                <div class="alumni-cell">
                    <div class="alumni-cell-avatar">${avatar}</div>
                    <div class="alumni-cell-info">
                        <strong>${escapeHtml(record.fullName)}</strong>
                        <span>${escapeHtml(record.email)}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(record.studentNumber)}</td>
            <td>${escapeHtml(record.program)}</td>
            <td>${escapeHtml(record.batchYear)}</td>
            <td>${escapeHtml(formatDate(record.createdAt))}</td>
            <td>${createStatusBadge(record.status)}</td>
            <td class="table-action-cell">
                <button class="view-details-button" type="button" data-action="view" data-id="${escapeAttribute(String(record.id))}">
                    <i class="bx bx-show"></i>
                    View Details
                </button>
            </td>
        </tr>
    `;
}

function createMobileRecordCard(record) {
    return `
        <article class="mobile-record-card">
            <div class="mobile-record-top">
                <div class="alumni-cell">
                    <div class="alumni-cell-avatar">${escapeHtml(getInitials(record.fullName))}</div>
                    <div class="alumni-cell-info">
                        <strong>${escapeHtml(record.fullName)}</strong>
                        <span>${escapeHtml(record.email)}</span>
                    </div>
                </div>
                ${createStatusBadge(record.status)}
            </div>

            <div class="mobile-record-main">
                <div class="mobile-record-item">
                    <span>Student Number</span>
                    <strong>${escapeHtml(record.studentNumber)}</strong>
                </div>
                <div class="mobile-record-item">
                    <span>Program</span>
                    <strong>${escapeHtml(record.program)}</strong>
                </div>
                <div class="mobile-record-item">
                    <span>Batch</span>
                    <strong>${escapeHtml(record.batchYear)}</strong>
                </div>
                <div class="mobile-record-item">
                    <span>Registered</span>
                    <strong>${escapeHtml(formatDate(record.createdAt))}</strong>
                </div>
            </div>

            <button class="view-details-button" type="button" data-action="view" data-id="${escapeAttribute(String(record.id))}">
                <i class="bx bx-show"></i>
                View Account Details
            </button>
        </article>
    `;
}

function createStatusBadge(status) {
    const config = getStatusConfig(status);
    return `
        <span class="status-badge status-${config.status}">
            <i class="bx ${config.icon}"></i>
            ${config.label}
        </span>
    `;
}

function getStatusConfig(status) {
    if (status === "verified") {
        return {
            status: "verified",
            label: "Verified",
            icon: "bx-check-shield",
            title: "Account Verified",
            text: "This alumni account has been successfully verified by the system administrator."
        };
    }

    if (status === "rejected") {
        return {
            status: "rejected",
            label: "Rejected",
            icon: "bx-user-x",
            title: "Account Rejected",
            text: "This account was rejected by the system administrator and may require correction."
        };
    }

    return {
        status: "pending",
        label: "Pending",
        icon: "bx-time-five",
        title: "Waiting for Administrator Review",
        text: "This account is currently pending final verification from the system administrator."
    };
}

function handleRecordAction(event) {
    const button = event.target.closest("[data-action='view']");
    if (!button) return;

    const record = state.records.find(item => String(item.id) === String(button.dataset.id));
    if (!record) return;

    state.selectedRecord = record;
    populateDetailsModal(record);
    openModal("detailsModal");
}

function populateDetailsModal(record) {
    const config = getStatusConfig(record.status);

    setText(el.detailsFullName, record.fullName);
    setText(el.detailsEmail, record.email);
    setText(el.detailsStudentNumber, record.studentNumber);
    setText(el.detailsEmailAddress, record.email);
    setText(el.detailsPhoneNumber, record.phoneNumber);
    setText(el.detailsGender, record.gender);
    setText(el.detailsAddress, record.address);
    setText(el.detailsProgram, record.program);
    setText(el.detailsBatchYear, record.batchYear);
    setText(el.detailsCurrentJob, record.currentJob);
    setText(el.detailsCompany, record.company);
    setText(el.detailsCreatedAt, formatDateTime(record.createdAt));
    setText(el.detailsUpdatedAt, formatDateTime(record.updatedAt));

    if (el.detailsStatusBadge) {
        el.detailsStatusBadge.className = `status-badge status-${config.status}`;
        el.detailsStatusBadge.innerHTML = `<i class="bx ${config.icon}"></i>${config.label}`;
    }

    if (el.verificationStatusMessage) {
        el.verificationStatusMessage.className = `verification-status-message ${config.status}`;
    }
    if (el.verificationMessageIcon) el.verificationMessageIcon.className = `bx ${config.icon}`;
    setText(el.verificationMessageTitle, config.title);
    setText(el.verificationMessageText, config.text);

    if (record.status === "rejected" && record.rejectionReason) {
        if (el.rejectionReasonContainer) el.rejectionReasonContainer.hidden = false;
        setText(el.detailsRejectionReason, record.rejectionReason);
    } else {
        if (el.rejectionReasonContainer) el.rejectionReasonContainer.hidden = true;
    }

    if (record.linkedinUrl && record.linkedinUrl !== "—") {
        el.detailsLinkedIn.href = sanitizeExternalUrl(record.linkedinUrl);
        el.detailsLinkedIn.textContent = record.linkedinUrl;
    } else {
        el.detailsLinkedIn.href = "#";
        el.detailsLinkedIn.textContent = "Not provided";
    }

    const initials = getInitials(record.fullName);
    if (el.detailsAvatarInitials) {
        el.detailsAvatarInitials.textContent = initials;
        el.detailsAvatarInitials.style.display = record.profilePicture ? "none" : "grid";
    }

    if (el.detailsProfileImage) {
        if (record.profilePicture) {
            el.detailsProfileImage.style.display = "block";
            el.detailsProfileImage.src = resolveImageUrl(record.profilePicture);
            el.detailsProfileImage.onerror = () => {
                el.detailsProfileImage.style.display = "none";
                if (el.detailsAvatarInitials) el.detailsAvatarInitials.style.display = "grid";
            };
        } else {
            el.detailsProfileImage.style.display = "none";
        }
    }
}

function renderPagination(startIndex, endIndex, total) {
    const totalPages = Math.ceil(total / state.pageSize);
    if (el.paginationContainer) el.paginationContainer.hidden = total === 0;

    setText(el.paginationStart, total ? startIndex + 1 : 0);
    setText(el.paginationEnd, endIndex);
    setText(el.paginationTotal, total);

    if (el.previousPageButton) el.previousPageButton.disabled = state.currentPage <= 1;
    if (el.nextPageButton) el.nextPageButton.disabled = state.currentPage >= totalPages;

    if (!el.paginationPages) return;

    const pages = getPaginationPages(state.currentPage, totalPages);
    el.paginationPages.innerHTML = pages.map(page => {
        if (page === "...") {
            return `<span class="pagination-page" aria-hidden="true">…</span>`;
        }

        return `
            <button
                type="button"
                class="pagination-page ${page === state.currentPage ? "active" : ""}"
                data-page="${page}"
                ${page === state.currentPage ? 'aria-current="page"' : ""}
            >
                ${page}
            </button>
        `;
    }).join("");

    el.paginationPages.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => changePage(Number(button.dataset.page)));
    });
}

function getPaginationPages(current, total) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = [1];
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let page = start; page <= end; page++) pages.push(page);

    if (current < total - 2) pages.push("...");
    pages.push(total);

    return pages;
}

function changePage(page) {
    const totalPages = Math.max(1, Math.ceil(state.filteredRecords.length / state.pageSize));
    if (page < 1 || page > totalPages || page === state.currentPage) return;

    state.currentPage = page;
    renderRecords();

    el.verificationTableWrapper?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateSummaryCards() {
    const counts = state.records.reduce((acc, record) => {
        acc.total += 1;
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
    }, { total: 0, pending: 0, verified: 0, rejected: 0 });

    setText(el.pendingCount, counts.pending);
    setText(el.verifiedCount, counts.verified);
    setText(el.rejectedCount, counts.rejected);
    setText(el.totalCount, counts.total);
    setText(el.verificationMenuBadge, counts.pending);

    if (el.verificationMenuBadge) {
        el.verificationMenuBadge.style.display = counts.pending ? "inline-flex" : "none";
    }
}

function populateDynamicFilters() {
    const programs = [...new Set(state.records.map(r => r.program).filter(Boolean))].sort();
    const batches = [...new Set(state.records.map(r => r.batchYear).filter(v => v && v !== "—"))]
        .sort((a, b) => Number(b) - Number(a));

    replaceOptions(el.programFilter, "All Programs", programs);
    replaceOptions(el.batchFilter, "All Batches", batches);
}

function replaceOptions(select, allLabel, values) {
    if (!select) return;

    select.innerHTML =
        `<option value="all">${escapeHtml(allLabel)}</option>` +
        values.map(value => `<option value="${escapeAttribute(value)}">${escapeHtml(value)}</option>`).join("");
}

function updateNotifications() {
    const pending = state.records.filter(record => record.status === "pending").slice(0, 5);

    if (el.notificationDot) {
        el.notificationDot.style.display = pending.length ? "block" : "none";
    }

    if (!el.notificationList) return;

    if (!pending.length) {
        el.notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="bx bx-bell-off"></i>
                <p>No new notifications</p>
            </div>
        `;
        return;
    }

    el.notificationList.innerHTML = pending.map(record => `
        <button
            type="button"
            class="notification-item"
            data-notification-record="${escapeAttribute(String(record.id))}"
            style="width:100%;padding:11px;border:0;border-bottom:1px solid var(--border);background:transparent;text-align:left;color:var(--text);"
        >
            <strong style="display:block;font-size:10.5px">${escapeHtml(record.fullName)}</strong>
            <span style="display:block;margin-top:2px;color:var(--muted);font-size:9px">
                Pending administrator verification
            </span>
        </button>
    `).join("");

    el.notificationList.querySelectorAll("[data-notification-record]").forEach(button => {
        button.addEventListener("click", () => {
            const record = state.records.find(r => String(r.id) === String(button.dataset.notificationRecord));
            if (!record) return;
            populateDetailsModal(record);
            openModal("detailsModal");
            closeDropdown(el.notificationDropdown, el.notificationButton);
        });
    });
}

function resetFilters() {
    if (el.verificationSearch) el.verificationSearch.value = "";
    if (el.globalSearch) el.globalSearch.value = "";
    if (el.clearSearchButton) el.clearSearchButton.hidden = true;
    if (el.statusFilter) el.statusFilter.value = "all";
    if (el.programFilter) el.programFilter.value = "all";
    if (el.batchFilter) el.batchFilter.value = "all";
    state.currentPage = 1;
    applyFilters();
}

function showLoadingState() {
    hideAllDataStates();
    if (el.verificationLoading) el.verificationLoading.hidden = false;
    if (el.resultCount) el.resultCount.textContent = "0";
}

function showErrorState(message) {
    hideAllDataStates();
    if (el.verificationErrorState) el.verificationErrorState.hidden = false;
    setText(el.verificationErrorMessage, message);
    if (el.paginationContainer) el.paginationContainer.hidden = true;
}

function hideAllDataStates() {
    if (el.verificationLoading) el.verificationLoading.hidden = true;
    if (el.verificationErrorState) el.verificationErrorState.hidden = true;
    if (el.verificationEmptyState) el.verificationEmptyState.hidden = true;
    if (el.verificationTableWrapper) el.verificationTableWrapper.hidden = true;
    if (el.verificationMobileList) el.verificationMobileList.hidden = true;
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("savedTheme") || localStorage.getItem("theme");
    const shouldUseDark = savedTheme === "dark";

    document.body.classList.toggle("dark", shouldUseDark);
    document.body.classList.toggle("dark-mode", shouldUseDark);
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = !(document.body.classList.contains("dark") || document.body.classList.contains("dark-mode"));

    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark-mode", isDark);

    localStorage.setItem("savedTheme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeIcon();
}

function updateThemeIcon() {
    if (!el.themeIcon) return;
    const isDark = document.body.classList.contains("dark") || document.body.classList.contains("dark-mode");
    el.themeIcon.className = isDark ? "bx bx-sun" : "bx bx-moon";
}

function initializeProfile() {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (_) {}

    if (!user) return;

    const fullName =
        user.full_name ||
        user.fullName ||
        [user.first_name || user.firstName, user.last_name || user.lastName].filter(Boolean).join(" ") ||
        "Alumni Office Staff";

    const initials = getInitials(fullName);

    setText(el.sidebarUserName, fullName);
    setText(el.headerUserName, fullName);
    setText(el.sidebarInitials, initials);
    setText(el.headerInitials, initials);

    const photo = user.profile_picture || user.profilePicture;
    if (photo) {
        const src = resolveImageUrl(photo);
        [el.sidebarProfileImage, el.headerProfileImage].forEach(img => {
            if (!img) return;
            img.src = src;
            img.style.display = "block";
        });
    }
}

function openSidebar() {
    el.sidebar?.classList.add("open");
    el.sidebarOverlay?.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    el.sidebar?.classList.remove("open");
    el.sidebarOverlay?.classList.remove("show");
    if (!document.querySelector(".modal.show")) document.body.style.overflow = "";
}

function toggleDropdown(dropdown, button) {
    if (!dropdown) return;
    const willOpen = !dropdown.classList.contains("show");
    dropdown.classList.toggle("show", willOpen);
    button?.setAttribute("aria-expanded", String(willOpen));
}

function closeDropdown(dropdown, button) {
    dropdown?.classList.remove("show");
    button?.setAttribute("aria-expanded", "false");
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.show")) {
        document.body.classList.remove("modal-open");
    }
}

function performLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    window.location.href = "../pages/login.html";
}

function showToast(title, message, type = "info") {
    if (!el.toastContainer) return;

    const icon =
        type === "success" ? "bx-check-circle" :
        type === "error" ? "bx-error-circle" :
        "bx-info-circle";

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="bx ${icon}"></i>
        <div class="toast-content">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    el.toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        window.setTimeout(() => toast.remove(), 220);
    }, 3200);
}

function setCurrentYear() {
    setText(el.currentYear, new Date().getFullYear());
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "AL";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function resolveImageUrl(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return path.startsWith("/") ? `http://localhost:3000${path}` : path;
}

function sanitizeExternalUrl(value) {
    try {
        const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const url = new URL(candidate);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch (_) {
        return "#";
    }
}

function setText(element, value) {
    if (element) element.textContent = value ?? "—";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function cryptoRandomId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
