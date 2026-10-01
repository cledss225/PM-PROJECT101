"use strict";

/* =========================================================
   ALUMNIHUB - ALUMNI DASHBOARD
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";

const ENDPOINTS = {
    me: `${API_BASE_URL}/auth/me`,
    profile: `${API_BASE_URL}/alumni/profile`,
    events: `${API_BASE_URL}/events`,
    jobs: `${API_BASE_URL}/jobs`,
    announcements: `${API_BASE_URL}/announcements`,
    myRsvps: `${API_BASE_URL}/events/my-rsvps`
};

const state = {
    user: null,
    profile: null,
    events: [],
    jobs: [],
    announcements: [],
    rsvps: []
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    bindEvents();
    setCurrentDate();
    setCurrentYear();
    restoreSidebarPreference();
    loadDashboard();

    window.setTimeout(() => {
        el.pageLoader?.classList.add("hide");
    }, 300);
});


/* =========================================================
   CACHE ELEMENTS
========================================================= */

function cacheElements() {

    [
        "pageLoader",

        "sidebar",
        "sidebarOverlay",
        "sidebarClose",
        "menuToggle",

        "globalSearch",

        "themeToggle",
        "themeIcon",

        "notificationButton",
        "notificationDropdown",
        "notificationDot",
        "notificationList",

        "headerProfileButton",
        "profileDropdown",

        "sidebarProfileImage",
        "headerProfileImage",
        "sidebarInitials",
        "headerInitials",
        "sidebarUserName",
        "headerUserName",

        "welcomeFirstName",
        "currentDate",
        "currentYear",

        "profileCompletionCard",
        "profileCompletionPercent",
        "profileProgressBar",

        "upcomingEventsCount",
        "myRsvpCount",
        "availableJobsCount",
        "announcementCount",

        "eventsLoading",
        "upcomingEventsList",
        "eventsEmpty",

        "jobsLoading",
        "latestJobsList",
        "jobsEmpty",

        "announcementsLoading",
        "latestAnnouncementsList",
        "announcementsEmpty",

        "logoutButton",
        "profileLogoutButton",
        "confirmLogoutButton",
        "logoutModal",

        "toastContainer"

    ].forEach(id => {
        el[id] = document.getElementById(id);
    });

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    el.menuToggle?.addEventListener(
        "click",
        toggleSidebarMode
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


    el.notificationButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            el.notificationDropdown?.classList.toggle(
                "show"
            );

            el.profileDropdown?.classList.remove(
                "show"
            );

        }
    );


    el.headerProfileButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            el.profileDropdown?.classList.toggle(
                "show"
            );

            el.notificationDropdown?.classList.remove(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".header-profile-wrapper"
                )
            ) {

                el.profileDropdown?.classList.remove(
                    "show"
                );

            }


            if (
                !event.target.closest(
                    ".notification-wrapper"
                )
            ) {

                el.notificationDropdown?.classList.remove(
                    "show"
                );

            }

        }
    );


    el.globalSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                handleGlobalSearch();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                el.globalSearch?.focus();

            }


            if (
                event.key === "Escape"
            ) {

                closeSidebar();

                el.profileDropdown?.classList.remove(
                    "show"
                );

                el.notificationDropdown?.classList.remove(
                    "show"
                );


                document
                    .querySelectorAll(".modal.show")
                    .forEach(modal => {
                        closeModal(modal.id);
                    });

            }

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
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => closeModal(
                    button.dataset.closeModal
                )
            );

        });


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


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        showToast(
            "Session expired",
            "Please sign in again.",
            "error"
        );

        window.setTimeout(
            performLogout,
            900
        );

        return;

    }


    await loadAccount();


    await Promise.allSettled([
        loadOwnProfile(),
        loadEvents(),
        loadJobs(),
        loadAnnouncements(),
        loadMyRsvps()
    ]);


    updateSummaryCounts();

    buildNotifications();

}


/* =========================================================
   ACCOUNT
========================================================= */

async function loadAccount() {

    const token =
        getToken();


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                ENDPOINTS.me,
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


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                "Unable to load account."
            );

        }


        state.user =
            normalizeUser(
                body?.user ??
                body?.data ??
                body
            );


        renderUser();


        saveUserLocally(
            state.user
        );


    } catch (error) {

        console.error(
            "LOAD ALUMNI ACCOUNT ERROR:",
            error
        );


        loadUserFromLocalStorage();

    }

}


