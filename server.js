'use strict'

const fs = require('fs')
const { request } = require('https')
const path = require('path')

module.exports = async function(app, opts) {

  app.register(require('@fastify/cors'), {
    origin: [
      'http://localhost:5173',
      'https://examinu.vercel.app'
    ],
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
  app.get('/api/:faculty/name', async (request, reply) => {
    const { faculty } = request.params
    const foundFaculty = data.find(f => f.code === faculty)
    if (!foundFaculty) {
      reply.code(404).send({ error: 'Faculty not found' })
      return
    }
    return foundFaculty.name
  }
  )
  app.get('/api/:faculty/:department/name', async (request) => {
    const { faculty, department } = request.params;
    const Faculty = data.find(f => f.code === faculty);
    const Departments = Faculty.departments
    const Department = Departments.find(d => d.code === department)

    return Department.name
  })
  app.get('/api/:faculty/:department/courses', async (request) => {
    const { faculty, department } = request.params;
    const Faculty = data.find(f => f.code === faculty);
    const Departments = Faculty.departments
    const Department = Departments.find(d => d.code === department)

    return Department.courses
  })
  app.get('/api/quiz/:course', async (request) => {
    const { course } = request.params;
    const { q } = request.query;
    const index = Number(q);
    const src = `${course}.json`;
    const filePath = path.join(process.cwd(), 'data', 'courses', src)
    const file = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(file)
    return data[index]
  })
  app.get('/api/quiz/:course/length', async (request) => {
    const { course } = request.params;
    const src = `${course}.json`;
    const filePath = path.join(process.cwd(), 'data', 'courses', src)
    const file = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(file)
    return data.length
  })

}
