# Guard

End-to-end encryption in the browser. No servers, no accounts, no trust required.

Guard lets you encrypt and decrypt messages locally using modern cryptographic keys. Share your public key through any channel, receive encrypted messages, and decrypt them on your device. Nothing ever leaves your browser.

**[Try it live](https://nainemom.github.io/guard/)**

## Why Guard?

You want to send something sensitive, but you don't trust the messenger app. Even if it uses TLS, the server can still read your messages. Guard removes the middleman — encryption happens on your device before the message is sent, and decryption happens on the recipient's device after they receive it.

There is no messaging server. You encrypt text in Guard, copy the output, and paste it into whatever channel you already use (Signal, Telegram, SMS, email, a sticky note — doesn't matter). The channel only ever sees ciphertext.

## How It Works

1. **Generate a key pair** — pick from 15+ encryption methods (ECDH, RSA, ML-KEM, and more)
2. **Share your public key** — send your Guard link to anyone who needs to message you securely
3. **They encrypt a message** — using your public key, entirely in their browser
4. **You decrypt it** — using your private key, entirely in your browser

That's it. No accounts. No servers. No metadata.

## Security Model

Guard enforces a strict local-only architecture:

- **Content Security Policy** blocks all external origins at the browser level — you can inspect this in the HTML source
- **Service Worker firewall** rejects any network request to a non-same-origin URL with HTTP 403
- **Zero external dependencies at runtime** — all crypto, encoding, and storage run client-side
- **IndexedDB storage** — keys live in your browser's local database, never transmitted

You can verify this yourself: open DevTools, check the Network tab after the first load. There are no outgoing requests.

## Cryptography

All crypto is powered by the [Noble](https://paulmillr.com/noble/) library family — audited, zero-dependency, pure JavaScript implementations.

### Supported Methods

| Category | Methods |
|---|---|
| **Key Exchange** | ECDH (X25519, X448, P256, P384, P521, Secp256k1) |
| **RSA** | RSA-2048, RSA-4096 |
| **Post-Quantum** | ML-KEM-512, ML-KEM-768, ML-KEM-1024 |
| **Symmetric** | AES-256-GCM, Salsa20, XChaCha20 |

### Output Codecs

Encrypted output can be encoded in multiple formats:

- **Base64** — compact, standard
- **Emoji** — encode ciphertext as emoji sequences
- **Persian Everyday** — encode ciphertext as natural-looking Persian sentences

## Offline-First PWA

Guard is a fully offline Progressive Web App. After the first visit, the service worker precaches everything — the app works without any network access.

The production build outputs just a handful of files:

```
index.html       # App shell
bundle-x.y.z.js  # All application code (single file)
style-x.y.z.css  # All styles (single file)
sw.js            # Service worker
logo.svg         # App icon
manifest.json    # PWA manifest
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Crypto | @noble/curves, @noble/ciphers, @noble/post-quantum |
| Database | Dexie (IndexedDB) |
| Routing | Wouter |
| PWA | Serwist |
| Testing | Vitest + Playwright (browser tests) |
| Linting | Biome |
| Releases | semantic-release (conventional commits) |

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 6480)
npm run dev

# Run tests
npm test

# Production build
npm run build
```

Requires Node v22+.

## Credit

This project started in October 2022 after a helpful conversation with [Mohamad Mohebifar](https://github.com/mohebifar) and [Saeed Alipoor](https://github.com/saeedalipoor).
