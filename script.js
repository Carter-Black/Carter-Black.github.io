// cursor
const cursor = document.getElementById('cursor');
let inspectorEnabled = false;

const cursorArrowBaseAngle = 90;
const cursorHandBaseAngle = 0;
const cursorScrollRotateEase = 0.045;
const cursorScrollUpAngle = 0;
const cursorScrollDownAngle = 180;

let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let curX = mouseX, curY = mouseY;
let currentAngle = cursorArrowBaseAngle;
let lastMouseX = mouseX;
let lastMouseY = mouseY;
let cursorMode = 'arrow';
let cursorHotspotX = 4;
let cursorHotspotY = 4;
let scrollAngle = cursorArrowBaseAngle;
let scrollAnimating = false;
let lastScrollY = window.scrollY;
const cursorFollowSpeed = 0.06;
const cursorRotateDeadZone = 1.5;
const cursorRotateNearRadius = 26;
const cursorRotateFarRadius = 120;
const cursorRotateNearLerp = 0.16;
const cursorRotateFarLerp = 0.25;
const cursorRotateNearMaxStep = 10;
const cursorRotateFarMaxStep = 22;

function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
}

function getShortestAngleDiff(from, to) {
  return normalizeAngle(to - from);
}

function updateCursorMode(target) {
  const interactiveTarget = target?.closest('a, button, .btn');
  const nextMode = (inspectorEnabled || interactiveTarget) ? 'hand' : 'arrow';
  if (nextMode === cursorMode) return;
  cursorMode = nextMode;
  if (cursorMode === 'hand') {
    setCursorHand();
  } else {
    setCursorArrow();
  }
}

document.addEventListener('mousemove', (e) => {
  scrollAnimating = false;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lagX = e.clientX - curX;
  const lagY = e.clientY - curY;
  const cursorLag = Math.hypot(lagX, lagY);
  const shouldRotateArrow = cursorMode === 'arrow' && cursorLag > cursorRotateDeadZone;

  if (shouldRotateArrow) {
    const rotateBlend = Math.max(
      0,
      Math.min(1, (cursorLag - cursorRotateNearRadius) / (cursorRotateFarRadius - cursorRotateNearRadius))
    );
    const rotateLerp = cursorRotateNearLerp + (cursorRotateFarLerp - cursorRotateNearLerp) * rotateBlend;
    const rotateMaxStep = cursorRotateNearMaxStep + (cursorRotateFarMaxStep - cursorRotateNearMaxStep) * rotateBlend;
    const targetAngle = Math.atan2(lagY, lagX) * (180 / Math.PI) + cursorArrowBaseAngle;
    const angleDiff = getShortestAngleDiff(currentAngle, targetAngle);
    const limitedAngleDiff = Math.max(-rotateMaxStep, Math.min(rotateMaxStep, angleDiff));
    currentAngle += limitedAngleDiff * rotateLerp;
    currentAngle = normalizeAngle(currentAngle);
  } else if (cursorMode === 'hand') {
    currentAngle += getShortestAngleDiff(currentAngle, cursorHandBaseAngle) * 0.18;
    currentAngle = normalizeAngle(currentAngle);
  } else if (dist <= cursorRotateDeadZone) {
    currentAngle += getShortestAngleDiff(currentAngle, cursorArrowBaseAngle) * 0.08;
    currentAngle = normalizeAngle(currentAngle);
  }

  mouseX = e.clientX;
  mouseY = e.clientY;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  updateCursorMode(e.target);
});

window.addEventListener('blur', () => {
  updateCursorMode(null);
});

document.addEventListener('mouseleave', () => {
  updateCursorMode(null);
});

window.addEventListener('scroll', () => {
  const nextScrollY = window.scrollY;
  const scrollDelta = nextScrollY - lastScrollY;
  lastScrollY = nextScrollY;

  if (!scrollDelta || cursorMode !== 'arrow') return;
  scrollAngle = scrollDelta > 0 ? cursorScrollDownAngle : cursorScrollUpAngle;
  scrollAnimating = true;
});

