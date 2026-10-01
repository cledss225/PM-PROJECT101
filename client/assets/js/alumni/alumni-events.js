"use strict";

const API_BASE_URL = "/api";

const state = {
    user: null,
    events: [],
    filteredEvents: [],
    myRsvps: [],
    selectedEvent: null,
    pendingRsvpAction: null
};

const el = {};


document.addEventListener("DOMContentLoaded", initializePage);


async function initializePage() {
    cacheElements();
    initializeTheme();
    bindEvents();

    const token = getToken();
    if (!token) {
        redirectToLogin();
        return;
    }

    await loadPageData();
}


function cacheElements() {
    const ids = [
        "sidebar", "mobileMenuBtn",
        "sidebarAvatar", "sidebarUserName", "sidebarVerification",
        "topbarAvatar", "topbarUserName",
        "themeToggle", "globalSearch", "logoutBtn",
        "totalEventsCount", "upcomingEventsCount", "myRsvpCount", "completedEventsCount",
        "eventSearch", "eventTypeFilter", "eventStatusFilter", "eventModeFilter", "resetEventFilters",
        "eventResultText", "eventsLoading", "eventsError", "eventsErrorMessage", "retryEventsBtn",
        "eventsGrid", "eventsEmpty", "myRsvpList", "myRsvpEmpty",
        "eventDetailsModal", "eventDetailsBackdrop", "closeDetailsModalBtn", "closeEventDetailsBtn",
        "detailsEventTitle", "detailsEventStatus", "detailsEventType", "detailsEventDescription",
        "detailsEventDate", "detailsEventTime", "detailsEventVenue", "detailsEventMode",
        "detailsAttendeeCount", "detailsCapacity", "detailsOrganizer",
        "onlineLinkContainer", "detailsOnlineLink", "eventRsvpBtn",
        "rsvpConfirmModal", "rsvpConfirmTitle", "rsvpConfirmMessage", "cancelRsvpBtn", "confirmRsvpBtn",
        "cancelRsvpModal", "keepRsvpBtn", "confirmCancelRsvpBtn",
        "logoutModal", "logoutBackdrop", "cancelLogoutBtn", "confirmLogoutBtn",
        "toastContainer"
    ];

    ids.forEach(id => {
        el[id] = document.getElementById(id);
    });
}


function bindEvents() {

    el.mobileMenuBtn?.addEventListener("click", event => {
        event.stopPropagation();
        el.sidebar?.classList.toggle("open");
    });

    el.themeToggle?.addEventListener("click", toggleTheme);
    el.logoutBtn?.addEventListener("click", () => openModal("logoutModal"));
    el.cancelLogoutBtn?.addEventListener("click", () => closeModal("logoutModal"));
    el.logoutBackdrop?.addEventListener("click", () => closeModal("logoutModal"));
    el.confirmLogoutBtn?.addEventListener("click", logout);

    el.eventSearch?.addEventListener("input", applyFilters);
    el.eventTypeFilter?.addEventListener("change", applyFilters);
    el.eventStatusFilter?.addEventListener("change", applyFilters);
    el.eventModeFilter?.addEventListener("change", applyFilters);
    el.resetEventFilters?.addEventListener("click", resetFilters);
    el.retryEventsBtn?.addEventListener("click", loadPageData);

    el.globalSearch?.addEventListener("input", event => {
        if (el.eventSearch) el.eventSearch.value = event.target.value;
        applyFilters();
    });

    el.eventsGrid?.addEventListener("click", handleEventsGridClick);
    el.myRsvpList?.addEventListener("click", handleMyRsvpClick);

    el.closeDetailsModalBtn?.addEventListener("click", closeEventDetailsModal);
    el.closeEventDetailsBtn?.addEventListener("click", closeEventDetailsModal);
    el.eventDetailsBackdrop?.addEventListener("click", closeEventDetailsModal);
    el.eventRsvpBtn?.addEventListener("click", handleMainRsvpButton);

    el.cancelRsvpBtn?.addEventListener("click", () => closeModal("rsvpConfirmModal"));
    el.confirmRsvpBtn?.addEventListener("click", confirmRsvp);
    el.keepRsvpBtn?.addEventListener("click", () => closeModal("cancelRsvpModal"));
    el.confirmCancelRsvpBtn?.addEventListener("click", confirmCancelRsvp);

    document.addEventListener("keydown", handleKeyboard);

    document.addEventListener("click", event => {
        if (
            window.innerWidth <= 960 &&
            el.sidebar?.classList.contains("open")
        ) {
            const clickedSidebar = el.sidebar.contains(event.target);
            const clickedButton = el.mobileMenuBtn?.contains(event.target);

            if (!clickedSidebar && !clickedButton) {
                el.sidebar.classList.remove("open");
            }
        }
    });
}


