/**
 * Early suppression for Ant Design warnings
 * Import this FIRST before any other imports
 */

// Immediately patch console methods before any Ant Design code runs
(function () {
    if (typeof console !== 'undefined') {
        const originalWarn = console.warn.bind(console);
        const originalError = console.error.bind(console);

        console.warn = function (...args: any[]) {
            const message = String(args[0] || '');

            // Filter Ant Design React 19 warnings
            if (
                message.includes('antd') && message.includes('compatible') ||
                message.includes('antd v5 support React') ||
                message.includes('v5-for-19') ||
                message.includes('[antd:')
            ) {
                return; // Silent suppression
            }

            originalWarn(...args);
        };

        console.error = function (...args: any[]) {
            const message = String(args[0] || '');

            // Filter Ant Design errors
            if (
                message.includes('antd') && message.includes('compatible') ||
                message.includes('[antd:')
            ) {
                return; // Silent suppression
            }

            originalError(...args);
        };
    }
})();

export { };