function animateCursor() {
  updateCursorMode(document.elementFromPoint(mouseX, mouseY));
  curX += (mouseX - curX) * cursorFollowSpeed;
  curY += (mouseY - curY) * cursorFollowSpeed;
  if (scrollAnimating && cursorMode === 'arrow') {
    currentAngle += getShortestAngleDiff(currentAngle, scrollAngle) * cursorScrollRotateEase;
    currentAngle = normalizeAngle(currentAngle);
    if (Math.abs(getShortestAngleDiff(currentAngle, scrollAngle)) < 0.6) {
      currentAngle = scrollAngle;
      scrollAnimating = false;
    }
  }
  cursor.style.left = curX + 'px';
  cursor.style.top = curY + 'px';
  cursor.style.transform = `translate(${-cursorHotspotX}px, ${-cursorHotspotY}px) rotate(${currentAngle}deg)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

function setCursorHand() {
  cursor.style.backgroundImage = "url('assets/green_hand.png')";
  cursor.style.width = '40px';
  cursor.style.height = '40px';
  cursorHotspotX = 18;
  cursorHotspotY = 4;
  cursor.style.transformOrigin = `${cursorHotspotX}px ${cursorHotspotY}px`;
}

function setCursorArrow() {
  cursor.style.backgroundImage = "url('assets/green_cursor.png')";
  cursor.style.width = '32px';
  cursor.style.height = '32px';
  cursorHotspotX = 4;
  cursorHotspotY = 4;
  cursor.style.transformOrigin = `${cursorHotspotX}px ${cursorHotspotY}px`;
}

setCursorArrow();

// event delegation — handles dynamically created elements (e.g. project links)
// typewriter
// Add your titles below — they cycle with a typing animation
// Example: 'cs student @ csuf'
const titles = [
  'CS @ CSUF',
  'class of 2028',
  'ML/AI',
  'Full Stack',
  'Incorperating AI into code',
  'Working on a future-proof workflow',
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const titleEl = document.querySelector('.me-title');

function typeWriter() {
  if (titles.length === 0) return;
  const current = titles[titleIndex];
  if (isDeleting) {
    titleEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    titleEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    setTimeout(typeWriter, 1500);
    return;
  }
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    titleIndex = (titleIndex + 1) % titles.length;
  }
  setTimeout(typeWriter, isDeleting ? 50 : 100);
}
typeWriter();

// skills
// Add skills as objects: { name: 'Skill', desc: 'What you can do / your experience' }
// Example: { name: 'Python', desc: 'Built ML pipelines, scraped data, automated workflows' }
const skills = [
  { name: 'Python', desc: '' },
  { name: 'C++', desc: '' },
  { name: 'JavaScript', desc: '' },
  { name: 'Microsoft Suite', desc: '' },
  { name: 'Lua', desc: '' },
  { name: 'Full Stack Development', desc: '' },
  { name: 'Basic ML/AI Theory', desc: '' },
  { name: 'Working in 3D space', desc: '' },
  { name: 'Team Environments', desc: '' },
];

const skillsGrid = document.querySelector('.skills-grid');

if (skillsGrid) {
  skills.forEach(skill => {
    const tag = document.createElement('div');
    tag.classList.add('skill-tag');
    tag.innerHTML = `
      <span class="skill-name">${skill.name}</span>
      ${skill.desc ? `<span class="skill-desc">${skill.desc}</span>` : ''}
    `;
    skillsGrid.appendChild(tag);
  });
}

document.querySelectorAll('.about-text p').forEach(paragraph => {
  if (!paragraph.textContent.trim()) {
    paragraph.remove();
  }
});

const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
  aboutStats.querySelectorAll('.stat').forEach(stat => {
    const number = stat.querySelector('.stat-num')?.textContent.trim();
    const label = stat.querySelector('.stat-label')?.textContent.trim();
    if (!number && !label) {
      stat.remove();
    }
  });

  if (!aboutStats.children.length) {
    aboutStats.remove();
  }
}

// github projects
const username = 'Carter-Black';
const projectsGrid = document.getElementById('projects-grid');
const githubProfileUrl = `https://github.com/${username}?tab=repositories`;
const projectCacheKey = `github-projects-${username}`;

function cacheProjects(repos) {
  try {
    const cachedRepos = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
    }));
    localStorage.setItem(projectCacheKey, JSON.stringify(cachedRepos));
  } catch {
    // ignore storage failures so project rendering stays resilient
  }
}