async function loadPageData() {

    showLoading();

    try {
        await loadCurrentUser();

        await Promise.allSettled([
            loadEvents(),
            loadMyRsvps()
        ]);

        synchronizeRsvpState();
        updateStatistics();
        applyFilters();
        renderMyRsvps();
        showEventsContent();

    } catch (error) {
        console.error("LOAD ALUMNI EVENTS PAGE ERROR:", error);

        if (error.status === 401 || error.status === 403) {
            clearSession();
            redirectToLogin();
            return;
        }

        showEventsError(error.message || "Unable to load events.");
    }
}


async function loadCurrentUser() {

    const response = await apiRequest("/auth/me", { method: "GET" });

    state.user = response.user || response.data || response;

    if (
        state.user?.role_id !== undefined &&
        Number(state.user.role_id) !== 2
    ) {
        throw new Error("This page is only available to alumni accounts.");
    }

    renderCurrentUser();
}


function renderCurrentUser() {

    const user = state.user || {};
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    const fullName = [
        user.first_name,
        user.middle_name,
        user.last_name
    ].filter(Boolean).join(" ").trim() || "Alumni User";

    const initials = getInitials(firstName, lastName);

    setText(el.sidebarUserName, fullName);
    setText(el.topbarUserName, fullName);
    renderSharedAlumniAvatar(el.sidebarProfileAvatar || el.sidebarAvatar, user.profile_picture, initials);
    renderSharedAlumniAvatar(el.topbarAvatar, user.profile_picture, initials);

    const verified = isVerifiedUser(user);

    if (el.sidebarVerification) {
        el.sidebarVerification.innerHTML = verified
            ? `<i class="bx bxs-badge-check"></i> Verified Alumni`
            : `<i class="bx bx-time-five"></i> Pending Verification`;

        el.sidebarVerification.style.color = verified
            ? "var(--success)"
            : "var(--warning)";
    }
}


async function loadEvents() {

    const response = await apiRequest("/events", { method: "GET" });

    const rawEvents = extractArray(response, ["events", "data", "records"]);

    state.events = rawEvents
        .map(normalizeEvent)
        .filter(event => !["draft", "cancelled", "archived"].includes(
            event.status.toLowerCase()
        ));
}


function normalizeEvent(event) {

    return {
        id: event.event_id ?? event.id,
        title: event.title ?? "Untitled Event",
        description: event.description ?? "",
        eventType: event.event_type ?? event.type ?? "Event",
        status: event.status ?? deriveEventStatus(event),
        startDate: event.start_date ?? event.event_date ?? "",
        endDate: event.end_date ?? "",
        startTime: event.start_time ?? "",
        endTime: event.end_time ?? "",
        mode: event.mode ?? event.event_mode ?? "",
        venue: event.venue ?? "",
        onlineLink: event.online_link ?? event.meeting_link ?? "",
        capacity: normalizeNumber(event.capacity),
        attendeeCount: normalizeNumber(
            event.attendee_count ?? event.rsvp_count ?? event.rsvpCount
        ),
        organizer: event.organizer ?? event.created_by_name ?? event.created_by ?? "Alumni Office",
        createdAt: event.created_at ?? "",
        isRsvped: Boolean(event.is_rsvped ?? event.user_rsvped ?? false)
    };
}


function deriveEventStatus(event) {

    const now = new Date();

    const start = parseEventDateTime(
        event.start_date ?? event.event_date,
        event.start_time
    );

    const end = parseEventDateTime(
        event.end_date ?? event.start_date ?? event.event_date,
        event.end_time
    );

    if (end && end < now) return "Completed";

    if (start && start <= now && (!end || end >= now)) return "Ongoing";

    return "Upcoming";
}


async function loadMyRsvps() {

    try {
        const response = await apiRequest("/events/my-rsvps", { method: "GET" });

        state.myRsvps = extractArray(response, [
            "rsvps", "events", "data", "records"
        ]).map(normalizeRsvp);

    } catch (error) {
        console.warn("MY RSVP ENDPOINT ERROR:", error);
        state.myRsvps = [];
    }
}


