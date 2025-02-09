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



export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {

            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
 
        throw error;
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error("Invalid container element provided for rendering projects.");
        return;
    }

    containerElement.innerHTML = '';

    if (!projects || projects.length === 0) {
        containerElement.innerHTML = '<p>No projects available. Check back later!</p>';
        return;
    }

    projects.forEach(project => {
        let article = document.createElement('article');

        let heading = document.createElement(headingLevel);
        heading.textContent = project.title;

        let image = document.createElement('img');
        image.src = project.image;
        image.alt = project.title;

        let description = document.createElement('p');
        description.textContent = project.description;

        let year = document.createElement('p');
        year.textContent = `c. ${project.year}`;
        year.style.fontStyle = 'italic';  // Italicize year like in the example

        let contentWrapper = document.createElement('div'); 
        contentWrapper.append(description, year); // Wrap description and year together

        article.append(heading, image, contentWrapper);
        containerElement.appendChild(article);
    });
}
export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}
