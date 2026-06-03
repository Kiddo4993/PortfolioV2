(function () {
    'use strict';

    const cursorDot  = document.createElement('div');
    const cursorRing = document.createElement('div');
    cursorDot.className  = 'cursor-dot';
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursorDot.style.left = mx + 'px';
        cursorDot.style.top  = my + 'px';
    });

    (function animateRing() {
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        cursorRing.style.left = rx + 'px';
        cursorRing.style.top  = ry + 'px';
        requestAnimationFrame(animateRing);
    })();

    const hoverSel = 'a, button, .project-card-name, .project-featured-name, .nav-logo, .col-head';
    document.querySelectorAll(hoverSel).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
    });

    (function splitHeroName() {
        const heroName = document.querySelector('.hero-name');
        if (!heroName) return;

        const first = 'Dylan';
        const last  = 'Duan';

        const firstSpans = [...first].map((ch, i) =>
            `<span class="char" style="--i:${i}">${ch}</span>`
        ).join('');

        const lastSpans = [...last].map((ch, i) =>
            `<span class="char" style="--i:${i + first.length + 1}">${ch}</span>`
        ).join('');

        heroName.innerHTML = firstSpans + '<br><em>' + lastSpans + '</em>';

        requestAnimationFrame(() => requestAnimationFrame(() => {
            heroName.classList.add('chars-visible');
        }));
    })();

    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

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

    const siteNav    = document.getElementById('siteNav');
    const navProgress = document.getElementById('navProgress');

    function updateNavOnScroll() {
        siteNav.classList.toggle('scrolled', window.scrollY > 60);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        navProgress.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
    }

    window.addEventListener('scroll', updateNavOnScroll, { passive: true });
    updateNavOnScroll();

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('data-target') === id);
                    });
                }
            });
        },
        { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach(s => navObserver.observe(s));

    const navOverlay = document.getElementById('navOverlay');

    document.querySelectorAll('.nav-link, .nav-overlay-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('data-target'));
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - siteNav.offsetHeight,
                    behavior: 'smooth'
                });
            }
            navOverlay.classList.remove('open');
        });
    });

    document.querySelector('.nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const navBurger = document.getElementById('navBurger');
    const navClose  = document.getElementById('navClose');

    navBurger.addEventListener('click', () => navOverlay.classList.add('open'));
    navClose.addEventListener('click',  () => navOverlay.classList.remove('open'));
    navOverlay.addEventListener('click', (e) => {
        if (e.target === navOverlay) navOverlay.classList.remove('open');
    });

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

    const heroInner = document.querySelector('.hero-inner');
    let ticking = false;

    function updateParallax() {
        if (heroInner) {
            const y = window.scrollY;
            const heroH = heroInner.closest('.hero').offsetHeight;
            if (y < heroH) {
                heroInner.style.transform = `translateY(${y * 0.2}px)`;
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

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

})();
