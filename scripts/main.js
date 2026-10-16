
import {
    titlePattern,
    numberPattern,
    datePattern,
    tagPattern,
    duplicateWordPattern
} from "./validators.js";

import { compileRegex } from "./search.js";
import { saveRecords, loadRecords } from "./storage.js";

// --------------------------------------------------
// 1. APPLICATION STATE AND HTML ELEMENTS
// --------------------------------------------------

let records = [];
let editingRecordId = null;

const recordsBody = document.getElementById("records-body");
const searchBox = document.getElementById("search-input");
const caseBox = document.getElementById("case-toggle");
const sortSelect = document.getElementById("sort-select");
const searchStatus = document.getElementById("search-status");
const taskForm = document.getElementById("task-form");

const titleInput = document.getElementById("title");
const dueDateInput = document.getElementById("dueDate");
const durationInput = document.getElementById("duration");
const tagInput = document.getElementById("tag");

const totalRecordsElement = document.getElementById("total-records");
const totalDurationElement = document.getElementById("total-duration");
const topTagElement = document.getElementById("top-tag");
const weeklyTrendElement = document.getElementById("weekly-trend");

// Find the existing submit button without changing the HTML.
const submitButton =
    taskForm.querySelector('button[type="submit"]') ||
    taskForm.querySelector('input[type="submit"]') ||
    taskForm.querySelector("button:not([type])");

// Add a Cancel Edit button next to the submit button.
const cancelEditButton = document.createElement("button");
cancelEditButton.type = "button";
cancelEditButton.textContent = "Cancel Edit";
cancelEditButton.hidden = true;

if (submitButton) {
    submitButton.insertAdjacentElement("afterend", cancelEditButton);
} else {
    taskForm.appendChild(cancelEditButton);
}

// --------------------------------------------------
// 2. VALIDATE RECORD STRUCTURE
// --------------------------------------------------

function isValidRecord(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return false;
    }

    return (
        typeof record.id === "string" &&
        record.id.length > 0 &&
        typeof record.title === "string" &&
        titlePattern.test(record.title) &&
        typeof record.dueDate === "string" &&
        isRealDate(record.dueDate) &&
        record.duration !== "" &&
        Number.isFinite(Number(record.duration)) &&
        Number(record.duration) >= 0 &&
        numberPattern.test(String(record.duration)) &&
        typeof record.tag === "string" &&
        tagPattern.test(record.tag) &&
        typeof record.createdAt === "string" &&
        !Number.isNaN(Date.parse(record.createdAt)) &&
        typeof record.updatedAt === "string" &&
        !Number.isNaN(Date.parse(record.updatedAt))
    );
}

