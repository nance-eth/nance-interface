// Override console.debug
// Don't print console.debug messages in production
const _console = {
  debug: (...args: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEBUG]", ...args);
    }
  },
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  trace: console.trace
};

console.debug = _console.debug;

export default _console;