function normalizeRsvp(item) {

    return {
        rsvpId: item.rsvp_id ?? null,
        eventId: item.event_id ?? null,
        status: item.rsvp_status ?? item.status ?? "going",
        event: normalizeEvent(item)
    };
}


function synchronizeRsvpState() {

    const rsvpEventIds = new Set(
        state.myRsvps.map(item => String(item.eventId))
    );

    state.events.forEach(event => {
        if (rsvpEventIds.has(String(event.id))) {
            event.isRsvped = true;
        }
    });
}


function applyFilters() {

    const search = (el.eventSearch?.value || "").trim().toLowerCase();
    const type = el.eventTypeFilter?.value || "all";
    const status = el.eventStatusFilter?.value || "all";
    const mode = el.eventModeFilter?.value || "all";

    state.filteredEvents = state.events.filter(event => {

        const searchableText = [
            event.title,
            event.description,
            event.eventType,
            event.venue,
            event.mode
        ].join(" ").toLowerCase();

        const matchesSearch = !search || searchableText.includes(search);
        const matchesType = type === "all" || normalizeText(event.eventType) === normalizeText(type);
        const matchesStatus = status === "all" || normalizeText(event.status) === normalizeText(status);
        const matchesMode = mode === "all" || normalizeText(event.mode) === normalizeText(mode);

        return matchesSearch && matchesType && matchesStatus && matchesMode;
    });

    state.filteredEvents.sort(sortEvents);
    renderEvents();
}


function resetFilters() {
    if (el.eventSearch) el.eventSearch.value = "";
    if (el.globalSearch) el.globalSearch.value = "";
    if (el.eventTypeFilter) el.eventTypeFilter.value = "all";
    if (el.eventStatusFilter) el.eventStatusFilter.value = "all";
    if (el.eventModeFilter) el.eventModeFilter.value = "all";
    applyFilters();
}


