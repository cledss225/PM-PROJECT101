const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
};


/* ==========================================
   LOAD DASHBOARD STATS
========================================== */

async function loadStats() {

    try {

        const response = await fetch(
            `${API_URL}/dashboard/stats`,
            {
                headers: authHeaders
            }
        );

        const data = await response.json();

        if (!data.success) return;

        document.getElementById("totalUsers").textContent =
            data.stats.total_users;

        document.getElementById("totalAlumni").textContent =
            data.stats.total_alumni;

        document.getElementById("verifiedAlumni").textContent =
            data.stats.verified_alumni;

        document.getElementById("employedAlumni").textContent =
            data.stats.employed_alumni;

    } catch (error) {

        console.error("Dashboard Stats Error:", error);

    }

}


/* ==========================================
   LOAD RECENT REGISTRATIONS
========================================== */

async function loadRecent() {

    try {

        const response = await fetch(
            `${API_URL}/dashboard/recent`,
            {
                headers: authHeaders
            }
        );

        const data = await response.json();

        if (!data.success) return;

        const table =
            document.getElementById("recentTable");

        if (!table) return;

        table.innerHTML = "";

        data.recent.forEach(user => {

            const status =
                user.is_verified
                    ? "Verified"
                    : "Pending";

            const statusClass =
                user.is_verified
                    ? "verified"
                    : "pending";

            table.innerHTML += `

                <tr>

                    <td>

                        <img
                            src="assets/images/avatars/default-avatar.png"
                            class="table-avatar"
                            alt="Profile"
                        >

                    </td>

                    <td>

                        <strong>
                            ${user.first_name} ${user.last_name}
                        </strong>

                    </td>

                    <td>
                        ${user.email}
                    </td>

                    <td>

                        <span class="status-badge ${statusClass}">
                            ${status}
                        </span>

                    </td>

                    <td>

                        ${new Date(user.created_at).toLocaleDateString()}

                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error("Recent Registrations Error:", error);

    }

}

function createBarValuePlugin(isDark){

    return {

        id:"barValueLabels",

        afterDatasetsDraw(chart){

            const ctx = chart.ctx;

            const dataset =
                chart.data.datasets[0];

            const meta =
                chart.getDatasetMeta(0);

            if(!meta || meta.hidden) return;

            ctx.save();

            ctx.textAlign = "center";

            ctx.textBaseline = "bottom";

            ctx.font =
                "700 13px Poppins, sans-serif";

            ctx.fillStyle =
                isDark
                ?
                "#F8FAFC"
                :
                "#0F172A";

            meta.data.forEach((bar,index)=>{

                const value =
                    Number(dataset.data[index]);

                ctx.fillText(
                    value,
                    bar.x,
                    bar.y - 9
                );

            });

            ctx.restore();

        }

    };

}
/* ==========================================
   BATCH BAR CHART
========================================== */

async function loadBatchChart(){

    try{

        const response = await fetch(
            `${API_URL}/dashboard/batches`,
            {
                headers:authHeaders
            }
        );

        const data = await response.json();

        if(!data.success) return;

        const canvas =
            document.getElementById("batchChart");

        if(!canvas) return;

        const labels =
            data.batches.map(
                item=>String(item.batch_year)
            );

        const totals =
            data.batches.map(
                item=>Number(item.total)
            );

        const isDark =
            document.body.classList.contains("dark");

        if(
            window.batchChart &&
            typeof window.batchChart.destroy === "function"
        ){

            window.batchChart.destroy();

        }

        const ctx =
            canvas.getContext("2d");

        const chartHeight =
            canvas.parentElement?.clientHeight || 330;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                chartHeight
            );

        if(isDark){

            gradient.addColorStop(
                0,
                "#60A5FA"
            );

            gradient.addColorStop(
                0.5,
                "#3B82F6"
            );

            gradient.addColorStop(
                1,
                "#1D4ED8"
            );

        }else{

            gradient.addColorStop(
                0,
                "#60A5FA"
            );

            gradient.addColorStop(
                0.5,
                "#2563EB"
            );

            gradient.addColorStop(
                1,
                "#1E40AF"
            );

        }

        const highestValue =
            Math.max(...totals,0);

        const suggestedMax =
            highestValue <= 2
            ?
            3
            :
            Math.ceil(highestValue * 1.25);

        window.batchChart =
        new Chart(canvas,{

            type:"bar",

            data:{

                labels,

                datasets:[{

                    label:"Registered Alumni",

                    data:totals,

                    backgroundColor:gradient,

                    hoverBackgroundColor:
                    isDark
                    ?
                    "#93C5FD"
                    :
                    "#3B82F6",

                    borderColor:
                    isDark
                    ?
                    "#BFDBFE"
                    :
                    "#1E3A8A",

                    borderWidth:1,

                    borderRadius:14,

                    borderSkipped:false,

                    maxBarThickness:
                    labels.length === 1
                    ?
                    115
                    :
                    72,

                    minBarLength:5,

                    categoryPercentage:
                    labels.length === 1
                    ?
                    0.35
                    :
                    0.72,

                    barPercentage:
                    labels.length === 1
                    ?
                    0.85
                    :
                    0.8

                }]

            },

            plugins:[

                createBarValuePlugin(isDark)

            ],

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{

                    duration:900,

                    easing:"easeOutQuart"

                },

                interaction:{

                    mode:"index",

                    intersect:false

                },

                layout:{

                    padding:{

                        top:28,

                        right:14,

                        bottom:4,

                        left:8

                    }

                },

                plugins:{

                    legend:{

                        display:false

                    },

                    tooltip:{

                        displayColors:false,

                        backgroundColor:
                        isDark
                        ?
                        "#020617"
                        :
                        "#FFFFFF",

                        titleColor:
                        isDark
                        ?
                        "#FFFFFF"
                        :
                        "#0F172A",

                        bodyColor:
                        isDark
                        ?
                        "#CBD5E1"
                        :
                        "#334155",

                        borderColor:
                        isDark
                        ?
                        "#334155"
                        :
                        "#CBD5E1",

                        borderWidth:1,

                        cornerRadius:10,

                        padding:12,

                        callbacks:{

                            title(context){

                                return (
                                    "Batch " +
                                    context[0].label
                                );

                            },

                            label(context){

                                const value =
                                    Number(context.raw);

                                return (
                                    value +
                                    (
                                        value === 1
                                        ?
                                        " registered alumnus"
                                        :
                                        " registered alumni"
                                    )
                                );

                            }

                        }

                    }

                },

                scales:{

                    x:{

                        offset:true,

                        ticks:{

                            color:
                            isDark
                            ?
                            "#E2E8F0"
                            :
                            "#334155",

                            padding:10,

                            font:{

                                family:"Poppins",

                                size:12,

                                weight:"600"

                            }

                        },

                        grid:{

                            display:false

                        },

                        border:{

                            color:
                            isDark
                            ?
                            "#475569"
                            :
                            "#CBD5E1"

                        }

                    },

                    y:{

                        beginAtZero:true,

                        suggestedMax,

                        ticks:{

                            precision:0,

                            stepSize:1,

                            color:
                            isDark
                            ?
                            "#94A3B8"
                            :
                            "#64748B",

                            padding:10,

                            font:{

                                family:"Poppins",

                                size:11,

                                weight:"500"

                            },

                            callback(value){

                                return Number.isInteger(value)
                                ?
                                value
                                :
                                "";

                            }

                        },

                        grid:{

                            color:
                            isDark
                            ?
                            "rgba(148,163,184,0.13)"
                            :
                            "rgba(100,116,139,0.13)",

                            drawTicks:false,

                            lineWidth:1

                        },

                        border:{

                            display:false

                        }

                    }

                }

            }

        });

    }catch(error){

        console.error(
            "Batch Chart Error:",
            error
        );

    }

}

/* ==========================================
   EMPLOYMENT STATUS DONUT CHART
========================================== */

async function loadEmploymentChart() {

    try {

        const response = await fetch(
            `${API_URL}/dashboard/employment`,
            {
                headers: authHeaders
            }
        );

        const data = await response.json();

        if (!data.success) return;

        const canvas =
            document.getElementById("employmentChart");

        if (!canvas) return;

        const employment = data.employment;

        const labels = [
            "Employed",
            "Unemployed"
        ];

        const totals = [
            Number(employment.employed),
            Number(employment.unemployed)
        ];

        const total =
            totals[0] + totals[1];

        const rate =
            total === 0
                ? 0
                : Math.round((totals[0] / total) * 100);

        const isDark =
            document.body.classList.contains("dark");


        if (
            window.employmentChart &&
            typeof window.employmentChart.destroy === "function"
        ) {
            window.employmentChart.destroy();
        }


        const centerTextPlugin = {

            id: "centerText",

            beforeDraw(chart) {

                const {
                    ctx,
                    chartArea: {
                        top,
                        bottom,
                        left,
                        right
                    }
                } = chart;

                const centerX =
                    (left + right) / 2;

                const centerY =
                    (top + bottom) / 2;

                ctx.save();

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillStyle =
                    isDark
                        ? "#FFFFFF"
                        : "#0F172A";

                ctx.font =
                    "700 26px Poppins";

                ctx.fillText(
                    `${rate}%`,
                    centerX,
                    centerY - 8
                );

                ctx.fillStyle =
                    isDark
                        ? "#CBD5E1"
                        : "#64748B";

                ctx.font =
                    "500 11px Poppins";

                ctx.fillText(
                    "Employed",
                    centerX,
                    centerY + 16
                );

                ctx.restore();

            }

        };


        window.employmentChart = new Chart(canvas, {

            type: "doughnut",

            plugins: [
                centerTextPlugin
            ],

            data: {

                labels,

                datasets: [{

                    data: totals,

                    backgroundColor: [
                        "#2563EB",
                        "#EF4444"
                    ],

                    hoverBackgroundColor: [
                        "#3B82F6",
                        "#F87171"
                    ],

                    borderWidth: 0,

                    spacing: 2

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "72%",

                animation: {
                    duration: 650
                },

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            color: isDark
                                ? "#CBD5E1"
                                : "#334155",

                            usePointStyle: true,

                            pointStyle: "circle",

                            boxWidth: 8,

                            boxHeight: 8,

                            padding: 14,

                            font: {
                                size: 10
                            }

                        }

                    },

                    tooltip: {

                        callbacks: {

                            label(context) {

                                const value =
                                    Number(context.raw);

                                const percentage =
                                    total === 0
                                        ? 0
                                        : Math.round(
                                            (value / total) * 100
                                        );

                                return `${context.label}: ${value} alumni (${percentage}%)`;

                            }

                        }

                    }

                }

            }

        });

    } catch (error) {

        console.error(
            "Employment Chart Error:",
            error
        );

    }

}


/* ==========================================
   LOGOUT
========================================== */

const logout =
    document.getElementById("logout");

if (logout) {

    logout.addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "login.html";

    });

}
/* ==========================================
   RECENT REGISTRATIONS SEARCH
========================================== */

function setupRecentRegistrationSearch() {

    const searchInput =
        document.getElementById("recentSearch");

    const table =
        document.getElementById("recentTable");

    if (!searchInput || !table) {
        return;
    }

    searchInput.addEventListener(
        "input",
        () => {

            const keyword =
                searchInput.value
                    .trim()
                    .toLowerCase();

            const rows =
                table.querySelectorAll("tr");

            rows.forEach(row => {

                const rowText =
                    row.textContent
                        .toLowerCase();

                row.style.display =
                    rowText.includes(keyword)
                        ? ""
                        : "none";

            });

        }
    );

}

/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log("Dashboard initialized");

        loadStats();
        loadRecent();
        loadBatchChart();
        loadEmploymentChart();

        setupActivityTabs();
        loadRecentActivity("today");
        setupRecentRegistrationSearch();

    }
);


/* ==========================================
   REFRESH CHARTS WHEN THEME CHANGES
========================================== */

document.addEventListener(
    "themeChanged",
    () => {

        loadBatchChart();

        loadEmploymentChart();

    }
);
/* ==========================================
   RECENT ACTIVITY TABS
========================================== */

async function loadRecentActivity(range = "today") {

    const updateList =
        document.querySelector(".update-list");

    if (!updateList) {
        return;
    }


    updateList.innerHTML = `
        <div style="
            padding: 18px;
            text-align: center;
            color: #94a3b8;
            font-size: 13px;
        ">
            Loading activities...
        </div>
    `;


    try {

        const response = await fetch(
            `${API_URL}/dashboard/activity?range=${encodeURIComponent(range)}`,
            {
                headers: authHeaders
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load recent activity."
            );

        }


        renderRecentActivity(
            data.activities || []
        );


    } catch (error) {

        console.error(
            "Recent Activity Error:",
            error
        );


        updateList.innerHTML = `
            <div style="
                padding: 18px;
                text-align: center;
                color: #ef4444;
                font-size: 13px;
            ">
                Unable to load recent activity.
            </div>
        `;

    }

}


/* ==========================================
   RENDER RECENT ACTIVITY
========================================== */

function renderRecentActivity(activities) {

    const updateList =
        document.querySelector(".update-list");

    if (!updateList) {
        return;
    }


    if (!activities.length) {

        updateList.innerHTML = `
            <div style="
                padding: 24px 16px;
                text-align: center;
                color: #94a3b8;
                font-size: 13px;
            ">
                No activity found for this period.
            </div>
        `;

        return;

    }


    updateList.innerHTML =
        activities
            .map(activity => {

                const type =
                    String(
                        activity.activity_type || ""
                    ).toLowerCase();


                let icon =
                    "bx bx-history";


                let colorClass =
                    "blue";


                if (type === "registration") {

                    icon =
                        "bx bx-user-plus";

                    colorClass =
                        "blue";

                }


                if (type === "approval") {

                    icon =
                        "bx bx-user-check";

                    colorClass =
                        "green";

                }


                if (type === "event") {

                    icon =
                        "bx bx-calendar-event";

                    colorClass =
                        "purple";

                }


                if (type === "profile") {

                    icon =
                        "bx bx-edit";

                    colorClass =
                        "orange";

                }


                return `
                    <div class="update-item">

                        <div class="update-icon ${colorClass}">
                            <i class="${icon}"></i>
                        </div>

                        <div>

                            <strong>
                                ${escapeDashboardHtml(
                                    activity.title
                                )}
                            </strong>

                            <p>
                                ${escapeDashboardHtml(
                                    activity.description
                                )}
                            </p>

                        </div>

                        <small>
                            ${formatActivityTime(
                                activity.activity_date
                            )}
                        </small>

                    </div>
                `;

            })
            .join("");

}


/* ==========================================
   SETUP ACTIVITY TAB CLICKS
========================================== */

function setupActivityTabs() {

    const tabs =
        document.querySelectorAll(
            ".update-tabs button"
        );


    if (!tabs.length) {
        return;
    }


    tabs.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                tabs.forEach(tab => {

                    tab.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                const label =
                    button.textContent
                        .trim()
                        .toLowerCase();


                let range =
                    "today";


                if (
                    label === "yesterday"
                ) {

                    range =
                        "yesterday";

                }


                if (
                    label === "this week"
                ) {

                    range =
                        "week";

                }


                await loadRecentActivity(
                    range
                );

            }
        );

    });

}


/* ==========================================
   ACTIVITY HELPERS
========================================== */

function formatActivityTime(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleTimeString(
        "en-PH",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


function escapeDashboardHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}