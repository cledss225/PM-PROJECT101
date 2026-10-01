const API_BASE = "/api";

const state = {
    user: null,
    profile: null,
    profileExists: false
};


/* =========================================================
   ELEMENTS
========================================================= */

const elements = {
    profileLoading: document.getElementById("profileLoading"),
    profileError: document.getElementById("profileError"),
    profileErrorMessage: document.getElementById("profileErrorMessage"),
    profileContent: document.getElementById("profileContent"),

    editProfileBtn: document.getElementById("editProfileBtn"),
    retryProfileBtn: document.getElementById("retryProfileBtn"),

    editProfileModal: document.getElementById("editProfileModal"),
    editModalBackdrop: document.getElementById("editModalBackdrop"),
    closeEditModalBtn: document.getElementById("closeEditModalBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),

    profileForm: document.getElementById("profileForm"),
    saveProfileBtn: document.getElementById("saveProfileBtn"),

    logoutBtn: document.getElementById("logoutBtn"),

    themeToggle: document.getElementById("themeToggle"),

    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    sidebar: document.getElementById("sidebar"),

    globalSearch: document.getElementById("globalSearch"),

    toastContainer: document.getElementById("toastContainer"),

    changeAvatarBtn: document.getElementById("changeAvatarBtn"),
    avatarFileInput: document.getElementById("avatarFileInput")
};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", initializeProfilePage);


async function initializeProfilePage() {

    initializeTheme();

    bindEvents();

    const token = getToken();

    if (!token) {
        redirectToLogin();
        return;
    }

    await loadProfilePage();
}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    elements.editProfileBtn?.addEventListener(
        "click",
        openEditModal
    );

    elements.closeEditModalBtn?.addEventListener(
        "click",
        closeEditModal
    );

    elements.cancelEditBtn?.addEventListener(
        "click",
        closeEditModal
    );

    elements.editModalBackdrop?.addEventListener(
        "click",
        closeEditModal
    );

    elements.retryProfileBtn?.addEventListener(
        "click",
        loadProfilePage
    );

    elements.profileForm?.addEventListener(
        "submit",
        saveProfile
    );

    elements.changeAvatarBtn?.addEventListener(
        "click",
        () => elements.avatarFileInput?.click()
    );

    elements.avatarFileInput?.addEventListener(
        "change",
        uploadProfilePicture
    );

    elements.logoutBtn?.addEventListener(
        "click",
        logout
    );

    elements.themeToggle?.addEventListener(
        "click",
        toggleTheme
    );

    elements.mobileMenuBtn?.addEventListener(
        "click",
        toggleSidebar
    );


    document.addEventListener(
        "keydown",
        handleKeyboardShortcuts
    );


    document.addEventListener(
        "click",
        handleOutsideSidebarClick
    );

}


/* =========================================================
   LOAD COMPLETE PROFILE PAGE
========================================================= */

