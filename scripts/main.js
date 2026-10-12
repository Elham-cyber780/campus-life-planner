

import { titlePattern } from './validators.js';

const taskForm = document.querySelector("form");

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Form submitted");
});

