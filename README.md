# Campus Life Planner

A task and event planner built with vanilla HTML, CSS, and JavaScript. Campus Life Planner helps students organize tasks, track deadlines, estimate task durations, and group activities using tags.

**Live site:** https://elham-cyber780.github.io/campus-life-planner/  
**GitHub repository:** https://github.com/Elham-cyber780/campus-life-planner

## Theme

Campus Life Planner supports student productivity by keeping task information organized in one place. Each task has a title, due date, estimated duration in minutes, and tag.

## Features

- **Task management:** Add, edit, and delete tasks.
- **Dashboard:** View the total number of records, combined task duration, most-used tag, and a seven-day task-creation summary.
- **Search:** Search task titles and tags using regular expressions.
- **Search highlighting:** Highlight matching text in task titles and tags.
- **Sorting:** Sort records by due date, title, or duration in ascending or descending order.
- **Form validation:** Validate titles, dates, durations, and tags before saving.
- **Browser storage:** Save records in `localStorage` so they can persist between visits in the same browser.
- **Sample data:** Load initial records from `seed.json` when suitable saved records are unavailable.
- **Accessibility:** Responsive layouts with breakpoints for mobile, tablet, and desktop screen sizes.
Hover and interactiob transitions, with reduced-mpotion preferences respected 
JSON import/export status messages announced through an accessible status region
JSON EXPORT: Download saved task recoeds as a JSON file.
JSON import: Import previously exported JSON records, validate the data, and report errors without replacing exisiting records when validation or saving fails.

**Verified functionality:** Task management,search and sorting,browser storage, JSON import/export,and responsive layout have been tested manually.Automated tests have also been run. See the testing checklist below for the scope of verification.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript using ES modules
- Browser `localStorage`
- JSON for sample data

## Project structure

- `index.html` — Page structure and task-management interface.
- `styles/main.css` — Page styling and responsive layout.
- `scripts/main.js` — Application state, task management, validation, dashboard, sorting, and rendering.
- `scripts/storage.js` — Browser storage functions.
- `scripts/search.js` — Regular-expression compilation for search.
- `scripts/validators.js` — Regular-expression patterns used for form validation.
- `seed.json` — Sample task records.
- `tests.html` — Test page, if applicable to the current implementation.
- `assets/` — Project wireframes and visual assets.

## Data model

Each task record contains the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique task identifier |
| `title` | String | Task title |
| `dueDate` | String | Due date in `YYYY-MM-DD` format |
| `duration` | Number | Estimated duration in minutes |
| `tag` | String | Category or label |
| `createdAt` | String | Creation timestamp in ISO format |
| `updatedAt` | String | Last-update timestamp in ISO format |

Sample records are stored in `seed.json`. User records are saved in browser `localStorage`.

## Regular-expression catalog

The application uses regular expressions to validate input and support search.

| Pattern | Purpose |
|---|---|
| `titlePattern` | Rejects leading, trailing, and consecutive ordinary spaces |
| `numberPattern` | Accepts non-negative integers and decimals with up to two decimal places |
| `datePattern` | Checks date format and basic month/day ranges |
| `tagPattern` | Allows letters separated by single spaces or hyphens |
| `duplicateWordPattern` | Detects consecutive repeated words, ignoring case |
| `compileRegex()` | Safely attempts to compile a user-provided search pattern and handles invalid expressions |

The date validator also checks whether a date exists on the calendar, since a regular expression alone cannot validate every calendar date.

## Accessibility

The project includes:

- Semantic page landmarks and a logical heading structure.
- A skip-to-content link.
- Labels associated with form controls.
- Visible keyboard-focus indicators.
- Accessible status messages for search and form feedback.
- Search highlighting created with text nodes and `<mark>` elements rather than inserting user search input as HTML.

Further accessibility checks should verify color contrast, keyboard operation, reduced-motion preferences, and the weekly summary's screen-reader experience.

## Getting started

1. Clone or download the project repository.
2. Open the project folder in a code editor.
3. Serve the project using a local development server.
4. Open `index.html` through that server so the JavaScript modules and `seed.json` can load correctly.
5. Add a task and refresh the page to check whether it remains saved.

Opening the project through a local server is recommended instead of opening the HTML file directly.

## Testing checklist

Before submission, verify the following manually:

- Add a task with valid information.
- Reject invalid titles, dates, durations, and tags.
- Try an impossible calendar date such as `2026-02-31`.
- Edit a task and confirm that the existing record is updated.
- Delete a task and confirm that it disappears.
- Refresh the page and check persistence.
- Sort by each available field in both directions.
- Search for a matching title or tag.
- Enter an invalid regular expression and confirm that the application displays an error rather than crashing.
- Confirm that search highlighting matches the results.
- Test the page at mobile, tablet, and desktop widths.
- Test keyboard navigation and visible focus indicators.
- Confirmed adding, editing. and deleting tasks
- Confirmed search, sorting, and persistence after refreshing the page.
Confirmed JSON export and valoid JSON import
Confirmed that invalid JSON is rejected and an error message
Checked the layout at 375px, 768px, and 1280px viewport widths
Ran the automated test page, with 20 tests passing 

## Known limitations

JSON file import/export has not yet been verified. Responsive breakpoints, reduced-motion behavior, and the full accessibility experience also require testing before they can be reported as complete.

## Author

Abdul Rahman Elham Wumpini

GitHub: https://github.com/Elham-cyber780
