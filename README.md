# campus-life-planner
# Campus Life Planner

A responsive, accessible task and event planner built with vanilla HTML, CSS and JavaScript.

**Live site:** https://elham-cyber780.github.io/campus-life-planner/
**GitHub:** https://github.com/Elham-cyber780
**Email:** e.abdulrahm@alustudent.com 

## Theme
Campus Life Planner: track tasks and events with a due date, a duration and a tag.

## Wireframes
- `assets/wireframe-mobile.jpg`
- `assets/wireframe-desktop.jpg`

## Data model
Each record is stored in localStorage and in `seed.json`:

| Field | Type | Example |
|---|---|---|
| id | string | "task_0001" |
| title | string | "Submit the HR application" |
| dueDate | string (YYYY-MM-DD) | "2026-10-18" |
| duration | number (minutes) | 120 |
| tag | string | "Admin" |
| createdAt | ISO timestamp | "2026-10-10T09:30:00.000Z" |
| updatedAt | ISO timestamp | "2026-10-10T09:30:00.000Z" |

## Accessibility plan
- Semantic landmarks: header, nav, main, section, footer, with one h1 and a logical heading order.
- A skip-to-content link as the first focusable element.
- Every form input has a label linked with for/id.
- A visible focus style on every interactive element.
- Every feature (add, edit, delete, sort, search, settings) works with the keyboard alone.
- Messages use role="status" or aria-live. The weekly cap message is polite when under the cap and assertive when exceeded.
- Text colour contrast of at least 4.5:1.
- Search matches are highlighted with `<mark>`.
- Mobile-first layout with breakpoints near 360px, 768px and 1024px.
- Animations respect `prefers-reduced-motion`.

## Features
(coming soon)

## Regex catalog
(coming soon)

## Keyboard map
(coming soon)

## How to run tests
(coming soon)