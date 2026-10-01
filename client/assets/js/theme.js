/* =====================================================
   ALUMNIHUB GLOBAL THEME
===================================================== */

const THEME_STORAGE_KEY = "theme";

const DARK_CLASSES = [
    "dark",
    "dark-mode"
];


/* =====================================================
   GET INITIAL THEME
===================================================== */

function getInitialTheme() {

    const savedTheme =
        localStorage.getItem(THEME_STORAGE_KEY);


    if (
        savedTheme === "dark" ||
        savedTheme === "light"
    ) {
        return savedTheme;
    }


    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    return prefersDark
        ? "dark"
        : "light";
}


/* =====================================================
   CHECK CURRENT THEME
===================================================== */

function isDarkMode() {

    return DARK_CLASSES.some(
        className =>
            document.body.classList.contains(className)
    );

}


/* =====================================================
   APPLY THEME
===================================================== */

function applyTheme(theme) {

    const useDarkMode =
        theme === "dark";


    DARK_CLASSES.forEach(
        className => {

            document.body.classList.toggle(
                className,
                useDarkMode
            );

        }
    );


    localStorage.setItem(
        THEME_STORAGE_KEY,
        theme
    );


    updateThemeIcon();


    document.dispatchEvent(
        new CustomEvent(
            "themeChanged",
            {
                detail: {
                    theme
                }
            }
        )
    );

}


/* =====================================================
   UPDATE ICON
===================================================== */

function updateThemeIcon() {

    const themeToggle =
        document.getElementById("themeToggle");


    if (!themeToggle) {
        return;
    }


    const icon =
        themeToggle.querySelector("i");


    if (!icon) {
        return;
    }


    const darkModeActive =
        isDarkMode();


    icon.className = darkModeActive
        ? "bx bx-sun"
        : "bx bx-moon";


    const label = darkModeActive
        ? "Switch to light mode"
        : "Switch to dark mode";


    themeToggle.setAttribute(
        "aria-label",
        label
    );


    themeToggle.setAttribute(
        "title",
        label
    );

}


/* =====================================================
   INITIALIZE THEME
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const initialTheme =
            getInitialTheme();


        applyTheme(initialTheme);


        const themeToggle =
            document.getElementById(
                "themeToggle"
            );


        if (!themeToggle) {
            return;
        }


        themeToggle.addEventListener(
            "click",
            function () {

                const nextTheme =
                    isDarkMode()
                        ? "light"
                        : "dark";


                applyTheme(nextTheme);

            }
        );

    }
);