function isRealDate(value) {
    if (!datePattern.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function isValidRecordList(data) {
    return (
        Array.isArray(data) &&
        data.every(isValidRecord) &&
        new Set(data.map(record => record.id)).size === data.length
    );
}

// --------------------------------------------------
// 3. DASHBOARD STATISTICS
// --------------------------------------------------

function updateDashboard() {
    totalRecordsElement.textContent = records.length;

    const durationSum = records.reduce(function (sum, record) {
        return sum + Number(record.duration);
    }, 0);

    totalDurationElement.textContent =
        durationSum.toLocaleString() + " minutes";

    const tagCounts = {};

    records.forEach(function (record) {
        const tag = record.tag.trim();
        const normalizedTag = tag.toLowerCase();

        if (tag) {
            if (!tagCounts[normalizedTag]) {
                tagCounts[normalizedTag] = {
                    label: tag,
                    count: 0
                };
            }

            tagCounts[normalizedTag].count++;
        }
    });

    const tags = Object.keys(tagCounts);

    if (tags.length === 0) {
        topTagElement.textContent = "No tags yet";
    } else {
        const mostUsed = tags.reduce(function (best, tag) {
            return tagCounts[tag].count > tagCounts[best].count
                ? tag
                : best;
        });

        topTagElement.textContent = tagCounts[mostUsed].label;
    }

    // Count tasks created on each of the last seven calendar days.
    weeklyTrendElement.replaceChildren();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
        const day = new Date(today);
        day.setDate(today.getDate() - daysAgo);

        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        const count = records.filter(function (record) {
            const created = new Date(record.createdAt);

            return (
                !Number.isNaN(created.getTime()) &&
                created >= day &&
                created < nextDay
            );
        }).length;

        const item = document.createElement("li");
        const label = day.toLocaleDateString("en", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        item.textContent = label + ": " + count + " task(s)";
        weeklyTrendElement.appendChild(item);
    }
}

// --------------------------------------------------
// 4. REGEX SEARCH AND SAFE HIGHLIGHTING
// --------------------------------------------------

function appendHighlightedText(cell, text, regex) {
    const value = String(text);

    if (!regex) {
        cell.textContent = value;
        return;
    }

    const matches = [];
    let match;

    const flags = regex.flags.includes("g")
        ? regex.flags
        : regex.flags + "g";

    const globalRegex = new RegExp(regex.source, flags);

    while ((match = globalRegex.exec(value)) !== null) {
        if (match[0].length === 0) {
            globalRegex.lastIndex++;
            continue;
        }

        matches.push({
            text: match[0],
            index: match.index
        });
    }

    if (matches.length === 0) {
        cell.textContent = value;
        return;
    }

    let position = 0;

    matches.forEach(function (item) {
        cell.appendChild(
            document.createTextNode(value.slice(position, item.index))
        );

        const mark = document.createElement("mark");
        mark.textContent = item.text;
        cell.appendChild(mark);

        position = item.index + item.text.length;
    });

    cell.appendChild(document.createTextNode(value.slice(position)));
}

// --------------------------------------------------
// 5. EDIT AND DELETE ACTIONS
// --------------------------------------------------

function startEditing(recordId) {
    const record = records.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        searchStatus.textContent = "Could not find that task to edit.";
        return;
    }

    editingRecordId = record.id;

    titleInput.value = record.title;
    dueDateInput.value = record.dueDate;
    durationInput.value = String(record.duration);
    tagInput.value = record.tag;

    clearFormErrors();

    if (submitButton) {
        if (!submitButton.dataset.originalText) {
            submitButton.dataset.originalText =
                submitButton.tagName === "INPUT"
                    ? submitButton.value
                    : submitButton.textContent;
        }

        if (submitButton.tagName === "INPUT") {
            submitButton.value = "Save Changes";
        } else {
            submitButton.textContent = "Save Changes";
        }
    }

    cancelEditButton.hidden = false;

    searchStatus.textContent =
        'Editing "' + record.title + '". Update the form and save your changes.';

    titleInput.focus();

    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function cancelEditing() {
    editingRecordId = null;
    taskForm.reset();
    clearFormErrors();

    if (submitButton && submitButton.dataset.originalText) {
        if (submitButton.tagName === "INPUT") {
            submitButton.value = submitButton.dataset.originalText;
        } else {
            submitButton.textContent = submitButton.dataset.originalText;
        }
    }

    cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", function () {
    cancelEditing();
    searchStatus.textContent = "Editing cancelled.";
});

function deleteRecord(recordId) {
    const record = records.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        searchStatus.textContent = "Could not find that task to delete.";
        return;
    }

    const confirmed = window.confirm(
        'Are you sure you want to delete "' + record.title + '"?'
    );

    if (!confirmed) {
        return;
    }

    records = records.filter(function (item) {
        return item.id !== recordId;
    });

    if (editingRecordId === recordId) {
        cancelEditing();
    }

    const saved = saveRecords(records);

    filterRecords();

    searchStatus.textContent = saved
        ? "Task deleted successfully."
        : "Task deleted for this session, but browser storage could not save the change.";
}

// --------------------------------------------------
// 6. FILTER, SORT, RENDER RECORDS
// --------------------------------------------------

