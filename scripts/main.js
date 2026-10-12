
import {
    titlePattern,
    datePattern,
    numberPattern,
    tagPattern
} from './validators.js';

const taskForm = document.querySelector("form");

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Title validation
    const titleInput = document.querySelector("#title");
    const titleError = document.querySelector("#title-error");

    if (!titlePattern.test(titleInput.value)) {
        titleError.textContent =
            "Title cannot start or end with a space, or contain double spaces.";
    } else {
        titleError.textContent = "";
    }

    // Due date validation
    const dueDateInput = document.querySelector("#dueDate");
    const dueDateError = document.querySelector("#dueDate-error");

    if (!datePattern.test(dueDateInput.value)) {
        dueDateError.textContent = "Use the format YYYY-MM-DD.";
    } else {
        dueDateError.textContent = "";
    }

    // Duration validation
    const durationInput = document.querySelector("#duration");
    const durationError = document.querySelector("#duration-error");

    if (!numberPattern.test(durationInput.value)) {
        durationError.textContent =
            "Enter minutes as a number, e.g. 90 or 7.5.";
    } else {
        durationError.textContent = "";
    }

    // Tag validation
    const tagInput = document.querySelector("#tag");
    const tagError = document.querySelector("#tag-error");

    if (!tagPattern.test(tagInput.value)) {
        tagError.textContent =
            "Letters, spaces and hyphens only.";
    } else {
        tagError.textContent = "";
    }
});