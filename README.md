# Design Brooks Rewrite

This project was rewritten from a basic static architectural landing page into a more professional studio website with stronger structure, cleaner copy, and better mobile responsiveness.

## What Changed

The original site used a simple layout with dated navigation, placeholder-style sections, and limited responsiveness. The rewrite focused on making the brand feel more like a real architecture and interior design studio.

Key improvements:

- Rewrote the full website copy to sound more professional and studio-focused
- Replaced the old template-style navigation and cluttered menu items
- Added a stronger hero section with clearer messaging and call-to-action buttons
- Added new sections for:
  - studio introduction
  - capabilities
  - selected projects
  - trust and statistics
  - services
  - process
  - testimonials
  - FAQ
  - contact form
- Improved the footer with cleaner information architecture
- Removed the old alert-based JavaScript behavior

## Design Approach

The redesign uses a more editorial and premium visual direction:

- warm neutral color palette
- serif and sans-serif typography pairing
- larger spacing and stronger hierarchy
- card-based layout with softer surfaces and shadows
- more polished composition for project imagery

The goal was to make the site feel suitable for an architecture firm presenting serious residential, commercial, hospitality, and refurbishment work.

## Mobile Responsiveness

The mobile experience was rewritten intentionally rather than only shrinking the desktop layout.

Responsive improvements include:

- dedicated mobile hamburger navigation
- full menu panel styling for small screens
- better stacking of hero, cards, and grid layouts
- full-width buttons on smaller devices
- safer spacing and font scaling for narrow screens
- improved handling for project cards, metrics, testimonials, and contact content
- overflow protection for very small screens

The hamburger menu background was also updated to be solid so the hero text does not show through behind it on mobile.

## Files Updated

- [index.html](C:\Users\new\Desktop\Cloned\designBrooks\index.html)
- [style.css](C:\Users\new\Desktop\Cloned\designBrooks\llb\css\style.css)
- [main.js](C:\Users\new\Desktop\Cloned\designBrooks\llb\script\main.js)

## Structure Overview

### HTML

`index.html` now contains the full single-page site structure with the following sections:

- hero
- intro statement
- value strip
- studio
- capabilities
- projects
- stats
- services
- process
- testimonials
- FAQ
- contact
- footer

### CSS

`llb/css/style.css` was rewritten to handle:

- global theme variables
- page layout and spacing
- navigation and mobile menu styles
- card components
- section grids
- contact form styling
- responsive breakpoints for tablet and mobile

### JavaScript

`llb/script/main.js` now handles:

- hamburger menu open and close behavior
- closing the menu on resize and link click
- body scroll lock when the mobile menu is open
- reveal-on-scroll animations
- simple contact form submission feedback

## Summary

This rewrite changed the website from a simple static template into a fuller professional architectural presentation site. The focus was on better brand perception, cleaner content, more useful sections, and a stronger responsive experience across devices.
