const token = localStorage.getItem("token");


if (!token) {

    window.location.href = "login.html";

}


/* =========================================================
   SAMPLE DATA
========================================================= */

const alumniReportData = [

    {
        id: 1,
        batch: 2020,
        program: "BSIT",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2024-01-10"
    },

    {
        id: 2,
        batch: 2020,
        program: "BSIT",
        gender: "Female",
        employment: "Self-employed",
        verified: true,
        registeredDate: "2024-02-15"
    },

    {
        id: 3,
        batch: 2020,
        program: "BSBA",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2024-03-20"
    },

    {
        id: 4,
        batch: 2021,
        program: "BSCS",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2024-04-10"
    },

    {
        id: 5,
        batch: 2021,
        program: "BSIT",
        gender: "Male",
        employment: "Unemployed",
        verified: false,
        registeredDate: "2024-05-05"
    },

    {
        id: 6,
        batch: 2021,
        program: "BSEd",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2024-06-16"
    },

    {
        id: 7,
        batch: 2021,
        program: "BSHM",
        gender: "Female",
        employment: "Self-employed",
        verified: true,
        registeredDate: "2024-07-08"
    },

    {
        id: 8,
        batch: 2022,
        program: "BSIT",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-01-11"
    },

    {
        id: 9,
        batch: 2022,
        program: "BSCS",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-02-13"
    },

    {
        id: 10,
        batch: 2022,
        program: "BSBA",
        gender: "Female",
        employment: "Unemployed",
        verified: false,
        registeredDate: "2025-03-15"
    },

    {
        id: 11,
        batch: 2022,
        program: "BSHM",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-04-19"
    },

    {
        id: 12,
        batch: 2022,
        program: "BSEd",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-05-21"
    },

    {
        id: 13,
        batch: 2023,
        program: "BSIT",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-06-10"
    },

    {
        id: 14,
        batch: 2023,
        program: "BSIT",
        gender: "Female",
        employment: "Self-employed",
        verified: true,
        registeredDate: "2025-07-12"
    },

    {
        id: 15,
        batch: 2023,
        program: "BSCS",
        gender: "Male",
        employment: "Unemployed",
        verified: false,
        registeredDate: "2025-08-20"
    },

    {
        id: 16,
        batch: 2023,
        program: "BSBA",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2025-09-18"
    },

    {
        id: 17,
        batch: 2024,
        program: "BSIT",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2026-01-07"
    },

    {
        id: 18,
        batch: 2024,
        program: "BSCS",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2026-02-14"
    },

    {
        id: 19,
        batch: 2024,
        program: "BSHM",
        gender: "Female",
        employment: "Unemployed",
        verified: false,
        registeredDate: "2026-03-19"
    },

    {
        id: 20,
        batch: 2024,
        program: "BSEd",
        gender: "Male",
        employment: "Self-employed",
        verified: true,
        registeredDate: "2026-04-23"
    },

    {
        id: 21,
        batch: 2025,
        program: "BSIT",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2026-05-08"
    },

    {
        id: 22,
        batch: 2025,
        program: "BSCS",
        gender: "Male",
        employment: "Unemployed",
        verified: false,
        registeredDate: "2026-05-18"
    },

    {
        id: 23,
        batch: 2025,
        program: "BSBA",
        gender: "Female",
        employment: "Employed",
        verified: true,
        registeredDate: "2026-06-02"
    },

    {
        id: 24,
        batch: 2025,
        program: "BSHM",
        gender: "Male",
        employment: "Employed",
        verified: true,
        registeredDate: "2026-06-27"
    }

];


let filteredReportData = [
    ...alumniReportData
];


let generatedReports = [];

let batchYearChart;

let employmentChart;

let programChart;

let genderChart;


/* =========================================================
   ELEMENTS
========================================================= */

const reportFromDate =
    document.getElementById("reportFromDate");

const reportToDate =
    document.getElementById("reportToDate");

const reportBatchFilter =
    document.getElementById("reportBatchFilter");

const reportProgramFilter =
    document.getElementById("reportProgramFilter");

const reportEmploymentFilter =
    document.getElementById("reportEmploymentFilter");

const generateReportModal =
    document.getElementById("generateReportModal");


/* =========================================================
   FILTER OPTIONS
========================================================= */

