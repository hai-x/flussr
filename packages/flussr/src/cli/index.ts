import cac from 'cac'
import { build } from './build'
import { dev } from './dev'

const cli = cac('flussr')
cli.version('0.0.0')

cli.command('build', 'build the app for production').action(async () => {
  try {
    await build()
  } catch {
    process.exit(1)
  }
})

cli
  .command('dev', 'starting the dev server')
  .option(
    '--dir',
    `A directory on which to start the application. If no directory is provided, the current directory will be used.
    }`
  )
  .action(async ({ dir }) => {
    dev({
      dir
    })
  })

cli.help()

cli.parse()
