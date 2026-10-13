
export function compileRegex(pattern, flags = "") {
    if (pattern === "") {
        return null;
    }

    try {
        return new RegExp(pattern, flags);
    } catch (error) {
        return null;
    }
}