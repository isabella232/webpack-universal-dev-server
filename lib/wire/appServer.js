// @flow

import type { Process } from "flow";
import type { ChildProcess } from "child_process";
import type { WpDevServerResumeMessage, AppServerListeningMessage, MessageHandler, Logger } from "../types";
import handleMessages from "../util/handleMessages";
import { TYPE_APP_SERVER_LISTENING, wpDevServerResume } from "../util/messages";

type WireAppServerArgs = {
    +appServer: ChildProcess,
    +process: Process,
    +sendToWpDevServer: MessageHandler<WpDevServerResumeMessage>,
    +log: Logger
};

export default function wireAppServer({
        appServer,
        process,
        sendToWpDevServer,
        log
    } : WireAppServerArgs): void {
    const messageHandlers = new Map();

    messageHandlers.set(TYPE_APP_SERVER_LISTENING, (message: AppServerListeningMessage) => {
        const address = message.address;
        const readableAddress = typeof address === "string" ? address : (address.address + ":" + address.port);

        sendToWpDevServer(wpDevServerResume());
        log(`App server listening at ${ message.bindType } ${ readableAddress }`);
    });

    handleMessages(appServer, messageHandlers);

    appServer.stdout.pipe(process.stdout);
    appServer.stderr.pipe(process.stderr);
}