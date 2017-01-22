import test from "ava";
import pauseMiddleware from "../../lib/util/pauseMiddleware";
import { pause, resume } from "../../lib/util/messages";

test.before(() => {
    pauseMiddleware.enable();
});

test("the middleware is inactive by default and just calls next", t => {
    const req = { url: "" };
    let called = false;

    pauseMiddleware(
        req, null,
        () => (called = true)
    );
    t.is(called, true);
});

test("the middleware queues all next functions when a PauseMessage is sent " +
    "and calls all next functions after the next tick when a ContinueMessage is sent", async t => {
    const req = { url: "" };
    const callOrder = [];

    process.emit("message", pause());

    pauseMiddleware(req, null, () => callOrder.push("a"));
    pauseMiddleware(req, null, () => callOrder.push("b"));
    pauseMiddleware(req, null, () => callOrder.push("c"));

    t.is(callOrder.join(""), "");

    process.emit("message", resume());

    await new Promise(resolve => resolve());

    t.is(callOrder.join(""), "abc");
});

test.after(() => {
    pauseMiddleware.disable();
});
