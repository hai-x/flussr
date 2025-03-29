#!/usr/bin/env node
const { enableCompileCache } = require('module')
// enable on-disk code caching of all modules loaded by Node.js
// requires Nodejs >= 22.8.0
if (enableCompileCache) {
  try {
    enableCompileCache()
  } catch {
    // ignore errors
  }
}

require('../dist/cli/index.js')
