/* ========================================
   NIGHT SKY PORTFOLIO — Raw/Dial Redesign
   Starfield · Camera Dial Nav · Observers
   Mobile Nav · Back to Top · Accessibility
   ======================================== */

(function () {
    'use strict';

    // ——————— Starfield Canvas ———————
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    const STAR_COUNT = 220;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.4 + 0.3,
            alpha: Math.random() * 0.6 + 0.2,
            alphaDir: (Math.random() - 0.5) * 0.008,
            drift: (Math.random() - 0.5) * 0.08,
        };
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(createStar());
        }
    }

    function createShootingStar() {
        const side = Math.random();
        return {
            x: side < 0.5 ? Math.random() * canvas.width : 0,
            y: side < 0.5 ? 0 : Math.random() * canvas.height * 0.5,
            len: Math.random() * 60 + 40,
            speed: Math.random() * 4 + 3,
            alpha: 1,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        };
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grd = ctx.createRadialGradient(
            canvas.width * 0.3, canvas.height * 0.5, 0,
            canvas.width * 0.3, canvas.height * 0.5, canvas.width * 0.6
        );
        grd.addColorStop(0, 'rgba(201, 151, 42, 0.04)');
        grd.addColorStop(0.5, 'rgba(50, 35, 8, 0.02)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const s of stars) {
            s.alpha += s.alphaDir;
            if (s.alpha >= 0.8 || s.alpha <= 0.15) s.alphaDir *= -1;
            s.y += s.drift;

            if (s.y > canvas.height + 5) {
                s.y = -5;
                s.x = Math.random() * canvas.width;
            } else if (s.y < -5) {
                s.y = canvas.height + 5;
                s.x = Math.random() * canvas.width;
            }

            ctx.fillStyle = `rgba(224, 230, 240, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, Math.max(1.5, s.r * 2), Math.max(1.5, s.r * 2));

            if (s.r > 1) {
                ctx.fillStyle = `rgba(129, 140, 248, ${s.alpha * 0.15})`;
                ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 4, s.r * 4);
            }
        }

        if (Math.random() < 0.003 && shootingStars.length < 2) {
            shootingStars.push(createShootingStar());
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const dx = Math.cos(ss.angle) * ss.speed;
            const dy = Math.sin(ss.angle) * ss.speed;

            ss.x += dx;
            ss.y += dy;
            ss.alpha -= 0.012;

            if (ss.alpha <= 0 || ss.x > canvas.width + 100 || ss.y > canvas.height + 100) {
                shootingStars.splice(i, 1);
                continue;
            }

            const tailX = ss.x - Math.cos(ss.angle) * ss.len;
            const tailY = ss.y - Math.sin(ss.angle) * ss.len;

            // Blocky tail segments
            const segments = 8;
            for (let j = 0; j < segments; j++) {
                let px = tailX + (ss.x - tailX) * (j / segments);
                let py = tailY + (ss.y - tailY) * (j / segments);
                ctx.fillStyle = `rgba(224, 230, 240, ${ss.alpha * (j / segments)})`;
                ctx.fillRect(px, py, 2, 2);
            }

            // Head of shooting star
            ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
            ctx.fillRect(ss.x - 1, ss.y - 1, 4, 4);
        }

        requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    initStars();
    drawStars();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });

    // ——————— Intersection Observer for fade-in ———————
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px',
        }
    );
    fadeEls.forEach(el => observer.observe(el));

    // ——————— Shared scroll-to section helper ———————
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // ——————— Camera Dial Navigation ———————
    const dialRing = document.getElementById('dialRing');
    const dialItems = document.querySelectorAll('.dial-item');
    const sections = document.querySelectorAll('.section');

    const TOTAL_ITEMS = dialItems.length;
    const ANGLE_STEP = 360 / TOTAL_ITEMS;

    function rotateDialToIndex(index) {
        const targetRotation = -90 - (index * ANGLE_STEP);
        dialRing.style.transform = `translate(-50%, -50%) rotate(${targetRotation}deg)`;

        dialItems.forEach((item, i) => {
            const isActive = i === index;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    // Click on dial items
    dialItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            scrollToSection(targetId);
        });

        // Keyboard support: Enter or Space activates
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                scrollToSection(targetId);
            }
        });
    });

    // ——————— Mobile bottom navigation ———————
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    mobileNavItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            scrollToSection(targetId);
        });
    });

    function updateMobileNav(index) {
        mobileNavItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    // ——————— Scroll spy to update dial & mobile nav ———————
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const dialIndex = Array.from(dialItems).findIndex(
                        item => item.getAttribute('data-target') === id
                    );
                    if (dialIndex !== -1) {
                        rotateDialToIndex(dialIndex);
                        updateMobileNav(dialIndex);
                    }
                }
            });
        },
        {
            rootMargin: "-20% 0px -70% 0px"
        }
    );

    sections.forEach(section => navObserver.observe(section));

    // Initialize at 0
    rotateDialToIndex(0);
    updateMobileNav(0);

    // ——————— Back to top button ———————
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ——————— Hero scroll hint: hide on first scroll ———————
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        const hideHint = () => {
            scrollHint.style.opacity = '0';
            scrollHint.style.transition = 'opacity 0.4s ease';
            window.removeEventListener('scroll', hideHint);
        };
        window.addEventListener('scroll', hideHint, { passive: true, once: true });
    }

})();
