/* ============================================================
   GoBlocks Documentation — main.js
   ============================================================ */
(function () {
  'use strict';

  /* ── Navigation Data ─────────────────────────────────────── */
  const NAV = [
    { title: 'Getting Started', items: [
      { id: 'index',          title: 'Introduction',        href: 'index.html' },
      { id: 'installation',   title: 'Installation',        href: 'installation.html' },
      { id: 'quick-start',    title: 'Quick Start',         href: 'quick-start.html' },
    ]},
    { title: 'Core Concepts', items: [
      { id: 'blocks',              title: 'Blocks Reference',    href: 'blocks.html' },
      { id: 'settings',            title: 'Settings',            href: 'settings.html' },
      { id: 'responsive-controls', title: 'Responsive Controls', href: 'responsive-controls.html' },
      { id: 'dynamic-content',     title: 'Dynamic Content',     href: 'dynamic-content.html' },
    ]},
    { title: 'Features', items: [
      { id: 'fse',           title: 'Full Site Editing', href: 'fse.html' },
      { id: 'performance',   title: 'Performance',       href: 'performance.html' },
      { id: 'accessibility', title: 'Accessibility',     href: 'accessibility.html' },
    ]},
    { title: 'Help', items: [
      { id: 'faq',            title: 'FAQ',              href: 'faq.html' },
      { id: 'troubleshooting',title: 'Troubleshooting',  href: 'troubleshooting.html' },
      { id: 'changelog',      title: 'Changelog',        href: 'changelog.html' },
    ]},
    { title: 'Reference', items: [
      { id: 'security',    title: 'Security',          href: 'security.html' },
      { id: 'translation', title: 'Translation & i18n',href: 'translation.html' },
      { id: 'support',     title: 'Support & License', href: 'support.html' },
    ]},
    { title: 'Developer', items: [
      { id: 'developer/guide',         title: 'Developer Guide', href: 'developer/guide.html' },
      { id: 'developer/hooks-filters', title: 'Hooks & Filters', href: 'developer/hooks-filters.html' },
      { id: 'developer/rest-api',      title: 'REST API',        href: 'developer/rest-api.html' },
    ]},
  ];

  /* Flat ordered list for prev/next */
  const NAV_FLAT = NAV.flatMap(s => s.items);

  /* ── Theme ───────────────────────────────────────────────── */
  function getTheme() {
    return localStorage.getItem('gb-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('gb-theme', t);
  }
  applyTheme(getTheme());

  /* ── Sidebar Nav ─────────────────────────────────────────── */
  function buildNav() {
    const nav  = document.getElementById('sidebar-nav');
    if (!nav) return;
    const base = window.GB_BASE || '';
    const page = window.GB_PAGE || '';

    nav.innerHTML = NAV.map(section => `
      <li class="sb-section">
        <div class="sb-section-label">${section.title}</div>
        <ul class="sb-items">
          ${section.items.map(item => {
            const active = item.id === page;
            const href   = base + item.href;
            return `<li class="sb-item">
              <a href="${href}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>
                <span class="sb-dot"></span>${item.title}
              </a></li>`;
          }).join('')}
        </ul>
      </li>`).join('');

    /* Scroll active item into view */
    const activeLink = nav.querySelector('a.active');
    if (activeLink) {
      requestAnimationFrame(() => {
        activeLink.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  /* ── Prev / Next ─────────────────────────────────────────── */
  function buildPrevNext() {
    const container = document.getElementById('doc-nav');
    if (!container) return;
    const base  = window.GB_BASE || '';
    const page  = window.GB_PAGE || '';
    const idx   = NAV_FLAT.findIndex(p => p.id === page);
    const prev  = idx > 0 ? NAV_FLAT[idx - 1] : null;
    const next  = idx < NAV_FLAT.length - 1 ? NAV_FLAT[idx + 1] : null;

    container.innerHTML = `
      ${prev ? `<a class="doc-nav-prev" href="${base}${prev.href}">
        <span class="doc-nav-label doc-nav-label-prev">Previous</span>
        <span class="doc-nav-title">${prev.title}</span></a>` : '<span></span>'}
      ${next ? `<a class="doc-nav-next" href="${base}${next.href}">
        <span class="doc-nav-label doc-nav-label-next">Next</span>
        <span class="doc-nav-title">${next.title}</span></a>` : '<span></span>'}`;
  }

  /* ── TOC ─────────────────────────────────────────────────── */
  function buildTOC() {
    const toc = document.getElementById('toc-nav');
    if (!toc) return;
    const prose = document.querySelector('.prose');
    if (!prose) return;
    const headings = prose.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      const panel = document.querySelector('.toc-panel');
      if (panel) panel.style.display = 'none';
      return;
    }
    toc.innerHTML = Array.from(headings).map(h => {
      const depth = parseInt(h.tagName[1]);
      const id    = h.id || slugify(h.textContent);
      if (!h.id) h.id = id;
      return `<a href="#${id}" data-depth="${depth}">${h.textContent.replace(/#/g, '').trim()}</a>`;
    }).join('');
  }

  /* TOC scroll spy */
  function initScrollSpy() {
    const links    = document.querySelectorAll('#toc-nav a');
    if (!links.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('toc-active'));
          const match = document.querySelector(`#toc-nav a[href="#${e.target.id}"]`);
          if (match) match.classList.add('toc-active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    document.querySelectorAll('.prose h2, .prose h3').forEach(h => observer.observe(h));
  }

  /* ── Heading Anchors ─────────────────────────────────────── */
  function addHeadingAnchors() {
    document.querySelectorAll('.prose h2, .prose h3, .prose h4').forEach(h => {
      if (!h.id) h.id = slugify(h.textContent);
      const a = document.createElement('a');
      a.className = 'heading-link';
      a.href = '#' + h.id;
      a.textContent = '#';
      a.setAttribute('aria-hidden', 'true');
      h.appendChild(a);
    });
  }

  /* ── Code Blocks ─────────────────────────────────────────── */
  function initCodeBlocks() {
    document.querySelectorAll('.prose pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;

      /* Detect language */
      const cls  = code.className || '';
      const lang = (cls.match(/language-(\w+)/) || [])[1] || pre.getAttribute('data-lang') || '';
      if (lang) pre.setAttribute('data-lang', lang);

      /* Syntax highlight */
      code.innerHTML = highlight(code.textContent, lang);

      /* Copy button */
      const btn = document.createElement('button');
      btn.className   = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code');
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(code.textContent).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        });
      });
      pre.appendChild(btn);
    });
  }

  /* ── Syntax Highlighter ──────────────────────────────────── */
  function highlight(code, lang) {
    const e  = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const sp = (cls, s) => `<span class="t-${cls}">${e(s)}</span>`;

    if (!lang) return e(code);

    const tokens = [];
    let src = code;

    const push = (raw, cls) => tokens.push({ raw, cls });

    /* Tokenize by consuming the source string */
    while (src.length) {

      /* Strings */
      const strMatch = src.match(/^(['"`])([\s\S]*?[^\\])\1/) ||
                       src.match(/^(['"`])\1/);
      if (strMatch) { push(strMatch[0], 'string'); src = src.slice(strMatch[0].length); continue; }

      /* Single-line comment */
      const slComment = src.match(/^(\/\/[^\n]*|#[^\n]*)/);
      if (slComment && /js|ts|php|bash|sh|css|yaml/.test(lang)) {
        push(slComment[0], 'comment'); src = src.slice(slComment[0].length); continue;
      }

      /* Multi-line comment */
      const mlComment = src.match(/^\/\*[\s\S]*?\*\//);
      if (mlComment) { push(mlComment[0], 'comment'); src = src.slice(mlComment[0].length); continue; }

      /* PHP tags */
      if (/php/.test(lang)) {
        const phpTag = src.match(/^(<\?php|<\?=|\?>)/);
        if (phpTag) { push(phpTag[0], 'php'); src = src.slice(phpTag[0].length); continue; }
        /* PHP variables */
        const phpVar = src.match(/^\$[a-zA-Z_][a-zA-Z0-9_]*/);
        if (phpVar) { push(phpVar[0], 'var'); src = src.slice(phpVar[0].length); continue; }
      }

      /* CSS selectors and properties */
      if (/css/.test(lang)) {
        const prop = src.match(/^([a-z-]+)\s*:/);
        if (prop) { push(prop[1], 'property'); src = src.slice(prop[1].length); continue; }
      }

      /* JSON keys */
      if (/json/.test(lang)) {
        const key = src.match(/^"([^"]+)"\s*:/);
        if (key) { push(key[0].slice(0, -1), 'key'); push(':', 'operator'); src = src.slice(key[0].length); continue; }
      }

      /* Numbers */
      const num = src.match(/^\b\d+(\.\d+)?(px|rem|em|%|vh|vw|ms|s)?\b/);
      if (num) { push(num[0], 'number'); src = src.slice(num[0].length); continue; }

      /* Keywords */
      const word = src.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (word) {
        const w = word[0];
        const keywords = {
          js:   /^(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|import|export|default|class|extends|async|await|try|catch|finally|throw|in|of|null|undefined|true|false|void|delete|yield)$/,
          ts:   /^(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|import|export|default|class|extends|async|await|try|catch|finally|throw|in|of|null|undefined|true|false|void|delete|yield|interface|type|enum|namespace|declare|abstract|readonly|public|private|protected|implements|as|from|any|string|number|boolean|never|unknown)$/,
          php:  /^(function|return|if|else|elseif|for|foreach|while|do|switch|case|break|continue|new|echo|print|class|extends|implements|public|private|protected|static|abstract|final|interface|trait|namespace|use|require|include|require_once|include_once|null|true|false|array|string|int|bool|float|void|self|parent|__CLASS__|__METHOD__|__FUNCTION__)$/,
          bash: /^(if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|exit|echo|export|local|readonly|source|alias)$/,
          css:  /^(important|px|em|rem|vh|vw|auto|none|flex|grid|block|inline|relative|absolute|fixed|sticky|hidden|visible|inherit|initial|unset)$/,
        };
        const langKey = lang.replace(/javascript/, 'js').replace(/typescript/, 'ts').replace(/shell|sh/, 'bash');
        const kw = keywords[langKey];
        if (kw && kw.test(w)) { push(w, 'keyword'); src = src.slice(w.length); continue; }
        push(w, ''); src = src.slice(w.length); continue;
      }

      /* Operators */
      const op = src.match(/^(===|!==|=>|->|::|\|\||&&|\?\?|\.\.\.|\+\+|--|<<|>>)/);
      if (op) { push(op[0], 'operator'); src = src.slice(op[0].length); continue; }

      /* Consume one char */
      push(src[0], ''); src = src.slice(1);
    }

    return tokens.map(t => t.cls ? sp(t.cls, t.raw) : e(t.raw)).join('');
  }

  /* ── Tables ──────────────────────────────────────────────── */
  function wrapTables() {
    document.querySelectorAll('.prose table').forEach(t => {
      if (t.closest('.table-wrap')) return;
      const w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  /* ── Blockquote → Callout ────────────────────────────────── */
  function upgradeBlockquotes() {
    document.querySelectorAll('.prose blockquote').forEach(bq => {
      const text = bq.textContent.trimStart();
      let type = null;
      if (/^Note:/i.test(text))   type = 'note';
      if (/^Tip:/i.test(text))    type = 'tip';
      if (/^Warning:/i.test(text) || /^Caution:/i.test(text)) type = 'warning';
      if (/^Danger:/i.test(text)) type = 'danger';
      if (!type) return;

      const icons = {
        note:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        tip:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12l2 2 4-4"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        danger:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      };

      const div = document.createElement('div');
      div.className = `callout callout-${type}`;
      div.innerHTML = `${icons[type]}<div class="callout-body">${bq.innerHTML}</div>`;
      bq.parentNode.replaceChild(div, bq);
    });
  }

  /* ── Mobile Sidebar ──────────────────────────────────────── */
  function initSidebar() {
    const toggle  = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar) return;

    function open() {
      sidebar.classList.add('open');
      overlay && overlay.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      sidebar.classList.remove('open');
      overlay && overlay.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () =>
      sidebar.classList.contains('open') ? close() : open());
    overlay && overlay.addEventListener('click', close);

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
    });

    /* Close when clicking a nav link on mobile */
    sidebar.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => { if (window.innerWidth < 960) close(); }));
  }

  /* ── Search ──────────────────────────────────────────────── */
  function initSearch() {
    const modal    = document.getElementById('search-modal');
    const input    = document.getElementById('search-input');
    const results  = document.getElementById('search-results');
    const backdrop = document.getElementById('search-backdrop');
    if (!modal || !input) return;

    const openBtns = document.querySelectorAll('.search-btn, .sidebar-search-mini');
    const closeBtns = document.querySelectorAll('.search-esc');

    function open() {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => input.focus());
    }
    function close() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      input.value = '';
      if (results) results.innerHTML = '';
    }

    openBtns.forEach(b => b.addEventListener('click', open));
    closeBtns.forEach(b => b.addEventListener('click', close));
    backdrop && backdrop.addEventListener('click', close);

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') close();
    });

    /* Search logic */
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => doSearch(input.value.trim()), 150);
    });

    /* Keyboard navigation in results */
    input.addEventListener('keydown', e => {
      const items = results.querySelectorAll('.search-result');
      if (!items.length) return;
      const sel = results.querySelector('[aria-selected="true"]');
      let idx = Array.from(items).indexOf(sel);
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); }
      else if (e.key === 'Enter' && sel) { window.location = sel.href; return; }
      else return;
      items.forEach(i => i.removeAttribute('aria-selected'));
      items[idx] && items[idx].setAttribute('aria-selected', 'true');
      items[idx] && items[idx].scrollIntoView({ block: 'nearest' });
    });

    function doSearch(q) {
      if (!q || !window.GB_SEARCH) { results.innerHTML = ''; return; }
      const q_lc = q.toLowerCase();
      const hits = window.GB_SEARCH
        .filter(p => p.title.toLowerCase().includes(q_lc) || p.content.toLowerCase().includes(q_lc))
        .slice(0, 8);

      if (!hits.length) {
        results.innerHTML = `<div class="search-results-empty">No results for "<strong>${q}</strong>"</div>`;
        return;
      }

      const base = window.GB_BASE || '';
      results.innerHTML = hits.map(p => {
        const ex  = excerpt(p.content, q_lc);
        const title = mark(p.title, q);
        return `<a class="search-result" href="${base}${p.url}">
          <div class="sr-section">${p.section}</div>
          <div class="sr-title">${title}</div>
          ${ex ? `<div class="sr-excerpt">${mark(ex, q)}</div>` : ''}
        </a>`;
      }).join('');
    }

    function excerpt(text, q) {
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return text.slice(0, 120);
      const start = Math.max(0, idx - 60);
      const end   = Math.min(text.length, idx + 120);
      return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    }

    function mark(text, q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return text.replace(re, m => `<mark>${m}</mark>`);
    }
  }

  /* ── Back to Top ─────────────────────────────────────────── */
  function initBackTop() {
    const btn = document.getElementById('back-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Theme Toggle ────────────────────────────────────────── */
  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(t);
    });
  }

  /* ── Utility ─────────────────────────────────────────────── */
  function slugify(text) {
    return text.trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /* ── Init ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    buildNav();
    buildPrevNext();
    wrapTables();
    upgradeBlockquotes();
    initCodeBlocks();
    buildTOC();
    initScrollSpy();
    addHeadingAnchors();
    initSidebar();
    initSearch();
    initBackTop();
    initTheme();
  });

})();
