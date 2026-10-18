(function () {
    'use strict';

    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = document.documentElement;
    const MOTION_OK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- load-in: wait for fonts so lines don't reflow mid-blur ---------- */
    if (MOTION_OK) {
        const go = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
        // intro.js owns the load-in when it runs; otherwise reveal once fonts are ready
        if (!root.classList.contains('is-intro')) (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
    }

    /* ---------- scroll reveal: once per section, stagger capped at 240ms ---------- */
    const sections = $$('[data-reveal]');
    if (MOTION_OK && 'IntersectionObserver' in window) {
        sections.forEach((sec) => {
            const parts = $$('.label, .section-note, .row, .stack, .contact', sec);
            parts.forEach((el, i) => el.style.setProperty('--d', Math.min(i * 40, 240)));
        });
        const io = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('seen');
            io.unobserve(e.target);
        }), { rootMargin: '0px 0px -12% 0px' });
        sections.forEach((s) => io.observe(s));
    } else {
        sections.forEach((s) => s.classList.add('seen'));
    }

    /* ---------- hover highlight that slides between rows (Vercel) ---------- */
    $$('.rows').forEach((list) => {
        const hl = document.createElement('li');
        hl.className = 'highlight';
        hl.setAttribute('aria-hidden', 'true');
        list.prepend(hl);
        let visible = false;

        function moveTo(head) {
            const lr = list.getBoundingClientRect(), r = head.getBoundingClientRect();
            if (!visible) hl.classList.add('no-slide');          // first hover: appear in place, don't fly in
            hl.style.transform = `translateY(${r.top - lr.top}px)`;
            hl.style.height = `${r.height}px`;
            hl.style.opacity = '1';
            if (!visible) { void hl.offsetWidth; hl.classList.remove('no-slide'); }
            visible = true;
        }
        $$('.row-head', list).forEach((head) => {
            head.addEventListener('pointerenter', () => FINE && moveTo(head));
            head.addEventListener('focus', () => moveTo(head));
        });
        list.addEventListener('pointerleave', () => { hl.style.opacity = '0'; visible = false; });
        list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) { hl.style.opacity = '0'; visible = false; } });
    });

    /* ---------- accordion rows (Stripe curve) ---------- */
    const workRows = $$('#workRows [data-row]');
    workRows.forEach((row) => {
        const head = $('.row-head', row);
        head.addEventListener('click', () => {
            const opening = !row.classList.contains('open');
            workRows.forEach((r) => { r.classList.remove('open'); $('.row-head', r).setAttribute('aria-expanded', 'false'); });
            if (opening) { row.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
        });
    });

    /* ---------- GitHub stars for SparkVEX (plain text, no library) ---------- */
    const starEl = $('[data-stars]');
    fetch('https://api.github.com/repos/Kiddo4993/' + starEl.dataset.stars)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((repo) => { starEl.textContent = `★ ${repo.stargazers_count} · forks ${repo.forks_count}`; })
        .catch(() => {});

    /* ---------- art preview follows the cursor (lerp 0.15) ---------- */
    const preview = $('#preview');
    if (FINE && MOTION_OK) {
        const plates = $$('.plate', preview);
        let x = 0, y = 0, tx = 0, ty = 0, s = 0.96, ts = 0.96, raf = 0, active = false;
        const tick = () => {
            x += (tx - x) * 0.15; y += (ty - y) * 0.15; s += (ts - s) * 0.2;
            preview.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
            if (active || Math.abs(tx - x) > 0.3 || Math.abs(s - ts) > 0.002) raf = requestAnimationFrame(tick);
            else raf = 0;
        };
        const place = (e, snap) => {
            tx = e.clientX + 24; ty = e.clientY - 120;
            if (snap) { x = tx; y = ty; }
            if (!raf) raf = requestAnimationFrame(tick);
        };
        $$('#artRows .row').forEach((row) => {
            const head = $('.row-head', row);
            head.addEventListener('pointerenter', (e) => {
                const first = !active;
                active = true; ts = 1;
                plates.forEach((p) => p.classList.toggle('on', p.dataset.plate === row.dataset.plate));
                preview.classList.add('on');
                place(e, first);
            });
            head.addEventListener('pointermove', (e) => place(e, false));
        });
        $('#artRows').addEventListener('pointerleave', () => { active = false; ts = 0.96; preview.classList.remove('on'); if (!raf) raf = requestAnimationFrame(tick); });
    }

    /* ---------- copy email (blur crossfade) ---------- */
    const copyBtn = $('#copyEmail');
    let copyTimer = 0;
    copyBtn.addEventListener('click', () => {
        const done = () => { copyBtn.classList.add('done'); clearTimeout(copyTimer); copyTimer = setTimeout(() => copyBtn.classList.remove('done'), 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(copyBtn.dataset.email).then(done, () => { location.href = 'mailto:' + copyBtn.dataset.email; });
        else location.href = 'mailto:' + copyBtn.dataset.email;
    });

    /* ---------- ⌘K: 100ms scale .96 (Family) ---------- */
    const k = $('#k'), kInput = $('#kInput'), kList = $('#kList');
    const jump = (id) => () => document.getElementById(id).scrollIntoView({ behavior: MOTION_OK ? 'smooth' : 'auto' });
    const open = (url) => () => window.open(url, '_blank', 'noopener');
    const CMDS = [
        ['Work', 'section', jump('work')],
        ['Art', 'section', jump('art')],
        ['Stack', 'section', jump('stack')],
        ['Contact', 'section', jump('contact')],
        ['Copy email', 'action', () => copyBtn.click()],
        ['SparkVEX live demo', 'link', open('https://spark-vex-app.vercel.app')],
        ['GitHub', 'link', open('https://github.com/Kiddo4993')],
        ['Art portfolio', 'link', open('https://art-portfolio.dylanduan2010.dev/')],
    ];
    let kOpen = false, kIdx = 0, kShown = CMDS, kLast = null;
    function kRender() {
        const q = kInput.value.trim().toLowerCase();
        kShown = CMDS.filter(([n]) => n.toLowerCase().includes(q));
        kIdx = Math.min(kIdx, Math.max(kShown.length - 1, 0));
        kList.innerHTML = '';
        kShown.forEach(([n, t], i) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option'); li.id = 'k-' + i; li.setAttribute('aria-selected', i === kIdx);
            li.innerHTML = '<span></span><small></small>';
            li.firstChild.textContent = n; li.lastChild.textContent = t;
            kList.appendChild(li);
        });
        kInput.setAttribute('aria-activedescendant', kShown.length ? 'k-' + kIdx : '');
    }
    function kShow() {
        if (kOpen) return;
        kOpen = true; kLast = document.activeElement; kInput.value = ''; kIdx = 0; kRender();
        k.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => k.classList.add('in')));
        kInput.focus({ preventScroll: true });
    }
    function kHide(after) {
        if (!kOpen) return;
        kOpen = false; k.classList.remove('in');
        setTimeout(() => { k.hidden = true; kLast && kLast.focus && kLast.focus({ preventScroll: true }); after && after(); }, MOTION_OK ? 100 : 0);
    }
    $('#kOpen').addEventListener('click', kShow);
    k.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) kHide(); });
    kList.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) kHide(kShown[[...kList.children].indexOf(li)][2]); });
    kList.addEventListener('mousemove', (e) => {
        const li = e.target.closest('li'); if (!li) return;
        const i = [...kList.children].indexOf(li);
        if (i !== kIdx) { kIdx = i; $$('li', kList).forEach((x, j) => x.setAttribute('aria-selected', j === kIdx)); }
    });
    kInput.addEventListener('input', () => { kIdx = 0; kRender(); });
    kInput.addEventListener('keydown', (e) => {
        const n = Math.max(kShown.length, 1);
        if (e.key === 'ArrowDown') { kIdx = (kIdx + 1) % n; kRender(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { kIdx = (kIdx - 1 + n) % n; kRender(); e.preventDefault(); }
        else if (e.key === 'Enter') { if (kShown[kIdx]) kHide(kShown[kIdx][2]); e.preventDefault(); }
        else if (e.key === 'Escape') { kHide(); e.preventDefault(); }
    });
    addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); kOpen ? kHide() : kShow(); }
    });

    /* ---------- mockup only: motion notes ---------- */
    const notesBtn = $('#notesBtn');
    let built = false;
    notesBtn.addEventListener('click', () => {
        if (!built) {
            $$('[data-note]').forEach((el) => {
                const n = document.createElement('p');
                n.className = 'mnote'; n.textContent = el.dataset.note;
                el.before(n);
            });
            built = true;
        }
        const on = document.body.classList.toggle('show-notes');
        notesBtn.setAttribute('aria-pressed', on);
    });
})();
