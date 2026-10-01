"use strict";

const API_BASE_URL = "http://localhost:5000/api";
const EVENTS_ENDPOINT = `${API_BASE_URL}/events`;
const PAGE_SIZE = 6;

const state = {
    events: [],
    filteredEvents: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    selectedEvent: null,
    deleteTarget: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    initializeProfile();
    bindEvents();
    setCurrentYear();
    loadEvents();
    window.setTimeout(() => el.pageLoader?.classList.add("hide"), 250);
});

function cacheElements() {
    [
        "sidebar", "sidebarOverlay", "sidebarClose", "menuToggle",
        "globalSearch", "themeToggle", "themeIcon",
        "headerProfileButton", "profileDropdown",
        "logoutButton", "profileLogoutButton", "confirmLogoutButton",
        "refreshButton", "createEventButton",
        "totalEventsCount", "upcomingEventsCount", "ongoingEventsCount", "completedEventsCount",
        "resultCount", "eventSearch", "clearSearchButton",
        "statusFilter", "eventTypeFilter", "resetFiltersButton",
        "eventsLoading", "eventsErrorState", "eventsErrorMessage", "retryButton",
        "eventsEmptyState", "eventsGrid",
        "paginationContainer", "paginationStart", "paginationEnd", "paginationTotal",
        "paginationPages", "previousPageButton", "nextPageButton",
        "eventFormModal", "eventForm", "eventFormModalTitle", "eventId",
        "eventTitle", "eventType", "eventStatus", "eventDescription",
        "eventStartDate", "eventStartTime", "eventEndDate", "eventEndTime",
        "eventMode", "eventCapacity", "eventVenue", "eventMeetingLink",
        "registrationDeadline", "eventVisibility", "eventRsvpEnabled", "eventImage",
        "saveEventButton", "saveEventButtonText",
        "eventDetailsModal", "detailsEventTitle", "detailsEventStatus",
        "detailsEventDescription", "detailsEventType", "detailsEventDate",
        "detailsEventTime", "detailsEventMode", "detailsEventVenue",
        "detailsEventCapacity", "detailsRsvpCount", "editEventFromDetailsButton",
        "deleteEventModal", "deleteEventName", "confirmDeleteEventButton",
        "logoutModal", "pageLoader", "toastContainer", "currentYear",
        "sidebarUserName", "headerUserName", "sidebarInitials", "headerInitials",
        "sidebarProfileImage", "headerProfileImage", "viewAttendeesButton",
        "eventAttendeesModal",
        "attendeesEventTitle",
        "attendeesCount",
        "attendeesLoading",
        "attendeesError",
        "attendeesErrorMessage",
        "attendeesEmpty",
        "attendeesList",
    ].forEach(id => {
        el[id] = document.getElementById(id);
    });
}

