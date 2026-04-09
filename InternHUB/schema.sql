-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- schema.sql â€” InternHub PostgreSQL Database Schema
-- Run ONCE against your PostgreSQL cluster to create all tables.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "departments" (
	"id" serial,
	"name" text NOT NULL,
	CONSTRAINT "department_pkey" PRIMARY KEY("id")
);

CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL CONSTRAINT "users_email_key" UNIQUE,
	"password" text NOT NULL,
	"gender" text,
	"college" text,
	"role" text DEFAULT 'Intern',
	"department_id" integer,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"description" text,
	"status" text,
	"priority" text,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"assigned_to" integer,
	"department_id" integer,
	"department_name" text
);

CREATE UNIQUE INDEX "department_pkey" ON "departments" ("id");
CREATE UNIQUE INDEX "tasks_pkey" ON "tasks" ("id");
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");

ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL;
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_user" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "users" ADD CONSTRAINT "fk_users_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL;

