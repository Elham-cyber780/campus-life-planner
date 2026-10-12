
import {
    titlePattern,
    datePattern,
    numberPattern,
    tagPattern,
    duplicateWordPattern
} from './validators.js';

const taskForm = document.querySelector("form");

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

// Load seed data and display it in the Records table
fetch("./seed.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(records => {
        console.log(records);

        // Select the table body
        const recordsBody = document.querySelector("#records-body");

        // Create one table row for every record
        records.forEach(record => {
            const row = document.createElement("tr");

            // Title cell
            const titleCell = document.createElement("td");
            titleCell.textContent = record.title;
            row.appendChild(titleCell);

            // Due date cell
            const dueDateCell = document.createElement("td");
            dueDateCell.textContent = record.dueDate;
            row.appendChild(dueDateCell);

            // Duration cell
            const durationCell = document.createElement("td");
            durationCell.textContent = record.duration;
            row.appendChild(durationCell);

            // Tag cell
            const tagCell = document.createElement("td");
            tagCell.textContent = record.tag;
            row.appendChild(tagCell);

            // Empty Actions cell for now
            const actionsCell = document.createElement("td");
            row.appendChild(actionsCell);

            // Add the completed row to the table
            recordsBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error loading seed data:", error);
    });