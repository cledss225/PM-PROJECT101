"use strict";

const API_BASE_URL = "http://localhost:5000/api";
const PROFILE_ENDPOINT = `${API_BASE_URL}/auth/me`;
const OFFICE_PROFILE_IMAGE_KEY = "officeProfileImage";

const state = {
    profile: null,
    selectedPhotoFile: null,
    selectedPhotoDataUrl: null
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initializeTheme();
    bindEvents();
    setCurrentYear();
    loadProfile();

    window.setTimeout(() => {
        el.pageLoader?.classList.add("hide");
    }, 250);
});


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

        "headerProfileButton",
        "profileDropdown",

        "logoutButton",
        "profileLogoutButton",
        "confirmLogoutButton",

        "sidebarProfileImage",
        "headerProfileImage",
        "profileImage",

        "sidebarInitials",
        "headerInitials",
        "profileInitials",

        "sidebarUserName",
        "headerUserName",

        "profileFullName",
        "profileEmail",

        "firstNameValue",
        "middleNameValue",
        "lastNameValue",
        "emailValue",
        "phoneValue",
        "officeValue",

        "roleValue",
        "accountStatusValue",
        "memberSinceValue",
        "lastLoginValue",

        "editProfileButton",
        "changePhotoButton",
        "profilePhotoInput",

        "editProfileModal",
        "editProfileForm",
        "editFirstName",
        "editMiddleName",
        "editLastName",
        "editEmail",
        "editPhone",

        "saveProfileButton",
        "saveProfileButtonText",

        "logoutModal",

        "toastContainer",
        "currentYear"

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


    el.editProfileButton?.addEventListener(
        "click",
        openEditProfileModal
    );


    el.changePhotoButton?.addEventListener(
        "click",
        () => {

            el.profilePhotoInput?.click();

        }
    );


    el.profilePhotoInput?.addEventListener(
        "change",
        handlePhotoSelection
    );


    el.editProfileForm?.addEventListener(
        "submit",
        handleProfileSubmit
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


    document.addEventListener(
        "keydown",
        (event) => {

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


async function loadProfile() {

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

        const response =
            await fetch(
                PROFILE_ENDPOINT,
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
            await safeJson(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(

                body?.message ||
                body?.error ||
                "Unable to load profile."

            );

        }


        const profile =
            normalizeProfile(
                body?.user ??
                body?.profile ??
                body?.data ??
                body
            );


        state.profile =
            profile;


        renderProfile(
            profile
        );


        saveUserToLocalStorage(
            profile
        );


    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );


        showToast(
            "Unable to load profile",
            error.message ||
            "Something went wrong.",
            "error"
        );


        loadProfileFromLocalStorage();

    }

}


function normalizeProfile(user) {

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

        phone:
            user?.phone_number ??
            user?.phone ??
            user?.contact_number ??
            "",

        roleId:
            user?.role_id ??
            user?.roleId ??
            null,

        roleName:
            user?.role_name ??
            user?.roleName ??
            user?.role ??
            "Alumni Office",

        profilePicture:
            user?.profile_picture ??
            user?.profilePicture ??
            "",

        isActive:
            user?.is_active !==
            false,

        isVerified:
            Boolean(
                user?.is_verified ??
                true
            ),

        createdAt:
            user?.created_at ??
            user?.createdAt ??
            null,

        lastLogin:
            user?.last_login ??
            user?.lastLogin ??
            null

    };

}


function renderProfile(profile) {

    const fullName =
        getFullName(
            profile
        );


    const initials =
        getInitials(
            fullName
        );


    setText(
        el.profileFullName,
        fullName
    );


    setText(
        el.profileEmail,
        profile.email ||
        "No email address"
    );


    setText(
        el.firstNameValue,
        profile.firstName ||
        "—"
    );


    setText(
        el.middleNameValue,
        profile.middleName ||
        "—"
    );


    setText(
        el.lastNameValue,
        profile.lastName ||
        "—"
    );


    setText(
        el.emailValue,
        profile.email ||
        "—"
    );


    setText(
        el.phoneValue,
        profile.phone ||
        "Not provided"
    );


    setText(
        el.officeValue,
        "Alumni Affairs Office"
    );


    setText(
        el.roleValue,
        formatRoleName(
            profile
        )
    );


    setText(
        el.accountStatusValue,
        profile.isActive
            ? "Active"
            : "Inactive"
    );


    setText(
        el.memberSinceValue,
        formatDate(
            profile.createdAt
        )
    );


    setText(
        el.lastLoginValue,
        formatDateTime(
            profile.lastLogin
        )
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


    setText(
        el.profileInitials,
        initials
    );


    const savedOfficeAvatar =
        localStorage.getItem(
            OFFICE_PROFILE_IMAGE_KEY
        );

    setProfileImages(
        savedOfficeAvatar ||
        profile.profilePicture
    );

}


function loadProfileFromLocalStorage() {

    try {

        const savedUser =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "null"
            );


        if (!savedUser) {
            return;
        }


        const profile =
            normalizeProfile(
                savedUser
            );


        state.profile =
            profile;


        renderProfile(
            profile
        );


    } catch (_) {}

}


function openEditProfileModal() {

    if (
        !state.profile
    ) {

        showToast(
            "Profile unavailable",
            "Profile information is still loading.",
            "error"
        );

        return;

    }


    setValue(
        el.editFirstName,
        state.profile.firstName
    );


    setValue(
        el.editMiddleName,
        state.profile.middleName
    );


    setValue(
        el.editLastName,
        state.profile.lastName
    );


    setValue(
        el.editEmail,
        state.profile.email
    );


    setValue(
        el.editPhone,
        state.profile.phone
    );


    openModal(
        "editProfileModal"
    );

}


async function handleProfileSubmit(event) {

    event.preventDefault();


    const firstName =
        el.editFirstName?.value.trim() ||
        "";


    const middleName =
        el.editMiddleName?.value.trim() ||
        "";


    const lastName =
        el.editLastName?.value.trim() ||
        "";


    const email =
        el.editEmail?.value.trim() ||
        "";


    const phone =
        el.editPhone?.value.trim() ||
        "";


    if (
        !firstName ||
        !lastName ||
        !email
    ) {

        showToast(
            "Check profile",
            "First name, last name, and email are required.",
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


    const payload = {

        first_name:
            firstName,

        middle_name:
            middleName ||
            null,

        last_name:
            lastName,

        email,

        phone_number:
            phone ||
            null

    };


    try {

        setSaveButtonLoading(
            true
        );


        const response =
            await fetch(
                PROFILE_ENDPOINT,
                {
                    method:
                        "PUT",

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
                "Profile update endpoint is not available yet."

            );

        }


        const updatedProfile =
            normalizeProfile(
                body?.user ??
                body?.profile ??
                body?.data ??
                {
                    ...state.profile,
                    ...payload
                }
            );


        state.profile =
            updatedProfile;


        renderProfile(
            updatedProfile
        );


        saveUserToLocalStorage(
            updatedProfile
        );


        closeModal(
            "editProfileModal"
        );


        showToast(
            "Profile updated",
            "Your profile information was saved successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        showToast(
            "Unable to update profile",
            error.message ||
            "Something went wrong.",
            "error"
        );


    } finally {

        setSaveButtonLoading(
            false
        );

    }

}


function handlePhotoSelection(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }


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
            "Unsupported image",
            "Please choose a JPG, PNG, or WEBP image.",
            "error"
        );

        event.target.value = "";

        return;
    }


    const maximumSize =
        5 * 1024 * 1024;


    if (
        file.size >
        maximumSize
    ) {

        showToast(
            "Image too large",
            "Profile photo must be 5 MB or smaller.",
            "error"
        );

        event.target.value = "";

        return;
    }


    const reader =
        new FileReader();


    reader.addEventListener(
        "load",
        async () => {

            if (
                typeof reader.result !==
                "string"
            ) {
                return;
            }


            try {

                const persistentImage =
                    await createPersistentOfficeAvatar(
                        reader.result
                    );


                state.selectedPhotoFile =
                    file;

                state.selectedPhotoDataUrl =
                    persistentImage;


                localStorage.setItem(
                    OFFICE_PROFILE_IMAGE_KEY,
                    persistentImage
                );


                if (state.profile) {

                    state.profile.profilePicture =
                        persistentImage;

                }


                updateStoredUserProfilePicture(
                    persistentImage
                );


                setProfileImages(
                    persistentImage
                );


                window.dispatchEvent(
                    new CustomEvent(
                        "officeProfileImageChanged",
                        {
                            detail: {
                                image:
                                    persistentImage
                            }
                        }
                    )
                );


                showToast(
                    "Photo saved",
                    "Your avatar will now be used across all Office pages.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "SAVE OFFICE AVATAR ERROR:",
                    error
                );


                showToast(
                    "Unable to save photo",
                    "The selected image could not be saved. Try a smaller image.",
                    "error"
                );

            }

        }
    );


    reader.readAsDataURL(
        file
    );

}


