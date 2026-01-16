CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"auth_provider" text NOT NULL,
	"auth_provider_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "users_auth_provider_auth_provider_id_unique" UNIQUE("auth_provider","auth_provider_id")
);
