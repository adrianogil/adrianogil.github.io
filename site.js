const themeToggle = document.querySelector('[data-theme-toggle]');
const copyButtons = document.querySelectorAll('[data-copy-button]');
const sidebar = document.querySelector('#sidebar');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarBackdrop = document.querySelector('[data-sidebar-close]');
const pageWrap = document.querySelector('.wrap');
const videoFacades = document.querySelectorAll('[data-youtube-id]');
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const startingTheme = storedTheme || (prefersDark ? 'dark' : 'light');

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', theme === 'dark');
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? themeToggle.dataset.lightLabel : themeToggle.dataset.darkLabel
    );
  }
  localStorage.setItem('theme', theme);
};

setTheme(startingTheme);

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

const sidebarFocusableElements = () => {
  if (!sidebar || !sidebarToggle) return [];
  const elements = [
    sidebarToggle,
    ...sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ];
  return elements.filter((element) => !element.hasAttribute('hidden'));
};

const setSidebarOpen = (isOpen, { restoreFocus = true } = {}) => {
  if (!sidebar || !sidebarToggle) return;
  document.body.classList.toggle('sidebar-open', isOpen);
  sidebarToggle.setAttribute('aria-expanded', String(isOpen));
  sidebarToggle.setAttribute(
    'aria-label',
    isOpen ? sidebarToggle.dataset.closeLabel : sidebarToggle.dataset.openLabel
  );
  sidebar.setAttribute('aria-hidden', String(!isOpen));
  if (sidebarBackdrop) {
    sidebarBackdrop.disabled = !isOpen;
    sidebarBackdrop.setAttribute('aria-hidden', String(!isOpen));
  }
  if (pageWrap) {
    pageWrap.inert = isOpen;
    if (isOpen) {
      pageWrap.setAttribute('aria-hidden', 'true');
    } else {
      pageWrap.removeAttribute('aria-hidden');
    }
  }

  if (isOpen) {
    const firstSidebarControl = sidebar.querySelector('a[href], button:not([disabled])');
    firstSidebarControl?.focus();
  } else if (restoreFocus) {
    sidebarToggle.focus();
  }
};

sidebarToggle?.addEventListener('click', () => {
  setSidebarOpen(!document.body.classList.contains('sidebar-open'));
});

sidebarBackdrop?.addEventListener('click', () => setSidebarOpen(false));

sidebar?.addEventListener('click', (event) => {
  if (event.target.closest('a[href]')) {
    setSidebarOpen(false, { restoreFocus: false });
  }
});

document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('sidebar-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setSidebarOpen(false);
    return;
  }
  if (event.key !== 'Tab') return;

  const focusable = sidebarFocusableElements();
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

videoFacades.forEach((facade) => {
  facade.addEventListener('click', () => {
    const videoId = facade.dataset.youtubeId || '';
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    iframe.title = facade.dataset.videoTitle || 'YouTube video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    facade.replaceWith(iframe);
    iframe.focus();
  });
});

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block')?.querySelector('code');
    if (!code) return;
    const text = code.innerText.replace(/\\n$/, '');
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = document.body.dataset.copiedLabel || 'Copied';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = document.body.dataset.copyLabel || 'Copy';
        button.classList.remove('copied');
      }, 2000);
    } catch (error) {
      button.textContent = document.body.dataset.copyFailedLabel || 'Copy failed';
    }
  });
});
