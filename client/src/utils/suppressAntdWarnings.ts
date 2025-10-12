/**
 * Suppress Ant Design React 19 compatibility warnings
 * 
 * This file patches console.warn to hide the Ant Design compatibility warning
 * for React 19. Ant Design v5 officially supports React 16-18, but works fine
 * with React 19 using the @ant-design/v5-patch-for-react-19 package.
 * 
 * The warning is purely informational and doesn't affect functionality.
 */

// Patch console immediately (works both server and client side)
const originalWarn = console.warn;
const originalError = console.error;

// Suppress console.warn for Ant Design React 19
console.warn = (...args: any[]) => {
    const message = args[0];

    // Filter out Ant Design React 19 compatibility warnings
    if (typeof message === 'string') {
        if (
            message.includes('antd: compatible') ||
            message.includes('antd v5 support React is 16 ~ 18') ||
            message.includes('v5-for-19') ||
            message.includes('[antd:')
        ) {
            return; // Suppress this warning
        }
    }

    originalWarn.apply(console, args);
};

// Suppress console.error for React 19 related warnings (optional)
console.error = (...args: any[]) => {
    const message = args[0];

    if (typeof message === 'string') {
        // Filter out specific React 19 warnings if needed
        if (
            message.includes('antd: compatible') ||
            message.includes('[antd:')
        ) {
            return;
        }
    }

    originalError.apply(console, args);
};

export { };