async function createPersistentOfficeAvatar(
    source
) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.onload =
                () => {

                    try {

                        const maximumDimension =
                            512;

                        const scale =
                            Math.min(
                                1,
                                maximumDimension /
                                Math.max(
                                    image.naturalWidth,
                                    image.naturalHeight
                                )
                            );


                        const width =
                            Math.max(
                                1,
                                Math.round(
                                    image.naturalWidth *
                                    scale
                                )
                            );

                        const height =
                            Math.max(
                                1,
                                Math.round(
                                    image.naturalHeight *
                                    scale
                                )
                            );


                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const context =
                            canvas.getContext(
                                "2d"
                            );


                        if (!context) {

                            resolve(
                                source
                            );

                            return;
                        }


                        context.fillStyle =
                            "#ffffff";

                        context.fillRect(
                            0,
                            0,
                            width,
                            height
                        );


                        context.drawImage(
                            image,
                            0,
                            0,
                            width,
                            height
                        );


                        resolve(
                            canvas.toDataURL(
                                "image/jpeg",
                                0.86
                            )
                        );


                    } catch (error) {

                        reject(
                            error
                        );

                    }

                };


            image.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to process the selected image."
                        )
                    );

                };


            image.src =
                source;

        }
    );

}


function updateStoredUserProfilePicture(
    imageSource
) {

    let storedUser =
        {};


    try {

        storedUser =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "{}"
            ) || {};

    } catch (_) {}


    storedUser.profile_picture =
        imageSource;

    storedUser.profilePicture =
        imageSource;


    localStorage.setItem(
        "user",
        JSON.stringify(
            storedUser
        )
    );

}

