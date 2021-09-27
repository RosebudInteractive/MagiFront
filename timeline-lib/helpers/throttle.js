// todo try to use it later instead of lodash.throttle
export default function throttle(originalFn, delayMs) {
    let timeout; // timeout to keep track of the executions
    return (...args) => {
        if (timeout) { // if timeout is set, this is NOT the first execution, so ignore
            return;
        }
        // this is the first execution which we need to delay by "delayMs" milliseconds
        timeout = setTimeout(() => {
            originalFn(...args); // call the passed function with all arguments
            timeout = null; // reset timeout so that the subsequent call launches the process anew
        }, delayMs);
    };
}
