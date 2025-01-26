console.log("IT’S ALIVE!");

let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "contact/", title: "Contact" },
    { url: "https://github.com/owenkyang", title: "GitHub" },
    { url: "resume/", title: "Resume" },
];

let nav = document.createElement("nav");
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains("home");

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    if (!ARE_WE_HOME && !url.startsWith("http")) {
        url = "../" + url;
    }

    let a = document.createElement("a");
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    if (a.host !== location.host) {
        a.target = "_blank";
    }

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

const themeSwitch = document.querySelector('#theme-switch');


function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    localStorage.setItem('colorScheme', colorScheme); 
    themeSwitch.value = colorScheme; 
}

themeSwitch.addEventListener('input', (event) => {
    const selectedTheme = event.target.value;
    setColorScheme(selectedTheme);
});


document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('colorScheme') || 'auto';
    setColorScheme(savedTheme);
});