function readCachedProjects() {
  try {
    const cached = JSON.parse(localStorage.getItem(projectCacheKey) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function renderProjectsFallback(message) {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = `
    <div class="project-card">
      <h3>github projects unavailable</h3>
      <p>${message}</p>
      <a class="project-link" href="${githubProfileUrl}" target="_blank" rel="noopener noreferrer">view github profile -></a>
    </div>
  `;
}

fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Could not reach GitHub.');
    }
    if (!Array.isArray(data)) {
      throw new Error('GitHub returned an unexpected response.');
    }
    return data;
  })
  .then(repos => {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    cacheProjects(repos);
    repos.forEach(repo => {
      const repoUrl = repo.html_url || `https://github.com/${username}/${repo.name}`;
      const card = document.createElement('div');
      card.classList.add('project-card');
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'no description provided'}</p>
        <a href="${repo.html_url}" target="_blank">view on github →</a>
      `;
      const projectLink = card.querySelector('a');
      if (projectLink) {
        projectLink.classList.add('project-link');
        projectLink.href = repoUrl;
        projectLink.rel = 'noopener noreferrer';
        projectLink.setAttribute('aria-label', `View ${repo.name} on GitHub`);
        projectLink.textContent = 'view on github ->';
      }
      projectsGrid.appendChild(card);
    });
  })
  .catch((error) => {
    const cachedRepos = readCachedProjects();
    if (cachedRepos.length) {
      if (!projectsGrid) return;
      projectsGrid.innerHTML = '';
      cachedRepos.forEach(repo => {
        const repoUrl = repo.html_url || `https://github.com/${username}/${repo.name}`;
        const card = document.createElement('div');
        card.classList.add('project-card');
        card.innerHTML = `
          <h3>${repo.name}</h3>
          <p>${repo.description || 'no description provided'}</p>
          <a href="${repoUrl}" target="_blank">view on github -></a>
        `;
        const projectLink = card.querySelector('a');
        if (projectLink) {
          projectLink.classList.add('project-link');
          projectLink.rel = 'noopener noreferrer';
          projectLink.setAttribute('aria-label', `View ${repo.name} on GitHub`);
        }
        projectsGrid.appendChild(card);
      });
      return;
    }

    const isRateLimited = /rate limit/i.test(error.message);
    renderProjectsFallback(
      isRateLimited
        ? 'GitHub API rate limit hit for now. Your repositories are still on GitHub, and this will recover once the limit resets.'
        : 'Could not load projects right now. You can still browse everything directly on GitHub.'
    );
  });

// background canvas
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const spacing = 40;
const dotRadius = 1;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cursorX = curX;
  const cursorY = curY;

  for (let x = 0; x < canvas.width; x += spacing) {
    for (let y = 0; y < canvas.height; y += spacing) {
      const dx = cursorX - x;
      const dy = cursorY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;
      let alpha = 0.15;
      let radius = dotRadius;
      if (dist < maxDist) {
        alpha = 0.15 + (1 - dist / maxDist) * 0.6;
        radius = dotRadius + (1 - dist / maxDist) * 3;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      ctx.fill();
    }
  }
  requestAnimationFrame(drawGrid);
}
drawGrid();

// console overlay
const consoleLeft = document.getElementById('consoleLeft');
const consoleRight = document.getElementById('consoleRight');

