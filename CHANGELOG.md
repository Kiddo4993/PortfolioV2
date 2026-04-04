# Portfolio Changelog

All notable changes to this project will be documented here.

## [2026-04-04] - Better Portfolio Update
### Added
- Open Graph and Twitter Card meta tags for better social sharing and SEO.
- Canonical URL link tag.
- Mobile-friendly bottom navigation bar that appears on small screens (≤600 px) alongside the camera dial.
- "Back to top" fixed button that appears after scrolling 400 px down.
- Hero CTA buttons: `[VIEW PROJECTS]` and `[GET IN TOUCH]` for clearer user flow.
- Scroll-down hint animation at the bottom of the hero section that fades out on first scroll.
- Staggered fade-in animation for hero tagline lines.
- Skip-to-main-content link for keyboard/screen-reader accessibility.
- `aria-label` attributes on navigation, sections, and interactive elements.
- `aria-current` attribute on active dial/nav items for screen readers.
- Keyboard support (Enter/Space) on dial navigation buttons.
- `prefers-reduced-motion` CSS media query to disable animations for users who prefer less motion.
- `▸` bullet prefix styling for the Skills lists to improve visual scannability.
- Converted `<div>` dial items to `<button>` elements for native keyboard accessibility.
- Semantic `<article>` tags for project and art card entries.
- `role="list"` on the dial ring and `role="listitem"` on dial items.

### Changed
- Content-wrapper gains bottom padding on mobile to prevent content hiding behind mobile nav.
- Back-to-top button repositioned higher on mobile to sit above the bottom nav bar.
- Dial items now use proper button elements instead of divs.
- Hero tagline lines now animate in sequentially with a 0.3 s stagger.

## [2026-04-01 13:05:00] - Retro Pixelated Theme Update
### Added
- "Pixelated" aesthetic across the entire application using the `VT323` font.
- Hard-edged, retro box shadows and borders, removing the "AI-generated" glassmorphism/soft glows.
- CRT scanline overlay effect using pure CSS to simulate an old monitor display.
- RGB Glitch animations on header hover.
- Blocky, pixel-perfect stars and shooting stars in the canvas animation.
- A blocky, brutalist restyling of the camera dial navigation menu.

### Changed
- Replaced Google Fonts 'Inter' and 'JetBrains Mono' with 'VT323'.
- Converted soft shadow styles to solid 8-bit style offset shadows (`8px 8px 0px`).
- Canvas stars are now rendered as sharp rectangles (`fillRect`) instead of soft gradients/arcs.
- Replaced smooth shooting star gradients with trailing solid rectangles.