function bindEvents() {
    
    el.menuToggle?.addEventListener("click", openSidebar);
    el.sidebarClose?.addEventListener("click", closeSidebar);
    el.sidebarOverlay?.addEventListener("click", closeSidebar);

    el.themeToggle?.addEventListener("click", toggleTheme);

    el.headerProfileButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        el.profileDropdown?.classList.toggle("show");
    });

    el.viewAttendeesButton?.addEventListener("click", () => {

        if (!state.selectedEvent) {
            return;
        }

        loadEventAttendees(
            state.selectedEvent
        );

    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".header-profile-wrapper")) {
            el.profileDropdown?.classList.remove("show");
        }
    });

    el.refreshButton?.addEventListener("click", () => loadEvents(true));
    el.retryButton?.addEventListener("click", () => loadEvents(true));

    el.createEventButton?.addEventListener("click", openCreateEventModal);

    el.eventSearch?.addEventListener("input", () => {
        if (el.clearSearchButton) {
            el.clearSearchButton.hidden = !el.eventSearch.value.trim();
        }
        state.currentPage = 1;
        applyFilters();
    });

    el.globalSearch?.addEventListener("input", () => {
        if (el.eventSearch) el.eventSearch.value = el.globalSearch.value;
        if (el.clearSearchButton) {
            el.clearSearchButton.hidden = !el.globalSearch.value.trim();
        }
        state.currentPage = 1;
        applyFilters();
    });

    el.clearSearchButton?.addEventListener("click", () => {
        if (el.eventSearch) el.eventSearch.value = "";
        if (el.globalSearch) el.globalSearch.value = "";
        el.clearSearchButton.hidden = true;
        state.currentPage = 1;
        applyFilters();
        el.eventSearch?.focus();
    });

    [el.statusFilter, el.eventTypeFilter].forEach(select => {
        select?.addEventListener("change", () => {
            state.currentPage = 1;
            applyFilters();
        });
    });

    el.resetFiltersButton?.addEventListener("click", resetFilters);

    el.previousPageButton?.addEventListener("click", () => changePage(state.currentPage - 1));
    el.nextPageButton?.addEventListener("click", () => changePage(state.currentPage + 1));

    el.eventsGrid?.addEventListener("click", handleEventAction);

    el.eventForm?.addEventListener("submit", handleEventSubmit);

    el.editEventFromDetailsButton?.addEventListener("click", () => {
        if (!state.selectedEvent) return;
        closeModal("eventDetailsModal");
        openEditEventModal(state.selectedEvent);
    });

    el.confirmDeleteEventButton?.addEventListener("click", deleteSelectedEvent);

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", () => closeModal(button.dataset.closeModal));
    });

    [el.logoutButton, el.profileLogoutButton].forEach(button => {
        button?.addEventListener("click", () => openModal("logoutModal"));
    });

    el.confirmLogoutButton?.addEventListener("click", performLogout);

    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            (el.globalSearch || el.eventSearch)?.focus();
        }

        if (event.key === "Escape") {
            closeSidebar();
            document.querySelectorAll(".modal.show").forEach(modal => closeModal(modal.id));
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) closeSidebar();
    });
}

async function loadEvents(showToastMessage = false) {
    showLoadingState();

    const token = localStorage.getItem("token");

    if (!token) {
        showErrorState("Your login session was not found. Please sign in again.");
        return;
    }

    try {
        const response = await fetch(EVENTS_ENDPOINT, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Your account is not authorized to manage events.");
        }

        if (!response.ok) {
            let message = `Unable to retrieve events (${response.status}).`;

            try {
                const body = await response.json();
                message = body.message || body.error || message;
            } catch (_) {}

            throw new Error(message);
        }

        const payload = await response.json();
        const rawEvents = extractEventArray(payload);

        state.events = rawEvents.map(normalizeEvent);
        state.currentPage = 1;

        updateSummaryCards();
        applyFilters();

        if (showToastMessage) {
            showToast("Events updated", "Latest event records loaded successfully.", "success");
        }

    } catch (error) {
        console.error("LOAD EVENTS ERROR:", error);
        showErrorState(error.message || "Unable to load events.");
    }
}

function extractEventArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.events)) return payload.events;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.records)) return payload.records;
    return [];
}

function normalizeEvent(event) {
    return {
        id: event.event_id ?? event.eventId ?? event.id,
        title: event.title ?? event.event_title ?? "Untitled Event",
        type: String(event.event_type ?? event.type ?? "other").toLowerCase(),
        status: String(event.status ?? "upcoming").toLowerCase(),
        description: event.description ?? "",
        startDate: event.start_date ?? event.startDate ?? null,
        startTime: event.start_time ?? event.startTime ?? null,
        endDate: event.end_date ?? event.endDate ?? null,
        endTime: event.end_time ?? event.endTime ?? null,
        mode: String(event.event_mode ?? event.mode ?? "onsite").toLowerCase(),
        capacity: event.capacity ?? event.participant_capacity ?? null,
        venue: event.venue ?? event.location ?? "",
        meetingLink: event.meeting_link ?? event.meetingLink ?? "",
        registrationDeadline: event.registration_deadline ?? event.registrationDeadline ?? null,
        visibility: String(event.visibility ?? "published").toLowerCase(),
        rsvpEnabled: event.rsvp_enabled ?? event.rsvpEnabled ?? true,
        rsvpCount: Number(event.rsvp_count ?? event.rsvpCount ?? 0),
        image: event.event_image ?? event.image ?? event.cover_image ?? "",
        createdAt: event.created_at ?? event.createdAt ?? null,
        updatedAt: event.updated_at ?? event.updatedAt ?? null
    };
}

