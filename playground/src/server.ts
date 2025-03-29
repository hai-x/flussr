import { renderHandler } from 'flussr/server'

export default (app) => {
  app.use('/', renderHandler(app))
}
