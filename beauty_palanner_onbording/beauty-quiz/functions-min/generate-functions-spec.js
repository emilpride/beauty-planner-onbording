const fs = require('fs')
const path = require('path')

function mergeRequiredAPIs(requiredAPIs) {
  const apiToReasons = new Map()
  for (const entry of requiredAPIs) {
    if (!entry || typeof entry !== 'object') continue
    const { api, reason } = entry
    if (!api) continue
    const list = apiToReasons.get(api) || []
    if (reason && !list.includes(reason)) {
      list.push(reason)
    }
    apiToReasons.set(api, list)
  }
  const merged = []
  for (const [api, reasons] of apiToReasons.entries()) {
    merged.push({ api, reason: reasons.join(' ') })
  }
  return merged
}

function extractStack(moduleExports) {
  const endpoints = {}
  const requiredAPIs = []

  function extract(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return
    for (const [name, value] of Object.entries(obj)) {
      const entryName = prefix ? `${prefix}-${name}` : name

      if (typeof value === 'function' && value.__endpoint && typeof value.__endpoint === 'object') {
        endpoints[entryName] = {
          ...value.__endpoint,
          entryPoint: entryName.replace(/-/g, '.'),
        }
        if (Array.isArray(value.__requiredAPIs)) {
          requiredAPIs.push(...value.__requiredAPIs)
        }
      } else if (value && typeof value === 'object') {
        extract(value, entryName)
      }
    }
  }

  extract(moduleExports)

  return {
    specVersion: 'v1alpha1',
    endpoints,
    requiredAPIs: mergeRequiredAPIs(requiredAPIs),
    extensions: {},
  }
}

function main() {
  const sourceDir = path.join(__dirname, 'lib')
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(sourceDir)
    const stack = extractStack(mod)
    const outputPath = path.join(__dirname, 'functions.yaml')
    fs.writeFileSync(outputPath, JSON.stringify(stack, null, 2))
    console.log(`functions spec written to ${outputPath}`)
  } catch (err) {
    console.error('Failed to generate functions.yaml', err)
    process.exitCode = 1
  }
}

main()