function loadFilterOptions() {

    const batches =
        [
            ...new Set(
                alumniReportData.map(
                    alumni => alumni.batch
                )
            )
        ].sort(
            (first, second) =>
                second - first
        );


    batches.forEach(batch => {

        const option =
            document.createElement("option");


        option.value =
            batch;


        option.textContent =
            batch;


        reportBatchFilter.appendChild(
            option
        );

    });


    const programs =
        [
            ...new Set(
                alumniReportData.map(
                    alumni => alumni.program
                )
            )
        ].sort();


    programs.forEach(program => {

        const option =
            document.createElement("option");


        option.value =
            program;


        option.textContent =
            program;


        reportProgramFilter.appendChild(
            option
        );

    });

}


/* =========================================================
   HELPERS
========================================================= */

function calculatePercentage(
    value,
    total
) {

    if (!total) {

        return 0;

    }


    return Math.round(
        (value / total) * 100
    );

}


function getThemeColors() {

    const isDark =
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode");


    return {

        text:
            isDark
                ? "#cbd5e1"
                : "#64748b",

        strongText:
            isDark
                ? "#f8fafc"
                : "#0f172a",

        grid:
            isDark
                ? "rgba(148, 163, 184, 0.15)"
                : "rgba(148, 163, 184, 0.22)",

        border:
            isDark
                ? "#111827"
                : "#ffffff"

    };

}


function countByProperty(
    records,
    property
) {

    return records.reduce(
        (counts, record) => {

            const key =
                record[property];


            counts[key] =
                (counts[key] || 0) + 1;


            return counts;

        },
        {}
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateReportStatistics() {

    const total =
        filteredReportData.length;


    const verified =
        filteredReportData.filter(
            alumni => alumni.verified
        ).length;


    const employed =
        filteredReportData.filter(
            alumni =>
                alumni.employment === "Employed" ||
                alumni.employment === "Self-employed"
        ).length;


    document
        .getElementById("totalAlumniStat")
        .textContent =
        total;


    document
        .getElementById("verifiedAlumniStat")
        .textContent =
        verified;


    document
        .getElementById("employedAlumniStat")
        .textContent =
        employed;


    document
        .getElementById("generatedReportsStat")
        .textContent =
        generatedReports.length;


    document
        .getElementById("verifiedRateText")
        .textContent =
        `${calculatePercentage(
            verified,
            total
        )}% verification rate`;


    document
        .getElementById("employmentRateText")
        .textContent =
        `${calculatePercentage(
            employed,
            total
        )}% employment rate`;


    document
        .getElementById("employmentCenterRate")
        .textContent =
        `${calculatePercentage(
            employed,
            total
        )}%`;

}


/* =========================================================
   CHART DEFAULTS
========================================================= */

function getCommonChartOptions() {

    const colors =
        getThemeColors();


    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: {
            duration: 700
        },

        plugins: {

            legend: {

                labels: {

                    color:
                        colors.text,

                    usePointStyle:
                        true,

                    pointStyle:
                        "circle",

                    font: {
                        family: "Poppins",
                        size: 9
                    }

                }

            },

            tooltip: {

                backgroundColor:
                    colors.strongText,

                titleColor:
                    colors.border,

                bodyColor:
                    colors.border,

                padding:
                    10,

                cornerRadius:
                    9,

                titleFont: {
                    family: "Poppins",
                    size: 10
                },

                bodyFont: {
                    family: "Poppins",
                    size: 9
                }

            }

        }

    };

}


/* =========================================================
   BATCH CHART
========================================================= */

function renderBatchChart() {

    const batchCounts =
        countByProperty(
            filteredReportData,
            "batch"
        );


    const labels =
        Object.keys(batchCounts)
            .sort(
                (first, second) =>
                    Number(first) -
                    Number(second)
            );


    const data =
        labels.map(
            label => batchCounts[label]
        );


    const colors =
        getThemeColors();


    if (batchYearChart) {

        batchYearChart.destroy();

    }


    batchYearChart =
        new Chart(
            document.getElementById(
                "batchYearChart"
            ),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label: "Total Alumni",

                            data,

                            backgroundColor:
                                "rgba(37, 99, 235, 0.78)",

                            borderColor:
                                "#2563eb",

                            borderWidth:
                                1,

                            borderRadius:
                                7,

                            maxBarThickness:
                                48

                        }

                    ]

                },

                options: {

                    ...getCommonChartOptions(),

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    colors.text,

                                font: {
                                    family: "Poppins",
                                    size: 9
                                }

                            },

                            border: {
                                display: false
                            }

                        },

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0,

                                color:
                                    colors.text,

                                font: {
                                    family: "Poppins",
                                    size: 9
                                }

                            },

                            grid: {
                                color:
                                    colors.grid
                            },

                            border: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   EMPLOYMENT CHART
