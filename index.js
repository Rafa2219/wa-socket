import {
    WhatsAppBot
} from './wa-socket.cjs';
import {
    Logger
} from './logger.js';


console.log("running...");
let sock = null;
const Bot = new WhatsAppBot();

let reconnectInProgress = false;
let trys = 5;
// ==================== INIT ====================
const init = async () => {

    Logger.info("Iniciando bot...");

    try {
        sock = await Bot.startBot();
    } catch (err) {
        console.error("Error al iniciar socket:", err);
        scheduleReconnect();
        return;
    }

    if (!sock) {
        console.error("Socket nulo.");
        scheduleReconnect();
        return;
    }

    // Limpiar listeners anteriores
    sock.ev.removeAllListeners('connection.update');
    sock.ev.removeAllListeners('messages.upsert');

    registerEvents();

    //await sleep(2000);

    // API = api(sock);

    // Logger.info("API inicializada.");
}






// ==================== RECONEXIÓN ====================
const scheduleReconnect = async () => {

    if (reconnectInProgress) return;

    reconnectInProgress = true;

    if (sock) {
        sock.ev.removeAllListeners('connection.update');
        sock.ev.removeAllListeners('messages.upsert');

        if (typeof sock.end === 'function') {
            sock.end();
        } else if (sock.ws?.close) {
            sock.ws.close();
        }

        sock = null;
        // API = null;
    }

    Logger.info("Reintentando en 3 segundos...");

    setTimeout(async () => {
        reconnectInProgress = false;
        await init();
    }, 3000);
}


const registerEvents = async () => {

    if (!sock) return;

    // ================= MENSAJES =================
    sock.ev.on('messages.upsert', async ({
        messages, type
    }) => {

        if (type !== 'notify' || !messages?.length) return;

        const m = messages[0];

        if (!m?.message) return;
        //if (m.key.fromMe) return; // ignorar propios

        const chatId = m.key?.remoteJid;

        try {

            Logger.info(JSON.stringify(m))

        } catch (err) {
            console.error(err);
        }
    });

    // ================= CONEXIÓN =================
    sock.ev.on('connection.update',
        async (update) => {

            const {
                connection,
                lastDisconnect
            } = update;

            if (connection === 'open') {
                Logger.success("Conexión establecida.");
            }

            if (connection === 'close') {

                const statusCode = lastDisconnect?.error?.output?.statusCode;

                Logger.warn("Conexión cerrada:", statusCode);

                if (statusCode === 401) {

                    Logger.addLog(
                        Logger.custom(['magenta', 'bgBlue'],
                            "Logout detectado. No reconecta.")
                    );
                    console.log(Logger.custom(["red"], `No se puede conectar, borra la carpeta de auth_info_baileys para intentar nuevamente `))

                    Logger.addLog("Closed by System Params Checker ~ ©2026 Rafa2219 | See more in GIt Hub!");
                    process.exit(1)
                    return 501;
                }
                scheduleReconnect();
            }
        });
}




// ==================== Inicio del websocket ====================
(async () => {
    /*let p = await Bot.checkDependencies();
    if (!p) {
        throw new Error("Dependencias no completadas");
        return 1;
    } else {
        await init();
    }*/
    await init();

})();