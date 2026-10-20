import express from 'express'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { createApp } from './app.mjs'

const app = createApp()
const httpServer = createServer(app)
const port = Number(process.env.PORT || 5173)
const host = process.env.HOST || '127.0.0.1'
if (process.argv.includes('--dev')) {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: 'spa',
  })
  app.use(vite.middlewares)
} else {
  app.use(express.static(resolve('dist'), { index: false }))
  app.get('/{*splat}', (_req, res) => res.sendFile(resolve('dist/index.html')))
}
httpServer.listen(port, host, () => console.log(`日常有来处 http://${host}:${port}`))
httpServer.on('error', err => { console.error(err.message); process.exitCode = 1 })
