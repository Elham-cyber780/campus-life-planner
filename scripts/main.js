
import {
    titlePattern,
    datePattern,
    numberPattern,
    tagPattern,
    duplicateWordPattern
} from "./validators.js";

import { compileRegex } from "./search.js";

let records = [];

const taskForm = document.querySelector("#task-form");
const sortSelect = document.querySelector("#sort-select");
const searchBox = document.querySelector("#search-input");
const caseBox = document.querySelector("#case-toggle");
const searchStatus = document.querySelector("#search-status");
const recordsBody = document.querySelector("#records-body");

// Display records in the table.
function renderRecords(list) {
    recordsBody.innerHTML = "";

    list.forEach(function (record) {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = record.title;

        const dateCell = document.createElement("td");
        dateCell.textContent = record.dueDate;

        const durationCell = document.createElement("td");
        durationCell.textContent = record.duration;

        const tagCell = document.createElement("td");
        tagCell.textContent = record.tag;

        const actionsCell = document.createElement("td");

        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(durationCell);
        row.appendChild(tagCell);
        row.appendChild(actionsCell);

        recordsBody.appendChild(row);
    });
}

// Sort a copy of the records so the original list remains unchanged.
function getSortedRecords(list) {
    const sortedRecords = [...list];

    switch (sortSelect.value) {
        case "date-asc":
            sortedRecords.sort(function (a, b) {
                return a.dueDate.localeCompare(b.dueDate);
            });
            break;

        case "date-desc":
            sortedRecords.sort(function (a, b) {
                return b.dueDate.localeCompare(a.dueDate);
            });
            break;

        case "title-asc":
            sortedRecords.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            break;

        case "title-desc":
            sortedRecords.sort(function (a, b) {
                return b.title.localeCompare(a.title);
            });
            break;

        case "duration-asc":
            sortedRecords.sort(function (a, b) {
                return Number(a.duration) - Number(b.duration);
            });
            break;

        case "duration-desc":
            sortedRecords.sort(function (a, b) {
                return Number(b.duration) - Number(a.duration);
            });
            break;
    }

    return sortedRecords;
}

// Filter records by searching their titles and tags.
function filterRecords() {
    const pattern = searchBox.value;
    const flags = caseBox.checked ? "i" : "";
    const regex = compileRegex(pattern, flags);

    // An empty search shows every record.
    if (pattern === "") {
        searchStatus.textContent =
            records.length + (records.length === 1 ? " match" : " matches");

        renderRecords(getSortedRecords(records));
        return;
    }

    // An invalid pattern shows an error without changing the table.
    if (regex === null) {
        searchStatus.textContent = "Invalid pattern";
        return;
    }

    const matches = records.filter(function (record) {
        const title = String(record.title);
        const tag = String(record.tag);

        regex.lastIndex = 0;
        const titleMatches = regex.test(title);

        regex.lastIndex = 0;
        const tagMatches = regex.test(tag);

        return titleMatches || tagMatches;
    });

    searchStatus.textContent =
        matches.length + (matches.length === 1 ? " match" : " matches");

    renderRecords(getSortedRecords(matches));
}

searchBox.addEventListener("input", filterRecords);
caseBox.addEventListener("change", filterRecords);
sortSelect.addEventListener("change", filterRecords);

// Check a value against a regular expression.
function matchesPattern(pattern, value) {
    pattern.lastIndex = 0;
    return pattern.test(value);
}

// Display a validation message beside its field.
function setError(id, message) {
    document.querySelector("#" + id + "-error").textContent = message;
}

// Validate the form when the user submits it.
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Keep the original input so the regex can detect spaces.
    const title = document.querySelector("#title").value;
    const dueDate = document.querySelector("#dueDate").value;
    const duration = document.querySelector("#duration").value;
    const tag = document.querySelector("#tag").value;

    let formIsValid = true;

    // Validate the title.
    if (!matchesPattern(titlePattern, title)) {
        setError(
            "title",
            "Enter a valid task title. Do not start or end with spaces."
        );
        formIsValid = false;
    } else if (matchesPattern(duplicateWordPattern, title)) {
        setError(
            "title",
            "Heads up: your title contains a repeated word."
        );
    } else {
        setError("title", "");
    }

    // Validate the date.
    if (!matchesPattern(datePattern, dueDate)) {
        setError(
            "dueDate",
            "Use the format YYYY-MM-DD and enter a valid date."
        );
        formIsValid = false;
    } else {
        setError("dueDate", "");
    }

    // Validate the duration.
    if (!matchesPattern(numberPattern, duration)) {
        setError(
            "duration",
            "Enter a valid duration in minutes using numbers only."
        );
        formIsValid = false;
    } else {
        setError("duration", "");
    }

    // Validate the tag.
    if (!matchesPattern(tagPattern, tag)) {
        setError(
            "tag",
            "Enter a valid tag using the required tag format."
        );
        formIsValid = false;
    } else {
        setError("tag", "");
    }

    if (formIsValid) {
        console.log("All fields valid");
    }
});

// Load the initial records from seed.json.
fetch("./seed.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Could not load seed.json");
        }

        return response.json();
    })
    .then(function (loadedRecords) {
        records = loadedRecords;
        filterRecords();
    })
    .catch(function (error) {
        console.error("Error loading records:", error);
        searchStatus.textContent = "Could not load records.";
    });