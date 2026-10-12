

import { titlePattern } from './validators.js';

const taskForm = document.querySelector("form");

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const titleInput = document.querySelector("#title");
    const titleError = document.querySelector("#title-error");

    if (!titlePattern.test(titleInput.value)) {
        titleError.textContent = "Title can't start or end with a space, or contain double spaces.";
    } else {
        titleError.textContent = "";
    }
});
