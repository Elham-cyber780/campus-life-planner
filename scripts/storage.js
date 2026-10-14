
const STORAGE_KEY = "campusLifePlannerRecords";

// Save records to the browser.
export function saveRecords(records) {
    try {
        const jsonData = JSON.stringify(records);
        localStorage.setItem(STORAGE_KEY, jsonData);
        return true;
    } catch (error) {
        console.error("Could not save records:", error);
        return false;
    }
}

// Load saved records from the browser.
export function loadRecords() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            return null;
        }

        const records = JSON.parse(savedData);

        if (!Array.isArray(records)) {
            throw new Error("Saved records must be an array.");
        }

        return records;
    } catch (error) {
        console.error("Could not load records:", error);
        return null;
    }
}

// Remove saved records from the browser.
export function clearRecords() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error("Could not clear records:", error);
        return false;
    }
}