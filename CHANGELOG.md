# Portfolio Changelog

All notable changes to this project will be documented here.

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
