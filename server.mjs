import fs from 'fs';
import path from 'path';
import mongoose from "mongoose";
import cors from '@fastify/cors';
import { cwd } from 'process';
import User from './models/user.js';
export default async function server(app, opts) {
  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://0.0.0.0:5173',
      'http://192.168.41.116:5173',
      'https://examinu.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']

  });

  // -------------------------
  // Load JSON data
  // -------------------------
  const dataFilePath = path.join(process.cwd(), 'data', 'data.json');
  const file = fs.readFileSync(dataFilePath, 'utf8');
  const data = JSON.parse(file);


  const uri = "mongodb://127.0.0.1:27017/examinu";
  mongoose.connect(uri).then(() => console.log("Connected to db")).catch(() => console.log("Failed to connect to db"))

  const db = mongoose.connection;
  // -------------------------
  // Base route
  // -------------------------
  app.get('/', () => ({ message: 'Welcome to ExaminU API' }));
  app.get('/users', () => User.find())
  app.post('/user', async (request, reply) => {
    const data = request.body;
    const result = await User.insertOne(data)
    return reply.status(201).send({ success: true, id: result.insertedId })
  })
  // -------------------------
  // Clerk-protected route
  // -------------------------
  app.get('/favicon.ico', (request, reply) => {
    const iconPath = path.join(process.cwd(), 'favicon.ico');
    reply.type('image/x-icon').send(fs.readFileSync(iconPath))
  })


  app.get('/api/faculty/names', () => data.map(f => f.name));
  app.get('/api/faculty/codes', () => data.map(f => f.code));

  app.get('/api/:faculty/name', (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = data.find(f => f.code === faculty);
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });
    return foundFaculty.name;
  });

  app.get('/api/:faculty/departments/names', (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = data.find(f => f.code === faculty);
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });
    return foundFaculty.departments.map(d => d.name);
  });

  app.get('/api/:faculty/departments/codes', (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = data.find(f => f.code === faculty);
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });
    return foundFaculty.departments.map(d => d.code);
  });

  // -------------------------
  // Department routes
  // -------------------------
  app.get('/api/:faculty/:department/name', (req, reply) => {
    const { faculty, department } = req.params;
    const foundFaculty = data.find(f => f.code === faculty);
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });

    const foundDepartment = foundFaculty.departments.find(d => d.code === department);
    if (!foundDepartment) return reply.code(404).send({ error: 'Department not found' });

    return foundDepartment.name;
  });

  app.get('/api/:faculty/:department/courses', (req, reply) => {
    const { faculty, department } = req.params;
    const foundFaculty = data.find(f => f.code === faculty);
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });

    const foundDepartment = foundFaculty.departments.find(d => d.code === department);
    if (!foundDepartment) return reply.code(404).send({ error: 'Department not found' });

    return foundDepartment.courses;
  });

  // -------------------------
  // Quiz routes
  // -------------------------
  app.get('/api/quiz/:course', (req, reply) => {
    const { course } = req.params;
    const { q } = req.query;

    const quizPath = path.join(process.cwd(), 'data', 'courses', `${course}.json`);

    if (!fs.existsSync(quizPath)) return reply.code(404).send({ error: 'Course not found' });

    const quizFile = fs.readFileSync(quizPath, 'utf8');
    const quizData = JSON.parse(quizFile);
    return quizData.find((f) => f.question == q);
  });

  app.get('/api/quiz/:course/length', (req, reply) => {
    const { course } = req.params;
    const quizPath = path.join(process.cwd(), 'data', 'courses', `${course}.json`);

    if (!fs.existsSync(quizPath)) return reply.code(404).send({ error: 'Course not found' });

    const quizFile = fs.readFileSync(quizPath, 'utf8');
    const quizData = JSON.parse(quizFile);

    return quizData.map((item) => item.question);
  });
}
// -------------------------
// CORS
// -------------------------

