# 🌙 LunarShield

A production-ready **Manifest V3 browser extension** that brings a universal dark mode to every website — with **night shift**, **OLED** themes, **per-site rules**, **schedules**, **smart image protection** and **on-device site detection**. 100% on-device and private: no telemetry, no data collection, no remote servers.

> Built for Chromium browsers (Chrome, Edge, Brave, Opera, Vivaldi). Requires **Chrome 111+** (uses `world: "MAIN"` content scripts).

---

## ✨ Features

- 🌗 **Universal dark mode** — theme engine that inverts and re-colors any page at `document_start` (no flash of white).
- 🌃 **Night shift** — warm, low-blue-light theme for evenings.
- ⚫ **OLED mode** — true black backgrounds for OLED/AMOLED displays.
- 🎚️ **Per-site rules** — enable, disable, or force a specific mode on individual sites.
- 🕒 **Schedules** — turn the theme on/off automatically based on time of day (with sunrise/sunset support).
- 🖼️ **Smart image protection** — detects logos, photos and icons so they don't look inverted.
- 🧠 **On-device site detection** — heuristic detection that works without any remote services.
- 🗝️ **Keyboard shortcuts** — toggle everything from the keyboard.
- 🔒 **Least-privilege permissions** — only `storage`, `commands` and `activeTab`. No host permissions, no `tabs`, no tracking.

---

## 🧰 Tech Stack

| Layer      | Technology |
|------------|------------|
| Extension  | Manifest V3 (Chromium) |
| Build      | [Vite](https://vitejs.dev/) + [CRXJS Vite Plugin](https://crxjs.dev/) |
| UI         | React 19 + Tailwind CSS |
| State      | Zustand |
| Tests      | Vitest (unit) + Playwright (e2e) |
| Linting    | ESLint + typescript-eslint |
| Language   | TypeScript 5.7 |

---

## 📋 Prerequisites

- **Node.js ≥ 20** — [download](https://nodejs.org/)
- **pnpm ≥ 11** — `npm install -g pnpm`, or enable via Corepack: `corepack enable`
- A Chromium browser (Chrome 111+, Edge, Brave, etc.)

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

> The repository uses `pnpm@11.15.0`. If you have a different pnpm version, you can use `corepack` to pin it automatically.

---

## 🧪 Development (with HMR)

```bash
pnpm dev
```

This generates the extension icons and starts a Vite dev server with **hot module reload** (HMR) powered by CRXJS.

1. The command keeps running in your terminal (dev server on `http://localhost:5173`).
2. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the **`dist/`** folder that Vite just created.
5. Pin LunarShield to the toolbar and test it — edits to popup/options React components hot-reload instantly; content-script changes reload on page refresh.

> **Note:** With CRXJS, extension IDs change between reloads, so keyboard shortcuts may reset while developing. They work as configured once installed from a build.

---

## 🏗️ Building for Production

```bash
pnpm build
```

This runs, in order:

1. `pnpm icons` — generate icon assets (`scripts/generate-icons.mjs`)
2. `pnpm typecheck` — type-check the whole project
3. `vite build` — bundle the extension into **`dist/`**

The output `dist/` folder contains a complete, signed-ready unpacked extension (`manifest.json` + all assets).

---

## 🔌 Installing the Built Extension in Your Browser

### Chrome / Edge / Brave

1. **Build the extension:**
   ```bash
   pnpm build
   ```

2. Open the extensions page for your browser:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Vivaldi: `vivaldi://extensions`

3. Toggle **Developer mode** **ON** (top-right corner).

4. Click **Load unpacked**.

5. Select the **`dist/`** folder inside this project.

6. 🎉 LunarShield is installed! Pin it to the toolbar and press **`Alt+Shift+D`** to toggle dark mode on any site.

### Keyboard Shortcuts

| Shortcut (Windows/Linux) | Shortcut (macOS) | Action |
|--------------------------|------------------|--------|
| `Alt+Shift+D` | `Command+Shift+D` | Toggle LunarShield on/off (global) |
| `Alt+Shift+S` | `Command+Shift+S` | Toggle the theme on the current site |
| `Alt+Shift+M` | `Command+Shift+M` | Cycle theme mode (Dark → Night → OLED) |
| `Alt+Shift+E` | `Command+Shift+E` | Enable/disable the schedule |

Shortcuts can be customized at `chrome://extensions/shortcuts`.

> **Packaging for the Chrome Web Store:** zip the contents of `dist/` and upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). Make sure the icon assets (16/32/48/128) are present inside `dist/icons/`.

---

## ✅ Quality Checks

| Command | What it does |
|---------|--------------|
| `pnpm typecheck` | TypeScript type-checking (`tsconfig.json` + `tsconfig.node.json`) |
| `pnpm lint` | ESLint over the whole project |
| `pnpm test:unit` | Run Vitest unit tests (once) |
| `pnpm test:unit:watch` | Run Vitest unit tests in watch mode |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm test` | Everything: lint → typecheck → unit tests → build → e2e |

**Run everything:**
```bash
pnpm test
```

> **E2E tests** require the extension to be built first — they load `dist/` as an unpacked extension in a headless Chromium instance. Run `pnpm build` (or `pnpm dev` once) before `pnpm test:e2e`. The global setup will fail with a clear message otherwise.

---

## 🗂️ Project Structure

```
├── e2e/                      # Playwright end-to-end tests
│   ├── fixtures/             # Test fixture HTML pages
│   ├── fixture-server.mjs    # Static server for fixtures (port 4173)
│   ├── fixtures.ts           # Loads dist/ as a persistent extension context
│   └── global-setup.ts       # Ensures dist/ exists before e2e
├── scripts/
│   └── generate-icons.mjs    # Generates all icon sizes from a source image
├── src/
│   ├── background/           # MV3 service worker: router, state, commands
│   ├── content/              # Content scripts (theme engine host + shadow host)
│   ├── options/              # Options page (React) — rules, schedules, data
│   ├── popup/                # Popup UI (React) — quick toggles & mode picker
│   ├── shared/               # Types, storage, defaults, colors, schedule, utils
│   ├── theme/                # The theme engine core
│   │   ├── strategies/       # CSS-vars and filter strategies
│   │   ├── detection.ts      # On-device light/dark site detection
│   │   ├── engine.ts         # The theme engine
│   │   ├── image-protection.ts
│   │   ├── resolve.ts, dom.ts, shadow-dom.ts
│   └── styles/               # Tailwind entry
├── manifest.config.ts        # Extension manifest (typed, via CRXJS)
├── vite.config.ts            # Vite + CRXJS + Vitest config
└── playwright.config.ts      # E2E config
```

---

## 🔒 Privacy

LunarShield is **fully on-device**:

- All settings are stored in `chrome.storage.local` — nothing leaves your machine.
- No host permissions: the content script runs without any site access tracking.
- No analytics, no telemetry, no third-party requests.
- Site detection runs locally using heuristics (no remote AI/APIs).

---

## 📄 License

Released under the **MIT License** (`package.json` declares `MIT`). Feel free to use, modify, and distribute — attribution appreciated.