function applyFilters() {
    const search = (el.eventSearch?.value || "").trim().toLowerCase();
    const status = el.statusFilter?.value || "all";
    const type = el.eventTypeFilter?.value || "all";

    state.filteredEvents = state.events.filter(event => {
        const searchable = [
            event.title,
            event.description,
            event.venue,
            event.type,
            event.status
        ].join(" ").toLowerCase();

        const matchesSearch = !search || searchable.includes(search);
        const matchesStatus = status === "all" || event.status === status;
        const matchesType = type === "all" || event.type === type;

        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.max(1, Math.ceil(state.filteredEvents.length / state.pageSize));
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    renderEvents();
}

function renderEvents() {
    hideAllStates();

    const total = state.filteredEvents.length;

    if (el.resultCount) el.resultCount.textContent = total;

    if (!total) {
        if (el.eventsEmptyState) el.eventsEmptyState.hidden = false;
        if (el.paginationContainer) el.paginationContainer.hidden = true;
        return;
    }

    const start = (state.currentPage - 1) * state.pageSize;
    const end = Math.min(start + state.pageSize, total);
    const pageEvents = state.filteredEvents.slice(start, end);

    if (el.eventsGrid) {
        el.eventsGrid.hidden = false;
        el.eventsGrid.innerHTML = pageEvents.map(createEventCard).join("");
    }

    renderPagination(start, end, total);
}

function createEventCard(event) {
    const imageHtml = event.image
        ? `<img src="${escapeAttribute(resolveImageUrl(event.image))}" alt="${escapeAttribute(event.title)}">`
        : `<i class="bx bxs-calendar-event"></i>`;

    return `
        <article class="event-card">
            <div class="event-card-cover">
                ${imageHtml}
                <span class="event-status ${escapeAttribute(event.status)}">
                    ${escapeHtml(capitalize(event.status))}
                </span>
            </div>

            <div class="event-card-body">
                <span class="event-card-type">
                    ${escapeHtml(formatEventType(event.type))}
                </span>

                <h3 class="event-card-title">
                    ${escapeHtml(event.title)}
                </h3>

                <p class="event-card-description">
                    ${escapeHtml(event.description || "No description provided.")}
                </p>

                <div class="event-meta">
                    <span>
                        <i class="bx bx-calendar"></i>
                        ${escapeHtml(formatEventDate(event))}
                    </span>

                    <span>
                        <i class="bx bx-time"></i>
                        ${escapeHtml(formatEventTime(event))}
                    </span>

                    <span>
                        <i class="bx bx-map"></i>
                        ${escapeHtml(event.venue || formatMode(event.mode))}
                    </span>
                </div>
            </div>

            <div class="event-card-footer">
                <span class="event-rsvp">
                    ${event.rsvpEnabled ? `${event.rsvpCount} RSVP` : "RSVP Disabled"}
                </span>

                <div class="event-actions">
                    <button
                        class="event-action-button"
                        type="button"
                        title="View details"
                        data-action="view"
                        data-id="${escapeAttribute(String(event.id))}"
                    >
                        <i class="bx bx-show"></i>
                    </button>

                    <button
                        class="event-action-button"
                        type="button"
                        title="Edit event"
                        data-action="edit"
                        data-id="${escapeAttribute(String(event.id))}"
                    >
                        <i class="bx bx-edit"></i>
                    </button>

                    <button
                        class="event-action-button danger"
                        type="button"
                        title="Delete event"
                        data-action="delete"
                        data-id="${escapeAttribute(String(event.id))}"
                    >
                        <i class="bx bx-trash"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function handleEventAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const selected = state.events.find(item => String(item.id) === String(button.dataset.id));
    if (!selected) return;

    const action = button.dataset.action;

    if (action === "view") {
        state.selectedEvent = selected;
        populateDetailsModal(selected);
        openModal("eventDetailsModal");
        return;
    }

    if (action === "edit") {
        openEditEventModal(selected);
        return;
    }

    if (action === "delete") {
        state.deleteTarget = selected;
        if (el.deleteEventName) el.deleteEventName.textContent = selected.title;
        openModal("deleteEventModal");
    }
}

function openCreateEventModal() {

    state.selectedEvent = null;

    resetEventForm();

    if (el.eventId) {
        el.eventId.value = "";
    }

    if (el.eventFormModalTitle) {
        el.eventFormModalTitle.textContent =
            "Create New Event";
    }

    if (el.saveEventButtonText) {
        el.saveEventButtonText.textContent =
            "Create Event";
    }

    openModal("eventFormModal");
}


function openEditEventModal(event) {
    state.selectedEvent = event;
    resetEventForm();

    if (el.eventFormModalTitle) el.eventFormModalTitle.textContent = "Edit Event";
    if (el.saveEventButtonText) el.saveEventButtonText.textContent = "Save Changes";

    setValue(el.eventId, event.id);
    setValue(el.eventTitle, event.title);
    setValue(el.eventType, event.type);
    setValue(el.eventStatus, event.status);
    setValue(el.eventDescription, event.description);
    setValue(el.eventStartDate, normalizeDateInput(event.startDate));
    setValue(el.eventStartTime, normalizeTimeInput(event.startTime));
    setValue(el.eventEndDate, normalizeDateInput(event.endDate));
    setValue(el.eventEndTime, normalizeTimeInput(event.endTime));
    setValue(el.eventMode, event.mode);
    setValue(el.eventCapacity, event.capacity ?? "");
    setValue(el.eventVenue, event.venue);
    setValue(el.eventMeetingLink, event.meetingLink);
    setValue(el.registrationDeadline, normalizeDateTimeLocal(event.registrationDeadline));
    setValue(el.eventVisibility, event.visibility);

    if (el.eventRsvpEnabled) {
        el.eventRsvpEnabled.checked = Boolean(event.rsvpEnabled);
    }

    openModal("eventFormModal");
}

function resetEventForm() {
    el.eventForm?.reset();
    if (el.eventId) el.eventId.value = "";
    if (el.eventStatus) el.eventStatus.value = "upcoming";
    if (el.eventVisibility) el.eventVisibility.value = "published";
    if (el.eventRsvpEnabled) el.eventRsvpEnabled.checked = true;
}

async function handleEventSubmit(event) {
    event.preventDefault();

    const payload = collectEventPayload();

    const validation = validateEventPayload(payload);

    if (!validation.valid) {
        showToast("Check event details", validation.message, "error");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        showToast("Session expired", "Please sign in again.", "error");
        return;
    }

    const isEditing = Boolean(el.eventId?.value);
    const url = isEditing
        ? `${EVENTS_ENDPOINT}/${encodeURIComponent(el.eventId.value)}`
        : EVENTS_ENDPOINT;

    try {
        setSaveButtonLoading(true);

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const body = await safeJson(response);

        if (!response.ok) {
            throw new Error(body?.message || body?.error || "Unable to save event.");
        }

        closeModal("eventFormModal");

        showToast(
            isEditing ? "Event updated" : "Event created",
            isEditing
                ? "The event information was updated successfully."
                : "The new event was created successfully.",
            "success"
        );

        await loadEvents();

    } catch (error) {
        console.error("SAVE EVENT ERROR:", error);
        showToast("Unable to save event", error.message, "error");
    } finally {
        setSaveButtonLoading(false);
    }
}

function collectEventPayload() {
    return {
        title: el.eventTitle?.value.trim() || "",
        event_type: el.eventType?.value || "",
        status: el.eventStatus?.value || "upcoming",
        description: el.eventDescription?.value.trim() || "",
        start_date: el.eventStartDate?.value || null,
        start_time: el.eventStartTime?.value || null,
        end_date: el.eventEndDate?.value || null,
        end_time: el.eventEndTime?.value || null,
        event_mode: el.eventMode?.value || "",
        capacity: el.eventCapacity?.value ? Number(el.eventCapacity.value) : null,
        venue: el.eventVenue?.value.trim() || null,
        meeting_link: el.eventMeetingLink?.value.trim() || null,
        registration_deadline: el.registrationDeadline?.value || null,
        visibility: el.eventVisibility?.value || "published",
        rsvp_enabled: Boolean(el.eventRsvpEnabled?.checked)
    };
}

function validateEventPayload(payload) {
    if (!payload.title) {
        return { valid: false, message: "Event title is required." };
    }

    if (!payload.event_type) {
        return { valid: false, message: "Please select an event type." };
    }

    if (!payload.description) {
        return { valid: false, message: "Event description is required." };
    }

    if (!payload.start_date || !payload.start_time) {
        return { valid: false, message: "Start date and start time are required." };
    }

    if (!payload.event_mode) {
        return { valid: false, message: "Please select an event mode." };
    }

    if (payload.end_date && payload.end_date < payload.start_date) {
        return { valid: false, message: "End date cannot be before start date." };
    }

    if (
        payload.start_date &&
        payload.end_date &&
        payload.start_date === payload.end_date &&
        payload.start_time &&
        payload.end_time &&
        payload.end_time < payload.start_time
    ) {
        return { valid: false, message: "End time cannot be before start time." };
    }

    return { valid: true };
}

async function deleteSelectedEvent() {
    if (!state.deleteTarget) return;

    const token = localStorage.getItem("token");

    if (!token) {
        showToast("Session expired", "Please sign in again.", "error");
        return;
    }

    try {
        if (el.confirmDeleteEventButton) {
            el.confirmDeleteEventButton.disabled = true;
            el.confirmDeleteEventButton.textContent = "Deleting...";
        }

        const response = await fetch(
            `${EVENTS_ENDPOINT}/${encodeURIComponent(state.deleteTarget.id)}`,
            {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const body = await safeJson(response);

        if (!response.ok) {
            throw new Error(body?.message || body?.error || "Unable to delete event.");
        }

        closeModal("deleteEventModal");

        showToast(
            "Event deleted",
            `"${state.deleteTarget.title}" was removed successfully.`,
            "success"
        );

        state.deleteTarget = null;

        await loadEvents();

    } catch (error) {
        console.error("DELETE EVENT ERROR:", error);
        showToast("Unable to delete event", error.message, "error");
    } finally {
        if (el.confirmDeleteEventButton) {
            el.confirmDeleteEventButton.disabled = false;
            el.confirmDeleteEventButton.textContent = "Delete Event";
        }
    }
}

function populateDetailsModal(event) {
    setText(el.detailsEventTitle, event.title);
    setText(el.detailsEventDescription, event.description || "No description provided.");
    setText(el.detailsEventType, formatEventType(event.type));
    setText(el.detailsEventDate, formatEventDate(event));
    setText(el.detailsEventTime, formatEventTime(event));
    setText(el.detailsEventMode, formatMode(event.mode));
    setText(el.detailsEventVenue, event.venue || "—");
    setText(el.detailsEventCapacity, event.capacity ? String(event.capacity) : "Unlimited");
    setText(el.detailsRsvpCount, event.rsvpEnabled ? String(event.rsvpCount) : "Disabled");

    if (el.detailsEventStatus) {
        el.detailsEventStatus.textContent = capitalize(event.status);
        el.detailsEventStatus.className = "";
        el.detailsEventStatus.classList.add("event-status", event.status);
    }
}

function updateSummaryCards() {
    const counts = state.events.reduce((acc, event) => {
        acc.total += 1;
        if (event.status === "upcoming") acc.upcoming += 1;
        if (event.status === "ongoing") acc.ongoing += 1;
        if (event.status === "completed") acc.completed += 1;
        return acc;
    }, {
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0
    });

    setText(el.totalEventsCount, counts.total);
    setText(el.upcomingEventsCount, counts.upcoming);
    setText(el.ongoingEventsCount, counts.ongoing);
    setText(el.completedEventsCount, counts.completed);
}

function renderPagination(startIndex, endIndex, total) {
    const totalPages = Math.ceil(total / state.pageSize);

    if (el.paginationContainer) {
        el.paginationContainer.hidden = total === 0;
    }

    setText(el.paginationStart, total ? startIndex + 1 : 0);
    setText(el.paginationEnd, endIndex);
    setText(el.paginationTotal, total);

    if (el.previousPageButton) {
        el.previousPageButton.disabled = state.currentPage <= 1;
    }

    if (el.nextPageButton) {
        el.nextPageButton.disabled = state.currentPage >= totalPages;
    }

    if (!el.paginationPages) return;

    el.paginationPages.innerHTML = "";

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `pagination-page ${page === state.currentPage ? "active" : ""}`;
        button.textContent = page;
        button.addEventListener("click", () => changePage(page));
        el.paginationPages.appendChild(button);
    }
}

function changePage(page) {
    const totalPages = Math.max(1, Math.ceil(state.filteredEvents.length / state.pageSize));

    if (page < 1 || page > totalPages || page === state.currentPage) return;

    state.currentPage = page;
    renderEvents();
    el.eventsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetFilters() {
    if (el.eventSearch) el.eventSearch.value = "";
    if (el.globalSearch) el.globalSearch.value = "";
    if (el.clearSearchButton) el.clearSearchButton.hidden = true;
    if (el.statusFilter) el.statusFilter.value = "all";
    if (el.eventTypeFilter) el.eventTypeFilter.value = "all";

    state.currentPage = 1;
    applyFilters();
}

function showLoadingState() {
    hideAllStates();

    if (el.eventsLoading) el.eventsLoading.hidden = false;
    if (el.resultCount) el.resultCount.textContent = "0";
}

function showErrorState(message) {
    hideAllStates();

    if (el.eventsErrorState) el.eventsErrorState.hidden = false;
    if (el.eventsErrorMessage) el.eventsErrorMessage.textContent = message;
    if (el.paginationContainer) el.paginationContainer.hidden = true;
}

function hideAllStates() {
    if (el.eventsLoading) el.eventsLoading.hidden = true;
    if (el.eventsErrorState) el.eventsErrorState.hidden = true;
    if (el.eventsEmptyState) el.eventsEmptyState.hidden = true;
    if (el.eventsGrid) el.eventsGrid.hidden = true;
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

// ==========================================
// LOAD EVENT ATTENDEES
// OFFICE / ADMIN
// ==========================================

async function loadEventAttendees(event) {

    const token = localStorage.getItem("token");

    if (!token) {
        showToast(
            "Session expired",
            "Please sign in again.",
            "error"
        );
        return;
    }

    state.selectedEvent = event;

    setText(
        el.attendeesEventTitle,
        `${event.title} - Attendees`
    );

    if (el.attendeesCount) {
        el.attendeesCount.textContent = "0";
    }

    if (el.attendeesList) {
        el.attendeesList.innerHTML = "";
    }

    if (el.attendeesLoading) {
        el.attendeesLoading.hidden = false;
    }

    if (el.attendeesEmpty) {
        el.attendeesEmpty.hidden = true;
    }

    if (el.attendeesError) {
        el.attendeesError.hidden = true;
    }

    openModal("eventAttendeesModal");

    try {

        const response = await fetch(
            `${EVENTS_ENDPOINT}/${encodeURIComponent(event.id)}/attendees`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const body = await safeJson(response);

        if (!response.ok) {
            throw new Error(
                body?.message ||
                body?.error ||
                "Unable to load event attendees."
            );
        }

        const attendees =
            Array.isArray(body?.attendees)
                ? body.attendees
                : [];

        if (el.attendeesLoading) {
            el.attendeesLoading.hidden = true;
        }

        if (el.attendeesCount) {
            el.attendeesCount.textContent = attendees.length;
        }

        event.rsvpCount = attendees.length;

        if (el.detailsRsvpCount) {
            el.detailsRsvpCount.textContent = attendees.length;
        }

        if (attendees.length === 0) {
            if (el.attendeesEmpty) {
                el.attendeesEmpty.hidden = false;
            }
            return;
        }

        if (el.attendeesList) {
            el.attendeesList.innerHTML =
                attendees
                    .map(createAttendeeItem)
                    .join("");
        }

    } catch (error) {

        console.error(
            "LOAD EVENT ATTENDEES ERROR:",
            error
        );

        if (el.attendeesLoading) {
            el.attendeesLoading.hidden = true;
        }

        if (el.attendeesError) {
            el.attendeesError.hidden = false;
        }

        setText(
            el.attendeesErrorMessage,
            error.message ||
            "Unable to load attendees."
        );
    }
}


// ==========================================
// CREATE ATTENDEE ITEM
// ==========================================

function createAttendeeItem(attendee) {

    const fullName = [
        attendee.first_name,
        attendee.middle_name,
        attendee.last_name
    ]
        .filter(Boolean)
        .join(" ");

    const initials = getInitials(fullName);

    const studentNumber =
        attendee.student_number ||
        "No student number";

    const program =
        attendee.program ||
        "Program not specified";

    const batch =
        attendee.batch_year
            ? `Batch ${attendee.batch_year}`
            : "Batch not specified";

    return `
        <article class="attendee-item">

            <div class="attendee-avatar">
                ${escapeHtml(initials)}
            </div>

            <div class="attendee-information">

                <div class="attendee-name">
                    ${escapeHtml(
                        fullName ||
                        "Alumni User"
                    )}
                </div>

                <div class="attendee-email">
                    ${escapeHtml(
                        attendee.email ||
                        "No email"
                    )}
                </div>

                <div class="attendee-details">

                    <span class="attendee-detail">
                        ${escapeHtml(studentNumber)}
                    </span>

                    <span class="attendee-detail">
                        ${escapeHtml(program)}
                    </span>

                    <span class="attendee-detail">
                        ${escapeHtml(batch)}
                    </span>

                </div>

            </div>

            <div class="attendee-rsvp-date">

                RSVP Date

                <strong>
                    ${escapeHtml(
                        formatRsvpDate(
                            attendee.created_at
                        )
                    )}
                </strong>

            </div>

        </article>
    `;
}


// ==========================================
// FORMAT RSVP DATE
// ==========================================

function formatRsvpDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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


// ==========================================
// THEME
// ==========================================

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("savedTheme") ||
        localStorage.getItem("theme");

    const dark = savedTheme === "dark";

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
        !(document.body.classList.contains("dark") ||
          document.body.classList.contains("dark-mode"));

    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark-mode", isDark);

    localStorage.setItem("savedTheme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeIcon();
}

function updateThemeIcon() {
    if (!el.themeIcon) return;

    const isDark =
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");

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
        [user.first_name || user.firstName, user.last_name || user.lastName]
            .filter(Boolean)
            .join(" ") ||
        "Alumni Office Staff";

    const initials = getInitials(fullName);

    setText(el.sidebarUserName, fullName);
    setText(el.headerUserName, fullName);
    setText(el.sidebarInitials, initials);
    setText(el.headerInitials, initials);

    const photo = user.profile_picture || user.profilePicture;

    if (photo) {
        [el.sidebarProfileImage, el.headerProfileImage].forEach(img => {
            if (!img) return;
            img.src = resolveImageUrl(photo);
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

    if (!document.querySelector(".modal.show")) {
        document.body.style.overflow = "";
    }
}

function performLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    window.location.href = "../pages/login.html";
}

function setSaveButtonLoading(loading) {
    if (!el.saveEventButton) return;

    el.saveEventButton.disabled = loading;

    if (el.saveEventButtonText) {
        el.saveEventButtonText.textContent = loading
            ? "Saving..."
            : (el.eventId?.value ? "Save Changes" : "Create Event");
    }
}

function showToast(title, message, type = "info") {
    if (!el.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="bx ${
            type === "success"
                ? "bx-check-circle"
                : type === "error"
                ? "bx-error-circle"
                : "bx-info-circle"
        }"></i>

        <div>
            <strong>${escapeHtml(title)}</strong>
            <span style="display:block;margin-top:3px;color:var(--muted);font-size:10px;">
                ${escapeHtml(message)}
            </span>
        </div>
    `;

    el.toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";

        window.setTimeout(() => toast.remove(), 220);
    }, 3200);
}

