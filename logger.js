const DEBUG_MODE = true;
const PROCESS_LOG = true;
const COLORED_TEXT = true;
const CUSTOM_ENABLED = true;
const MESSAGES = true;

let logs = [];

export const Logger = (() => {

    const colors = {

        // básicos
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",

        // texto
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",

        // fondos
        bgBlack: "\x1b[40m",
        bgRed: "\x1b[41m",
        bgGreen: "\x1b[42m",
        bgYellow: "\x1b[43m",
        bgBlue: "\x1b[44m",
        bgMagenta: "\x1b[45m",
        bgCyan: "\x1b[46m",
        bgWhite: "\x1b[47m"

    };

    const color = (text, clr) => {

        if (!COLORED_TEXT)
            return text;

        return `${colors[clr] || ""}${text}${colors.reset}`;
    };

    return {
        data: (...args) => {
            if (!MESSAGES) return 0;
            console.log(...args);
        },

        info: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.log(
                color("🔵 [INFO]", "blue"),
                ...args
            );
        },

        success: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.log(
                color("🟢 [ÉXITO]", "green"),
                ...args
            );
        },

        warn: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.warn(
                color("🟠 [ALERTA]", "yellow"),
                ...args
            );
        },
        alerta: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.warn(
                color("🟠 [ALERTA]", "yellow"),
                ...args
            );
        },
        error: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.error(
                color("🔴 [ERROR]", "red"),
                ...args
            );
        },

        exec: (...args) => {

            if (!DEBUG_MODE)
                return;

            console.log(
                color("⚙️ [EXEC]", "magenta"),
                ...args
            );
        },
        colored: (col = "reset", ...args) => {
            if (!CUSTOM_ENABLED) return 0;
            console.log(colors[col], ...args, colors.reset)
        },
        custom: (config = [], ...args) => {
            if (!CUSTOM_ENABLED) return 0;
            let result = '';
            for (let param of config) {
                result += colors[param];
            }
            return result + args + colors.reset;
        },
        addLog: (text) => {

            if (!PROCESS_LOG) {

                return {
                    success: false,
                    message: 'Los logs de sistema están desactivados'
                };
            }

            const entry =
            `[${new Date().toISOString()}] ${text}`;

            console.log(
                color(entry, "cyan")
            );

            logs.push(entry);

            if (logs.length > 200) {
                logs.shift();
            }

            return {
                success: true,
                message: 'Log agregado'
            };
        },

        getLogs: () => [...logs],

        clearLogs: () => {

            logs.length = 0;

            return {
                success: true,
                message: 'Logs eliminados'
            };
        }

    };

})();