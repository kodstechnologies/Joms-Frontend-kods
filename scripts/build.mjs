import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const node = process.execPath
const typecheckOnly = process.argv.includes('--typecheck')

const run = (script, args) => {
  const result = spawnSync(node, [script, ...args], { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(path.join(root, 'node_modules/typescript/lib/tsc.js'), ['-b'])
if (!typecheckOnly) {
  run(path.join(root, 'node_modules/vite/bin/vite.js'), ['build'])
}
