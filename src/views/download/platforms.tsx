import { ReactNode } from 'react'
import { ClientInfo, PlatformId } from './useInstallPrompt'
import { Key, MenuDots } from './parts'

type Browser = ClientInfo['browser']

export type InstallMethod = {
  /** Which browsers these steps are for, as shown to the reader. */
  browsers: string
  for: Browser[]
  /** One-line version used in the hero hint. */
  short: string
  steps: ReactNode[]
}

export type Platform = {
  id: PlatformId
  name: string
  result: string
  methods: InstallMethod[]
  methodFor: (b: Browser) => InstallMethod | undefined
}

function platform(p: Omit<Platform, 'methodFor'>): Platform {
  return { ...p, methodFor: (b) => p.methods.find((m) => m.for.includes(b)) }
}

export const PLATFORMS: Platform[] = [
  platform({
    id: 'macos',
    name: 'macOS',
    result: 'Opens in its own window and sits in the Dock.',
    methods: [
      {
        browsers: 'Safari 17 or later, macOS Sonoma',
        for: ['safari'],
        short: 'in Safari, choose File, then Add to Dock',
        steps: [
          <>
            In the menu bar, choose <Key>File</Key> then <Key>Add to Dock</Key>.
          </>,
          <>
            Keep the name or change it, then click <Key>Add</Key>.
          </>,
        ],
      },
      {
        browsers: 'Chrome or Edge',
        for: ['chrome', 'edge'],
        short: 'click the install icon at the right end of the address bar',
        steps: [
          <>Click the install icon at the right end of the address bar.</>,
          <>
            Click <Key>Install</Key>.
          </>,
        ],
      },
    ],
  }),
  platform({
    id: 'windows',
    name: 'Windows',
    result: 'Opens in its own window and appears in the Start menu.',
    methods: [
      {
        browsers: 'Edge or Chrome',
        for: ['edge', 'chrome'],
        short: 'click the install icon at the right end of the address bar',
        steps: [
          <>Click the install icon at the right end of the address bar.</>,
          <>
            In Edge you can also open{' '}
            <Key>
              <MenuDots label="Settings and more" />
            </Key>{' '}
            then <Key>Apps</Key> then <Key>Install this site as an app</Key>.
          </>,
          <>
            Click <Key>Install</Key>.
          </>,
        ],
      },
    ],
  }),
  platform({
    id: 'ios',
    name: 'iPhone & iPad',
    result: 'Adds an icon to the Home Screen that opens full screen.',
    methods: [
      {
        browsers: 'Safari',
        for: ['safari', 'chrome', 'edge', 'firefox', 'other'],
        short: 'in Safari, tap Share, then Add to Home Screen',
        steps: [
          <>Open this page in Safari.</>,
          <>
            Tap <Key>Share</Key> then <Key>Add to Home Screen</Key>.
          </>,
          <>
            Tap <Key>Add</Key>.
          </>,
        ],
      },
    ],
  }),
  platform({
    id: 'android',
    name: 'Android',
    result: 'Adds Zeno to the home screen and app drawer.',
    methods: [
      {
        browsers: 'Chrome',
        for: ['chrome', 'edge', 'other'],
        short: 'in Chrome, open the menu and tap Install app',
        steps: [
          <>Open this page in Chrome.</>,
          <>
            Tap{' '}
            <Key>
              <MenuDots vertical label="More" />
            </Key>{' '}
            then <Key>Install app</Key>. On some versions it reads <Key>Add to Home screen</Key>.
          </>,
          <>
            Tap <Key>Install</Key>.
          </>,
        ],
      },
    ],
  }),
]
