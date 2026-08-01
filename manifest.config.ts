import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'LunarShield',
  version: '1.0.0',
  description:
    'Universal dark mode, night shift and OLED themes with per-site rules, schedules and smart image protection. 100% on-device and private.',
  minimum_chrome_version: '111',
  // Least-privilege permission set: no host permissions, no tabs, no scripting.
  // `activeTab` is granted transiently when the user invokes the extension.
  permissions: ['storage', 'commands', 'activeTab'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_title: 'LunarShield',
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
  options_page: 'src/options/index.html',
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  commands: {
    'toggle-global': {
      suggested_key: { default: 'Alt+Shift+D', mac: 'Command+Shift+D' },
      description: 'Toggle LunarShield on/off',
    },
    'toggle-site': {
      suggested_key: { default: 'Alt+Shift+S', mac: 'Command+Shift+S' },
      description: 'Toggle the theme on the current site',
    },
    'cycle-mode': {
      suggested_key: { default: 'Alt+Shift+M', mac: 'Command+Shift+M' },
      description: 'Cycle theme mode (Dark, Night, OLED)',
    },
    'toggle-schedule': {
      suggested_key: { default: 'Alt+Shift+E', mac: 'Command+Shift+E' },
      description: 'Enable or disable the schedule',
    },
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_start',
      all_frames: true,
    },
    {
      // Runs in the page's MAIN world to surface dynamically attached shadow
      // roots to the isolated-world engine via a DOM attribute (Chrome 111+).
      matches: ['<all_urls>'],
      js: ['src/content/shadow-host.ts'],
      run_at: 'document_start',
      all_frames: true,
      world: 'MAIN',
    },
  ],
})
