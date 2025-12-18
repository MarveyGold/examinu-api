import Fastify, { fastify } from 'fastify';
import fs from 'fs';
import cors from '@fastify/cors';

const app = Fastify();

await app.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST']
});

const filePath = process.cwd() + `/data/data.json`;
app.get('/api/data', async () => {
  const file = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(file);
  return data.map(f => f.name)
});
app.listen({ port: 8080, host: '0.0.0.0'}, () => {
  console.log("server started on port 8080")
})
