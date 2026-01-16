import { createClerkClient } from "@clerk/backend";

export async function verifyClerk(req, reply) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const session = await createClerkClient.sessions.verifySession(token);
    req.clerkUserId = session.userId;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
