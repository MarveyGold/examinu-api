import Fastify from 'fastify'
import server from './server.mjs'

const app = Fastify({ logger: true })
await app.register(server)
await app.listen({ port: process.env.PORT || 8080, host: '0.0.0.0' })