function formatEventType(type) {
    const map = {
        reunion: "Reunion",
        seminar: "Seminar",
        webinar: "Webinar",
        career: "Career Event",
        networking: "Networking",
        community: "Community Activity",
        other: "Other"
    };

    return map[type] || capitalize(type);
}

function formatMode(mode) {
    const map = {
        onsite: "On-site",
        online: "Online",
        hybrid: "Hybrid"
    };

    return map[mode] || capitalize(mode);
}

function formatEventDate(event) {
    if (!event.startDate) return "—";

    const start = parseLocalDate(event.startDate);
    if (!start) return "—";

    const startText = new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(start);

    if (!event.endDate || event.endDate === event.startDate) {
        return startText;
    }

    const end = parseLocalDate(event.endDate);
    if (!end) return startText;

    const endText = new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(end);

    return `${startText} - ${endText}`;
}

function formatEventTime(event) {
    const start = formatTime(event.startTime);
    const end = formatTime(event.endTime);

    if (start === "—") return "—";
    if (end === "—") return start;

    return `${start} - ${end}`;
}

function formatTime(value) {
    if (!value) return "—";

    const match = String(value).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value);

    const hour = Number(match[1]);
    const minute = match[2];
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
}

function normalizeDateInput(value) {
    if (!value) return "";

    const text = String(value);
    const match = text.match(/^(\d{4}-\d{2}-\d{2})/);

    return match ? match[1] : "";
}

function normalizeTimeInput(value) {
    if (!value) return "";

    const text = String(value);
    const match = text.match(/^(\d{2}:\d{2})/);

    return match ? match[1] : "";
}

function normalizeDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 16);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
}

function parseLocalDate(value) {
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
    );
}

function capitalize(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "AO";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function resolveImageUrl(path) {
    if (!path) return "";

    if (/^(https?:|data:|blob:)/i.test(path)) {
        return path;
    }

    if (path.startsWith("/")) {
        return `http://localhost:5000${path}`;
    }

    return path;
}

function setCurrentYear() {
    setText(el.currentYear, new Date().getFullYear());
}

function setText(element, value) {
    if (element) {
        element.textContent = value ?? "—";
    }
}

function setValue(element, value) {
    if (element) {
        element.value = value ?? "";
    }
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

async function safeJson(response) {
    try {
        return await response.json();
    } catch (_) {
        return null;
    }
}