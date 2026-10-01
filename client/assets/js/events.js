const token = localStorage.getItem("token");


if (!token) {

    window.location.href = "login.html";

}


/* =========================================================
   SAMPLE EVENT DATA

   Temporary data muna ito.
   Papalitan natin ito ng PostgreSQL API sa next part.
========================================================= */

let events = [

    {
        id: 1,
        title: "Annual Alumni Homecoming 2026",
        category: "Networking",
        status: "Upcoming",
        date: "2026-08-15",
        time: "17:00",
        venue: "University Gymnasium",
        organizer: "Alumni Affairs Office",
        capacity: 350,
        attendees: 218,
        description:
            "A special gathering for graduates to reconnect, celebrate achievements, and strengthen the AlumniHub community."
    },

    {
        id: 2,
        title: "Career Development Seminar",
        category: "Career",
        status: "Upcoming",
        date: "2026-09-05",
        time: "09:00",
        venue: "Main Auditorium",
        organizer: "Career Services Department",
        capacity: 200,
        attendees: 126,
        description:
            "A career-focused seminar featuring industry experts, professional development sessions, and employment opportunities."
    },

    {
        id: 3,
        title: "Graduation Recognition Ceremony",
        category: "Academic",
        status: "Completed",
        date: "2026-06-20",
        time: "13:00",
        venue: "University Covered Court",
        organizer: "Office of Student Affairs",
        capacity: 500,
        attendees: 476,
        description:
            "A recognition ceremony celebrating the accomplishments of the university's graduating students and outstanding alumni."
    },

    {
        id: 4,
        title: "Community Outreach Program",
        category: "Community",
        status: "Upcoming",
        date: "2026-10-12",
        time: "07:30",
        venue: "Barangay Community Center",
        organizer: "Alumni Volunteer Group",
        capacity: 150,
        attendees: 72,
        description:
            "A volunteer outreach activity that brings alumni together to support local families and community development projects."
    }

];


let eventToDeleteId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const eventsContainer =
    document.getElementById("eventsContainer");

const eventEmptyState =
    document.getElementById("eventEmptyState");

const eventResultText =
    document.getElementById("eventResultText");