function normalizeUser(user) {

    return {

        userId:
            user?.user_id ??
            user?.id ??
            null,

        firstName:
            user?.first_name ??
            user?.firstName ??
            "",

        middleName:
            user?.middle_name ??
            user?.middleName ??
            "",

        lastName:
            user?.last_name ??
            user?.lastName ??
            "",

        email:
            user?.email ??
            "",

        roleId:
            user?.role_id ??
            user?.roleId ??
            null,

        isVerified:
            Boolean(
                user?.is_verified
            ),

        profilePicture:
            user?.profile_picture ??
            user?.profilePicture ??
            ""

    };

}


function renderUser() {

    if (!state.user) {
        return;
    }


    const fullName =
        getFullName(
            state.user
        );


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
        el.welcomeFirstName,
        state.user.firstName ||
        "Alumni"
    );


    setText(
        el.sidebarInitials,
        initials
    );


    setText(
        el.headerInitials,
        initials
    );


    setAvatar(
        el.sidebarProfileImage,
        el.sidebarInitials,
        state.user.profilePicture
    );


    setAvatar(
        el.headerProfileImage,
        el.headerInitials,
        state.user.profilePicture
    );

}


/* =========================================================
   OWN ALUMNI PROFILE
========================================================= */

async function loadOwnProfile() {

    const token =
        getToken();


    try {

        const response =
            await fetch(
                ENDPOINTS.profile,
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


        const body =
            await safeJson(response);


        if (!response.ok) {

            if (
                response.status === 404
            ) {

                state.profile =
                    null;

                renderProfileCompletion();

                return;

            }


            throw new Error(
                body?.message ||
                "Unable to load alumni profile."
            );

        }


        state.profile =
            body?.profile ??
            body?.alumni ??
            body?.data ??
            body;


        renderProfileCompletion();


    } catch (error) {

        console.error(
            "LOAD ALUMNI PROFILE ERROR:",
            error
        );


        state.profile =
            null;


        renderProfileCompletion();

    }

}


function renderProfileCompletion() {

    const percent =
        calculateProfileCompletion();


    setText(
        el.profileCompletionPercent,
        `${percent}%`
    );


    if (
        el.profileProgressBar
    ) {

        el.profileProgressBar.style.width =
            `${percent}%`;

    }


    if (
        el.profileCompletionCard
    ) {

        el.profileCompletionCard.dataset.completion =
            String(percent);

    }

}


function calculateProfileCompletion() {

    const user =
        state.user ||
        {};


    const profile =
        state.profile ||
        {};


    const values = [

        user.firstName,
        user.lastName,
        user.email,

        profile.student_number,
        profile.program,
        profile.batch_year,
        profile.birth_date,
        profile.gender,
        profile.phone_number,
        profile.address,
        profile.current_job,
        profile.company

    ];


    const completed =
        values.filter(value => {

            return (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            );

        }).length;


    return Math.round(
        (
            completed /
            values.length
        ) *
        100
    );

}


/* =========================================================
   EVENTS
========================================================= */

async function loadEvents() {

    showSectionLoading(
        "events",
        true
    );


    try {

        const response =
            await authenticatedFetch(
                ENDPOINTS.events
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                "Unable to load events."
            );

        }


        state.events =
            extractArray(
                body,
                [
                    "events",
                    "data",
                    "records"
                ]
            )
                .map(normalizeEvent)
                .filter(isVisibleEvent);


        renderUpcomingEvents();


    } catch (error) {

        console.error(
            "LOAD ALUMNI EVENTS ERROR:",
            error
        );


        state.events = [];


        renderUpcomingEvents();

    }

}


function normalizeEvent(event) {

    return {

        id:
            event.event_id ??
            event.id,

        title:
            event.title ??
            "Untitled Event",

        description:
            event.description ??
            "",

        status:
            String(
                event.status ??
                ""
            ).toLowerCase(),

        eventType:
            event.event_type ??
            event.type ??
            "",

        startDate:
            event.start_date ??
            event.event_date ??
            null,

        endDate:
            event.end_date ??
            null,

        venue:
            event.venue ??
            "",

        mode:
            event.event_mode ??
            event.mode ??
            ""

    };

}


function isVisibleEvent(event) {

    const status =
        event.status;


    if (
        status === "cancelled" ||
        status === "draft" ||
        status === "archived"
    ) {

        return false;

    }


    return true;

}


