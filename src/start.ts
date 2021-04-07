import express from 'express'
import type { Server } from 'http'
import 'express-async-errors'
import logger from 'loglevel'
import { errorMiddleware } from './middleware/error'
import { CloseOptions } from './types'
import { getRoutes } from './routes'

function startServer({ port = process.env.PORT } = {}): Promise<unknown> {
  const app = express()

  app.get('/', (_req, res) => {
    res.json({ foo: 'Hello World' })
  })

  app.use(getRoutes())

  app.use(errorMiddleware)

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      const address = server.address()
      if (address) {
        if (typeof address === 'object') {
          logger.info(`Listening on http://localhost:${address.port}`)
        } else {
          logger.info(`Listening on ${address}`)
        }
      }
      const originalClose = server.close.bind(server)
      //@ts-ignore
      server.close = () => {
        return new Promise(resolveClose => {
          originalClose(resolveClose)
        })
      }
      setupCloseOnExit(server)
      resolve(server)
    })
  })
}

function setupCloseOnExit(server: Server) {
  async function exitHandler(options: CloseOptions = {}) {
    await server
      .close()
      //@ts-ignore
      .then(() => {
        logger.info('Server successfully closed')
      })
      .catch((e: Error) => {
        logger.warn('Something went wrong closing the server', e.stack)
      })
    if (options.exit) process.exit()
  }
  process.on('exit', exitHandler)
  process.on('SIGINT', exitHandler.bind(null, { exit: true }))
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
}

export { startServer }
