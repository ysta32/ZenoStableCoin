# Security headers

Production responses (Vercel) carry these headers for every path (`vercel.json`, source `/(.*)`):

| Header                       | Value / purpose                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `Content-Security-Policy`    | Same-origin only for scripts, styles, fonts, images, workers, manifest and fetch. |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload` (two years, preload-eligible).     |
| `X-Content-Type-Options`     | `nosniff`                                                                         |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                 |
| `Permissions-Policy`         | Camera, microphone, geolocation and payment disabled.                             |
| `X-Frame-Options`            | `DENY` (legacy companion to `frame-ancestors 'none'`).                            |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                     |

## CSP notes

- `script-src 'self'` plus one `sha256-…` hash for the inline pre-paint theme script in
  `index.html`. **If that script changes, recompute the hash** or the theme flash returns:

  ```sh
  node -e "const h=require('fs').readFileSync('index.html','utf8');const s=/<script>([\s\S]*?)<\/script>/.exec(h)[1];console.log('sha256-'+require('crypto').createHash('sha256').update(s).digest('base64'))"
  ```

- `style-src 'unsafe-inline'` is required: framer-motion writes inline `style` attributes and
  `index.html` has an inline splash `<style>` block.
- Fonts are self-hosted via `@fontsource`; no external origins are allowed anywhere.
- `sw.js` and `manifest.webmanifest` keep their own extra headers (Vercel merges matching rules).

## Persisted state

`src/lib/persistGuards.ts` `parsePersisted` validates `localStorage` state before use: payloads
over `MAX_STATE_BYTES` (1 MB, UTF-8) or collections over `MAX_ITEMS` (5000) are rejected, wallets
must be `0x` + 40 hex chars, balances must be finite and non-negative, and `__proto__` /
`constructor` / `prototype` keys are stripped during parsing.
