import fs from 'fs';
import path from 'path';
import mongoose from "mongoose";
import cors from '@fastify/cors';
import "dotenv/config";
import Data from './models/data.js';
import Feedback from './models/feedback.js'
import Quiz from './models/quiz.js'

export default async function server(app, opts) {
  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://0.0.0.0:5173',
      'http://192.168.205.116:5173',
      'https://examinu.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']

  });
  const uri = process.env.DB_URL;
  mongoose.connect(uri).then(() => console.log("Connected to db")).catch(() => console.log("Failed to connect to db"))


  // -------------------------
  // Base route
  // -------------------------
  app.get('/', () => ({ message: 'Welcome to ExaminU API' }));
  app.get('/api', () => Data.find())
  app.get('/users', () => Feedback.find())
  app.post('/user', async (request, reply) => {
    const data = request.body;
    const result = await Feedback.insertOne(data)
    return reply.status(201).send({ success: true, id: result.insertedId })
  })
  app.get('/favicon.ico', (request, reply) => {
    const iconPath = path.join(process.cwd(), 'favicon.ico');
    reply.type('image/x-icon').send(fs.readFileSync(iconPath))
  })
  const result = await Data.aggregate([
    {
      $group: {
        _id: { name: "$name", code: "$code" }
      }
    },
    { $project: { _id: 0, name: "$_id.name", code: "$_id.code" } }
  ]);


  app.get('/api/faculty/names', async () => {
    return result.map(a => a.name)
  });
  app.get('/api/faculty/codes', () => result.map(a => a.code));

  app.get('/api/:faculty/name', async (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = await Data.findOne({ code: faculty });
    const { name } = foundFaculty;
    return name;
  });

  app.get('/api/:faculty/departments/names', async (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = await Data.findOne({ code: faculty });
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });
    return foundFaculty.departments.map(d => d.name);
  });

  app.get('/api/:faculty/departments/codes', async (req, reply) => {
    const { faculty } = req.params;
    const foundFaculty = await Data.findOne({ code: faculty });
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });
    return foundFaculty.departments.map(d => d.code);
  });

  // -------------------------
  // Department routes
  // -------------------------
  app.get('/api/:faculty/:department/name', async (req, reply) => {
    const { faculty, department } = req.params;
    const foundFaculty = await Data.findOne({ code: faculty });
    if (!foundFaculty) return reply.code(404).send({ error: 'Faculty not found' });

    const foundDepartment = foundFaculty.departments.find(d => d.code === department);
    if (!foundDepartment) return reply.code(404).send({ error: 'Department not found' });

    return foundDepartment.name;
  });

  app.get('/api/:faculty/:department/courses', async (req, reply) => {
    const { faculty, department } = req.params;
    const foundFaculty = await Data.findOne({ code: faculty });
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

