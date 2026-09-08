// Visualizing the Node.js Event Loop
// Order of execution (fastest to slowest):
// 1. Synchronous code (main thread, top to bottom)
// 2. process.nextTick queue      -> runs BEFORE any other async queue, even microtasks
// 3. Microtask queue (Promises)  -> runs after nextTick, before macrotasks
// 4. Timers phase (setTimeout)   -> runs after the above, once the delay has elapsed
// 5. Check phase (setImmediate)  -> runs after the poll phase, typically after setTimeout(0)

console.log("1. start (sync)");

setTimeout(() => {
    console.log("5. setTimeout (0ms) -> timers phase");
}, 0);

setImmediate(() => {
    console.log("6. setImmediate -> check phase");
});

process.nextTick(() => {
    console.log("2. process.nextTick -> microtask queue (runs first)");
});

Promise.resolve().then(() => {
    console.log("3. Promise.then -> microtask queue (after nextTick)");
});

console.log("4. end (sync)");

// Typical output:
// 1. start (sync)
// 4. end (sync)
// 2. process.nextTick -> microtask queue (runs first)
// 3. Promise.then -> microtask queue (after nextTick)
// 5. setTimeout (0ms) -> timers phase
// 6. setImmediate -> check phase
//
// Note: the order of 5 and 6 can swap when this file is run inside an I/O
// callback (e.g. fs.readFile), where setImmediate is guaranteed to fire
// before any setTimeout. At the top level, timing is not guaranteed either
// way and depends on how fast the event loop reaches the timers phase.
