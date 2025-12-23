'use strict'

const fs = require('fs')
const path = require('path')

module.exports = async function(app, opts) {

  app.register(require('@fastify/cors'), {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  })


  const filePath = path.join(process.cwd(), 'data', 'data.json')
  const file = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(file)


  app.get('/', async () => {
    return { message: "Welcome to Examinus API" }
  })

  app.get('/api', async () => {
    return data
  })

  app.get('/api/faculty/names', async () => {
    return data.map(f => f.name)
  })

  app.get('/api/faculty/codes', async () => {
    return data.map(f => f.code)
  })


  app.get('/api/:faculty/departments/names', async (request, reply) => {
    const { faculty } = request.params
    const foundFaculty = data.find(f => f.code === faculty)
    if (!foundFaculty) {
      reply.code(404).send({ error: 'Faculty not found' })
      return
    }
    return foundFaculty.departments.map(d => d.name)
  })


  app.get('/api/:faculty/departments/codes', async (request, reply) => {
    const { faculty } = request.params
    const foundFaculty = data.find(f => f.code === faculty)
    if (!foundFaculty) {
      reply.code(404).send({ error: 'Faculty not found' })
      return
    }
    return foundFaculty.departments.map(d => d.code)
  })
}
