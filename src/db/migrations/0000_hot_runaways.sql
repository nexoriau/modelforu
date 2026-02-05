CREATE TYPE "public"."icon_type_enum" AS ENUM('audio', 'video', 'photo', 'credits_low', 'subscription', 'invoice', 'model', 'referral', 'product');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('success', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'agency');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'suspended', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."subModel_status" AS ENUM('cloning', 'cloned', 'canceled', 'pending', 'idle');--> statement-breakpoint
CREATE TYPE "public"."subModel_type" AS ENUM('audio', 'video', 'photo');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('token', 'model');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"description" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255),
	"company_website" varchar(255),
	"company_description" text,
	"company_industry" varchar(255),
	"company_number" varchar(255),
	CONSTRAINT "company_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "generate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"sub_model_id" uuid NOT NULL,
	"description" text NOT NULL,
	"media_url" text[] DEFAULT '{}' NOT NULL,
	"selected_image" text DEFAULT '' NOT NULL,
	"items_length" integer NOT NULL,
	"type" varchar NOT NULL,
	"soft_delete" boolean DEFAULT false NOT NULL,
	"soft_deleted_at" timestamp with time zone,
	"generation_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generate_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"is_discarded" boolean DEFAULT false NOT NULL,
	"discarded_at" timestamp with time zone,
	"is_selected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"gender" varchar(255) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"is_default_model" boolean DEFAULT false NOT NULL,
	"is_published_by_admin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models_to_users" (
	"user_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	CONSTRAINT "models_to_users_user_id_model_id_pk" PRIMARY KEY("user_id","model_id")
);
--> statement-breakpoint
CREATE TABLE "notification_preference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_cloned_email" boolean DEFAULT true NOT NULL,
	"model_cloned_in_app" boolean DEFAULT true NOT NULL,
	"subscription_email" boolean DEFAULT true NOT NULL,
	"subscription_in_app" boolean DEFAULT true NOT NULL,
	"invoice_email" boolean DEFAULT true NOT NULL,
	"invoice_in_app" boolean DEFAULT true NOT NULL,
	"credits_email" boolean DEFAULT true NOT NULL,
	"credits_in_app" boolean DEFAULT true NOT NULL,
	"referral_email" boolean DEFAULT true NOT NULL,
	"referral_in_app" boolean DEFAULT true NOT NULL,
	"product_updates_email" boolean DEFAULT true NOT NULL,
	"product_updates_in_app" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type_enum" NOT NULL,
	"iconType" "icon_type_enum" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"soft_delete" boolean DEFAULT false NOT NULL,
	"time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passwordResetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "passwordResetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payment_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"credits" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" uuid,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"customer_email" varchar(255),
	"payment_status" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"plan_name" varchar(255),
	"invoice_id" varchar(255),
	"type" "type" DEFAULT 'token' NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"invoice_url" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"type" "subModel_type" NOT NULL,
	"is_by_admin" boolean DEFAULT false,
	"status" "subModel_status" NOT NULL,
	"description" text NOT NULL,
	"drive_link" text DEFAULT '' NOT NULL,
	"api_key" text DEFAULT '',
	"items_length" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar(255) NOT NULL,
	"user_id" uuid,
	"card_type" varchar(255),
	"user_email" varchar(255) NOT NULL,
	"source" varchar(255) DEFAULT 'purchase' NOT NULL,
	"type" varchar(255) DEFAULT 'One-Time' NOT NULL,
	"description" varchar(255),
	"token_quantity" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"invoice_url" text,
	"invoice_id" varchar(255) NOT NULL,
	"created_date" timestamp with time zone,
	"tokens_expire_at" timestamp with time zone,
	"company_name" varchar(255),
	"vat_number" varchar(255),
	"company_address" text,
	"event_type" varchar(255),
	"interval" varchar(255),
	"cancel_at_period_end" boolean DEFAULT false,
	"cancellation_feedback" text,
	"cancellation_comment" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscription_history_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2) NOT NULL,
	"monthly_credits" integer NOT NULL,
	"annual_credits" integer NOT NULL,
	"monthly_description" text NOT NULL,
	"annual_description" text NOT NULL,
	"features" text[] NOT NULL,
	"highlighted" boolean DEFAULT false,
	"for_agency" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trained_model_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trained_model_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trained_model_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trained_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar NOT NULL,
	"group_id" uuid,
	"style" text,
	"sample_text" text,
	"voice_file_url" text,
	"preview_image_url" text,
	"description" text,
	"api_config" text DEFAULT '{}',
	"is_published" boolean DEFAULT false NOT NULL,
	"assign_to_all" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trained_model_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"plan_name" varchar(255) NOT NULL,
	"event_type" varchar(255),
	"user_id" uuid NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"status" varchar(255),
	"cancel_at_period_end" boolean NOT NULL,
	"event_timestamp" timestamp with time zone,
	"created" timestamp with time zone,
	"interval" varchar(255),
	"price" numeric(12, 2) NOT NULL,
	"invoice_url" text DEFAULT '',
	"invoice_id" varchar(255) NOT NULL,
	"tokens" integer NOT NULL,
	"current_period_end" timestamp with time zone,
	"description" text,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"last_name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"password" text,
	"image" text,
	"phone" text,
	"country" text,
	"language" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"status" "status" DEFAULT 'approved' NOT NULL,
	"tokens" integer DEFAULT 30 NOT NULL,
	"models" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 30 NOT NULL,
	"subscription_id" varchar(255) DEFAULT '',
	"stripe_customer_id" varchar(255) DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generate" ADD CONSTRAINT "generate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generate" ADD CONSTRAINT "generate_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generate" ADD CONSTRAINT "generate_sub_model_id_sub_model_id_fk" FOREIGN KEY ("sub_model_id") REFERENCES "public"."sub_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_generate_id_generate_id_fk" FOREIGN KEY ("generate_id") REFERENCES "public"."generate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models_to_users" ADD CONSTRAINT "models_to_users_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models_to_users" ADD CONSTRAINT "models_to_users_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_model" ADD CONSTRAINT "sub_model_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_model" ADD CONSTRAINT "sub_model_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model_assignment" ADD CONSTRAINT "trained_model_assignment_trained_model_id_trained_model_id_fk" FOREIGN KEY ("trained_model_id") REFERENCES "public"."trained_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model_assignment" ADD CONSTRAINT "trained_model_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model_assignment" ADD CONSTRAINT "trained_model_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model_group" ADD CONSTRAINT "trained_model_group_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model" ADD CONSTRAINT "trained_model_group_id_trained_model_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."trained_model_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trained_model" ADD CONSTRAINT "trained_model_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;