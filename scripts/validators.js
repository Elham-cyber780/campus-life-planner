
//Allows any characters but rejects leading/trailing spaces and consective spaces.
export const titlePattern = /^(?!.* {2})\S(?:.\S)?$/;

//Allows whole numbers without leading zeros and decimals with up to two decimal places
export const numberPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

Allows dates in YYYY-MM-DD format with valid month and day ranges.
export const datePattern = /^(?!0000)\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

//Allows letters, spaces, amnd hyphens, but not leading/trailing or consective separators
export const tagPattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

//Catches repeated consecutive words, such as "the the", regardless of case.
export const duplicateWordPattern = /\b(\w+)\s+\1\b/i;