async function loadProfilePage() {

    showLoadingState();

    try {

        const userResponse = await apiRequest(
            "/auth/me",
            {
                method: "GET"
            }
        );


        state.user =
            userResponse.user ||
            userResponse.data ||
            userResponse;


        if (
            state.user?.role_id !== undefined &&
            Number(state.user.role_id) !== 2
        ) {

            throw new Error(
                "This page is only available to alumni accounts."
            );

        }


        try {

            const profileResponse = await apiRequest(
                "/alumni/profile",
                {
                    method: "GET"
                }
            );


            state.profile =
                profileResponse.profile ||
                profileResponse.alumni ||
                profileResponse.data ||
                profileResponse;


            state.profileExists =
                Boolean(
                    state.profile &&
                    (
                        state.profile.profile_id ||
                        state.profile.user_id ||
                        state.profile.student_number ||
                        state.profile.program
                    )
                );


        } catch (profileError) {

            console.warn(
                "Profile GET response:",
                profileError
            );


            if (
                profileError.status === 404 ||
                profileError.status === 400
            ) {

                state.profile = {};
                state.profileExists = false;

            } else {

                throw profileError;

            }

        }


        renderProfile();

        showContentState();


    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );


        if (
            error.status === 401 ||
            error.status === 403
        ) {

            clearSession();

            redirectToLogin();

            return;

        }


        showErrorState(
            error.message ||
            "Unable to retrieve your profile."
        );

    }

}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile() {

    const user = state.user || {};
    const profile = state.profile || {};


    const firstName =
        normalizeValue(
            user.first_name ||
            profile.first_name
        );


    const middleName =
        normalizeValue(
            user.middle_name ||
            profile.middle_name
        );


    const lastName =
        normalizeValue(
            user.last_name ||
            profile.last_name
        );


    const email =
        normalizeValue(
            user.email ||
            profile.email
        );


    const fullName =
        buildFullName(
            firstName,
            middleName,
            lastName
        );


    const initials =
        getInitials(
            firstName,
            lastName
        );


    setText("sidebarUserName", fullName);
    setText("topbarUserName", fullName);

    renderAvatar("sidebarAvatar", user.profile_picture, initials);
    renderAvatar("topbarAvatar", user.profile_picture, initials);
    renderAvatar("profileAvatar", user.profile_picture, initials, true);

    setText("profileFullName", fullName);
    setText("profileEmail", displayValue(email));
    setText("profileStudentNumber", displayValue(profile.student_number));


    const programBatch =
        buildProgramBatch(
            profile.program,
            profile.batch_year
        );


    setText("profileProgramBatch", programBatch);

    setText("viewFirstName", displayValue(firstName));
    setText("viewMiddleName", displayValue(middleName));
    setText("viewLastName", displayValue(lastName));
    setText("viewBirthDate", formatDate(profile.birth_date));
    setText("viewGender", displayValue(profile.gender));
    setText("viewEmail", displayValue(email));

    setText("viewPhoneNumber", displayValue(profile.phone_number));
    setText("viewAddress", displayValue(profile.address));

    setText("viewStudentNumber", displayValue(profile.student_number));
    setText("viewProgram", displayValue(profile.program));
    setText("viewBatchYear", displayValue(profile.batch_year));

    setText("viewCurrentJob", displayValue(profile.current_job));
    setText("viewCompany", displayValue(profile.company));

    renderLinkedIn(profile.linkedin_url);

    const verified = isUserVerified(user);
    const active = isUserActive(user);

    setText(
        "viewVerificationStatus",
        verified ? "Verified" : "Pending Verification"
    );

    setText(
        "viewAccountStatus",
        active ? "Active" : "Inactive"
    );

    renderVerificationBadge(verified);
    renderProfileCompletion();
}


/* =========================================================
   PROFILE COMPLETION
========================================================= */

function renderProfileCompletion() {

    const user = state.user || {};
    const profile = state.profile || {};

    const fields = [
        user.first_name,
        user.last_name,
        user.email,
        profile.student_number,
        profile.program,
        profile.batch_year,
        profile.birth_date,
        profile.gender,
        profile.phone_number,
        profile.address,
        profile.current_job,
        profile.company,
        profile.linkedin_url
    ];

    const completedFields =
        fields.filter(value => hasValue(value)).length;

    const percentage =
        Math.round((completedFields / fields.length) * 100);

    setText("completionPercent", `${percentage}%`);

    const bar = document.getElementById("completionBar");
    if (bar) bar.style.width = `${percentage}%`;

    let message;

    if (percentage === 100) {
        message = "Your AlumniHub profile is complete.";
    } else if (percentage >= 75) {
        message = "Almost there! Add the remaining information to complete your profile.";
    } else if (percentage >= 50) {
        message = "Your profile is taking shape. Add more details to improve it.";
    } else {
        message = "Complete your profile to get the most out of AlumniHub.";
    }

    setText("completionMessage", message);
}


/* =========================================================
   VERIFICATION BADGE
========================================================= */

function renderVerificationBadge(verified) {

    const badge = document.getElementById("verificationBadge");
    if (!badge) return;

    if (verified) {
        badge.innerHTML = `
            <i class="bx bxs-badge-check"></i>
            Verified Alumni
        `;
        badge.classList.remove("pending");
    } else {
        badge.innerHTML = `
            <i class="bx bx-time-five"></i>
            Pending Verification
        `;
        badge.classList.add("pending");
    }

    const sidebarVerified = document.querySelector(".verified-text");

    if (sidebarVerified) {
        sidebarVerified.innerHTML = verified
            ? `<i class="bx bxs-badge-check"></i> Verified Alumni`
            : `<i class="bx bx-time-five"></i> Pending Verification`;
    }
}


