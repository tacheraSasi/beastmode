CREATE TABLE `daily_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer NOT NULL,
	`date` integer NOT NULL,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`session_count` integer DEFAULT 0,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`goal_hours` integer DEFAULT 100,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration_seconds` integer,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
