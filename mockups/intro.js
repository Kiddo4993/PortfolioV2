/* =========================================================
   INTRO — "code becomes craft"
   1. `› dylan duan` types itself in mono (the engineer)
   2. each letter grows + morphs into the display face (FLIP per char)
   3. an ink stroke draws under the name (the artist)
   4. the name glides into the header slot; the page blurs in around it
   Once per session · skippable by click/key/scroll · no library (WAAPI)
   ========================================================= */
(function () {
    'use strict';

    const root = document.documentElement;
    const overlay = document.getElementById('intro');
    const me = document.querySelector('.me');
    const header = document.querySelector('.top');
    if (!overlay || !me) return;

    const SHEET = 'cubic-bezier(.32,.72,0,1)';   // Linear's hero curve
    const MOVE  = 'cubic-bezier(.65,0,.35,1)';   // A → B on screen
    const MONO = 'dylan duan', SANS = 'Dylan Duan';
    // hand-tuned keystroke gaps (ms): uneven on purpose, a real typist hesitates at the space
    const KEYS = [70, 52, 88, 61, 150, 66, 84, 48, 72, 0];

    let anims = [], timers = [], done = true;
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const play = (el, kf, opt) => { const a = el.animate(kf, { fill: 'both', ...opt }); anims.push(a); return a; };
    const chars = (s) => [...s].map((c) => `<span class="c">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const remember = () => { try { sessionStorage.setItem('dd-intro', '1'); } catch (e) {} };

    function build() {
        overlay.innerHTML =
            '<div class="intro-bg"></div>' +
            '<div class="intro-stage">' +
              `<p class="intro-mono"><span class="intro-prompt">›</span><span class="intro-typed">${chars(MONO)}</span><span class="intro-caret"></span></p>` +
              `<p class="intro-name">${chars(SANS)}</p>` +
              '<svg class="intro-ink"><path class="ink-a"/></svg>' +
              '<p class="intro-tag">Software engineer · Artist</p>' +
            '</div>';
    }

    // a slightly wobbly brush line, different every visit
    function inkPath(w) {
        const pts = [], n = 7;
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            pts.push([t * w, 10 + Math.sin(t * Math.PI * 1.3) * 2.2 + (Math.random() - 0.5) * 2 - t * 3]);
        }
        pts.push([w + 10, pts[n][1] - 7]);            // the flick at the end
        let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
        for (let i = 1; i < pts.length; i++) {          // Catmull-Rom → cubic
            const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = pts[i], p3 = pts[i + 1] || p2;
            d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
        }
        return d;
    }

    async function run() {
        done = false;
        build();
        root.classList.add('is-intro');
        const $ = (s) => overlay.querySelector(s);
        const stage = $('.intro-stage'), mono = $('.intro-mono'), caret = $('.intro-caret');
        const typed = [...overlay.querySelectorAll('.intro-typed .c')];
        const glyphs = [...overlay.querySelectorAll('.intro-name .c')];
        const nameEl = $('.intro-name'), ink = $('.intro-ink'), tag = $('.intro-tag');
        if (document.fonts) await document.fonts.ready;
        if (done) return;

        const moveCaret = (i) => {
            const mr = mono.getBoundingClientRect(), cr = typed[Math.max(i, 0)].getBoundingClientRect();
            caret.style.transform = `translateX(${(i < 0 ? cr.left : cr.right) - mr.left + 2}px)`;
        };

        // 1 · type
        moveCaret(-1);
        await wait(320);
        for (let i = 0; i < typed.length; i++) {
            if (done) return;
            typed[i].style.opacity = '1';
            moveCaret(i);
            await wait(KEYS[i]);
        }
        caret.classList.add('blink');
        await wait(380);
        if (done) return;

        // 2 · morph each mono letter into its display-face twin
        play($('.intro-prompt'), [{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
        play(caret, [{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
        typed.forEach((m, i) => {
            const s = glyphs[i], mr = m.getBoundingClientRect(), sr = s.getBoundingClientRect();
            const dx = sr.left + sr.width / 2 - (mr.left + mr.width / 2);
            const dy = sr.top + sr.height / 2 - (mr.top + mr.height / 2);
            const k = sr.height / mr.height;
            const opt = { duration: 650, easing: SHEET, delay: i * 22 };
            play(m, [{ transform: 'none', opacity: 1, filter: 'blur(0px)' },
                     { transform: `translate(${dx}px,${dy}px) scale(${k})`, opacity: 0, filter: 'blur(6px)' }], opt);
            play(s, [{ transform: `translate(${-dx}px,${-dy}px) scale(${1 / k})`, opacity: 0, filter: 'blur(6px)' },
                     { transform: 'none', opacity: 1, filter: 'blur(0px)' }], opt);
        });

        // 3 · ink stroke + tagline
        await wait(420);
        if (done) return;
        const nr = nameEl.getBoundingClientRect(), st = stage.getBoundingClientRect();
        ink.setAttribute('width', nr.width + 20); ink.setAttribute('height', 26);
        ink.style.left = `${nr.left - st.left}px`; ink.style.top = `${nr.bottom - st.top + 2}px`;
        tag.style.top = `${nr.bottom - st.top + 44}px`;
        const d = inkPath(nr.width);
        [...ink.querySelectorAll('path')].forEach((p, i) => {
            p.setAttribute('d', d);
            const len = p.getTotalLength();
            p.style.strokeDasharray = len;
            play(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 620, easing: MOVE, delay: i * 45 });
        });
        play(tag, [{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(6px)' },
                   { opacity: 1, filter: 'blur(0px)', transform: 'none' }], { duration: 600, easing: SHEET, delay: 300 });
        await wait(1350);
        if (done) return;

        // 4 · hand-off: name glides into the header slot
        play(ink, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
        play(tag, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
        await wait(100);
        const prev = header.style.transform;
        header.style.transition = 'none'; header.style.transform = 'none';      // measure the slot without the load-in offset
        const mr = me.getBoundingClientRect();
        header.style.transform = prev; void header.offsetWidth; header.style.transition = '';
        const from = nameEl.getBoundingClientRect();
        const k = mr.width / from.width;
        const dx = mr.left - from.left, dy = mr.top + mr.height / 2 - from.top - (from.height * k) / 2;
        nameEl.style.transformOrigin = '0 0';
        root.classList.add('ready');                                            // page blurs in around the glide
        play(nameEl, [{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(${k})` }], { duration: 750, easing: SHEET });
        play($('.intro-bg'), [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 120, easing: 'ease-out' });
        await wait(760);
        finish();
    }

    function finish() {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout); timers = [];
        anims.forEach((a) => a.cancel()); anims = [];
        root.classList.add('ready');
        root.classList.remove('is-intro');
        overlay.innerHTML = '';
        remember();
        removeSkip();
    }

    function skip() {
        if (done) return;
        const bg = overlay.querySelector('.intro-bg');
        root.classList.add('ready');
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'both' }).onfinish = () => {
            finish();
            overlay.getAnimations().forEach((a) => a.cancel());
        };
        if (bg) bg.style.pointerEvents = 'none';
    }
    const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    const addSkip = () => SKIP_EVENTS.forEach((ev) => addEventListener(ev, skip, { passive: true }));
    const removeSkip = () => SKIP_EVENTS.forEach((ev) => removeEventListener(ev, skip));

    // start only if the pre-paint script opted in (motion allowed, first visit this session, top of page)
    if (root.classList.contains('is-intro') && scrollY === 0) {
        root.classList.remove('is-intro');
        addSkip();
        run();
    } else if (root.classList.contains('is-intro')) {
        root.classList.remove('is-intro');
        root.classList.add('ready');
    }

    // mockup only: replay
    window.replayIntro = () => {
        if (!done || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        scrollTo(0, 0);
        root.classList.remove('ready');
        setTimeout(() => { addSkip(); run(); }, 50);
    };
})();
