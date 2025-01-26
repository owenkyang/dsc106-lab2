console.log("IT’S ALIVE!");

// Define an array of pages
let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "contact/", title: "Contact" },
    { url: "https://github.com/owenkyang", title: "GitHub" },
    { url: "resume/", title: "Resume" },
];

// Create a <nav> element and prepend it to the <body>
let nav = document.createElement("nav");
document.body.prepend(nav);

// Detect if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains("home");

// Loop through the pages array and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust URL for relative paths if not on the homepage
    if (!ARE_WE_HOME && !url.startsWith("http")) {
        url = "../" + url;
    }

    // Create an <a> element
    let a = document.createElement("a");
    a.href = url;
    a.textContent = title;

    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = "_blank";
    }

    // Append the link to the <nav>
    nav.append(a);
}
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme:
        <select id="theme-switch">
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
    `
);

// Reference the <select> element
const themeSwitch = document.querySelector('#theme-switch');

// Function to set the color scheme
function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    localStorage.setItem('colorScheme', colorScheme); // Save preference to localStorage
    themeSwitch.value = colorScheme; // Update the dropdown to reflect the saved value
}

// Event listener for theme changes
themeSwitch.addEventListener('input', (event) => {
    const selectedTheme = event.target.value;
    setColorScheme(selectedTheme);
});

// On page load, apply the saved theme or default to 'auto'
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('colorScheme') || 'auto';
    setColorScheme(savedTheme); // Apply the saved theme
});
