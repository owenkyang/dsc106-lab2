import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title'); 


if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

renderProjects(projects, projectsContainer, 'h2');
let selectedIndex = -1;
function renderPieChart(projectsGiven) {

    d3.select('svg').selectAll('*').remove();
    d3.select('.legend').selectAll('*').remove();


    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    arcs.forEach((arc, idx) => {
        d3.select('svg')
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(idx));
    });

    let legend = d3.select('.legend')
        .style('display', 'grid')
        .style('grid-template-columns', 'repeat(auto-fill, minmax(9em, 1fr))');

    data.forEach((d, idx) => {
        legend.append('li')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '0.3em')
            .html(`<span class="swatch" style="background-color:${colors(idx)};"></span> ${d.label} <em>(${d.value})</em>`);
    });
    let svg = d3.select('svg');
    svg.selectAll('path').remove();

    arcs.forEach((arc, i) => {
        svg
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(i))
          .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
      
            svg.selectAll('path')
               .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
            

            legend.selectAll('li')
                  .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      
            if (selectedIndex === -1) {
              renderProjects(projectsGiven, projectsContainer, 'h2');
            } else {
              const clickedYear = data[selectedIndex].label;
              const filteredProjects = projectsGiven.filter(
                (proj) => proj.year === clickedYear
              );
              renderProjects(filteredProjects, projectsContainer, 'h2'); // this line needs to be changed
            }
          });
      });
}


renderPieChart(projects);


let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects); // this line needs to be changed
});

