let data = [];
let xScale, yScale;
let commits = d3.groups(data, (d) => d.commit);
function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: false, 
          configurable: false, 
          enumerable: false,
        });
  
        return ret;
      });
  }
function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    const totalLinesAdded = d3.sum(data, d => d.length);
    const fileLengths = d3.rollups(data, v => v.length, d => d.file);
    const maxFileLength = d3.max(fileLengths, d => d[1]);
    dl.append('dt').text('Max file length');
    dl.append('dd').text(maxFileLength);

    const uniqueFiles = d3.rollups(data, v => v.length, d => d.file).length;
    dl.append('dt').text('Total files');
    dl.append('dd').text(uniqueFiles);
    const avgLinesPerCommit = (data.length / commits.length).toFixed(2);
    dl.append('dt').text('Average lines per commit');
    dl.append('dd').text(avgLinesPerCommit);

    
  }


  function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
    const time = document.getElementById('commit-time');

    if (!commit || Object.keys(commit).length === 0) {
        // Clear tooltip content when hovering off
        
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });

    // Update author
    if (author) {
        author.textContent = commit.author || 'Unknown';
    }

    // Update total lines
    if (lines) {
        lines.textContent = d3.sum(commit.lines, d => d.length) || 0;
    }

    // Update commit time
    if (time) {
        time.textContent = commit.time || 'Unknown time';
    }
}
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }
  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

function drawScatterPlot() {
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([10, 20]);
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
    
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);
   const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  const dots = svg.append('g').attr('class', 'dots');


    dots
    .selectAll('circle').data(sortedCommits).join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget).style('fill-opacity', 1);
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipContent({}); // Clear tooltip content
        updateTooltipVisibility(false);
    });
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
    
    // Add Y axis
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);

}
let brushSelection = null;


function isCommitSelected(commit) {
    if (!brushSelection) return false; const min = { x: brushSelection[0][0], y: brushSelection[0][1] }; 
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] }; const x = xScale(commit.date); 
    const y = yScale(commit.hourFrac); 
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}
function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }
function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}
function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }
function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),

    }));
    
    displayStats();
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  drawScatterPlot();
  brushSelector();
});
