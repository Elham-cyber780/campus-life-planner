
import {
    titlePattern,
    datePattern,
    numberPattern,
    tagPattern,
    duplicateWordPattern
} from './validators.js';

// Master list of records
let records = [];

const taskForm = document.querySelector("form");

// Form validation
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let formIsValid = true;

    // Title validation and duplicate-word warning
    const titleInput = document.querySelector("#title");
    const titleError = document.querySelector("#title-error");

    if (!titlePattern.test(titleInput.value)) {
        titleError.textContent =
            "Title cannot start or end with a space, or contain double spaces.";
        formIsValid = false;
    } else if (duplicateWordPattern.test(titleInput.value)) {
        titleError.textContent =
            "Heads up: Your title contains a repeated word.";
    } else {
        titleError.textContent = "";
    }

    // Due date validation
    const dueDateInput = document.querySelector("#dueDate");
    const dueDateError = document.querySelector("#dueDate-error");

    if (!datePattern.test(dueDateInput.value)) {
        dueDateError.textContent = "Use the format YYYY-MM-DD.";
        formIsValid = false;
    } else {
        dueDateError.textContent = "";
    }

    // Duration validation
    const durationInput = document.querySelector("#duration");
    const durationError = document.querySelector("#duration-error");

    if (!numberPattern.test(durationInput.value)) {
        durationError.textContent =
            "Enter minutes as a number, e.g. 90 or 7.5.";
        formIsValid = false;
    } else {
        durationError.textContent = "";
    }

    // Tag validation
    const tagInput = document.querySelector("#tag");
    const tagError = document.querySelector("#tag-error");

    if (!tagPattern.test(tagInput.value)) {
        tagError.textContent =
            "Letters, spaces and hyphens only.";
        formIsValid = false;
    } else {
        tagError.textContent = "";
    }

    // Report whether all fields passed validation
    if (formIsValid) {
        console.log("All fields valid");
    }
});

// Render records in the table
function renderRecords(list) {
    const recordsBody = document.querySelector("#records-body");

    // Clear existing rows before redrawing
    recordsBody.textContent = "";

    list.forEach(function (record) {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = record.title;
        row.appendChild(titleCell);

        const dueDateCell = document.createElement("td");
        dueDateCell.textContent = record.dueDate;
        row.appendChild(dueDateCell);

        const durationCell = document.createElement("td");
        durationCell.textContent = record.duration;
        row.appendChild(durationCell);

        const tagCell = document.createElement("td");
        tagCell.textContent = record.tag;
        row.appendChild(tagCell);

        // Actions column remains empty for now
        const actionsCell = document.createElement("td");
        row.appendChild(actionsCell);

        recordsBody.appendChild(row);
    });
}

// Sorting controls
const sortSelect = document.querySelector("#sort-select");

sortSelect.addEventListener("change", function () {
    const sortValue = sortSelect.value;

    switch (sortValue) {
        case "date-asc":
            records.sort(function (a, b) {
                return a.dueDate.localeCompare(b.dueDate);
            });
            break;

        case "date-desc":
            records.sort(function (a, b) {
                return b.dueDate.localeCompare(a.dueDate);
            });
            break;

        case "title-asc":
            records.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            break;

        case "title-desc":
            records.sort(function (a, b) {
                return b.title.localeCompare(a.title);
            });
            break;

        case "duration-asc":
            records.sort(function (a, b) {
                return Number(a.duration) - Number(b.duration);
            });
            break;

        case "duration-desc":
            records.sort(function (a, b) {
                return Number(b.duration) - Number(a.duration);
            });
            break;
    }

    renderRecords(records);
});

// Load seed data
fetch("./seed.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(loadedRecords => {
        records = loadedRecords;
        console.log(records);
        renderRecords(records);
    })
    .catch(error => {
        console.error("Error loading seed data:", error);
    });