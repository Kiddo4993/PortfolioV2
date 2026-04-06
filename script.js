/* ========================================
   DYLAN DUAN PORTFOLIO — Atelier Logbook
   ======================================== */

(function () {
    'use strict';

    // ——————— Starfield Canvas ———————
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    const STAR_COUNT = 180;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.5 + 0.15,
            alphaDir: (Math.random() - 0.5) * 0.006,
            drift: (Math.random() - 0.5) * 0.06,
        };
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(createStar());
        }
    }

    function createShootingStar() {
        return {
            x: Math.random() * canvas.width,
            y: 0,
            len: Math.random() * 55 + 35,
            speed: Math.random() * 3.5 + 2.5,
            alpha: 1,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        };
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const s of stars) {
            s.alpha += s.alphaDir;
            if (s.alpha >= 0.65 || s.alpha <= 0.1) s.alphaDir *= -1;
            s.y += s.drift;

            if (s.y > canvas.height + 5) { s.y = -5; s.x = Math.random() * canvas.width; }
            else if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }

            ctx.fillStyle = `rgba(220, 226, 238, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, Math.max(1, s.r * 2), Math.max(1, s.r * 2));
        }

        if (Math.random() < 0.002 && shootingStars.length < 2) {
            shootingStars.push(createShootingStar());
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const dx = Math.cos(ss.angle) * ss.speed;
            const dy = Math.sin(ss.angle) * ss.speed;

            ss.x += dx;
            ss.y += dy;
            ss.alpha -= 0.014;

            if (ss.alpha <= 0 || ss.x > canvas.width + 100 || ss.y > canvas.height + 100) {
                shootingStars.splice(i, 1);
                continue;
            }

            const tailX = ss.x - Math.cos(ss.angle) * ss.len;
            const tailY = ss.y - Math.sin(ss.angle) * ss.len;
            const segments = 8;

            for (let j = 0; j < segments; j++) {
                const px = tailX + (ss.x - tailX) * (j / segments);
                const py = tailY + (ss.y - tailY) * (j / segments);
                ctx.fillStyle = `rgba(220, 226, 238, ${ss.alpha * (j / segments) * 0.7})`;
                ctx.fillRect(px, py, 1.5, 1.5);
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
            ctx.fillRect(ss.x - 1, ss.y - 1, 3, 3);
        }

        requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    initStars();
    drawStars();
    window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

    // ——————— Fade-in on scroll ———————
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

    // ——————— Nav: scroll glass + progress bar ———————
    const siteNav = document.getElementById('siteNav');
    const navProgress = document.getElementById('navProgress');

    function updateNavOnScroll() {
        const scrolled = window.scrollY > 60;
        siteNav.classList.toggle('scrolled', scrolled);

        // Progress bar: fill based on scroll position through page
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        navProgress.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateNavOnScroll, { passive: true });
    updateNavOnScroll();

    // ——————— Nav: active section scroll spy ———————
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        const isActive = link.getAttribute('data-target') === id;
                        link.classList.toggle('active', isActive);
                    });
                }
            });
        },
        { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach(section => navObserver.observe(section));

    // ——————— Nav: smooth scroll on link click ———————
    document.querySelectorAll('.nav-link, .nav-overlay-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                const navHeight = siteNav.offsetHeight;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
            // Close overlay if open
            navOverlay.classList.remove('open');
        });
    });

    // Logo → scroll to top
    document.querySelector('.nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ——————— Mobile menu ———————
    const navBurger = document.getElementById('navBurger');
    const navOverlay = document.getElementById('navOverlay');
    const navClose = document.getElementById('navClose');

    navBurger.addEventListener('click', () => navOverlay.classList.add('open'));
    navClose.addEventListener('click', () => navOverlay.classList.remove('open'));

    // Close overlay on backdrop click
    navOverlay.addEventListener('click', (e) => {
        if (e.target === navOverlay) navOverlay.classList.remove('open');
    });

})();
