CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"current_location" varchar(255),
	"preferred_job_titles" jsonb,
	"preferred_locations" jsonb,
	"preferred_job_types" jsonb,
	"min_salary_expectation" integer,
	"max_salary_expectation" integer,
	"is_remote_preferred" boolean,
	"skills" jsonb,
	"experience_summary" text,
	"education" jsonb,
	"work_experience" jsonb,
	"last_resume_upload_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"location" jsonb,
	"is_remote" boolean,
	"description" text,
	"url" varchar(512),
	"posted_date" date,
	"expiration_date" date,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" varchar(10),
	"job_type" varchar(50),
	"experience_level" varchar(50),
	"skills" jsonb,
	"industry" varchar(100),
	"normalized_company_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"api_url" varchar(512),
	"description" text,
	"legal_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