if (consoleLeft && consoleRight) {
const codeLines = [
  `<span class="comment">// initializing portfolio...</span>`,
  `<span class="keyword">const</span> dev = <span class="string">"Carter Black"</span>;`,
  `<span class="keyword">let</span> skills = [<span class="string">"AI/ML"</span>, <span class="string">"C++"</span>];`,
  `<span class="fn">fetchProjects</span>(<span class="string">"Carter-Black"</span>);`,
  `<span class="comment">// rendering components...</span>`,
  `<span class="keyword">if</span> (coffee > <span class="num">0</span>) { code(); }`,
  `<span class="fn">console</span>.log(<span class="string">"hello world"</span>);`,
  `<span class="keyword">return</span> <span class="fn">Portfolio</span>();`,
  `<span class="comment">// loading github api...</span>`,
  `<span class="keyword">async function</span> <span class="fn">init</span>() {`,
  `  <span class="keyword">await</span> <span class="fn">loadRepos</span>();`,
  `  <span class="fn">renderSkills</span>(skills);`,
  `}`,
  `<span class="keyword">const</span> status = <span class="string">"online"</span>;`,
  `<span class="comment">// build complete ✓</span>`,
  `<span class="fn">animate</span>(<span class="num">60</span>);`,
  `<span class="keyword">export default</span> <span class="fn">App</span>;`,
  `<span class="keyword">let</span> x = Math.<span class="fn">random</span>();`,
  `<span class="fn">setInterval</span>(update, <span class="num">1000</span>);`,
];

let leftInterval = null;
let rightInterval = null;

function addLine(panel) {
  const line = document.createElement('div');
  line.classList.add('console-line');
  line.innerHTML = codeLines[Math.floor(Math.random() * codeLines.length)];
  panel.appendChild(line);
  while (panel.children.length > 30) panel.removeChild(panel.firstChild);
}

function showPanel(panel) {
  panel.classList.add('visible');
  return setInterval(() => addLine(panel), 200);
}

function hidePanel(panel, intervalRef) {
  panel.classList.remove('visible');
  clearInterval(intervalRef);
}

const edgeZone = 60;

document.addEventListener('mousemove', (e) => {
  const w = window.innerWidth;
  if (e.clientX < edgeZone) {
    if (!leftInterval) leftInterval = showPanel(consoleLeft);
  } else {
    if (leftInterval) { hidePanel(consoleLeft, leftInterval); leftInterval = null; }
  }
  if (e.clientX > w - edgeZone) {
    if (!rightInterval) rightInterval = showPanel(consoleRight);
  } else {
    if (rightInterval) { hidePanel(consoleRight, rightInterval); rightInterval = null; }
  }
});
}

// inspect helper banner
const inspectBanner = document.getElementById('inspectBanner');
const bannerQueue = [];
let bannerTypingTimeout = null;
let bannerHideTimeout = null;
let bannerLoopTimeout = null;
let bannerActive = false;

function loadFlag(key) {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function saveFlag(key) {
  try {
    localStorage.setItem(key, 'true');
  } catch {
    // ignore storage failures and keep the banner experience non-blocking
  }
}

function queueBannerMessage(message, hold = 2800) {
  bannerQueue.push({ message, hold });
  if (!bannerActive) showNextBannerMessage();
}

function showNextBannerMessage() {
  if (!bannerQueue.length) {
    bannerActive = false;
    inspectBanner.classList.remove('visible');
    inspectBanner.textContent = '';
    return;
  }

  bannerActive = true;
  clearTimeout(bannerTypingTimeout);
  clearTimeout(bannerHideTimeout);
  clearTimeout(bannerLoopTimeout);

  const { message, hold } = bannerQueue.shift();
  inspectBanner.textContent = '';
  inspectBanner.classList.add('visible');

  let index = 0;
  const typeNextCharacter = () => {
    inspectBanner.textContent = message.slice(0, index);
    index += 1;
    if (index <= message.length) {
      bannerTypingTimeout = setTimeout(typeNextCharacter, 18);
      return;
    }

    bannerHideTimeout = setTimeout(() => {
      inspectBanner.classList.remove('visible');
      bannerLoopTimeout = setTimeout(showNextBannerMessage, 240);
    }, hold);
  };

  typeNextCharacter();
}

queueBannerMessage('tip: toggle >_ inspect in the corner to live-edit the site.', 3800);

// inspect editor
const inspectToggle = document.getElementById('inspectToggle');
const inspectState = document.getElementById('inspectState');
const inspectEditor = document.getElementById('inspectEditor');
const inspectEditorTag = document.getElementById('inspectEditorTag');
const inspectEditorBody = document.getElementById('inspectEditorBody');
const inspectEditorClose = document.getElementById('inspectEditorClose');

const editableProps = [
  'color', 'background-color', 'font-size', 'font-weight',
  'padding', 'margin', 'border', 'border-radius',
  'opacity', 'letter-spacing', 'line-height',
];

let inspectedEl = null;
let hasShownInspectHint = loadFlag('inspectHintShown');

inspectToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (inspectorEnabled) {
    exitInspectMode();
  } else {
    inspectorEnabled = true;
    inspectState.textContent = 'ON';
    inspectToggle.classList.add('active');
    document.body.classList.add('inspect-mode');
    if (!hasShownInspectHint) {
      queueBannerMessage('inspect is on: try clicking any object on the page.', 3200);
      hasShownInspectHint = true;
      saveFlag('inspectHintShown');
    }
  }
  updateCursorMode(document.elementFromPoint(mouseX, mouseY));
});

