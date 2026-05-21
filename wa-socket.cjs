const {
    default: makeWASocket,
        useMultiFileAuthState,
        DisconnectReason,
        fetchLatestBaileysVersion,
        makeCacheableSignalKeyStore,
        Browsers,
        downloadMediaMessage,
        getContentType,
        proto,
        generateForwardMessageContent,
        generateWAMessageFromContent
    } = require('@whiskeysockets/baileys');
    require('events').EventEmitter.defaultMaxListeners = 30;




    // ==================== UTILIDADES ====================
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => {
            rl.question(query, answer => {
                rl.close();
                resolve(answer);
            });
        });
    }

    // ========= imports ========

    const {
        promisify
    } = require('util');
    const readLine = require('readline');
    const pino = require('pino');
    const fs = require('fs');
    const os = require('os');
    const {
        exec
    } = require('child_process');
    const {
        Logger
    } = require('./logger.js')
    const util = require('util');
    const execPromise = util.promisify(exec);

    const config = {
        // Información del bot
        bot: {
            name: "name",
            botCurrency: "",
            version: "2.1.9",
            prefix: "/",
            owner: "",
            ownerLid: "",
            phoneNumber: "50212345678",
            admins: []
        },

        // Configuración de WhatsApp
        //esto es prácticamente el sock
        whatsapp: {
            logger: pino( {
                level: 'silent'
            }),
            //printQRInTerminal: false,
            //browser: Browsers.macOS("Chrome"),
            printQRInTerminal: false,
            browser: Browsers.macOS("Chrome"),
            //browser: ["Chrome", "Linux", "121.0.6167.85"],
            markOnlineOnConnect: true,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 30000,
            keepAliveIntervalMs: 10000,
            maxMsgRetryCount: 3,
            msgRetryCounterCache: new Map(),
            mediaUploadTimeoutMs: 60000,
            mediaDownloadTimeoutMs: 60000,
            retryRequestDelayMs: 2000,
            maxRetries: 3,
            linkPreviewImageThumbnailWidth: 192,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            //mobile: false,
        }
    };

    class WhatsAppBot {

        constructor() {

            this.config = config;

            this.bot = this.config.bot;
            this.whatsapp = this.config.whatsapp;

            this.phoneNumber = this.bot.phoneNumber;

            this.ownerJid = this.bot.ownerJid + "@lid";
            this.ownerNumber = this.bot.ownerLid;

            this.subAdminsPhoneNumbers = this.bot.admins;

            this.subAdmins = this.subAdminsPhoneNumbers.map(
                n => n.replace(/\D/g, '') + "@s.whatsapp.net"
            );

            this.reading = {
                ok: false,
                time: 10,
                timeActive: 0
            };

            this.sock = null;

            this.colors = {
                red: "\x1b[31m",
                green: "\x1b[32m",
                yellow: "\x1b[33m",
                reset: "\x1b[0m"
            };

            this.platform = os.platform();

            this.startReadingCounter();

        }

        // =========================
        // UTILIDADES
        // =========================

        log(...args) {
            console.log(...args);
        }

        startReadingCounter() {

            setInterval(() => {
                this.reading.timeActive++;
            }, 1000);

        }

        createDirectories() {

            const directories = [
                'auth_info_baileys',
                'media',
                'temp',
                'media/downloads',
                'media/stickers',
                'modules',
                'media/music'
            ];

            directories.forEach(dir => {

                if (!fs.existsSync(dir)) {

                    fs.mkdirSync(dir, {
                        recursive: true
                    });

                    this.log("Carpeta creada:", dir);

                }

            });

        }

        setupErrorHandlers() {

            process.on('uncaughtException',
                (error) => {
                    console.error('Error no capturado:', error);
                });

            process.on('unhandledRejection',
                (error) => {
                    console.error('Promesa rechazada no manejada:', error);
                });

        }

        // =========================
        // DEPENDENCIAS
        // =========================

        isVersionValid(installed,
            required) {

            const i = installed.split(/[.\-]/).map(Number);
            const r = required.split(/[.\-]/).map(Number);

            for (let x = 0; x < r.length; x++) {

                if ((i[x] || 0) > r[x]) return true;
                if ((i[x] || 0) < r[x]) return false;

            }

            return true;

        }

        getInstallGuide(name) {

            if (this.platform === "win32") {

                if (name === "ffmpeg")
                    return "https://ffmpeg.org/download.html";

                if (name === "yt-dlp")
                    return "pip install -U yt-dlp";

                if (name === "Python")
                    return "https://www.python.org/downloads/";

            }

            if (this.platform === "darwin") {
                return `brew install ${name.toLowerCase()}`;
            }

            if (this.platform === "linux") {

                if (name === "ffmpeg")
                    return "sudo apt install ffmpeg";

                if (name === "yt-dlp")
                    return "pip install -U yt-dlp";

                if (name === "Python")
                    return "sudo apt install python3";

            }

            return "Consulta la documentación oficial.";

        }

        async checkDependency( {
            command,
            name,
            requiredVersion,
            regex,
            critical,
            description
        }) {

            try {

                const {
                    stdout,
                    stderr
                } = await execPromise(command);

                const output = stdout || stderr;

                const match = output.match(regex);

                if (!match) {
                    throw new Error("No se pudo detectar versión");
                }

                const installedVersion = match[1];

                if (!this.isVersionValid(installedVersion, requiredVersion)) {

                    return {
                        ok: false,
                        critical,
                        message:
                        `${name} versión ${installedVersion} es menor que la requerida (${requiredVersion}).`,
                        description,
                        install: this.getInstallGuide(name)
                    };

                }

                console.log(
                    `${this.colors.green}✓ ${name} ${installedVersion} OK${this.colors.reset}`
                );

                return {
                    ok: true
                };

            } catch {

                return {
                    ok: false,
                    critical,
                    message:
                    `${name} no está instalado o no es accesible desde el sistema.`,
                    description,
                    install: this.getInstallGuide(name)
                };

            }

        }

        async checkDependencies() {

            console.log("\nVerificando dependencias...\n");

            const checks = [{
                command: "ffmpeg -version",
                name: "ffmpeg",
                requiredVersion: "4.4",
                regex: /ffmpeg version ([\d.]+)/,
                critical: true,
                description:
                "Necesario para stickers y audio."
            },

                {
                    command: "yt-dlp --version",
                    name: "yt-dlp",
                    requiredVersion: "2024.01.01",
                    regex: /([\d.]+)/,
                    critical: false,
                    description:
                    "Necesario para descargas multimedia."
                },

                {
                    command: "python --version",
                    name: "Python",
                    requiredVersion: "3.9",
                    regex: /Python ([\d.]+)/,
                    critical: false,
                    description:
                    "Necesario para módulos externos."
                }];

            const criticalFailures = [];
            const warnings = [];

            for (const dep of checks) {

                const result = await this.checkDependency(dep);

                if (!result.ok) {

                    const block = `
                    ${this.colors.red}${result.message}${this.colors.reset}

                    → ¿Por qué es necesario?
                    ${result.description}

                    → Cómo instalar:
                    ${result.install}
                    `;

                    if (result.critical) {
                        criticalFailures.push(block);
                    } else {
                        warnings.push(block);
                    }

                }

            }

            if (warnings.length) {

                console.log("\nAdvertencias:");

                warnings.forEach(w => console.log(w));

            }

            if (criticalFailures.length) {

                console.log("\nErrores críticos:");

                criticalFailures.forEach(e => console.log(e));

                process.exit(1);

            }

            console.log(
                `\n${this.colors.green}Dependencias correctas.${this.colors.reset}\n`
            );
            return true;
        }

        // =========================
        // BOT
        // =========================

        async startBot() {

            const {
                state,
                saveCreds
            } = await useMultiFileAuthState('auth_info_baileys');

            const {
                version,
                isLatest
            } = await fetchLatestBaileysVersion();

            console.log(
                `Usando WA v${version.join('.')}, última: ${isLatest}`
            );

            this.sock = makeWASocket({

                version,

                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino( {
                            level: "fatal"
                        })
                    )
                },

                ...this.whatsapp

            });

            // =========================
            // PAIRING CODE
            // =========================

            if (
                !this.sock.authState.creds.me &&
                !this.sock.authState.creds.registered
            ) {

                setTimeout(async () => {

                    try {

                        console.log(
                            `Solicitando código para ${this.phoneNumber}`
                        );

                        const code =
                        await this.sock.requestPairingCode(
                            this.phoneNumber
                        );

                        console.log(
                            `\n${this.colors.green}${code?.match(/.{1,4}/g)?.join("-") || code}${this.colors.reset}\n`
                        );

                    } catch (err) {

                        console.error(err);

                    }

                }, 3000);

            }

            // =========================
            // CONEXIÓN
            // =========================

            this.sock.ev.on('connection.update', (update) => {

                const {
                    connection,
                    lastDisconnect
                } = update;

                if (connection === 'close') {

                    const shouldReconnect =
                    (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;

                    this.reading.ok = false;
                    this.reading.time = 0;

                    console.log(
                        'Conexión cerrada. Reconectar:',
                        shouldReconnect
                    );

                } else if (connection === 'open') {

                    console.log(`Bot conectado: ${this.phoneNumber}`);

                    let readingTimeOut = this.reading.time;

                    const interval = setInterval(() => {

                        console.log(
                            "Leyendo en:",
                            readingTimeOut,
                            "segundos..."
                        );

                        readingTimeOut--;

                        if (readingTimeOut <= 0) {

                            console.log("Bot Activo");

                            this.reading.time = 10;
                            this.reading.ok = true;

                            clearInterval(interval);

                        }

                    },
                        1000);

                }

            });

            // =========================
            // GUARDAR CREDS
            // =========================

            this.sock.ev.on(
                'creds.update',
                saveCreds
            );

            // =========================
            // MENSAJES
            // =========================

            this.sock.ev.on(
                'messages.upsert',
                async ({
                    messages,
                    type
                }) => {
                    if (type !== 'notify') return;
                    const m = messages[0];
                    if (!m.message) return;
                    // lógica...
                }
            );
            return this.sock;

        }

    }

    module.exports = {
        WhatsAppBot
    };
    
    
    // usar startBot para iniciar el bot