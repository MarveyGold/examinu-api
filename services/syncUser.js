
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient;

export async function syncUser(clerkUserId) {
  // Check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.authProvider, 'clerk'),
        eq(users.authProviderId, clerkUserId)
      )
    )
    .limit(1);

  if (existing.length) return existing[0].id;

  // Fetch Clerk user
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.emailAddresses[0].emailAddress;

  // Insert new user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      authProvider: 'clerk',
      authProviderUserId: clerkUserId
    })
    .returning();

  return newUser.id;
}