function filterRecords() {
    const pattern = searchBox.value.trim();
    let regex = null;
    let filteredRecords = [...records];

    if (pattern !== "") {
        const flags = caseBox.checked ? "i" : "";
        regex = compileRegex(pattern, flags);

        if (regex === null) {
            searchStatus.textContent =
                "Invalid regular expression. Please check your pattern.";

            recordsBody.replaceChildren();
            updateDashboard();
            return;
        }

        filteredRecords = filteredRecords.filter(function (record) {
            regex.lastIndex = 0;
            const titleMatches = regex.test(record.title);

            regex.lastIndex = 0;
            const tagMatches = regex.test(record.tag);

            return titleMatches || tagMatches;
        });
    }

    const sortOption = sortSelect.value;

    filteredRecords.sort(function (a, b) {
        if (sortOption.startsWith("date")) {
            const result = a.dueDate.localeCompare(b.dueDate);
            return sortOption.endsWith("asc") ? result : -result;
        }

        if (sortOption.startsWith("title")) {
            const result = a.title.localeCompare(b.title);
            return sortOption.endsWith("asc") ? result : -result;
        }

        const result = Number(a.duration) - Number(b.duration);
        return sortOption.endsWith("asc") ? result : -result;
    });

    recordsBody.replaceChildren();

    filteredRecords.forEach(function (record) {
        const row = document.createElement("tr");

        [
            ["title", record.title],
            ["date", record.dueDate],
            ["duration", record.duration],
            ["tag", record.tag]
        ].forEach(function ([type, value]) {
            const cell = document.createElement("td");

            if (pattern !== "" && (type === "title" || type === "tag")) {
                appendHighlightedText(cell, value, regex);
            } else {
                cell.textContent = value;
            }

            row.appendChild(cell);
        });

        // Actions column: Edit and Delete.
        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            "Edit task: " + record.title
        );

        editButton.addEventListener("click", function () {
            startEditing(record.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            "Delete task: " + record.title
        );

        deleteButton.addEventListener("click", function () {
            deleteRecord(record.id);
        });

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);
        recordsBody.appendChild(row);
    });

    searchStatus.textContent =
        filteredRecords.length + " record(s) displayed.";

    updateDashboard();
}

searchBox.addEventListener("input", filterRecords);
caseBox.addEventListener("change", filterRecords);
sortSelect.addEventListener("change", filterRecords);

// --------------------------------------------------
// 7. FORM VALIDATION
// --------------------------------------------------

function showError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + "-error");
    const field = document.getElementById(fieldName);

    if (!errorElement || !field) {
        return;
    }

    errorElement.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
}

function clearFormErrors() {
    ["title", "dueDate", "duration", "tag"].forEach(function (name) {
        showError(name, "");
    });
}

function validateForm(title, dueDate, duration, tag) {
    let valid = true;

    const fields = [
        {
            name: "title",
            value: title,
            pattern: titlePattern,
            message: "Enter a title without leading, trailing, or double spaces."
        },
        {
            name: "dueDate",
            value: dueDate,
            pattern: datePattern,
            message: "Enter a valid date in YYYY-MM-DD format."
        },
        {
            name: "duration",
            value: duration,
            pattern: numberPattern,
            message: "Enter a non-negative number with up to two decimal places."
        },
        {
            name: "tag",
            value: tag,
            pattern: tagPattern,
            message: "Use letters separated by single spaces or hyphens."
        }
    ];

    fields.forEach(function (field) {
        const matches = field.pattern.test(field.value);

        if (!matches) {
            showError(field.name, field.message);
            valid = false;
        } else {
            showError(field.name, "");
        }
    });

    if (datePattern.test(dueDate) && !isRealDate(dueDate)) {
        showError("dueDate", "That date does not exist on the calendar.");
        valid = false;
    }

    return valid;
}

