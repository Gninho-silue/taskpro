// Basic polyfills for libraries expecting Node globals in browser
// Ensure this loads before any other imports that may rely on it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).global = window;
// Optional: minimal process shim if some libs read process.env
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).process = (window as any).process || { env: {} };