========================================================= */

function renderEmploymentChart() {

    const employmentCounts =
        countByProperty(
            filteredReportData,
            "employment"
        );


    const labels = [
        "Employed",
        "Self-employed",
        "Unemployed"
    ];


    const data =
        labels.map(
            label =>
                employmentCounts[label] || 0
        );


    if (employmentChart) {

        employmentChart.destroy();

    }


    employmentChart =
        new Chart(
            document.getElementById(
                "employmentChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data,

                            backgroundColor: [
                                "#2563eb",
                                "#7c3aed",
                                "#f59e0b"
                            ],

                            borderColor:
                                getThemeColors().border,

                            borderWidth:
                                4,

                            hoverOffset:
                                7

                        }

                    ]

                },

                options: {

                    ...getCommonChartOptions(),

                    cutout:
                        "70%",

                    plugins: {

                        ...getCommonChartOptions().plugins,

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    getThemeColors().text,

                                usePointStyle:
                                    true,

                                padding:
                                    15,

                                font: {
                                    family: "Poppins",
                                    size: 8
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   PROGRAM CHART
========================================================= */

function renderProgramChart() {

    const programCounts =
        countByProperty(
            filteredReportData,
            "program"
        );


    const labels =
        Object.keys(programCounts)
            .sort();


    const data =
        labels.map(
            label => programCounts[label]
        );


    const colors =
        getThemeColors();


    if (programChart) {

        programChart.destroy();

    }


    programChart =
        new Chart(
            document.getElementById(
                "programChart"
            ),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label: "Alumni",

                            data,

                            backgroundColor:
                                "rgba(124, 58, 237, 0.78)",

                            borderColor:
                                "#7c3aed",

                            borderWidth:
                                1,

                            borderRadius:
                                7,

                            maxBarThickness:
                                31

                        }

                    ]

                },

                options: {

                    ...getCommonChartOptions(),

                    indexAxis:
                        "y",

                    scales: {

                        x: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0,

                                color:
                                    colors.text,

                                font: {
                                    family: "Poppins",
                                    size: 9
                                }

                            },

                            grid: {
                                color:
                                    colors.grid
                            },

                            border: {
                                display: false
                            }

                        },

                        y: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    colors.text,

                                font: {
                                    family: "Poppins",
                                    size: 9
                                }

                            },

                            border: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   GENDER CHART
========================================================= */

function renderGenderChart() {

    const genderCounts =
        countByProperty(
            filteredReportData,
            "gender"
        );


    const labels =
        Object.keys(genderCounts);


    const data =
        labels.map(
            label => genderCounts[label]
        );


    if (genderChart) {

        genderChart.destroy();

    }


    genderChart =
        new Chart(
            document.getElementById(
                "genderChart"
            ),
            {

                type: "pie",

                data: {

                    labels,

                    datasets: [

                        {

                            data,

                            backgroundColor: [
                                "#2563eb",
                                "#ec4899",
                                "#94a3b8"
                            ],

                            borderColor:
                                getThemeColors().border,

                            borderWidth:
                                4,

                            hoverOffset:
                                7

                        }

                    ]

                },

                options: {

                    ...getCommonChartOptions(),

                    plugins: {

                        ...getCommonChartOptions().plugins,

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    getThemeColors().text,

                                usePointStyle:
                                    true,

                                padding:
                                    15,

                                font: {
                                    family: "Poppins",
                                    size: 8
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   RENDER ALL CHARTS
========================================================= */

function renderAllCharts() {

    renderBatchChart();

    renderEmploymentChart();

    renderProgramChart();

    renderGenderChart();

}


/* =========================================================
   SUMMARY TABLE
========================================================= */

function createSummaryRows() {

    const groupedRecords = {};


    filteredReportData.forEach(alumni => {

        const key =
            `${alumni.batch}-${alumni.program}`;


        if (!groupedRecords[key]) {

            groupedRecords[key] = {

                batch:
                    alumni.batch,

                program:
                    alumni.program,

                total:
                    0,

                verified:
                    0,

                employed:
                    0

            };

        }


        groupedRecords[key].total +=
            1;


        if (alumni.verified) {

            groupedRecords[key].verified +=
                1;

        }


        if (
            alumni.employment === "Employed" ||
            alumni.employment === "Self-employed"
        ) {

            groupedRecords[key].employed +=
                1;

        }

    });


    return Object.values(
        groupedRecords
    ).sort(
        (first, second) => {

            if (
                first.batch !== second.batch
            ) {

                return second.batch -
                    first.batch;

            }


            return first.program.localeCompare(
                second.program
            );

        }
    );

}


function renderSummaryTable() {

    const tableBody =
        document.getElementById(
            "reportSummaryTableBody"
        );


    const tableWrapper =
        document.querySelector(
            ".report-table-wrapper"
        );


    const emptyState =
        document.getElementById(
            "reportTableEmptyState"
        );


    const summaryRows =
        createSummaryRows();


    tableBody.innerHTML =
        "";


    document
        .getElementById("reportSummaryText")
        .textContent =
        `Showing ${filteredReportData.length} filtered alumni ${
            filteredReportData.length === 1
                ? "record"
                : "records"
        }.`;


    if (summaryRows.length === 0) {

        tableWrapper.classList.add(
            "hidden"
        );


        emptyState.classList.remove(
            "hidden"
        );


        return;

    }


    tableWrapper.classList.remove(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    summaryRows.forEach(row => {

        const employmentRate =
            calculatePercentage(
                row.employed,
                row.total
            );


        const tableRow =
            document.createElement("tr");


        tableRow.innerHTML = `

            <td>
                ${row.batch}
            </td>

            <td>

                <div class="report-table-program">

                    <div class="report-program-icon">
                        <i class="bx bx-book-open"></i>
                    </div>

                    <span>
                        ${row.program}
                    </span>

                </div>

            </td>

            <td>
                ${row.total}
            </td>

            <td>
                ${row.verified}
            </td>

            <td>
                ${row.employed}
            </td>

            <td class="report-rate-cell">

                <div class="report-rate-top">

                    <span>
                        Employment
                    </span>

                    <strong>
                        ${employmentRate}%
                    </strong>

                </div>

                <div class="report-rate-track">

                    <div
                        class="report-rate-fill"
                        style="width: ${employmentRate}%"
                    ></div>

                </div>

            </td>

        `;


        tableBody.appendChild(
            tableRow
        );

    });

}


/* =========================================================
   FILTER REPORT
========================================================= */

function applyFilters() {

    const fromDate =
        reportFromDate.value;


    const toDate =
        reportToDate.value;


    const batch =
        reportBatchFilter.value;


    const program =
        reportProgramFilter.value;


    const employment =
        reportEmploymentFilter.value;


    if (
        fromDate &&
        toDate &&
        fromDate > toDate
    ) {

        showReportToast(
            "From Date cannot be later than To Date."
        );


        return;

    }


    filteredReportData =
        alumniReportData.filter(alumni => {

            const matchesFromDate =
                !fromDate ||
                alumni.registeredDate >=
                    fromDate;


            const matchesToDate =
                !toDate ||
                alumni.registeredDate <=
                    toDate;


            const matchesBatch =
                batch === "all" ||
                alumni.batch ===
                    Number(batch);


            const matchesProgram =
                program === "all" ||
                alumni.program ===
                    program;


            const matchesEmployment =
                employment === "all" ||
                alumni.employment ===
                    employment;


            return (
                matchesFromDate &&
                matchesToDate &&
                matchesBatch &&
                matchesProgram &&
                matchesEmployment
            );

        });


    refreshReportPage();


    showReportToast(
        `${filteredReportData.length} report records found.`
    );

}


function resetFilters() {

    reportFromDate.value =
        "";


    reportToDate.value =
        "";


    reportBatchFilter.value =
        "all";


    reportProgramFilter.value =
        "all";


    reportEmploymentFilter.value =
        "all";


    filteredReportData = [
        ...alumniReportData
    ];


    refreshReportPage();


    showReportToast(
        "Report filters reset."
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshReportPage() {

    updateReportStatistics();

    renderAllCharts();

    renderSummaryTable();

}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportReportAsCSV(
    fileName = "alumnihub-report"
) {

    if (
        filteredReportData.length === 0
    ) {

        showReportToast(
            "There are no records to export."
        );


        return;

    }


    const headings = [

        "ID",
        "Batch",
        "Program",
        "Gender",
        "Employment Status",
        "Verified",
        "Registered Date"

    ];


    const rows =
        filteredReportData.map(
            alumni => [

                alumni.id,
                alumni.batch,
                alumni.program,
                alumni.gender,
                alumni.employment,
                alumni.verified
                    ? "Yes"
                    : "No",
                alumni.registeredDate

            ]
        );


    const csvContent =
        [
            headings,
            ...rows
        ]
            .map(row =>
                row
                    .map(value =>
                        `"${String(value)
                            .replaceAll(
                                '"',
                                '""'
                            )}"`
                    )
                    .join(",")
            )
            .join("\n");


    const file =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const link =
        document.createElement("a");


    const url =
        URL.createObjectURL(file);


    link.href =
        url;


    link.download =
        `${fileName}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(url);


    showReportToast(
        "CSV report downloaded successfully."
    );

}


/* =========================================================
   PDF / PRINT
========================================================= */

function printReport() {

    if (
        filteredReportData.length === 0
    ) {

        showReportToast(
            "There are no records to print."
        );


        return;

    }


    window.print();

}


function exportReportAsPdf() {

    showReportToast(
        "Choose Save as PDF in the print window."
    );


    setTimeout(
        function () {

            window.print();

        },
        350
    );

}


/* =========================================================
   MODALS
========================================================= */

function openModal(modal) {

    modal.classList.add("show");


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal.classList.remove("show");


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   GENERATED REPORTS
========================================================= */

function generateReport() {

    const reportType =
        document
            .getElementById(
                "generatedReportType"
            )
            .value;


    const customName =
        document
            .getElementById(
                "generatedReportName"
            )
            .value
            .trim();


    const format =
        document
            .getElementById(
                "generatedReportFormat"
            )
            .value;


    const currentUser =
        getStoredUserName();


    const report = {

        id:
            Date.now(),

        name:
            customName ||
            reportType,

        type:
            reportType,

        format,

        recordCount:
            filteredReportData.length,

        generatedBy:
            currentUser,

        generatedAt:
            new Date()

    };


    generatedReports.unshift(
        report
    );


    closeModal(
        generateReportModal
    );


    document
        .getElementById(
            "generatedReportName"
        )
        .value =
        "";


    renderRecentReports();

    updateReportStatistics();


    showReportToast(
        "Report generated successfully."
    );


    if (format === "CSV") {

        exportReportAsCSV(
            createSafeFileName(
                report.name
            )
        );

    }


    if (format === "PDF") {

        exportReportAsPdf();

    }


    if (format === "Print") {

        printReport();

    }

}


function createSafeFileName(value) {

    return value
        .toLowerCase()
        .trim()
        .replaceAll(
            /[^a-z0-9]+/g,
            "-"
        )
        .replaceAll(
            /^-|-$/g,
            ""
        ) ||
        "alumnihub-report";

}


function renderRecentReports() {

    const container =
        document.getElementById(
            "recentReportsContainer"
        );


    const emptyState =
        document.getElementById(
            "recentReportsEmptyState"
        );


    container.innerHTML =
        "";


    document
        .getElementById("recentReportCount")
        .textContent =
        `${generatedReports.length} ${
            generatedReports.length === 1
                ? "report"
                : "reports"
        }`;


    if (
        generatedReports.length === 0
    ) {

        container.classList.add(
            "hidden"
        );


        emptyState.classList.remove(
            "hidden"
        );


        return;

    }


    container.classList.remove(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    generatedReports.forEach(report => {

        const item =
            document.createElement("article");


        item.className =
            "recent-report-item";


        item.innerHTML = `

            <div class="recent-report-main">

                <div class="recent-report-icon">
                    <i class="bx bx-file"></i>
                </div>

                <div class="recent-report-information">

                    <strong>
                        ${escapeHTML(report.name)}
                    </strong>

                    <span>

                        ${formatGeneratedDate(
                            report.generatedAt
                        )}

                        • ${report.recordCount} records

                        • ${escapeHTML(
                            report.generatedBy
                        )}

                    </span>

                </div>

            </div>


            <div class="recent-report-actions">

                <span class="recent-report-format">
                    ${escapeHTML(report.format)}
                </span>

                <button
                    class="recent-report-download"
                    data-report-id="${report.id}"
                    type="button"
                    title="Download report"
                >
                    <i class="bx bx-download"></i>
                </button>

            </div>

        `;


        container.appendChild(
            item
        );

    });

}


function downloadGeneratedReport(reportId) {

    const report =
        generatedReports.find(
            item =>
                item.id === reportId
        );


    if (!report) {

        return;

    }


    if (report.format === "CSV") {

        exportReportAsCSV(
            createSafeFileName(
                report.name
            )
        );

        return;

    }


    if (report.format === "PDF") {

        exportReportAsPdf();

        return;

    }


    printReport();

}


/* =========================================================
   USER
========================================================= */

function getStoredUserName() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );


        if (!user) {

            return "Administrator";

        }


        return [

            user.first_name,
            user.last_name

        ]
            .filter(Boolean)
            .join(" ") ||
            "Administrator";

    } catch (error) {

        return "Administrator";

    }

}


function loadCurrentUser() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );


        if (!user) {

            return;

        }


        const fullName =
            [
                user.first_name,
                user.last_name
            ]
                .filter(Boolean)
                .join(" ");


        const initials =
            [
                user.first_name,
                user.last_name
            ]
                .filter(Boolean)
                .map(name =>
                    name.charAt(0).toUpperCase()
                )
                .join("") ||
            "A";


        document
            .getElementById("sidebarName")
            .textContent =
            fullName ||
            "Administrator";


        document
            .getElementById("sidebarEmail")
            .textContent =
            user.email ||
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
            "Unable to load user:",
            error
        );

    }

}


/* =========================================================
   FORMATTERS
========================================================= */

function formatGeneratedDate(date) {

    return new Intl.DateTimeFormat(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);

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
   TOAST
========================================================= */

let reportToastTimer;


function showReportToast(message) {

    const toast =
        document.getElementById(
            "reportToast"
        );


    document
        .getElementById(
            "reportToastMessage"
        )
        .textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        reportToastTimer
    );


    reportToastTimer =
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
   EVENT LISTENERS
========================================================= */

document
    .getElementById("applyReportFilters")
    .addEventListener(
        "click",
        applyFilters
    );


document
    .getElementById("resetReportFilters")
    .addEventListener(
        "click",
        resetFilters
    );


document
    .getElementById("generateReportButton")
    .addEventListener(
        "click",
        function () {

            openModal(
                generateReportModal
            );

        }
    );


document
    .getElementById("confirmGenerateReport")
    .addEventListener(
        "click",
        generateReport
    );


document
    .getElementById("exportExcelButton")
    .addEventListener(
        "click",
        function () {

            exportReportAsCSV();

        }
    );


document
    .getElementById("exportPdfButton")
    .addEventListener(
        "click",
        exportReportAsPdf
    );


document
    .getElementById("printReportButton")
    .addEventListener(
        "click",
        printReport
    );


document
    .getElementById("recentReportsContainer")
    .addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-report-id]"
                );


            if (!button) {

                return;

            }


            downloadGeneratedReport(
                Number(
                    button.dataset.reportId
                )
            );

        }
    );


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const modal =
                    document.getElementById(
                        button.dataset.closeModal
                    );


                if (modal) {

                    closeModal(modal);

                }

            }
        );

    });


document
    .querySelectorAll(
        ".reports-modal-backdrop"
    )
    .forEach(backdrop => {

        backdrop.addEventListener(
            "click",
            function () {

                const modal =
                    backdrop.closest(
                        ".reports-modal"
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
                ".reports-modal.show"
            )
            .forEach(closeModal);

    }
);


/* =========================================================
   DARK MODE CHART REFRESH
========================================================= */

const themeObserver =
    new MutationObserver(
        function () {

            renderAllCharts();

        }
    );


themeObserver.observe(
    document.body,
    {
        attributes: true,
        attributeFilter: [
            "class"
        ]
    }
);


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

loadFilterOptions();

loadCurrentUser();

renderRecentReports();

refreshReportPage();
// ==========================================
// ADMIN BREADCRUMB → DASHBOARD
// ==========================================

const adminBreadcrumb =
    document.getElementById("adminBreadcrumb");

if (adminBreadcrumb) {

    adminBreadcrumb.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "dashboard.html";

        }
    );

}