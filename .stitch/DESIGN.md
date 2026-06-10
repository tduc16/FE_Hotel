# Design System: Hotel Hoang Minh - Manage Booking
**Project ID:** 12806413409878354001

## 1. Visual Theme & Atmosphere
**Atmosphere:** Modern Luxury Hotel, elegant, quiet, high-end corporate hospitality.
**Theme:** Soft blue-white background combined with deep teal-blue tones as main accents. High contrast text on container elements for ultimate readability. Warm golden warnings/badges and clean corporate gray footers.

## 2. Color Palette & Roles
* **Primary Deep Blue-Green/Teal (#004c6d):** Main brand color, used for prominent headings, primary dark-theme backdrops, and interactive states.
* **Primary Container Teal (#00658f):** Used for high-impact buttons, highlighted indicators, and icon accents.
* **On Primary Container Light Blue (#b2deff):** Highlighted text on dark background container, active labels.
* **Background Light Blue-White (#f8f9ff):** Primary app background.
* **Surface Container Lowest White (#ffffff):** Background for clean cards, forms, and main surface areas.
* **Surface Container Light Blue (#e5eeff):** Background for hover states, select indicators, and structured sectioning.
* **On Surface Deep Blue-Black (#0d1c2e):** Main body text, labels, and high-priority copy.
* **Secondary Grayish Blue (#545f72):** Subtext, captions, and secondary actions.
* **Error Rose Red (#ba1a1a):** Form validation errors and destructive buttons (e.g. Cancel Booking).

## 3. Typography Rules
* **Font family:** `Manrope` (Google Fonts, weights: 400, 500, 600, 700, 800)
* **Display headings:** bold weight, letter-spacing -0.02em for desktop.
* **Main body text:** medium weight (400 or 500), 14px to 16px, line-height 24px.
* **Icons:** `Material Symbols Outlined` (filled state where appropriate).

## 4. Component Stylings
* **Buttons:** `rounded-xl` (0.75rem), primary container (#00658f) background with white text, scale-95 transition on active, brightness hover.
* **Cards/Containers:** Generous rounded corner `rounded-[24px]` (1.5rem), shadow `shadow-[0_4px_20px_rgba(0,101,143,0.04)]`, thin border `border-outline-variant/30` (#c0c7cf).
* **Inputs/Forms:** Background slateish-gray `#edf2f7` or light `#edf2f7`, `rounded-xl`, padding base-md, no border, focus ring `#00658f` with 2px.

## 5. Layout Principles
* **Layout Grid:** max-width container-max (1200px), gutter 24px, vertical spacing based on base-md (12px to 24px).
* **Header:** sticky, z-50, shadow on scroll.
