
import {
    titlePattern,
    numberPattern,
    datePattern,
    tagPattern,
    duplicateWordPattern
} from "./validators.js";

import { compileRegex } from "./search.js";
import { saveRecords, loadRecords } from "./storage.js";

// Store the tasks currently being used by the planner.
let records = [];

// Find the important HTML elements.
const recordsBody = document.getElementById("records-body");
const searchBox = document.getElementById("search-input");
const caseBox = document.getElementById("case-toggle");
const sortSelect = document.getElementById("sort-select");
const searchStatus = document.getElementById("search-status");
const taskForm = document.getElementById("task-form");

// Find the dashboard elements.
const totalRecordsElement = document.getElementById("total-records");
const totalDurationElement = document.getElementById("total-duration");
const topTagElement = document.getElementById("top-tag");
const weeklyTrendElement = document.getElementById("weekly-trend");