/* =========================================================
   LINKEDIN
========================================================= */

function renderLinkedIn(url) {

    const link = document.getElementById("viewLinkedIn");
    if (!link) return;

    if (!hasValue(url)) {
        link.textContent = "—";
        link.removeAttribute("href");
        return;
    }

    const safeUrl = normalizeExternalUrl(url);
    link.textContent = url;
    link.href = safeUrl;
}


/* =========================================================
   OPEN / CLOSE EDIT MODAL
========================================================= */

function openEditModal() {
    populateProfileForm();
    elements.editProfileModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeEditModal() {
    elements.editProfileModal?.classList.add("hidden");
    document.body.style.overflow = "";
}


/* =========================================================
   POPULATE EDIT FORM
========================================================= */

function populateProfileForm() {

    const user = state.user || {};
    const profile = state.profile || {};

    setInputValue("firstName", user.first_name || profile.first_name);
    setInputValue("middleName", user.middle_name || profile.middle_name);
    setInputValue("lastName", user.last_name || profile.last_name);
    setInputValue("profileEmailInput", user.email || profile.email);
    setInputValue("birthDate", formatDateForInput(profile.birth_date));
    setInputValue("gender", profile.gender);
    setInputValue("phoneNumber", profile.phone_number);
    setInputValue("address", profile.address);
    setInputValue("studentNumber", profile.student_number);
    setInputValue("program", profile.program);
    setInputValue("batchYear", profile.batch_year);
    setInputValue("currentJob", profile.current_job);
    setInputValue("company", profile.company);
    setInputValue("linkedinUrl", profile.linkedin_url);
}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile(event) {

    event.preventDefault();

    if (!elements.profileForm) return;

    const saveButton = elements.saveProfileBtn;
    const originalContent = saveButton?.innerHTML;

    const payload = {
        first_name: getInputValue("firstName"),
        middle_name: getInputValue("middleName"),
        last_name: getInputValue("lastName"),
        birth_date: nullableValue(getInputValue("birthDate")),
        gender: nullableValue(getInputValue("gender")),
        phone_number: nullableValue(getInputValue("phoneNumber")),
        address: nullableValue(getInputValue("address")),
        student_number: nullableValue(getInputValue("studentNumber")),
        program: nullableValue(getInputValue("program")),
        batch_year: nullableNumber(getInputValue("batchYear")),
        current_job: nullableValue(getInputValue("currentJob")),
        company: nullableValue(getInputValue("company")),
        linkedin_url: nullableValue(getInputValue("linkedinUrl"))
    };

    if (!payload.first_name || !payload.last_name) {
        showToast("First name and last name are required.", "error");
        return;
    }

    try {
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <span class="loader-small"></span>
                Saving...
            `;
        }

        const method = state.profileExists ? "PUT" : "POST";

        const response = await apiRequest(
            "/alumni/profile",
            {
                method,
                body: JSON.stringify(payload)
            }
        );

        console.log("SAVE PROFILE RESPONSE:", response);

        closeEditModal();
        showToast("Your profile has been updated successfully.", "success");
        await loadProfilePage();

    } catch (error) {
        console.error("SAVE PROFILE ERROR:", error);
        showToast(error.message || "Unable to save your profile.", "error");
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = originalContent || `
                <i class="bx bx-save"></i>
                <span>Save Changes</span>
            `;
        }
    }
}


/* =========================================================
   PROFILE PICTURE
========================================================= */

function renderAvatar(
    elementId,
    picture,
    initials,
    keepChangeButton = false
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) return;


    let changeButton = null;
    let fileInput = null;


    if (keepChangeButton) {

        changeButton =
            document.getElementById(
                "changeAvatarBtn"
            );

        fileInput =
            document.getElementById(
                "avatarFileInput"
            );

    }


    Array
        .from(element.childNodes)
        .forEach(node => {

            if (
                node !== changeButton &&
                node !== fileInput
            ) {

                element.removeChild(node);

            }

        });


    if (hasValue(picture)) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            String(picture);

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

                image.remove();

                const text =
                    document.createElement(
                        "span"
                    );

                text.textContent =
                    initials;

                element.insertBefore(
                    text,
                    changeButton || null
                );

            },
            {
                once: true
            }
        );


        element.insertBefore(
            image,
            changeButton || null
        );

    } else {

        const text =
            document.createElement(
                "span"
            );

        text.textContent =
            initials;

        element.insertBefore(
            text,
            changeButton || null
        );

    }

}


async function uploadProfilePicture(
    event
) {

    const input =
        event.target;

    const file =
        input.files?.[0];


    if (!file) return;


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showToast(
            "Please select a JPG, PNG, or WEBP image.",
            "error"
        );

        input.value = "";

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        showToast(
            "Profile picture must be 5 MB or smaller.",
            "error"
        );

        input.value = "";

        return;

    }


    const button =
        elements.changeAvatarBtn;

    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled = true;

            button.innerHTML =
                `<i class="bx bx-loader-alt bx-spin"></i>`;

        }


        const formData =
            new FormData();


        formData.append(
            "profile_picture",
            file
        );


        const response =
            await uploadApiRequest(
                "/auth/profile-picture",
                formData
            );


        const updatedUser =
            response.user || {};


        state.user = {
            ...(state.user || {}),
            ...updatedUser,
            profile_picture:
                response.profile_picture ||
                updatedUser.profile_picture ||
                state.user?.profile_picture
        };


        syncStoredUser(
            state.user
        );


        renderProfile();


        showToast(
            "Profile picture updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "PROFILE PICTURE UPLOAD ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to update profile picture.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalContent ||
                `<i class="bx bxs-camera"></i>`;

        }


        input.value = "";

    }

}


async function uploadApiRequest(
    endpoint,
    formData
) {

    const token =
        getToken();


    const response =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                method: "PUT",

                headers: {
                    Accept:
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    formData
            }
        );


    const rawText =
        await response.text();


    let data = {};


    if (rawText) {

        try {

            data =
                JSON.parse(
                    rawText
                );

        } catch {

            data = {
                message:
                    rawText
            };

        }

    }


    if (!response.ok) {

        const error =
            new Error(
                data.message ||
                `Request failed with status ${response.status}.`
            );


        error.status =
            response.status;


        throw error;

    }


    return data;

}


function syncStoredUser(
    user
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) || "{}"
            );


        localStorage.setItem(
            "user",
            JSON.stringify({
                ...existing,
                ...user
            })
        );

    } catch {

        localStorage.setItem(
            "user",
            JSON.stringify(
                user || {}
            )
        );

    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    const headers = {
        Accept: "application/json",
        ...(options.headers || {})
    };

    if (options.body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
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

    if (!response.ok) {
        const error = new Error(
            data.message || `Request failed with status ${response.status}.`
        );
        error.status = response.status;
        error.data = data;
        throw error;
    }

    if (data.success === false) {
        const error = new Error(data.message || "The request was unsuccessful.");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}


/* =========================================================
   PAGE STATES
========================================================= */

function showLoadingState() {
    elements.profileLoading?.classList.remove("hidden");
    elements.profileError?.classList.add("hidden");
    elements.profileContent?.classList.add("hidden");
}

function showContentState() {
    elements.profileLoading?.classList.add("hidden");
    elements.profileError?.classList.add("hidden");
    elements.profileContent?.classList.remove("hidden");
}

function showErrorState(message) {
    elements.profileLoading?.classList.add("hidden");
    elements.profileContent?.classList.add("hidden");
    elements.profileError?.classList.remove("hidden");

    if (elements.profileErrorMessage) {
        elements.profileErrorMessage.textContent = message;
    }
}


/* =========================================================
   THEME
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("savedTheme") ||
        localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.remove("dark", "dark-mode");
    } else {
        document.body.classList.add("dark", "dark-mode");
    }

    updateThemeIcon();
}

function toggleTheme() {

    const currentlyDark =
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");

    if (currentlyDark) {
        document.body.classList.remove("dark", "dark-mode");
        localStorage.setItem("savedTheme", "light");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark", "dark-mode");
        localStorage.setItem("savedTheme", "dark");
        localStorage.setItem("theme", "dark");
    }

    updateThemeIcon();
}

function updateThemeIcon() {

    const icon = elements.themeToggle?.querySelector("i");
    if (!icon) return;

    const dark =
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");

    icon.className = dark ? "bx bx-sun" : "bx bx-moon";
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar(event) {
    event?.stopPropagation();
    elements.sidebar?.classList.toggle("open");
}

function handleOutsideSidebarClick(event) {

    if (
        window.innerWidth > 960 ||
        !elements.sidebar ||
        !elements.sidebar.classList.contains("open")
    ) return;

    const clickedInsideSidebar = elements.sidebar.contains(event.target);
    const clickedMenuButton = elements.mobileMenuBtn?.contains(event.target);

    if (!clickedInsideSidebar && !clickedMenuButton) {
        elements.sidebar.classList.remove("open");
    }
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function handleKeyboardShortcuts(event) {

    if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        elements.globalSearch?.focus();
    }

    if (event.key === "Escape") {
        closeEditModal();
        elements.sidebar?.classList.remove("open");
    }
}


/* =========================================================
   LOGOUT / SESSION
========================================================= */

function logout() {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    clearSession();
    window.location.href = "/pages/login.html";
}

function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

function redirectToLogin() {
    window.location.href = "/pages/login.html";
}

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        ""
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "info") {

    if (!elements.toastContainer) {
        console.log(`${type}: ${message}`);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "bx bx-info-circle";
    if (type === "success") icon = "bx bx-check-circle";
    else if (type === "error") icon = "bx bx-error-circle";

    toast.innerHTML = `
        <i class="${icon}"></i>
        <div>
            <strong>${
                type === "success"
                    ? "Success"
                    : type === "error"
                    ? "Error"
                    : "AlumniHub"
            }</strong>
            <span></span>
        </div>
    `;

    const messageElement = toast.querySelector("span");
    if (messageElement) messageElement.textContent = message;

    elements.toastContainer.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4500);
}


/* =========================================================
   HELPERS
========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value ?? "—";
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.value = value ?? "";
}

function getInputValue(id) {
    const element = document.getElementById(id);
    if (!element) return "";
    return element.value.trim();
}

function hasValue(value) {
    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
}

function normalizeValue(value) {
    return hasValue(value) ? String(value).trim() : "";
}

function nullableValue(value) {
    const normalized = normalizeValue(value);
    return normalized || null;
}

function nullableNumber(value) {
    if (!hasValue(value)) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function displayValue(value) {
    return hasValue(value) ? String(value) : "—";
}

function buildFullName(firstName, middleName, lastName) {
    const parts = [firstName, middleName, lastName].filter(hasValue);
    return parts.length ? parts.join(" ") : "Alumni User";
}

function getInitials(firstName, lastName) {
    const first = normalizeValue(firstName);
    const last = normalizeValue(lastName);

    if (first || last) {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }

    return "AL";
}

function buildProgramBatch(program, batchYear) {
    const programText = normalizeValue(program);
    const batchText = normalizeValue(batchYear);

    if (programText && batchText) return `${programText} • Batch ${batchText}`;
    if (programText) return programText;
    if (batchText) return `Batch ${batchText}`;
    return "AlumniHub Graduate";
}

function formatDate(value) {
    if (!hasValue(value)) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatDateForInput(value) {
    if (!hasValue(value)) return "";

    const raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isUserVerified(user) {
    return (
        user.is_verified === true ||
        user.is_verified === 1 ||
        user.is_verified === "true" ||
        user.verification_status === "verified" ||
        user.verification_status === "approved"
    );
}

function isUserActive(user) {
    if (user.is_active === undefined || user.is_active === null) return true;

    return (
        user.is_active === true ||
        user.is_active === 1 ||
        user.is_active === "true"
    );
}

function normalizeExternalUrl(url) {
    const value = normalizeValue(url);
    if (!value) return "#";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
}