// --------------------------------------------------
// 8. ADD AND EDIT TASKS, THEN SAVE
// --------------------------------------------------

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value;
    const dueDate = dueDateInput.value;
    const duration = durationInput.value;
    const tag = tagInput.value;

    if (!validateForm(title, dueDate, duration, tag)) {
        searchStatus.textContent = "Please correct the form errors.";
        return;
    }

    const duplicateWarning = duplicateWordPattern.test(title);
    const now = new Date().toISOString();

    // EDIT MODE: update the existing record rather than creating a new one.
    if (editingRecordId !== null) {
        const recordIndex = records.findIndex(function (record) {
            return record.id === editingRecordId;
        });

        if (recordIndex === -1) {
            cancelEditing();
            searchStatus.textContent =
                "That task could not be found. Please try again.";
            filterRecords();
            return;
        }

        records[recordIndex] = {
            ...records[recordIndex],
            title: title,
            dueDate: dueDate,
            duration: Number(duration),
            tag: tag,
            updatedAt: now
        };

        const saved = saveRecords(records);

        cancelEditing();
        filterRecords();

        if (!saved) {
            searchStatus.textContent =
                "Changes applied for this session, but browser storage failed.";
        } else if (duplicateWarning) {
            searchStatus.textContent =
                "Changes saved. Warning: the title contains a repeated word.";
        } else {
            searchStatus.textContent = "Task updated successfully.";
        }

        return;
    }

    // ADD MODE: create a new task.
    const newRecord = {
        id: (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        )
            ? crypto.randomUUID()
            : "task_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        title: title,
        dueDate: dueDate,
        duration: Number(duration),
        tag: tag,
        createdAt: now,
        updatedAt: now
    };

    records.push(newRecord);

    const saved = saveRecords(records);

    taskForm.reset();
    clearFormErrors();
    filterRecords();

    if (!saved) {
        searchStatus.textContent =
            "Task added for this session, but saving to browser storage failed.";
    } else if (duplicateWarning) {
        searchStatus.textContent =
            "Task saved. Warning: the title contains a repeated word.";
    } else {
        searchStatus.textContent = "Task added and saved successfully.";
    }
});

// --------------------------------------------------
// 9. LOAD SAVED RECORDS OR SEED DATA
// --------------------------------------------------

async function initializeRecords() {
    const savedRecords = loadRecords();

    if (savedRecords !== null && isValidRecordList(savedRecords)) {
        records = savedRecords;
        filterRecords();
        return;
    }

    if (savedRecords !== null) {
        searchStatus.textContent =
            "Saved records were invalid. Attempting to load sample records.";
    }

    try {
        const response = await fetch("./seed.json");

        if (!response.ok) {
            throw new Error("Could not load seed.json.");
        }

        const seedRecords = await response.json();

        if (!isValidRecordList(seedRecords)) {
            throw new Error(
                "Seed data has invalid fields or duplicate record IDs."
            );
        }

        records = seedRecords;
        const saved = saveRecords(records);

        filterRecords();

        if (!saved) {
            searchStatus.textContent =
                "Sample records loaded, but browser storage is unavailable.";
        }
    } catch (error) {
        console.error("Could not initialize records:", error);
        records = [];
        filterRecords();
        searchStatus.textContent =
            "Could not load records. Check seed.json and the browser console.";
    }
}
// --------------------------------------------------
// 10. JSON IMPORT AND EXPORT
// --------------------------------------------------

const exportButton = document.getElementById("export-json");
const importFileInput = document.getElementById("import-json");
const importButton = document.getElementById("import-json-button");
const importExportStatus = document.getElementById("import-export-status");

// EXPORT: Download saved tasks as a JSON file.
exportButton.addEventListener("click", function () {
    try {
        const jsonData = JSON.stringify(records, null, 2);
        const blob = new Blob([jsonData], {
            type: "application/json"
        });

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = "campus-life-planner-records.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);

        importExportStatus.textContent =
            "Tasks exported successfully.";
    } catch (error) {
        console.error("Export failed:", error);

        importExportStatus.textContent =
            "Export failed. Please try again.";
    }
});

// IMPORT: Read, validate, and save a selected JSON file.
importButton.addEventListener("click", async function () {
    const file = importFileInput.files[0];

    if (!file) {
        importExportStatus.textContent =
            "Please choose a JSON file first.";
        return;
    }

    try {
        const fileText = await file.text();
        const importedRecords = JSON.parse(fileText);

        // Validate the complete list before changing existing records.
        if (!isValidRecordList(importedRecords)) {
            throw new Error(
                "The file contains invalid records or duplicate IDs."
            );
        }

        // Keep the existing records if saving fails.
        if (!saveRecords(importedRecords)) {
            throw new Error(
                "Could not save the imported records to browser storage."
            );
        }

        records = importedRecords;

        // Exit edit mode if a task was being edited.
        cancelEditing();

        // Refresh the table, search results, and dashboard.
        filterRecords();

        importExportStatus.textContent =
            "JSON imported successfully. " +
            records.length + " task(s) loaded.";

        importFileInput.value = "";
    } catch (error) {
        console.error("Import failed:", error);

        importExportStatus.textContent =
            "Import failed: " + error.message;
    }
});
initializeRecords();