function getUpcomingEvents() {

    const now =
        new Date();


    return state.events
        .filter(event => {

            const date =
                parseDate(
                    event.startDate
                );


            if (!date) {

                return (
                    event.status === "upcoming" ||
                    event.status === "ongoing"
                );

            }


            return (
                date >=
                startOfToday(now)
            );

        })
        .sort(
            (a, b) => {

                const dateA =
                    parseDate(
                        a.startDate
                    )?.getTime() ??
                    Number.MAX_SAFE_INTEGER;


                const dateB =
                    parseDate(
                        b.startDate
                    )?.getTime() ??
                    Number.MAX_SAFE_INTEGER;


                return dateA - dateB;

            }
        );

}


function renderUpcomingEvents() {

    showSectionLoading(
        "events",
        false
    );


    const events =
        getUpcomingEvents();


    if (
        el.upcomingEventsCount
    ) {

        el.upcomingEventsCount.textContent =
            events.length;

    }


    if (!events.length) {

        if (
            el.upcomingEventsList
        ) {

            el.upcomingEventsList.hidden =
                true;

            el.upcomingEventsList.innerHTML =
                "";

        }


        if (
            el.eventsEmpty
        ) {

            el.eventsEmpty.hidden =
                false;

        }


        return;

    }


    if (
        el.eventsEmpty
    ) {

        el.eventsEmpty.hidden =
            true;

    }


    if (
        el.upcomingEventsList
    ) {

        el.upcomingEventsList.hidden =
            false;


        el.upcomingEventsList.innerHTML =
            events
                .slice(0, 4)
                .map(
                    event => `

                        <a
                            href="alumni-events.html"
                            class="dashboard-list-item"
                        >

                            <div class="list-item-icon">

                                <i class="bx bx-calendar-event"></i>

                            </div>


                            <div class="list-item-content">

                                <strong>
                                    ${escapeHtml(
                                        event.title
                                    )}
                                </strong>


                                <p>
                                    ${escapeHtml(
                                        event.description ||
                                        event.eventType ||
                                        "Alumni event"
                                    )}
                                </p>


                                <div class="list-item-meta">

                                    <span>

                                        <i class="bx bx-calendar"></i>

                                        ${escapeHtml(
                                            formatDate(
                                                event.startDate
                                            )
                                        )}

                                    </span>


                                    ${
                                        event.venue
                                            ? `

                                                <span>

                                                    <i class="bx bx-map"></i>

                                                    ${escapeHtml(
                                                        event.venue
                                                    )}

                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                        </a>

                    `
                )
                .join("");

    }

}


/* =========================================================
   JOBS
========================================================= */

async function loadJobs() {

    showSectionLoading(
        "jobs",
        true
    );


    try {

        const response =
            await authenticatedFetch(
                ENDPOINTS.jobs
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                "Unable to load jobs."
            );

        }


        state.jobs =
            extractArray(
                body,
                [
                    "jobs",
                    "data",
                    "records"
                ]
            )
                .map(normalizeJob)
                .filter(isAvailableJob);


        renderJobs();


    } catch (error) {

        console.error(
            "LOAD ALUMNI JOBS ERROR:",
            error
        );


        state.jobs = [];


        renderJobs();

    }

}


function normalizeJob(job) {

    return {

        id:
            job.job_id ??
            job.id,

        title:
            job.title ??
            job.job_title ??
            "Untitled Job",

        company:
            job.company ??
            job.company_name ??
            "",

        location:
            job.location ??
            "",

        employmentType:
            job.employment_type ??
            job.job_type ??
            "",

        status:
            String(
                job.status ??
                ""
            ).toLowerCase(),

        deadline:
            job.application_deadline ??
            job.deadline ??
            null,

        createdAt:
            job.created_at ??
            null

    };

}


function isAvailableJob(job) {

    if (
        job.status === "draft" ||
        job.status === "archived" ||
        job.status === "closed" ||
        job.status === "inactive"
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


function renderJobs() {

    showSectionLoading(
        "jobs",
        false
    );


    setText(
        el.availableJobsCount,
        state.jobs.length
    );


    if (
        !state.jobs.length
    ) {

        if (
            el.latestJobsList
        ) {

            el.latestJobsList.hidden =
                true;

            el.latestJobsList.innerHTML =
                "";

        }


        if (
            el.jobsEmpty
        ) {

            el.jobsEmpty.hidden =
                false;

        }


        return;

    }


    if (
        el.jobsEmpty
    ) {

        el.jobsEmpty.hidden =
            true;

    }


    if (
        el.latestJobsList
    ) {

        el.latestJobsList.hidden =
            false;


        const jobs =
            [...state.jobs]
                .sort(
                    (a, b) => {

                        return (
                            dateTimestamp(
                                b.createdAt
                            ) -
                            dateTimestamp(
                                a.createdAt
                            )
                        );

                    }
                )
                .slice(0, 4);


        el.latestJobsList.innerHTML =
            jobs
                .map(
                    job => `

                        <a
                            href="alumni-jobs.html"
                            class="dashboard-list-item"
                        >

                            <div class="list-item-icon">

                                <i class="bx bx-briefcase-alt-2"></i>

                            </div>


                            <div class="list-item-content">

                                <strong>
                                    ${escapeHtml(
                                        job.title
                                    )}
                                </strong>


                                <p>
                                    ${escapeHtml(
                                        job.company ||
                                        "Company not specified"
                                    )}
                                </p>


                                <div class="list-item-meta">

                                    ${
                                        job.location
                                            ? `

                                                <span>

                                                    <i class="bx bx-map"></i>

                                                    ${escapeHtml(
                                                        job.location
                                                    )}

                                                </span>

                                            `
                                            : ""
                                    }


                                    ${
                                        job.employmentType
                                            ? `

                                                <span>

                                                    <i class="bx bx-time"></i>

                                                    ${escapeHtml(
                                                        formatLabel(
                                                            job.employmentType
                                                        )
                                                    )}

                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                        </a>

                    `
                )
                .join("");

    }

}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

async function loadAnnouncements() {

    showSectionLoading(
        "announcements",
        true
    );


    try {

        const response =
            await authenticatedFetch(
                ENDPOINTS.announcements
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            throw new Error(
                body?.message ||
                "Unable to load announcements."
            );

        }


        state.announcements =
            extractArray(
                body,
                [
                    "announcements",
                    "data",
                    "records"
                ]
            )
                .map(normalizeAnnouncement)
                .filter(isVisibleAnnouncement);


        renderAnnouncements();


    } catch (error) {

        console.error(
            "LOAD ALUMNI ANNOUNCEMENTS ERROR:",
            error
        );


        state.announcements = [];


        renderAnnouncements();

    }

}


function normalizeAnnouncement(item) {

    return {

        id:
            item.announcement_id ??
            item.id,

        title:
            item.title ??
            "Untitled Announcement",

        content:
            item.content ??
            item.description ??
            "",

        category:
            item.category ??
            "general",

        priority:
            item.priority ??
            "normal",

        status:
            String(
                item.status ??
                ""
            ).toLowerCase(),

        targetAudience:
            String(
                item.target_audience ??
                item.targetAudience ??
                "all"
            ).toLowerCase(),

        publishDate:
            item.publish_date ??
            item.created_at ??
            null,

        expiryDate:
            item.expiry_date ??
            null

    };

}


function isVisibleAnnouncement(item) {

    if (
        item.status &&
        item.status !== "published" &&
        item.status !== "active"
    ) {

        return false;

    }


    const audience =
        item.targetAudience;


    const allowedAudience =
        [
            "all",
            "alumni",
            "graduates"
        ];


    if (
        audience &&
        !allowedAudience.includes(
            audience
        )
    ) {

        return false;

    }


    if (
        item.expiryDate
    ) {

        const expiry =
            parseDate(
                item.expiryDate
            );


        if (
            expiry &&
            expiry <
            startOfToday(
                new Date()
            )
        ) {

            return false;

        }

    }


    return true;

}


function renderAnnouncements() {

    showSectionLoading(
        "announcements",
        false
    );


    setText(
        el.announcementCount,
        state.announcements.length
    );


    if (
        !state.announcements.length
    ) {

        if (
            el.latestAnnouncementsList
        ) {

            el.latestAnnouncementsList.hidden =
                true;

            el.latestAnnouncementsList.innerHTML =
                "";

        }


        if (
            el.announcementsEmpty
        ) {

            el.announcementsEmpty.hidden =
                false;

        }


        return;

    }


    if (
        el.announcementsEmpty
    ) {

        el.announcementsEmpty.hidden =
            true;

    }


    if (
        el.latestAnnouncementsList
    ) {

        el.latestAnnouncementsList.hidden =
            false;


        const items =
            [...state.announcements]
                .sort(
                    (a, b) =>
                        dateTimestamp(
                            b.publishDate
                        ) -
                        dateTimestamp(
                            a.publishDate
                        )
                )
                .slice(0, 4);


        el.latestAnnouncementsList.innerHTML =
            items
                .map(
                    item => `

                        <a
                            href="alumni-announcements.html"
                            class="dashboard-list-item"
                        >

                            <div class="list-item-icon">

                                <i class="bx bx-megaphone"></i>

                            </div>


                            <div class="list-item-content">

                                <strong>
                                    ${escapeHtml(
                                        item.title
                                    )}
                                </strong>


                                <p>
                                    ${escapeHtml(
                                        truncateText(
                                            item.content,
                                            90
                                        )
                                    )}
                                </p>


                                <div class="list-item-meta">

                                    <span>

                                        <i class="bx bx-category"></i>

                                        ${escapeHtml(
                                            formatLabel(
                                                item.category
                                            )
                                        )}

                                    </span>


                                    <span>

                                        <i class="bx bx-calendar"></i>

                                        ${escapeHtml(
                                            formatDate(
                                                item.publishDate
                                            )
                                        )}

                                    </span>

                                </div>

                            </div>

                        </a>

                    `
                )
                .join("");

    }

}


/* =========================================================
   RSVP
========================================================= */

async function loadMyRsvps() {

    try {

        const response =
            await authenticatedFetch(
                ENDPOINTS.myRsvps
            );


        const body =
            await safeJson(response);


        if (!response.ok) {

            state.rsvps = [];

            setText(
                el.myRsvpCount,
                0
            );

            return;

        }


        state.rsvps =
            extractArray(
                body,
                [
                    "rsvps",
                    "events",
                    "data",
                    "records"
                ]
            );


        setText(
            el.myRsvpCount,
            state.rsvps.length
        );


    } catch (error) {

        console.error(
            "LOAD MY RSVP ERROR:",
            error
        );


        state.rsvps = [];


        setText(
            el.myRsvpCount,
            0
        );

    }

}


/* =========================================================
   COUNTS
========================================================= */

function updateSummaryCounts() {

    setText(
        el.upcomingEventsCount,
        getUpcomingEvents().length
    );


    setText(
        el.myRsvpCount,
        state.rsvps.length
    );


    setText(
        el.availableJobsCount,
        state.jobs.length
    );


    setText(
        el.announcementCount,
        state.announcements.length
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function buildNotifications() {

    const notifications = [];


    const nextEvent =
        getUpcomingEvents()[0];


    if (nextEvent) {

        notifications.push({

            icon:
                "bx-calendar-event",

            title:
                nextEvent.title,

            text:
                `Upcoming event on ${formatDate(
                    nextEvent.startDate
                )}`

        });

    }


    const latestJob =
        [...state.jobs]
            .sort(
                (a, b) =>
                    dateTimestamp(
                        b.createdAt
                    ) -
                    dateTimestamp(
                        a.createdAt
                    )
            )[0];


    if (latestJob) {

        notifications.push({

            icon:
                "bx-briefcase-alt-2",

            title:
                "New job opportunity",

            text:
                `${latestJob.title}${
                    latestJob.company
                        ? ` at ${latestJob.company}`
                        : ""
                }`

        });

    }


    const latestAnnouncement =
        [...state.announcements]
            .sort(
                (a, b) =>
                    dateTimestamp(
                        b.publishDate
                    ) -
                    dateTimestamp(
                        a.publishDate
                    )
            )[0];


    if (latestAnnouncement) {

        notifications.push({

            icon:
                "bx-megaphone",

            title:
                latestAnnouncement.title,

            text:
                truncateText(
                    latestAnnouncement.content,
                    70
                )

        });

    }


    renderNotifications(
        notifications
    );

}


function renderNotifications(
    notifications
) {

    if (!el.notificationList) {
        return;
    }


    if (
        !notifications.length
    ) {

        el.notificationList.innerHTML = `

            <div class="notification-empty">

                <i class="bx bx-bell-off"></i>

                <p>
                    No new notifications.
                </p>

            </div>

        `;


        if (
            el.notificationDot
        ) {

            el.notificationDot.hidden =
                true;

        }


        return;

    }


    if (
        el.notificationDot
    ) {

        el.notificationDot.hidden =
            false;

    }


    el.notificationList.innerHTML =
        notifications
            .map(
                item => `

                    <div
                        style="
                            padding:12px 10px;
                            display:flex;
                            gap:10px;
                            border-bottom:1px solid var(--border);
                        "
                    >

                        <div
                            style="
                                width:36px;
                                height:36px;
                                flex:0 0 36px;
                                display:grid;
                                place-items:center;
                                border-radius:10px;
                                color:var(--primary);
                                background:var(--primary-soft);
                                font-size:17px;
                            "
                        >

                            <i class="bx ${escapeHtml(
                                item.icon
                            )}"></i>

                        </div>


                        <div style="min-width:0;">

                            <strong
                                style="
                                    display:block;
                                    font-size:10px;
                                "
                            >
                                ${escapeHtml(
                                    item.title
                                )}
                            </strong>


                            <span
                                style="
                                    display:block;
                                    margin-top:3px;
                                    color:var(--muted);
                                    font-size:8.5px;
                                    line-height:1.45;
                                "
                            >
                                ${escapeHtml(
                                    item.text
                                )}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   SEARCH
========================================================= */

function handleGlobalSearch() {

    const query =
        el.globalSearch?.value
            .trim() ||
        "";


    if (!query) {
        return;
    }


    const normalized =
        query.toLowerCase();


    const eventMatch =
        state.events.some(
            item =>
                `${item.title} ${item.description}`
                    .toLowerCase()
                    .includes(normalized)
        );


    if (eventMatch) {

        window.location.href =
            `alumni-events.html?q=${encodeURIComponent(
                query
            )}`;

        return;

    }


    const jobMatch =
        state.jobs.some(
            item =>
                `${item.title} ${item.company} ${item.location}`
                    .toLowerCase()
                    .includes(normalized)
        );


    if (jobMatch) {

        window.location.href =
            `alumni-jobs.html?q=${encodeURIComponent(
                query
            )}`;

        return;

    }


    const announcementMatch =
        state.announcements.some(
            item =>
                `${item.title} ${item.content}`
                    .toLowerCase()
                    .includes(normalized)
        );


    if (announcementMatch) {

        window.location.href =
            `alumni-announcements.html?q=${encodeURIComponent(
                query
            )}`;

        return;

    }


    showToast(
        "No results",
        `No dashboard result found for "${query}".`,
        "info"
    );

}


/* =========================================================
   LOADING STATE
========================================================= */

function showSectionLoading(
    section,
    loading
) {

    const map = {

        events: {
            loading:
                el.eventsLoading,

            list:
                el.upcomingEventsList,

            empty:
                el.eventsEmpty
        },

        jobs: {
            loading:
                el.jobsLoading,

            list:
                el.latestJobsList,

            empty:
                el.jobsEmpty
        },

        announcements: {
            loading:
                el.announcementsLoading,

            list:
                el.latestAnnouncementsList,

            empty:
                el.announcementsEmpty
        }

    };


    const refs =
        map[section];


    if (!refs) {
        return;
    }


    if (
        refs.loading
    ) {

        refs.loading.hidden =
            !loading;

    }


    if (loading) {

        if (
            refs.list
        ) {

            refs.list.hidden =
                true;

        }


        if (
            refs.empty
        ) {

            refs.empty.hidden =
                true;

        }

    }

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
        "light";


    const dark =
        savedTheme === "dark";


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

    const dark =
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
        dark
    );


    document.body.classList.toggle(
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


    updateThemeIcon();

}


function updateThemeIcon() {

    if (!el.themeIcon) {
        return;
    }


    const dark =
        document.body.classList.contains(
            "dark"
        ) ||
        document.body.classList.contains(
            "dark-mode"
        );


    el.themeIcon.className =
        dark
            ? "bx bx-sun"
            : "bx bx-moon";

}


/* =========================================================
   SIDEBAR
========================================================= */


function toggleSidebarMode() {

    if (window.innerWidth <= 960) {
        if (el.sidebar?.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
        return;
    }

    document.body.classList.toggle("sidebar-mini");

    const collapsed = document.body.classList.contains("sidebar-mini");
    localStorage.setItem("alumniSidebarMini", collapsed ? "1" : "0");

    if (el.menuToggle) {
        el.menuToggle.setAttribute(
            "aria-label",
            collapsed ? "Expand sidebar" : "Collapse sidebar"
        );
        el.menuToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }
}

function restoreSidebarPreference() {
    const collapsed = localStorage.getItem("alumniSidebarMini") === "1";

    if (window.innerWidth > 960 && collapsed) {
        document.body.classList.add("sidebar-mini");
    }

    if (el.menuToggle) {
        el.menuToggle.setAttribute(
            "aria-label",
            document.body.classList.contains("sidebar-mini") ? "Expand sidebar" : "Collapse sidebar"
        );
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


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);


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
        document.getElementById(id);


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


/* =========================================================
   LOGOUT
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

    if (!el.currentDate) {
        return;
    }


    el.currentDate.textContent =
        new Intl.DateTimeFormat(
            "en-PH",
            {
                weekday:
                    "short",

                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        ).format(
            new Date()
        );

}


function setCurrentYear() {

    setText(
        el.currentYear,
        new Date().getFullYear()
    );

}


function formatDate(value) {

    if (!value) {
        return "Date TBA";
    }


    const date =
        parseDate(value);


    if (!date) {
        return "Date TBA";
    }


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        }
    ).format(date);

}


function parseDate(value) {

    if (!value) {
        return null;
    }


    const match =
        String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

    }


    const date =
        new Date(value);


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}


function startOfToday(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


function dateTimestamp(value) {

    const date =
        parseDate(value);


    return date
        ? date.getTime()
        : 0;

}


/* =========================================================
   HELPERS
========================================================= */

function getToken() {

    return localStorage.getItem(
        "token"
    );

}


async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        "Accept":
            "application/json",

        ...(options.headers || {}),

        "Authorization":
            `Bearer ${token}`

    };


    return fetch(
        url,
        {
            ...options,
            headers
        }
    );

}


function extractArray(
    payload,
    keys
) {

    if (
        Array.isArray(payload)
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


function getFullName(user) {

    return [

        user.firstName,
        user.middleName,
        user.lastName

    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
        "Alumni User";

}


function getInitials(name) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        !parts.length
    ) {

        return "AL";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function setAvatar(
    image,
    initials,
    source
) {

    if (
        !image ||
        !initials
    ) {

        return;

    }


    if (!source) {

        image.style.display =
            "none";

        initials.style.display =
            "flex";

        return;

    }


    image.src =
        resolveImageUrl(source);


    image.style.display =
        "block";


    initials.style.display =
        "none";


    image.onerror =
        () => {

            image.style.display =
                "none";

            initials.style.display =
                "flex";

        };

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


function formatLabel(value) {

    if (!value) {
        return "—";
    }


    return String(value)
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


function truncateText(
    value,
    maxLength
) {

    const text =
        String(
            value ||
            ""
        )
            .replace(/\s+/g, " ")
            .trim();


    if (
        text.length <=
        maxLength
    ) {

        return text;

    }


    return (
        text.slice(
            0,
            maxLength - 1
        ) +
        "…"
    );

}


function setText(
    element,
    value
) {

    if (element) {

        element.textContent =
            value ?? "—";

    }

}


function saveUserLocally(user) {

    let existing = {};


    try {

        existing =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "{}"
            ) ||
            {};

    } catch (_) {}


    localStorage.setItem(
        "user",
        JSON.stringify({
            ...existing,

            user_id:
                user.userId,

            first_name:
                user.firstName,

            middle_name:
                user.middleName,

            last_name:
                user.lastName,

            email:
                user.email,

            role_id:
                user.roleId,

            is_verified:
                user.isVerified,

            profile_picture:
                user.profilePicture
        })
    );

}


function loadUserFromLocalStorage() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "null"
            );


        if (!saved) {
            return;
        }


        state.user =
            normalizeUser(saved);


        renderUser();


    } catch (_) {}

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
                ${escapeHtml(title)}
            </strong>


            <span>
                ${escapeHtml(message)}
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


function escapeHtml(value) {

    return String(
        value ?? ""
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


async function safeJson(response) {

    try {

        return await response.json();

    } catch (_) {

        return null;

    }

}

/* =========================================================
   COLLEGE ART DASHBOARD ENHANCEMENTS
   Purely presentational; existing API/data logic above remains intact.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeZineDashboard();
});

function initializeZineDashboard() {
    const revealSections = document.querySelectorAll(".reveal-section");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealSections.forEach(section => observer.observe(section));
    } else {
        revealSections.forEach(section => section.classList.add("is-visible"));
    }

    document.querySelectorAll("[data-scroll-to]").forEach(button => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.scrollTo);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}