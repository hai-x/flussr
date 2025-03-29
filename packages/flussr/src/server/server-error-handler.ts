import { ErrorRequestHandler } from 'express'
import { fillHtml } from './utils/html'

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    res.statusCode = 200
    res.send(
      fillHtml({
        title: 'Internal Server Error',
        body: 'Internal Server Error'
      })
    )
  }
  next()
}

export default errorHandler