inspectEditorClose.addEventListener('click', (e) => {
  e.stopPropagation();
  inspectEditor.classList.remove('visible');
  if (inspectedEl) {
    inspectedEl.classList.remove('inspect-highlight');
    inspectedEl = null;
  }
  updateCursorMode(document.elementFromPoint(mouseX, mouseY));
});

function exitInspectMode() {
  if (!inspectorEnabled) return;
  inspectorEnabled = false;
  inspectState.textContent = 'OFF';
  inspectToggle.classList.remove('active');
  document.body.classList.remove('inspect-mode');
  inspectEditor.classList.remove('visible');
  if (inspectedEl) {
    inspectedEl.classList.remove('inspect-highlight');
    inspectedEl = null;
  }
  updateCursorMode(document.elementFromPoint(mouseX, mouseY));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') exitInspectMode();
});

function openInspectEditor(el, clickX, clickY) {
  if (inspectedEl) inspectedEl.classList.remove('inspect-highlight');
  inspectedEl = el;
  el.classList.add('inspect-highlight');

  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.split(' ').filter(c => c !== 'inspect-highlight')[0]
    : '';
  inspectEditorTag.textContent = `> ${tag}${id || cls}`;

  const computed = getComputedStyle(el);
  inspectEditorBody.innerHTML = '';

  editableProps.forEach(prop => {
    const val = computed.getPropertyValue(prop).trim();
    const row = document.createElement('div');
    row.classList.add('ie-row');
    row.innerHTML = `
      <label class="ie-label">${prop}</label>
      <input class="ie-input" type="text" value="${val}" />
    `;
    const input = row.querySelector('.ie-input');
    input.addEventListener('input', () => {
      el.style.setProperty(prop, input.value);
    });
    inspectEditorBody.appendChild(row);
  });

  const resetBtn = document.createElement('button');
  resetBtn.classList.add('ie-reset');
  resetBtn.textContent = 'reset styles';
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editableProps.forEach(prop => el.style.removeProperty(prop));
    openInspectEditor(el, clickX, clickY);
  });
  inspectEditorBody.appendChild(resetBtn);

  const pad = 16;
  const ew = 300;
  let px = clickX + pad;
  let py = clickY + pad;
  if (px + ew > window.innerWidth) px = clickX - ew - pad;
  if (py + 500 > window.innerHeight) py = Math.max(10, window.innerHeight - 510);
  inspectEditor.style.left = px + 'px';
  inspectEditor.style.top = py + 'px';
  inspectEditor.classList.add('visible');
}

document.addEventListener('click', (e) => {
  if (!inspectorEnabled) return;
  if (inspectEditor.contains(e.target) || inspectToggle.contains(e.target)) return;
  e.preventDefault();
  openInspectEditor(e.target, e.clientX, e.clientY);
});