function sortEvents(a, b) {

    const aDate = parseEventDateTime(a.startDate, a.startTime);
    const bDate = parseEventDateTime(b.startDate, b.startTime);

    return (
        (aDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (bDate?.getTime() ?? Number.MAX_SAFE_INTEGER)
    );
}


function renderEvents() {

    if (!el.eventsGrid) return;

    const events = state.filteredEvents;

    setText(
        el.eventResultText,
        `${events.length} event${events.length === 1 ? "" : "s"} found`
    );

    if (events.length === 0) {
        el.eventsGrid.innerHTML = "";
        el.eventsGrid.classList.add("hidden");
        el.eventsEmpty?.classList.remove("hidden");
        return;
    }

    el.eventsEmpty?.classList.add("hidden");
    el.eventsGrid.classList.remove("hidden");
    el.eventsGrid.innerHTML = events.map(createEventCard).join("");
}


function createEventCard(event) {

    const date = parseEventDateTime(event.startDate, event.startTime);
    const day = date ? String(date.getDate()) : "--";
    const month = date
        ? date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
        : "TBA";

    const statusClass = normalizeText(event.status);
    const capacityText = event.capacity
        ? `${event.attendeeCount} / ${event.capacity}`
        : `${event.attendeeCount} registered`;

    return `
        <article class="event-card ${event.isRsvped ? "rsvped" : ""}">
            <div class="event-card-top">
                <div class="event-date-box">
                    <strong>${escapeHtml(day)}</strong>
                    <span>${escapeHtml(month)}</span>
                </div>

                <span class="event-card-status ${escapeHtml(statusClass)}">
                    ${escapeHtml(event.status)}
                </span>
            </div>

            <div class="event-card-body">
                <span class="event-card-type">${escapeHtml(event.eventType)}</span>
                <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                <p class="event-card-description">
                    ${escapeHtml(truncateText(event.description || "No description provided.", 110))}
                </p>

                <div class="event-card-meta">
                    <span><i class="bx bx-calendar"></i>${escapeHtml(formatEventDate(event))}</span>
                    <span><i class="bx bx-time"></i>${escapeHtml(formatEventTime(event))}</span>
                    <span><i class="bx bx-map"></i>${escapeHtml(event.venue || event.mode || "Venue TBA")}</span>
                </div>

                ${event.isRsvped ? `
                    <span class="event-rsvp-chip">
                        <i class="bx bx-check-circle"></i>
                        RSVP Confirmed
                    </span>
                ` : ""}
            </div>

            <div class="event-card-footer">
                <span class="event-capacity"><strong>${escapeHtml(capacityText)}</strong></span>
                <button
                    type="button"
                    class="event-card-action"
                    data-event-action="view"
                    data-event-id="${escapeHtml(event.id)}"
                >
                    View Details
                </button>
            </div>
        </article>
    `;
}


function handleEventsGridClick(event) {

    const button = event.target.closest("[data-event-action]");
    if (!button) return;

    const selected = findEventById(button.dataset.eventId);
    if (!selected) return;

    openEventDetails(selected);
}


async function openEventDetails(event) {

    state.selectedEvent = event;

    setText(el.detailsEventTitle, event.title);
    setText(el.detailsEventStatus, event.status);
    setText(el.detailsEventType, event.eventType);
    setText(el.detailsEventDescription, event.description || "No description provided.");
    setText(el.detailsEventDate, formatEventDate(event));
    setText(el.detailsEventTime, formatEventTime(event));
    setText(el.detailsEventVenue, event.venue || "Venue TBA");
    setText(el.detailsEventMode, event.mode || "Not specified");
    setText(el.detailsAttendeeCount, event.attendeeCount);
    setText(el.detailsCapacity, event.capacity || "Unlimited");
    setText(el.detailsOrganizer, event.organizer || "Alumni Office");

    renderOnlineLink(event);
    updateDetailsRsvpButton(event);
    openModal("eventDetailsModal");

    await refreshEventAttendeeCount(event);
}


function renderOnlineLink(event) {

    if (event.onlineLink) {
        el.onlineLinkContainer?.classList.remove("hidden");
        if (el.detailsOnlineLink) el.detailsOnlineLink.href = normalizeUrl(event.onlineLink);
    } else {
        el.onlineLinkContainer?.classList.add("hidden");
    }
}


async function refreshEventAttendeeCount(event) {

    if (!event?.id) return;

    try {
        const response = await apiRequest(
            `/events/${encodeURIComponent(event.id)}/attendees`,
            { method: "GET" }
        );

        const attendees = extractArray(response, ["attendees", "data", "records"]);
        event.attendeeCount = attendees.length;

        setText(el.detailsAttendeeCount, attendees.length);
        updateStatistics();
        renderEvents();

    } catch (error) {
        console.warn("ATTENDEE COUNT ERROR:", error);
    }
}


function updateDetailsRsvpButton(event) {

    if (!el.eventRsvpBtn) return;

    const label = el.eventRsvpBtn.querySelector("span");
    const icon = el.eventRsvpBtn.querySelector("i");
    const completed = normalizeText(event.status) === "completed";

    if (completed) {
        el.eventRsvpBtn.disabled = true;
        if (label) label.textContent = "Event Completed";
        if (icon) icon.className = "bx bx-calendar-check";
        return;
    }

    el.eventRsvpBtn.disabled = false;

    if (event.isRsvped) {
        if (label) label.textContent = "Cancel RSVP";
        if (icon) icon.className = "bx bx-x-circle";
    } else {
        if (label) label.textContent = "RSVP to Event";
        if (icon) icon.className = "bx bx-check-circle";
    }
}


function handleMainRsvpButton() {

    const event = state.selectedEvent;
    if (!event) return;

    if (event.isRsvped) {
        state.pendingRsvpAction = "cancel";
        closeModal("eventDetailsModal");
        openModal("cancelRsvpModal");
    } else {
        state.pendingRsvpAction = "join";
        setText(el.rsvpConfirmTitle, "Join this event?");
        setText(
            el.rsvpConfirmMessage,
            `Your RSVP for "${event.title}" will be recorded in AlumniHub.`
        );
        closeModal("eventDetailsModal");
        openModal("rsvpConfirmModal");
    }
}


async function confirmRsvp() {

    const event = state.selectedEvent;
    if (!event) return;

    setButtonLoading(el.confirmRsvpBtn, true, "Joining...");

    try {
        await createRsvp(event.id);
        event.isRsvped = true;
        closeModal("rsvpConfirmModal");

        showToast(
            "RSVP confirmed",
            `You have successfully joined "${event.title}".`,
            "success"
        );

        await refreshAfterRsvp();

    } catch (error) {
        console.error("RSVP ERROR:", error);
        showToast("Unable to RSVP", error.message || "Please try again.", "error");
    } finally {
        setButtonLoading(el.confirmRsvpBtn, false, "Confirm RSVP");
    }
}


async function createRsvp(eventId) {
    return apiRequest(`/events/${encodeURIComponent(eventId)}/rsvp`, {
        method: "POST"
    });
}


async function confirmCancelRsvp() {

    const event = state.selectedEvent;
    if (!event) return;

    setButtonLoading(el.confirmCancelRsvpBtn, true, "Cancelling...");

    try {
        await cancelRsvp(event.id);
        event.isRsvped = false;
        closeModal("cancelRsvpModal");

        showToast(
            "RSVP cancelled",
            `Your RSVP for "${event.title}" has been cancelled.`,
            "success"
        );

        await refreshAfterRsvp();

    } catch (error) {
        console.error("CANCEL RSVP ERROR:", error);
        showToast("Unable to cancel RSVP", error.message || "Please try again.", "error");
    } finally {
        setButtonLoading(el.confirmCancelRsvpBtn, false, "Cancel RSVP");
    }
}


async function cancelRsvp(eventId) {
    return apiRequest(`/events/${encodeURIComponent(eventId)}/rsvp`, {
        method: "DELETE"
    });
}


async function refreshAfterRsvp() {

    await Promise.allSettled([
        loadEvents(),
        loadMyRsvps()
    ]);

    synchronizeRsvpState();
    updateStatistics();
    applyFilters();
    renderMyRsvps();
}


function renderMyRsvps() {

    if (!el.myRsvpList || !el.myRsvpEmpty) return;

    const rsvpEvents = getRsvpEvents();
    setText(el.myRsvpCount, rsvpEvents.length);

    if (rsvpEvents.length === 0) {
        el.myRsvpList.innerHTML = "";
        el.myRsvpEmpty.classList.remove("hidden");
        return;
    }

    el.myRsvpEmpty.classList.add("hidden");

    el.myRsvpList.innerHTML = rsvpEvents.map(event => `
        <div class="my-rsvp-item">
            <div class="my-rsvp-icon">
                <i class="bx bx-calendar-check"></i>
            </div>

            <div class="my-rsvp-info">
                <strong>${escapeHtml(event.title)}</strong>
                <span>
                    ${escapeHtml(formatEventDate(event))}
                    •
                    ${escapeHtml(formatEventTime(event))}
                </span>
            </div>

            <button
                type="button"
                class="event-card-action"
                data-rsvp-action="view"
                data-event-id="${escapeHtml(event.id)}"
            >
                View
            </button>

            <button
                type="button"
                class="cancel-rsvp-inline"
                data-rsvp-action="cancel"
                data-event-id="${escapeHtml(event.id)}"
            >
                Cancel RSVP
            </button>
        </div>
    `).join("");
}


function getRsvpEvents() {

    const ids = new Set(
        state.myRsvps.map(item => String(item.eventId))
    );

    const fullEvents = state.events.filter(event =>
        event.isRsvped || ids.has(String(event.id))
    );

    if (fullEvents.length) return fullEvents.sort(sortEvents);

    return state.myRsvps
        .map(item => item.event)
        .filter(Boolean)
        .sort(sortEvents);
}


function handleMyRsvpClick(event) {

    const button = event.target.closest("[data-rsvp-action]");
    if (!button) return;

    const selected = findEventById(button.dataset.eventId);
    if (!selected) return;

    const action = button.dataset.rsvpAction;

    if (action === "view") {
        openEventDetails(selected);
        return;
    }

    if (action === "cancel") {
        state.selectedEvent = selected;
        openModal("cancelRsvpModal");
    }
}


function updateStatistics() {

    const total = state.events.length;
    const upcoming = state.events.filter(event => normalizeText(event.status) === "upcoming").length;
    const completed = state.events.filter(event => normalizeText(event.status) === "completed").length;
    const joined = getRsvpEvents().length;

    setText(el.totalEventsCount, total);
    setText(el.upcomingEventsCount, upcoming);
    setText(el.completedEventsCount, completed);
    setText(el.myRsvpCount, joined);
}


function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add("hidden");

    const anyOpen = document.querySelector(".modal:not(.hidden)");
    if (!anyOpen) document.body.style.overflow = "";
}

