(function () {
    'use strict';

    /* ================================================
       MOTION CORE — guards + single rAF engine
       Everything continuous (Lenis, cursor, magnetics,
       starfield) runs inside one rAF loop.
       ================================================ */

    document.documentElement.classList.add('js');

    const MOTION_OK    = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const frameTasks = [];
    function onFrame(fn) { frameTasks.push(fn); }

    let mouseX = -200, mouseY = -200;
    if (FINE_POINTER) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });
    }

    /* ================================================
       SMOOTH SCROLL — Lenis (skipped for reduced motion)
       ================================================ */

    let lenis = null;
    if (MOTION_OK && typeof Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.05 });
        onFrame((time) => lenis.raf(time));
    }

    const siteNav = document.getElementById('siteNav');

    function scrollToY(target) {
        const offset = typeof target === 'number' ? 0 : -siteNav.offsetHeight;
        if (lenis) {
            lenis.scrollTo(target, { offset });
        } else {
            const top = typeof target === 'number'
                ? target
                : target.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top, behavior: MOTION_OK ? 'smooth' : 'auto' });
        }
    }

    /* ================================================
       STARFIELD — layered parallax depth behind
       hero / art / contact (transparent sections)
       ================================================ */

    (function initStarfield() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [], w = 0, h = 0;

        function build() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width  = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(Math.round((w * h) / 9000), FINE_POINTER ? 150 : 90);
            stars = Array.from({ length: count }, () => {
                const depth = Math.random();
                return {
                    x: Math.random() * w,
                    y: Math.random() * h * 1.4,
                    r: 0.4 + depth * 1.2,
                    z: 0.12 + depth * 0.5,
                    a: 0.12 + Math.random() * 0.45,
                    tw: Math.random() * Math.PI * 2,
                    ts: 0.4 + Math.random() * 1.1,
                    vx: (Math.random() - 0.5) * 0.02 * (0.4 + depth),
                    gold: Math.random() < 0.18
                };
            });
            if (!MOTION_OK) drawStatic();
        }

        function drawStatic() {
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                ctx.globalAlpha = s.a;
                ctx.fillStyle = s.gold ? '#c9972a' : '#e8e2d6';
                ctx.beginPath();
                ctx.arc(s.x, s.y % h, s.r, 0, 6.2832);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function draw(time) {
            const t = time * 0.001;
            const sy = window.scrollY;
            const wrap = h * 1.4;
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                s.x += s.vx;
                if (s.x < -2) s.x = w + 2; else if (s.x > w + 2) s.x = -2;
                let yy = (s.y - sy * s.z) % wrap;
                if (yy < 0) yy += wrap;
                yy -= h * 0.2;
                ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(s.tw + t * s.ts));
                ctx.fillStyle = s.gold ? '#c9972a' : '#e8e2d6';
                ctx.beginPath();
                ctx.arc(s.x, yy, s.r, 0, 6.2832);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        build();
        window.addEventListener('resize', build);
        if (MOTION_OK) onFrame(draw);
    })();

    /* ================================================
       HERO — char split + load choreography
       ================================================ */

    (function splitHeroName() {
        const heroName = document.querySelector('.hero-name');
        if (!heroName) return;

        heroName.setAttribute('aria-label', 'Dylan Duan');

        const first = 'Dylan';
        const last  = 'Duan';
        const span = (ch, i) => `<span class="char" style="--i:${i}" aria-hidden="true">${ch}</span>`;

        const firstSpans = [...first].map((ch, i) => span(ch, i)).join('');
        const lastSpans  = [...last].map((ch, i) => span(ch, i + first.length + 1)).join('');

        heroName.innerHTML = firstSpans + '<br><em>' + lastSpans + '</em>';
    })();

    // Load-in: body.loaded fires all [data-load] + .char transitions.
    // load-done then strips those transitions so they can't interfere
    // with hover / magnetic transforms afterwards.
    if (MOTION_OK) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.body.classList.add('loaded');
            setTimeout(() => document.body.classList.add('load-done'), 1600);
        }));
    } else {
        document.body.classList.add('loaded', 'load-done');
    }

    /* ================================================
       SCROLL REVEALS — IntersectionObserver
       ================================================ */

    if (MOTION_OK) {
        const fadeEls = document.querySelectorAll('.fade-in');
        const fadeObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        fadeObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );
        fadeEls.forEach(el => fadeObserver.observe(el));

        document.querySelectorAll('.project-card, .project-featured').forEach((card, i) => {
            card.classList.remove('fade-in');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.97)';

            const obs = new IntersectionObserver(([e]) => {
                if (!e.isIntersecting) return;
                const delay = i * 0.1;
                card.style.transition = `opacity 0.7s ${EASE} ${delay}s, transform 0.7s ${EASE} ${delay}s`;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                setTimeout(() => {
                    card.style.opacity = '';
                    card.style.transform = '';
                    card.style.transition = '';
                }, (0.7 + delay) * 1000 + 80);
                obs.disconnect();
            }, { threshold: 0.05 });

            obs.observe(card);
        });

        document.querySelectorAll('.art-entry').forEach((entry, i) => {
            entry.classList.remove('fade-in');
            entry.style.opacity   = '0';
            entry.style.transform = 'translateX(-30px)';

            const obs = new IntersectionObserver(([e]) => {
                if (!e.isIntersecting) return;
                const delay = i * 0.15;
                entry.style.transition = `opacity 0.75s ${EASE} ${delay}s, transform 0.75s ${EASE} ${delay}s`;
                entry.style.opacity   = '1';
                entry.style.transform = 'translateX(0)';
                setTimeout(() => {
                    entry.style.opacity   = '';
                    entry.style.transform = '';
                    entry.style.transition = '';
                }, (0.75 + delay) * 1000 + 80);
                obs.disconnect();
            }, { threshold: 0.05 });

            obs.observe(entry);
        });

        document.querySelectorAll('.skill-list').forEach((list) => {
            const items = list.querySelectorAll('li');
            items.forEach(item => {
                item.style.opacity   = '0';
                item.style.transform = 'translateY(10px)';
            });

            const obs = new IntersectionObserver(([e]) => {
                if (!e.isIntersecting) return;
                items.forEach((item, i) => {
                    item.style.transition = `opacity 0.45s ${EASE} ${i * 0.07}s, transform 0.45s ${EASE} ${i * 0.07}s`;
                    item.style.opacity   = '1';
                    item.style.transform = 'translateY(0)';
                });
                obs.disconnect();
            }, { threshold: 0.1 });

            obs.observe(list);
        });
    } else {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }

    /* ================================================
       NAV — scrolled state, progress bar, scrollspy
       with sliding indicator
       ================================================ */

    const navProgress = document.getElementById('navProgress');

    function updateNavOnScroll() {
        siteNav.classList.toggle('scrolled', window.scrollY > 60);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        navProgress.style.transform = `scaleX(${docH > 0 ? (window.scrollY / docH).toFixed(4) : 0})`;
    }

    window.addEventListener('scroll', updateNavOnScroll, { passive: true });
    updateNavOnScroll();

    const navLinks     = document.querySelectorAll('.nav-link');
    const navIndicator = document.getElementById('navIndicator');
    let activeLink     = null;
    let indicatorReady = false;

    function positionIndicator(instant) {
        if (!navIndicator) return;
        const label = activeLink && activeLink.querySelector('.nav-label');
        if (!label || label.offsetParent === null) {
            navIndicator.style.opacity = '0';
            return;
        }
        const lr = label.getBoundingClientRect();
        const nr = siteNav.getBoundingClientRect();
        const skipAnim = instant || !indicatorReady;
        if (skipAnim) navIndicator.style.transition = 'none';
        navIndicator.style.opacity = '1';
        navIndicator.style.transform =
            `translate3d(${(lr.left - nr.left).toFixed(1)}px, ${(lr.bottom - nr.top + 3).toFixed(1)}px, 0) scaleX(${(lr.width / 100).toFixed(4)})`;
        if (skipAnim) {
            void navIndicator.offsetWidth;
            navIndicator.style.transition = '';
            indicatorReady = true;
        }
    }

    function setActiveSection(id) {
        let found = null;
        navLinks.forEach(link => {
            const match = link.getAttribute('data-target') === id;
            link.classList.toggle('active', match);
            if (match) found = link;
        });
        activeLink = found;
        positionIndicator();
    }

    const sections = document.querySelectorAll('.section');
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            });
        },
        { rootMargin: '-25% 0px -65% 0px' }
    );
    sections.forEach(s => navObserver.observe(s));

    window.addEventListener('resize', () => positionIndicator(true));
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => positionIndicator(true));
    }

    /* ================================================
       NAV — anchor scrolling + mobile overlay
       ================================================ */

    const navOverlay = document.getElementById('navOverlay');

    document.querySelectorAll('.nav-link, .nav-overlay-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('data-target'));
            if (target) scrollToY(target);
            navOverlay.classList.remove('open');
        });
    });

    document.querySelector('.nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        scrollToY(0);
    });

    const navBurger = document.getElementById('navBurger');
    const navClose  = document.getElementById('navClose');

    navBurger.addEventListener('click', () => navOverlay.classList.add('open'));
    navClose.addEventListener('click',  () => navOverlay.classList.remove('open'));
    navOverlay.addEventListener('click', (e) => {
        if (e.target === navOverlay) navOverlay.classList.remove('open');
    });

    /* ================================================
       MAGNETIC ELEMENTS — cursor-proximity pull,
       fine pointers only, spring-back on exit
       ================================================ */

    if (FINE_POINTER && MOTION_OK) {
        const magnets = [];
        document.querySelectorAll('.hero-arrow-link').forEach(el => {
            magnets.push({ el, strength: 0.28, radius: 55, x: 0, y: 0, tx: 0, ty: 0 });
        });

        if (magnets.length) {
            onFrame(() => {
                for (const m of magnets) {
                    const r  = m.el.getBoundingClientRect();
                    const cx = r.left + r.width  / 2 - m.x;
                    const cy = r.top  + r.height / 2 - m.y;
                    const dx = mouseX - cx;
                    const dy = mouseY - cy;
                    const reach = m.radius + Math.max(r.width, r.height) / 2;
                    const d = Math.hypot(dx, dy);

                    if (d < reach) {
                        const pull = (1 - d / reach) * m.strength;
                        m.tx = dx * pull;
                        m.ty = dy * pull;
                    } else {
                        m.tx = 0;
                        m.ty = 0;
                    }

                    m.x += (m.tx - m.x) * 0.16;
                    m.y += (m.ty - m.y) * 0.16;

                    if (m.tx === 0 && m.ty === 0 && Math.abs(m.x) < 0.05 && Math.abs(m.y) < 0.05) {
                        if (m.el.style.transform) m.el.style.transform = '';
                    } else {
                        m.el.style.transform = `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`;
                    }
                }
            });
        }

        document.querySelectorAll('.project-card-name, .project-featured-name').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r  = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width  / 2);
                const dy = e.clientY - (r.top  + r.height / 2);
                el.style.transition = 'none';
                el.style.transform  = `translate(${dx * 0.16}px, ${dy * 0.22}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transition = `transform 0.7s ${EASE}, color 0.25s`;
                el.style.transform  = '';
            });
        });
    }

    /* ================================================
       HERO PARALLAX — layered exit rates + fade,
       drives --sy for the constellation backdrop
       ================================================ */

    if (MOTION_OK) {
        const hero      = document.querySelector('.hero');
        const heroInner = document.querySelector('.hero-inner');
        const heroLeft  = document.querySelector('.hero-left');
        const heroRight = document.querySelector('.hero-right');
        const heroRule  = document.querySelector('.hero-rule');
        let ticking = false;

        function updateParallax() {
            const y = window.scrollY;
            const heroH = hero.offsetHeight;
            if (y <= heroH) {
                heroLeft.style.transform  = `translate3d(0, ${(y * 0.2).toFixed(1)}px, 0)`;
                heroRule.style.transform  = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
                heroRight.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
                heroInner.style.opacity   = Math.max(0, 1 - (y / heroH) * 1.1).toFixed(3);
                hero.style.setProperty('--sy', (y * 0.06).toFixed(2));
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ================================================
       GITHUB STATS
       ================================================ */

    async function fetchGithubStats() {
        try {
            const res = await fetch('https://api.github.com/users/Kiddo4993/repos?per_page=100');
            if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
            const repos = await res.json();

            document.querySelectorAll('[data-repo]').forEach(el => {
                const repoName = el.getAttribute('data-repo');
                const repo = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
                if (!repo) return;

                const updateElement = (target, field) => {
                    const val = repo[field];
                    if (val !== undefined) {
                        target.textContent = val;
                    }
                };

                const field = el.getAttribute('data-field');
                if (field) {
                    updateElement(el, field);
                } else {
                    el.querySelectorAll('[data-field]').forEach(child => {
                        const childField = child.getAttribute('data-field');
                        updateElement(child, childField);
                    });
                }
            });
        } catch (err) {
            console.warn('Failed to fetch dynamic GitHub stats, using fallback values.', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchGithubStats);
    } else {
        fetchGithubStats();
    }

    /* ---------- start the engine ---------- */
    if (frameTasks.length) requestAnimationFrame(function engine(time) {
        for (let i = 0; i < frameTasks.length; i++) frameTasks[i](time);
        requestAnimationFrame(engine);
    });

})();
