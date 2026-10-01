const API_BASE_URL = "/api/accounts";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// =========================================
// ELEMENTS
// =========================================

const approvalLoading =
document.getElementById("approvalLoading");

const approvalError =
document.getElementById("approvalError");

const approvalErrorMessage =
document.getElementById("approvalErrorMessage");

const approvalEmpty =
document.getElementById("approvalEmpty");

const approvalTableWrapper =
document.getElementById("approvalTableWrapper");

const approvalTableBody =
document.getElementById("approvalTableBody");

const pendingCount =
document.getElementById("pendingCount");

const approvedTodayCount =
document.getElementById("approvedTodayCount");

const rejectedTodayCount =
document.getElementById("rejectedTodayCount");

const visibleCount =
document.getElementById("visibleCount");

const approvalResultText =
document.getElementById("approvalResultText");

const accountSearch =
document.getElementById("accountSearch");

const programFilter =
document.getElementById("programFilter");

const batchFilter =
document.getElementById("batchFilter");

const refreshAccounts =
document.getElementById("refreshAccounts");

const retryLoadAccounts =
document.getElementById("retryLoadAccounts");

const accountDetailsModal =
document.getElementById("accountDetailsModal");

const accountDetailsContent =
document.getElementById("accountDetailsContent");

const approveAccountModal =
document.getElementById("approveAccountModal");

const approveAccountName =
document.getElementById("approveAccountName");

const approveAccountEmail =
document.getElementById("approveAccountEmail");

const confirmApproveButton =
document.getElementById("confirmApproveButton");

const rejectAccountModal =
document.getElementById("rejectAccountModal");

const rejectAccountName =
document.getElementById("rejectAccountName");

const rejectAccountEmail =
document.getElementById("rejectAccountEmail");

const rejectionReason =
document.getElementById("rejectionReason");

const rejectionReasonError =
document.getElementById("rejectionReasonError");

const confirmRejectButton =
document.getElementById("confirmRejectButton");

const toastContainer =
document.getElementById("toastContainer");

const logoutButton =
document.getElementById("logout");


// =========================================
// STATE
// =========================================

let pendingAccounts = [];

let selectedAccount = null;

let approvedToday = 0;

let rejectedToday = 0;


// =========================================
// HELPERS
// =========================================