function closeEventDetailsModal() {
    closeModal("eventDetailsModal");
}


function showLoading() {
    el.eventsLoading?.classList.remove("hidden");
    el.eventsError?.classList.add("hidden");
    el.eventsGrid?.classList.add("hidden");
    el.eventsEmpty?.classList.add("hidden");
}

function showEventsContent() {
    el.eventsLoading?.classList.add("hidden");
    el.eventsError?.classList.add("hidden");
}

function showEventsError(message) {
    el.eventsLoading?.classList.add("hidden");
    el.eventsGrid?.classList.add("hidden");
    el.eventsEmpty?.classList.add("hidden");
    el.eventsError?.classList.remove("hidden");
    setText(el.eventsErrorMessage, message);
}


async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    const headers = {
        Accept: "application/json",
        ...(options.headers || {})
    };

    if (options.body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const rawText = await response.text();
    let data = {};

    if (rawText) {
        try {
            data = JSON.parse(rawText);
        } catch {
            data = { message: rawText };
        }
    }

    if (!response.ok || data.success === false) {
        const error = new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}.`
        );
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}


function initializeTheme() {

    const saved =
        localStorage.getItem("savedTheme") ||
        localStorage.getItem("theme") ||
        "dark";

    const dark = saved === "dark";

    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("dark-mode", dark);
    updateThemeIcon();
}

function toggleTheme() {

    const dark = !(
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode")
    );

    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("dark-mode", dark);

    localStorage.setItem("savedTheme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
    updateThemeIcon();
}

function updateThemeIcon() {

    const icon = el.themeToggle?.querySelector("i");
    if (!icon) return;

    const dark =
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");

    icon.className = dark ? "bx bx-sun" : "bx bx-moon";
}


function handleKeyboard(event) {

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        el.globalSearch?.focus();
    }

    if (event.key === "Escape") {
        document.querySelectorAll(".modal:not(.hidden)").forEach(modal => closeModal(modal.id));
        el.sidebar?.classList.remove("open");
    }
}


function logout() {
    clearSession();
    window.location.href = "../pages/login.html";
}

function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
}

function redirectToLogin() {
    window.location.href = "../pages/login.html";
}

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        ""
    );
}


function findEventById(id) {
    return state.events.find(event => String(event.id) === String(id));
}


function parseEventDateTime(dateValue, timeValue) {

    if (!dateValue) return null;

    let datePart = String(dateValue);
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) datePart = `${match[1]}-${match[2]}-${match[3]}`;

    const date = timeValue
        ? new Date(`${datePart}T${timeValue}`)
        : new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) return null;
    return date;
}


function formatEventDate(event) {

    const start = parseEventDateTime(event.startDate, event.startTime);
    if (!start) return "Date TBA";

    const startText = start.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    if (event.endDate && event.endDate !== event.startDate) {
        const end = parseEventDateTime(event.endDate, event.endTime);

        if (end) {
            return `${startText} - ${end.toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric"
            })}`;
        }
    }

    return startText;
}


function formatEventTime(event) {

    const start = formatTime(event.startTime);
    const end = formatTime(event.endTime);

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return "Time TBA";
}

function formatTime(value) {

    if (!value) return "";

    const match = String(value).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value);

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}


function extractArray(payload, keys) {

    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    return [];
}

function normalizeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
}

function getInitials(firstName, lastName) {
    const first = String(firstName || "").trim();
    const last = String(lastName || "").trim();

    if (first || last) {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }

    return "AL";
}

function isVerifiedUser(user) {
    return (
        user?.is_verified === true ||
        user?.is_verified === 1 ||
        user?.is_verified === "true" ||
        normalizeText(user?.verification_status) === "verified" ||
        normalizeText(user?.verification_status) === "approved"
    );
}

function normalizeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "#";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

function truncateText(value, length) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= length) return text;
    return `${text.slice(0, length - 1)}…`;
}

function setText(element, value) {
    if (element) element.textContent = value ?? "—";
}

function setButtonLoading(button, loading, text) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {
        button.dataset.oldHtml = button.innerHTML;
        button.innerHTML = `<span>${escapeHtml(text)}</span>`;
    } else if (button.dataset.oldHtml) {
        button.innerHTML = button.dataset.oldHtml;
        delete button.dataset.oldHtml;
    }
}


function showToast(title, message, type = "info") {

    if (!el.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "success"
        ? "bx-check-circle"
        : type === "error"
        ? "bx-error-circle"
        : "bx-info-circle";

    toast.innerHTML = `
        <i class="bx ${icon}"></i>
        <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    el.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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