const eventSearch =
    document.getElementById("eventSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const statusFilter =
    document.getElementById("statusFilter");

const resetEventFilters =
    document.getElementById("resetEventFilters");

const eventFormModal =
    document.getElementById("eventFormModal");

const viewEventModal =
    document.getElementById("viewEventModal");

const deleteEventModal =
    document.getElementById("deleteEventModal");

const eventForm =
    document.getElementById("eventForm");

const eventModalTitle =
    document.getElementById("eventModalTitle");

const eventSubmitText =
    document.getElementById("eventSubmitText");


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function formatEventDate(dateValue) {

    if (!dateValue) {

        return "No date";

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


function formatEventTime(timeValue) {

    if (!timeValue) {

        return "No time";

    }


    const [hour, minute] =
        timeValue.split(":");


    const date =
        new Date();


    date.setHours(
        Number(hour),
        Number(minute),
        0,
        0
    );


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    ).format(date);

}


function getStatusClass(status) {

    if (status === "Completed") {

        return "event-status-completed";

    }


    if (status === "Cancelled") {

        return "event-status-cancelled";

    }


    return "event-status-upcoming";

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
   UPDATE STATISTICS
========================================================= */

function updateEventStatistics() {

    const totalEvents =
        events.length;


    const upcomingEvents =
        events.filter(
            event => event.status === "Upcoming"
        ).length;


    const completedEvents =
        events.filter(
            event => event.status === "Completed"
        ).length;


    const totalAttendees =
        events.reduce(
            (total, event) =>
                total + Number(event.attendees || 0),
            0
        );


    document
        .getElementById("totalEvents")
        .textContent =
        totalEvents;


    document
        .getElementById("upcomingEvents")
        .textContent =
        upcomingEvents;


    document
        .getElementById("completedEvents")
        .textContent =
        completedEvents;


    document
        .getElementById("totalAttendees")
        .textContent =
        totalAttendees.toLocaleString("en-PH");

}


/* =========================================================
   RENDER EVENTS
========================================================= */

function renderEvents(eventList = events) {

    eventsContainer.innerHTML = "";


    if (eventList.length === 0) {

        eventsContainer.classList.add("hidden");

        eventEmptyState.classList.remove("hidden");

        eventResultText.textContent =
            "No matching events were found.";

        return;

    }


    eventsContainer.classList.remove("hidden");

    eventEmptyState.classList.add("hidden");


    eventResultText.textContent =
        `Showing ${eventList.length} ${
            eventList.length === 1
                ? "event"
                : "events"
        }.`;


    eventList.forEach(event => {

        const eventCard =
            document.createElement("article");


        eventCard.className =
            "event-card";


        eventCard.innerHTML = `

            <div class="event-card-accent"></div>

            <div class="event-card-body">

                <div class="event-card-top">

                    <div>

                        <div class="event-category-label">

                            <i class="bx bx-category"></i>

                            ${escapeHTML(event.category)}

                        </div>

                        <h3 class="event-card-title">

                            ${escapeHTML(event.title)}

                        </h3>

                    </div>

                    <span
                        class="
                            event-status
                            ${getStatusClass(event.status)}
                        "
                    >

                        ${escapeHTML(event.status)}

                    </span>

                </div>


                <p class="event-card-description">

                    ${escapeHTML(event.description)}

                </p>


                <div class="event-detail-grid">

                    <div class="event-detail-item">

                        <div class="event-detail-icon">

                            <i class="bx bx-calendar"></i>

                        </div>

                        <div class="event-detail-text">

                            <span>Date</span>

                            <strong>
                                ${formatEventDate(event.date)}
                            </strong>

                        </div>

                    </div>


                    <div class="event-detail-item">

                        <div class="event-detail-icon">

                            <i class="bx bx-time-five"></i>

                        </div>

                        <div class="event-detail-text">

                            <span>Time</span>

                            <strong>
                                ${formatEventTime(event.time)}
                            </strong>

                        </div>

                    </div>


                    <div class="event-detail-item">

                        <div class="event-detail-icon">

                            <i class="bx bx-map"></i>

                        </div>

                        <div class="event-detail-text">

                            <span>Venue</span>

                            <strong>
                                ${escapeHTML(event.venue)}
                            </strong>

                        </div>

                    </div>


                    <div class="event-detail-item">

                        <div class="event-detail-icon">

                            <i class="bx bx-user"></i>

                        </div>

                        <div class="event-detail-text">

                            <span>Organizer</span>

                            <strong>
                                ${escapeHTML(event.organizer)}
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="event-card-footer">

                    <div class="event-participant-count">

                        <i class="bx bx-group"></i>

                        <span>

                            ${Number(event.attendees || 0)}
                            /
                            ${Number(event.capacity || 0)}
                            participants

                        </span>

                    </div>


                    <div class="event-card-actions">

                        <button
                            class="
                                event-action-button
                                event-view-button
                            "
                            data-action="view"
                            data-id="${event.id}"
                            type="button"
                            title="View event"
                        >
                            <i class="bx bx-show"></i>
                        </button>


                        <button
                            class="
                                event-action-button
                                event-edit-button
                            "
                            data-action="edit"
                            data-id="${event.id}"
                            type="button"
                            title="Edit event"
                        >
                            <i class="bx bx-edit"></i>
                        </button>


                        <button
                            class="
                                event-action-button
                                event-delete-button
                            "
                            data-action="delete"
                            data-id="${event.id}"
                            type="button"
                            title="Delete event"
                        >
                            <i class="bx bx-trash"></i>
                        </button>

                    </div>

                </div>

            </div>

        `;


        eventsContainer.appendChild(eventCard);

    });

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function filterEvents() {

    const searchValue =
        eventSearch.value
            .trim()
            .toLowerCase();


    const categoryValue =
        categoryFilter.value;


    const statusValue =
        statusFilter.value;


    const filteredEvents =
        events.filter(event => {

            const searchableText = `
                ${event.title}
                ${event.venue}
                ${event.organizer}
                ${event.description}
            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(searchValue);


            const matchesCategory =
                categoryValue === "all" ||
                event.category === categoryValue;


            const matchesStatus =
                statusValue === "all" ||
                event.status === statusValue;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    renderEvents(filteredEvents);

}


/* =========================================================
   MODAL FUNCTIONS
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
   CREATE EVENT
========================================================= */

function openCreateEventModal() {

    eventForm.reset();


    document
        .getElementById("eventId")
        .value =
        "";


    document
        .getElementById("eventStatus")
        .value =
        "Upcoming";


    eventModalTitle.textContent =
        "Create New Event";


    eventSubmitText.textContent =
        "Save Event";


    openModal(eventFormModal);

}


/* =========================================================
   EDIT EVENT
========================================================= */

function openEditEventModal(eventId) {

    const selectedEvent =
        events.find(
            event => event.id === eventId
        );


    if (!selectedEvent) {

        return;

    }


    document
        .getElementById("eventId")
        .value =
        selectedEvent.id;


    document
        .getElementById("eventTitle")
        .value =
        selectedEvent.title;


    document
        .getElementById("eventCategory")
        .value =
        selectedEvent.category;


    document
        .getElementById("eventStatus")
        .value =
        selectedEvent.status;


    document
        .getElementById("eventDate")
        .value =
        selectedEvent.date;


    document
        .getElementById("eventTime")
        .value =
        selectedEvent.time;


    document
        .getElementById("eventVenue")
        .value =
        selectedEvent.venue;


    document
        .getElementById("eventOrganizer")
        .value =
        selectedEvent.organizer;


    document
        .getElementById("eventCapacity")
        .value =
        selectedEvent.capacity;


    document
        .getElementById("eventDescription")
        .value =
        selectedEvent.description;


    eventModalTitle.textContent =
        "Edit Event";


    eventSubmitText.textContent =
        "Update Event";


    openModal(eventFormModal);

}


/* =========================================================
   VIEW EVENT
========================================================= */

function openViewEventModal(eventId) {

    const selectedEvent =
        events.find(
            event => event.id === eventId
        );


    if (!selectedEvent) {

        return;

    }


    document
        .getElementById("viewEventTitle")
        .textContent =
        selectedEvent.title;


    document
        .getElementById("viewEventContent")
        .innerHTML = `

            <div class="event-view-banner">

                <span>
                    ${escapeHTML(selectedEvent.category)}
                </span>

                <h3>
                    ${escapeHTML(selectedEvent.title)}
                </h3>

                <p>
                    ${escapeHTML(selectedEvent.description)}
                </p>

            </div>


            <div class="event-view-detail-grid">

                <div class="event-view-detail">

                    <i class="bx bx-calendar"></i>

                    <div>

                        <span>Date</span>

                        <strong>
                            ${formatEventDate(selectedEvent.date)}
                        </strong>

                    </div>

                </div>


                <div class="event-view-detail">

                    <i class="bx bx-time-five"></i>

                    <div>

                        <span>Time</span>

                        <strong>
                            ${formatEventTime(selectedEvent.time)}
                        </strong>

                    </div>

                </div>


                <div class="event-view-detail">

                    <i class="bx bx-map"></i>

                    <div>

                        <span>Venue</span>

                        <strong>
                            ${escapeHTML(selectedEvent.venue)}
                        </strong>

                    </div>

                </div>


                <div class="event-view-detail">

                    <i class="bx bx-user"></i>

                    <div>

                        <span>Organizer</span>

                        <strong>
                            ${escapeHTML(selectedEvent.organizer)}
                        </strong>

                    </div>

                </div>


                <div class="event-view-detail">

                    <i class="bx bx-group"></i>

                    <div>

                        <span>Participants</span>

                        <strong>

                            ${selectedEvent.attendees}
                            /
                            ${selectedEvent.capacity}

                        </strong>

                    </div>

                </div>


                <div class="event-view-detail">

                    <i class="bx bx-check-circle"></i>

                    <div>

                        <span>Status</span>

                        <strong>
                            ${escapeHTML(selectedEvent.status)}
                        </strong>

                    </div>

                </div>

            </div>

        `;


    openModal(viewEventModal);

}


/* =========================================================
   DELETE EVENT
========================================================= */

function openDeleteEventModal(eventId) {

    eventToDeleteId =
        eventId;


    openModal(deleteEventModal);

}


function deleteSelectedEvent() {

    if (eventToDeleteId === null) {

        return;

    }


    events =
        events.filter(
            event =>
                event.id !== eventToDeleteId
        );


    eventToDeleteId =
        null;


    closeModal(deleteEventModal);


    updateEventStatistics();

    filterEvents();


    showEventToast(
        "Event deleted successfully."
    );

}


/* =========================================================
   SAVE CREATE / UPDATE
========================================================= */

eventForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const eventIdValue =
            document
                .getElementById("eventId")
                .value;


        const existingEvent =
            events.find(
                item =>
                    item.id ===
                    Number(eventIdValue)
            );


        const eventData = {

            id:
                eventIdValue
                    ? Number(eventIdValue)
                    : Date.now(),

            title:
                document
                    .getElementById("eventTitle")
                    .value
                    .trim(),

            category:
                document
                    .getElementById("eventCategory")
                    .value,

            status:
                document
                    .getElementById("eventStatus")
                    .value,

            date:
                document
                    .getElementById("eventDate")
                    .value,

            time:
                document
                    .getElementById("eventTime")
                    .value,

            venue:
                document
                    .getElementById("eventVenue")
                    .value
                    .trim(),

            organizer:
                document
                    .getElementById("eventOrganizer")
                    .value
                    .trim(),

            capacity:
                Number(
                    document
                        .getElementById("eventCapacity")
                        .value
                ),

            attendees:
                existingEvent
                    ? existingEvent.attendees
                    : 0,

            description:
                document
                    .getElementById("eventDescription")
                    .value
                    .trim()

        };


        if (eventIdValue) {

            events =
                events.map(
                    item =>
                        item.id === eventData.id
                            ? eventData
                            : item
                );


            showEventToast(
                "Event updated successfully."
            );

        } else {

            events.unshift(eventData);


            showEventToast(
                "New event created successfully."
            );

        }


        closeModal(eventFormModal);


        updateEventStatistics();

        filterEvents();

    }
);


/* =========================================================
   EVENT CARD ACTIONS
========================================================= */

eventsContainer.addEventListener(
    "click",
    function (event) {

        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (!actionButton) {

            return;

        }


        const eventId =
            Number(
                actionButton.dataset.id
            );


        const action =
            actionButton.dataset.action;


        if (action === "view") {

            openViewEventModal(eventId);

        }


        if (action === "edit") {

            openEditEventModal(eventId);

        }


        if (action === "delete") {

            openDeleteEventModal(eventId);

        }

    }
);


/* =========================================================
   FILTER LISTENERS
========================================================= */

eventSearch.addEventListener(
    "input",
    filterEvents
);


categoryFilter.addEventListener(
    "change",
    filterEvents
);


statusFilter.addEventListener(
    "change",
    filterEvents
);


resetEventFilters.addEventListener(
    "click",
    function () {

        eventSearch.value =
            "";


        categoryFilter.value =
            "all";


        statusFilter.value =
            "all";


        renderEvents(events);

    }
);


/* =========================================================
   BUTTON LISTENERS
========================================================= */

document
    .getElementById("openCreateEventModal")
    .addEventListener(
        "click",
        openCreateEventModal
    );


document
    .getElementById("confirmDeleteEvent")
    .addEventListener(
        "click",
        deleteSelectedEvent
    );


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const modalId =
                    button.dataset.closeModal;


                const modal =
                    document.getElementById(
                        modalId
                    );


                if (modal) {

                    closeModal(modal);

                }

            }
        );

    });


document
    .querySelectorAll(
        ".event-modal-backdrop"
    )
    .forEach(backdrop => {

        backdrop.addEventListener(
            "click",
            function () {

                const modal =
                    backdrop.closest(
                        ".event-modal"
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
                ".event-modal.show"
            )
            .forEach(closeModal);

    }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showEventToast(message) {

    const toast =
        document.getElementById(
            "eventToast"
        );


    const toastMessage =
        document.getElementById(
            "eventToastMessage"
        );


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
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


            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "login.html";

        }
    );


/* =========================================================
   INITIAL LOAD
========================================================= */

loadCurrentUser();

updateEventStatistics();

renderEvents(events);