function escapeHtml(value) {

    return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function getFullName(account) {

    const fullName = [
        account.first_name,
        account.middle_name,
        account.last_name
    ]
    .filter(Boolean)
    .join(" ")
    .trim();

    return fullName || account.name || "Unknown Alumni";

}


function getInitials(account) {

    const name = getFullName(account);

    return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");

}


function formatDate(value) {

    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


function getProgram(account) {

    return account.program ||
    account.course ||
    "Not specified";

}


function getBatch(account) {

    return account.batch_year ||
    account.batch ||
    "Not specified";

}


function getStudentNumber(account) {

    return account.student_number ||
    "Not provided";

}


// =========================================
// UI STATES
// =========================================

function hideAllStates() {

    approvalLoading.hidden = true;

    approvalError.hidden = true;

    approvalEmpty.hidden = true;

    approvalTableWrapper.hidden = true;

}


function showLoading() {

    hideAllStates();

    approvalLoading.hidden = false;

}


function showError(message) {

    hideAllStates();

    approvalError.hidden = false;

    approvalErrorMessage.textContent =
    message || "Unable to load pending accounts.";

}


function showEmpty() {

    hideAllStates();

    approvalEmpty.hidden = false;

}


function showTable() {

    hideAllStates();

    approvalTableWrapper.hidden = false;

}


// =========================================
// LOAD ACCOUNTS
// =========================================

async function loadPendingAccounts() {

    showLoading();

    refreshAccounts.disabled = true;

    refreshAccounts
    .querySelector("i")
    .classList.add("bx-spin");

    try {

        const response = await fetch(
            `${API_BASE_URL}/pending`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load pending accounts."
            );

        }

        pendingAccounts =
        Array.isArray(data.accounts)
        ? data.accounts
        : [];

        pendingCount.textContent =
        pendingAccounts.length;

        populateFilters();

        applyFilters();

    } catch (error) {

        console.error(
            "Load pending accounts error:",
            error
        );

        showError(error.message);

        pendingCount.textContent = "0";

        visibleCount.textContent = "0";

        approvalResultText.textContent =
        "Unable to display pending accounts";

    } finally {

        refreshAccounts.disabled = false;

        refreshAccounts
        .querySelector("i")
        .classList.remove("bx-spin");

    }

}


// =========================================
// FILTERS
// =========================================

function populateFilters() {

    const programs = [
        ...new Set(
            pendingAccounts
            .map(account => getProgram(account))
            .filter(value =>
                value &&
                value !== "Not specified"
            )
        )
    ].sort();

    const batches = [
        ...new Set(
            pendingAccounts
            .map(account => String(getBatch(account)))
            .filter(value =>
                value &&
                value !== "Not specified"
            )
        )
    ].sort((a, b) => b.localeCompare(a));

    programFilter.innerHTML =
    '<option value="">All Programs</option>';

    batchFilter.innerHTML =
    '<option value="">All Batches</option>';

    programs.forEach(program => {

        const option =
        document.createElement("option");

        option.value = program;

        option.textContent = program;

        programFilter.appendChild(option);

    });

    batches.forEach(batch => {

        const option =
        document.createElement("option");

        option.value = batch;

        option.textContent = `Batch ${batch}`;

        batchFilter.appendChild(option);

    });

}


function applyFilters() {

    const searchValue =
    accountSearch.value
    .trim()
    .toLowerCase();

    const selectedProgram =
    programFilter.value;

    const selectedBatch =
    batchFilter.value;

    const filteredAccounts =
    pendingAccounts.filter(account => {

        const searchableText = [
            getFullName(account),
            account.email,
            getProgram(account),
            getBatch(account),
            getStudentNumber(account)
        ]
        .join(" ")
        .toLowerCase();

        const matchesSearch =
        searchableText.includes(searchValue);

        const matchesProgram =
        !selectedProgram ||
        getProgram(account) === selectedProgram;

        const matchesBatch =
        !selectedBatch ||
        String(getBatch(account)) === selectedBatch;

        return (
            matchesSearch &&
            matchesProgram &&
            matchesBatch
        );

    });

    renderAccounts(filteredAccounts);

}


// =========================================
// RENDER TABLE
// =========================================

function renderAccounts(accounts) {

    approvalTableBody.innerHTML = "";

    visibleCount.textContent =
    accounts.length;

    approvalResultText.textContent =
    `Showing ${accounts.length} pending account${
        accounts.length === 1 ? "" : "s"
    }`;

    if (accounts.length === 0) {

        showEmpty();

        return;

    }

    showTable();

    accounts.forEach(account => {

        const row =
        document.createElement("tr");

        const userId =
        account.user_id || account.id;

        const name =
        getFullName(account);

        const email =
        account.email || "No email";

        const profilePicture =
        account.profile_picture;

        const avatarContent =
        profilePicture
        ? `
            <img
                src="${escapeHtml(profilePicture)}"
                alt="${escapeHtml(name)}"
            >
        `
        : escapeHtml(getInitials(account));

        row.innerHTML = `

            <td>

                <div class="alumni-cell">

                    <div class="alumni-table-avatar">
                        ${avatarContent}
                    </div>

                    <div class="alumni-cell-info">

                        <strong>
                            ${escapeHtml(name)}
                        </strong>

                        <span>
                            ${escapeHtml(email)}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(getProgram(account))}
            </td>


            <td>
                ${escapeHtml(getBatch(account))}
            </td>


            <td>
                ${escapeHtml(getStudentNumber(account))}
            </td>


            <td>
                ${escapeHtml(
                    formatDate(account.created_at)
                )}
            </td>


            <td>

                <span class="pending-badge">
                    Pending
                </span>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action-button view"
                        data-action="view"
                        data-id="${escapeHtml(userId)}"
                        title="View details"
                    >
                        <i class="bx bx-show"></i>
                    </button>


                    <button
                        type="button"
                        class="table-action-button approve"
                        data-action="approve"
                        data-id="${escapeHtml(userId)}"
                        title="Approve account"
                    >
                        <i class="bx bx-check"></i>
                    </button>


                    <button
                        type="button"
                        class="table-action-button reject"
                        data-action="reject"
                        data-id="${escapeHtml(userId)}"
                        title="Reject account"
                    >
                        <i class="bx bx-x"></i>
                    </button>

                </div>

            </td>

        `;

        approvalTableBody.appendChild(row);

    });

}


// =========================================
// ACCOUNT LOOKUP
// =========================================

function findAccountById(userId) {

    return pendingAccounts.find(account => {

        const currentId =
        account.user_id || account.id;

        return String(currentId) === String(userId);

    });

}


// =========================================
// DETAILS MODAL
// =========================================

function openDetailsModal(account) {

    if (!account) {
        return;
    }

    const name =
    getFullName(account);

    const profilePicture =
    account.profile_picture;

    const avatarContent =
    profilePicture
    ? `
        <img
            src="${escapeHtml(profilePicture)}"
            alt="${escapeHtml(name)}"
        >
    `
    : escapeHtml(getInitials(account));

    accountDetailsContent.innerHTML = `

        <div class="details-profile">

            <div class="details-avatar">
                ${avatarContent}
            </div>

            <div>

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p>
                    ${escapeHtml(
                        account.email ||
                        "No email available"
                    )}
                </p>

            </div>

        </div>


        <div class="details-grid">

            ${createDetailItem(
                "Student Number",
                getStudentNumber(account)
            )}

            ${createDetailItem(
                "Program",
                getProgram(account)
            )}

            ${createDetailItem(
                "Batch Year",
                getBatch(account)
            )}

            ${createDetailItem(
                "Phone Number",
                account.phone_number ||
                "Not provided"
            )}

            ${createDetailItem(
                "Gender",
                account.gender ||
                "Not provided"
            )}

            ${createDetailItem(
                "Birth Date",
                formatDate(account.birth_date)
            )}

            ${createDetailItem(
                "Address",
                account.address ||
                "Not provided"
            )}

            ${createDetailItem(
                "Current Job",
                account.current_job ||
                "Not provided"
            )}

            ${createDetailItem(
                "Company",
                account.company ||
                "Not provided"
            )}

            ${createDetailItem(
                "Registered Date",
                formatDate(account.created_at)
            )}

            ${createLinkedInItem(
                account.linkedin_url
            )}

        </div>

    `;

    openModal(accountDetailsModal);

}


function createDetailItem(label, value) {

    return `

        <div class="detail-item">

            <span>
                ${escapeHtml(label)}
            </span>

            <strong>
                ${escapeHtml(value)}
            </strong>

        </div>

    `;

}


function createLinkedInItem(url) {

    if (!url) {

        return createDetailItem(
            "LinkedIn",
            "Not provided"
        );

    }

    const safeUrl =
    escapeHtml(url);

    return `

        <div class="detail-item">

            <span>
                LinkedIn
            </span>

            <a
                href="${safeUrl}"
                target="_blank"
                rel="noopener noreferrer"
            >
                View Profile
            </a>

        </div>

    `;

}


// =========================================
// APPROVE
// =========================================

function openApproveModal(account) {

    selectedAccount = account;

    approveAccountName.textContent =
    getFullName(account);

    approveAccountEmail.textContent =
    account.email || "No email";

    openModal(approveAccountModal);

}


async function approveSelectedAccount() {

    if (!selectedAccount) {
        return;
    }

    const userId =
    selectedAccount.user_id ||
    selectedAccount.id;

    setButtonLoading(
        confirmApproveButton,
        true,
        "Approving..."
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}/${userId}/approve`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to approve account."
            );

        }

        pendingAccounts =
        pendingAccounts.filter(account => {

            const currentId =
            account.user_id || account.id;

            return String(currentId) !== String(userId);

        });

        approvedToday += 1;

        approvedTodayCount.textContent =
        approvedToday;

        pendingCount.textContent =
        pendingAccounts.length;

        closeModal(approveAccountModal);

        populateFilters();

        applyFilters();

        showToast(
            "Account approved",
            `${getFullName(selectedAccount)} is now verified.`,
            "success"
        );

        selectedAccount = null;

    } catch (error) {

        console.error(
            "Approve account error:",
            error
        );

        showToast(
            "Approval failed",
            error.message,
            "error"
        );

    } finally {

        setButtonLoading(
            confirmApproveButton,
            false,
            "Approve Account"
        );

    }

}


// =========================================
// REJECT
// =========================================

function openRejectModal(account) {

    selectedAccount = account;

    rejectAccountName.textContent =
    getFullName(account);

    rejectAccountEmail.textContent =
    account.email || "No email";

    rejectionReason.value = "";

    rejectionReasonError.hidden = true;

    openModal(rejectAccountModal);

}


async function rejectSelectedAccount() {

    if (!selectedAccount) {
        return;
    }

    const reason =
    rejectionReason.value.trim();

    if (!reason) {

        rejectionReasonError.hidden = false;

        rejectionReason.focus();

        return;

    }

    rejectionReasonError.hidden = true;

    const userId =
    selectedAccount.user_id ||
    selectedAccount.id;

    setButtonLoading(
        confirmRejectButton,
        true,
        "Rejecting..."
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}/${userId}/reject`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reason
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to reject account."
            );

        }

        pendingAccounts =
        pendingAccounts.filter(account => {

            const currentId =
            account.user_id || account.id;

            return String(currentId) !== String(userId);

        });

        rejectedToday += 1;

        rejectedTodayCount.textContent =
        rejectedToday;

        pendingCount.textContent =
        pendingAccounts.length;

        closeModal(rejectAccountModal);

        populateFilters();

        applyFilters();

        showToast(
            "Account rejected",
            `${getFullName(selectedAccount)} was removed from pending requests.`,
            "warning"
        );

        selectedAccount = null;

    } catch (error) {

        console.error(
            "Reject account error:",
            error
        );

        showToast(
            "Rejection failed",
            error.message,
            "error"
        );

    } finally {

        setButtonLoading(
            confirmRejectButton,
            false,
            "Reject Account"
        );

    }

}


