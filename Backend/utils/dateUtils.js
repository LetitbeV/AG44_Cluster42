// Helper to format a Date object or string to "YYYY-MM-DD HH:mm:ss" (Local Time)
const formatLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Helper to parse a string input as Local Time (removes 'Z' if present)
const parseLocal = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        return new Date(dateString.replace('Z', ''));
    }
    return new Date(dateString);
};

module.exports = {
    formatLocal,
    parseLocal
};
