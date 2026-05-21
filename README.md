# wa-socket

A WebSocket-based system to connect to WhatsApp, read messages, and manipulate your WhatsApp account to a certain extent. This is a simplified version of what WhatsApp bots use internally. Currently, the system does not include extra actions by default, but provides a solid foundation for building upon.

**License:** GNU General Public License v3.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Event System](#event-system)
- [Logging System](#logging-system)
- [Connection Management](#connection-management)
- [Error Handling](#error-handling)
- [Requirements](#requirements)
- [License](#license)

---

## 🎯 Overview

**wa-socket** is a Node.js-based WebSocket client for WhatsApp communication. It leverages the [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) library to establish and maintain connections with WhatsApp Web infrastructure.

The project is built with:
- **Runtime:** Node.js (CommonJS and ES Modules)
- **Core Library:** @whiskeysockets/baileys (WebSocket protocol handler)
- **Language:** JavaScript
- **Architecture:** Event-driven async/await pattern

---

## ✨ Features

- ✅ **WebSocket Connection:** Establishes persistent connections to WhatsApp Web
- ✅ **Message Listening:** Real-time message reception with full metadata
- ✅ **Auto-Reconnection:** Automatic reconnection logic with configurable retry intervals
- ✅ **QR Code Pairing:** Phone number-based pairing code generation
- ✅ **Credential Management:** Multi-file authentication state storage
- ✅ **Advanced Logging:** Customizable, colored console output with log history
- ✅ **Dependency Checking:** Automatic verification of system dependencies
- ✅ **Cross-Platform Support:** Windows, macOS, and Linux compatibility
- ✅ **Error Recovery:** Comprehensive error handling and state cleanup

---

## 🏗️ Technical Architecture

### Core Components

#### 1. **Main Entry Point** (`index.js`)
- Initializes the bot instance
- Registers event listeners for connection and messages
- Implements reconnection strategy
- Manages the application lifecycle

#### 2. **WhatsApp Bot Class** (`wa-socket.cjs`)
- **Main Class:** `WhatsAppBot`
- **Responsibilities:**
  - Socket initialization with Baileys configuration
  - Dependency verification (ffmpeg, yt-dlp, Python)
  - Authentication state management
  - Pairing code generation
  - Connection lifecycle management

#### 3. **Logger Module** (`logger.js`)
- ES Module-based logging system
- Supports 16 ANSI colors (text and background)
- Configurable debug modes
- Log history management (max 200 entries)
- Custom color combinations

---

## 📁 Project Structure

```
wa-socket/
├── index.js                 # Main application entry point
├── wa-socket.cjs            # WhatsAppBot class and core logic
├── logger.js                # Advanced logging system
├── README.md               # Documentation (this file)
├── LICENSE                 # GNU GPL v3.0
├── auth_info_baileys/      # Authentication credentials (auto-created)
├── media/                  # Media storage (auto-created)
│   ├── downloads/
│   ├── stickers/
│   └── music/
├── temp/                   # Temporary files (auto-created)
└── modules/                # Custom modules directory (auto-created)
```

---

## 🔧 Dependencies

### Runtime Dependencies

```json
{
  "@whiskeysockets/baileys": "Latest version",
  "pino": "Logging library for Baileys",
  "events": "Node.js EventEmitter"
}
```

### System Dependencies (Required/Optional)

| Dependency | Version | Required | Purpose |
|-----------|---------|----------|---------|
| **ffmpeg** | ≥ 4.4 | ✅ Yes | Audio and sticker processing |
| **Python** | ≥ 3.9 | ❌ No | External module support |
| **yt-dlp** | ≥ 2024.01.01 | ❌ No | Multimedia downloads |

### Installation Guide

**macOS:**
```bash
brew install ffmpeg python3
pip install -U yt-dlp
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg python3
pip install -U yt-dlp
```

**Windows:**
- Download FFmpeg from: https://ffmpeg.org/download.html
- Install Python from: https://www.python.org/downloads/
- Install yt-dlp: `pip install -U yt-dlp`

---

## 📥 Installation & Setup

### Prerequisites
- Node.js 16+ with npm
- System dependencies (see Dependencies section)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rafa2219/wa-socket.git
   cd wa-socket
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Verify system dependencies:**
   ```bash
   npm start
   ```
   The system will automatically check for ffmpeg, Python, and yt-dlp.

4. **First Run - Authentication:**
   - On first launch, you'll receive a pairing code
   - Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
   - Enter the displayed pairing code

---

## ⚙️ Configuration

### Configuration Object (wa-socket.cjs, lines 55-94)

```javascript
const config = {
  bot: {
    name: "name",                    // Bot display name
    botCurrency: "",                 // Currency symbol/code
    version: "2.1.9",                // Bot version
    prefix: "/",                     // Command prefix
    owner: "",                       // Owner display name
    ownerLid: "",                    // Owner LID (unique identifier)
    phoneNumber: "50212345678",      // Bot phone number
    admins: []                       // Array of admin phone numbers
  },
  whatsapp: {
    logger: pino({ level: 'silent' }), // Baileys logger
    printQRInTerminal: false,           // Show QR in terminal
    browser: Browsers.macOS("Chrome"),  // Browser identifier
    markOnlineOnConnect: true,          // Mark as online on connection
    defaultQueryTimeoutMs: 60000,       // Query timeout
    connectTimeoutMs: 30000,            // Connection timeout
    keepAliveIntervalMs: 10000,         // Keep-alive ping interval
    maxMsgRetryCount: 3,                // Message retry attempts
    mediaUploadTimeoutMs: 60000,        // Media upload timeout
    mediaDownloadTimeoutMs: 60000,      // Media download timeout
    retryRequestDelayMs: 2000,          // Delay between retries
    maxRetries: 3,                      // Maximum retry attempts
    linkPreviewImageThumbnailWidth: 192, // Thumbnail width (px)
    generateHighQualityLinkPreview: true, // High-quality previews
    syncFullHistory: false               // Full message history sync
  }
};
```

### Customization

Edit `wa-socket.cjs` to modify:
- **Bot metadata:** name, version, owner info
- **Timeouts:** Connection and query timeouts
- **Media settings:** Upload/download limits and thumbnail quality
- **Retry logic:** Retry counts and delays

---

## 🚀 Usage

### Starting the Bot

```bash
node index.js
```

### Expected Output

```
running...
🔵 [INFO] Iniciando bot...
Usando WA v20.x.xx, última: true
Solicitando código para 50255912498
🟢 [CODE] XXXX-XXXX-XXXX-XXXX
🔵 [INFO] Esperando confirmación...
🟢 [ÉXITO] Conexión establecida.
Bot conectado: 50212345678
```

---

## 🔌 API Reference

### WhatsAppBot Class

#### Constructor
```javascript
const Bot = new WhatsAppBot();
```

#### Methods

**`startBot()`**
- **Returns:** Promise<Socket>
- **Description:** Initializes the WebSocket connection to WhatsApp
- **Usage:**
  ```javascript
  const sock = await Bot.startBot();
  ```

**`checkDependencies()`**
- **Returns:** Promise<boolean>
- **Description:** Verifies system dependencies
- **Usage:**
  ```javascript
  const allGood = await Bot.checkDependencies();
  ```

**`createDirectories()`**
- **Returns:** void
- **Description:** Creates required directories (auth, media, temp)
- **Usage:** Called automatically in constructor

**`setupErrorHandlers()`**
- **Returns:** void
- **Description:** Sets up global error handlers for uncaught exceptions

#### Properties

```javascript
Bot.config        // Full configuration object
Bot.bot          // Bot configuration subset
Bot.whatsapp     // WhatsApp connection config
Bot.sock         // Current socket instance
Bot.phoneNumber  // Bot's phone number
Bot.subAdmins    // List of admin JIDs
```

---

## 📡 Event System

### Connection Events

**`connection.update`**
```javascript
sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect, qr, isLatest } = update;
  
  if (connection === 'open') {
    // Connected successfully
  }
  if (connection === 'close') {
    // Connection closed
    const statusCode = lastDisconnect.error?.output?.statusCode;
    // Handle based on statusCode
  }
});
```

### Message Events

**`messages.upsert`**
```javascript
sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return; // Only handle new messages
  
  const m = messages[0];
  console.log({
    from: m.key.remoteJid,
    fromMe: m.key.fromMe,
    message: m.message,
    timestamp: m.messageTimestamp
  });
});
```

### Credential Events

**`creds.update`**
```javascript
sock.ev.on('creds.update', saveCreds);
// Automatically saves authentication credentials
```

---

## 📝 Logging System

### Logger Methods

```javascript
import { Logger } from './logger.js';

Logger.info("Information message");           // 🔵 [INFO]
Logger.success("Success message");            // 🟢 [ÉXITO]
Logger.warn("Warning message");               // 🟠 [ALERTA]
Logger.error("Error message");                // 🔴 [ERROR]
Logger.exec("Execution message");             // ⚙️  [EXEC]
Logger.data(...args);                         // Raw output
Logger.addLog("Timestamped log entry");       // [ISO-8601] message
Logger.getLogs();                             // Get log history
Logger.clearLogs();                           // Clear history
Logger.custom(['red', 'bgBlue'], "Text");    // Custom colors
```

### Configuration Flags

```javascript
const DEBUG_MODE = true;           // Enable debug messages
const PROCESS_LOG = true;          // Enable log history
const COLORED_TEXT = true;         // Enable ANSI colors
const CUSTOM_ENABLED = true;       // Enable custom colors
const MESSAGES = true;             // Enable data() output
```

### Available Colors

**Text Colors:** black, red, green, yellow, blue, magenta, cyan, white

**Background Colors:** bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite

**Modifiers:** bright, dim, underscore, reset

---

## 🔄 Connection Management

### Auto-Reconnection Strategy

The system implements an exponential backoff reconnection strategy:

1. **Disconnection Detected:**
   ```javascript
   if (connection === 'close') {
     const statusCode = lastDisconnect.error?.output?.statusCode;
   }
   ```

2. **Status Code Handling:**
   - **401 (Unauthorized):** No reconnection - requires re-authentication
   - **Other codes:** Automatic reconnection with 3-second delay

3. **Reconnection Process:**
   ```javascript
   setTimeout(async () => {
     reconnectInProgress = false;
     await init();
   }, 3000);
   ```

### Cleanup on Disconnect

```javascript
if (typeof sock.end === 'function') {
  sock.end();
} else if (sock.ws?.close) {
  sock.ws.close();
}

sock = null;
```

---

## ⚠️ Error Handling

### Global Error Handlers

```javascript
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
});
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Logout` | Session expired or logged out elsewhere | Delete `auth_info_baileys/` folder and restart |
| `Connection timeout` | Network issues | Check internet, retry in 3 seconds |
| `Missing dependency` | ffmpeg/Python not installed | Follow installation guide for your OS |
| `QR Code error` | Invalid phone number format | Use format: country code + number |

---

## ✅ Requirements

- **Node.js:** v16 or higher
- **npm:** v8 or higher
- **RAM:** Minimum 256MB
- **Disk Space:** 500MB for node_modules + media storage
- **Network:** Stable internet connection
- **System:** Windows, macOS, or Linux

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚡ Getting Started Example

```javascript
import { WhatsAppBot } from './wa-socket.cjs';
import { Logger } from './logger.js';

const Bot = new WhatsAppBot();
let sock = null;

const init = async () => {
  try {
    Logger.info("Iniciando bot...");
    sock = await Bot.startBot();
    
    // Listen for messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      Logger.success(`Mensaje recibido de: ${m.key.remoteJid}`);
    });
    
    // Monitor connection
    sock.ev.on('connection.update', (update) => {
      if (update.connection === 'open') {
        Logger.success("Bot listo!");
      }
    });
  } catch (err) {
    Logger.error("Error:", err.message);
  }
};

await init();
```

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/Rafa2219/wa-socket/issues)
- Check existing documentation
- Review error logs in the console

---

**Last Updated:** 2026-05-21  
**Version:** 2.1.9  
**Maintainer:** Rafa2219