// =========================================
// MODAL HELPERS
// =========================================

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("active");

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

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
    "";

}


function setButtonLoading(
    button,
    isLoading,
    text
) {

    button.disabled = isLoading;

    if (isLoading) {

        button.dataset.originalHtml =
        button.innerHTML;

        button.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            ${escapeHtml(text)}

        `;

        return;

    }

    if (button.dataset.originalHtml) {

        button.innerHTML =
        button.dataset.originalHtml;

        delete button.dataset.originalHtml;

    }

}


// =========================================
// TOAST
// =========================================

function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
    document.createElement("div");

    const iconClass = {
        success: "bx-check-circle",
        error: "bx-error-circle",
        warning: "bx-error"
    }[type] || "bx-info-circle";

    toast.className =
    `approval-toast ${type}`;

    toast.innerHTML = `

        <i class="bx ${iconClass}"></i>

        <div>

            <strong>
                ${escapeHtml(title)}
            </strong>

            <span>
                ${escapeHtml(message)}
            </span>

        </div>

    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 3500);

}


// =========================================
// EVENTS
// =========================================

approvalTableBody.addEventListener(
    "click",
    event => {

        const button =
        event.target.closest(
            "[data-action]"
        );

        if (!button) {
            return;
        }

        const account =
        findAccountById(
            button.dataset.id
        );

        if (!account) {
            return;
        }

        const action =
        button.dataset.action;

        if (action === "view") {

            openDetailsModal(account);

        }

        if (action === "approve") {

            openApproveModal(account);

        }

        if (action === "reject") {

            openRejectModal(account);

        }

    }
);


accountSearch.addEventListener(
    "input",
    applyFilters
);


programFilter.addEventListener(
    "change",
    applyFilters
);


batchFilter.addEventListener(
    "change",
    applyFilters
);


refreshAccounts.addEventListener(
    "click",
    loadPendingAccounts
);


retryLoadAccounts.addEventListener(
    "click",
    loadPendingAccounts
);


confirmApproveButton.addEventListener(
    "click",
    approveSelectedAccount
);


confirmRejectButton.addEventListener(
    "click",
    rejectSelectedAccount
);


rejectionReason.addEventListener(
    "input",
    () => {

        if (
            rejectionReason.value.trim()
        ) {

            rejectionReasonError.hidden =
            true;

        }

    }
);


document.addEventListener(
    "click",
    event => {

        const closeTrigger =
        event.target.closest(
            "[data-close-modal]"
        );

        if (!closeTrigger) {
            return;
        }

        const modalId =
        closeTrigger.dataset.closeModal;

        const modal =
        document.getElementById(modalId);

        closeModal(modal);

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        document
        .querySelectorAll(
            ".approval-modal.active"
        )
        .forEach(closeModal);

    }
);


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
            "login.html";

        }
    );

}


// =========================================
// START
// =========================================

loadPendingAccounts();