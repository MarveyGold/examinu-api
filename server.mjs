import fs from 'fs';
import path from 'path';

//import cors from '@fastify/cors';
import { verifyClerk } from './plugins/clerk.js';
import { syncUser } from './services/syncUser.js';

/**
 * Exported server function
 * @param {import('fastify').FastifyInstance} app
 */
export default function server(app) {
  // -------------------------
  // CORS
  // -------------------------
  // await app.register(cors, {
  //  origin: [
  //    'http://0.0.0.0:5173',
  //    'https://examinu.vercel.app'
  //   ],
  //   methods: ['GET', 'POST']
  // });

  // -------------------------
  // Load JSON data
  // -------------------------
  const dataFilePath = path.join(process.cwd(), 'data', 'data.json');
  const file = fs.readFileSync(dataFilePath, 'utf8');
  const data = JSON.parse(file);

  // -------------------------
  // Base route
  // -------------------------
  app.get('/', () => ({ message: 'Welcome to ExaminU API' }));

  // -------------------------
  // Clerk-protected route
  // -------------------------
  app.get('/me', { preHandler: verifyClerk }, async (req, reply) => {
    try {
      const userId = await syncUser(req.clerkUserId);
      return { userId };
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });


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