function setProfileImages(source) {

    const images = [

        el.sidebarProfileImage,
        el.headerProfileImage,
        el.profileImage

    ];


    const initials = [

        el.sidebarInitials,
        el.headerInitials,
        el.profileInitials

    ];


    if (source) {

        const resolvedSource =
            resolveImageUrl(
                source
            );


        images.forEach(img => {

            if (!img) {
                return;
            }


            img.src =
                resolvedSource;


            img.style.display =
                "block";


            img.onerror =
                () => {

                    img.style.display =
                        "none";

                };

        });


        initials.forEach(item => {

            if (item) {

                item.style.display =
                    "none";

            }

        });


        return;

    }


    images.forEach(img => {

        if (img) {

            img.style.display =
                "none";

        }

    });


    initials.forEach(item => {

        if (item) {

            item.style.display =
                "flex";

        }

    });

}


function saveUserToLocalStorage(
    profile
) {

    let current =
        {};


    try {

        current =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) ||
                "{}"
            ) || {};

    } catch (_) {}


    const next = {

        ...current,

        user_id:
            profile.userId,

        first_name:
            profile.firstName,

        middle_name:
            profile.middleName,

        last_name:
            profile.lastName,

        email:
            profile.email,

        phone_number:
            profile.phone,

        role_id:
            profile.roleId,

        role_name:
            profile.roleName,

        profile_picture:
            localStorage.getItem(
                OFFICE_PROFILE_IMAGE_KEY
            ) ||
            profile.profilePicture,

        is_active:
            profile.isActive,

        is_verified:
            profile.isVerified,

        created_at:
            profile.createdAt,

        last_login:
            profile.lastLogin

    };


    localStorage.setItem(
        "user",
        JSON.stringify(
            next
        )
    );

}


function setSaveButtonLoading(
    loading
) {

    if (
        !el.saveProfileButton
    ) {
        return;
    }


    el.saveProfileButton.disabled =
        loading;


    if (
        el.saveProfileButtonText
    ) {

        el.saveProfileButtonText.textContent =
            loading
                ? "Saving..."
                : "Save Changes";

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


function getFullName(profile) {

    const fullName = [

        profile.firstName,
        profile.middleName,
        profile.lastName

    ]
        .filter(Boolean)
        .join(" ")
        .trim();


    return (
        fullName ||
        "Alumni Office Staff"
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


function formatRoleName(profile) {

    if (
        profile.roleName &&
        !/^\d+$/.test(
            String(
                profile.roleName
            )
        )
    ) {

        return profile.roleName;

    }


    if (
        Number(
            profile.roleId
        ) === 3
    ) {

        return "Alumni Office";

    }


    if (
        Number(
            profile.roleId
        ) === 1
    ) {

        return "Administrator";

    }


    return "Alumni Office";

}


function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-PH",
        {
            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"
        }
    ).format(
        date
    );

}


function formatDateTime(value) {

    if (!value) {
        return "No login record";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    ).format(
        date
    );

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


async function safeJson(response) {

    try {

        return await response.json();

    } catch (_) {

        return null;

    }

}