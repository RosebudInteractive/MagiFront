//todo try to use it later instead of lodash.debounce
export default function debounce(originalFn, timeoutMs) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => originalFn(...args), timeoutMs);
    };
}
