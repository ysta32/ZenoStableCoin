import { readFileSync } from 'node:fs'

const version = process.argv[2]?.replace(/^v/, '')

try {
  if (!version) {
    throw new Error('Usage: node scripts/release-notes.mjs <version>')
  }

  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
  const lines = changelog.split(/\r?\n/)
  const start = lines.findIndex((line) => {
    const heading = /^## \[([^\]]+)\] - \d{4}-\d{2}-\d{2}\s*$/.exec(line)
    return heading?.[1] === version
  })

  if (start === -1) {
    throw new Error(`No changelog section found for ${version}`)
  }

  const body = []
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line) || /^\[[^\]]+\]:\s/.test(line)) break
    body.push(line)
  }

  process.stdout.write(`${body.join('\n').trim()}\n`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
