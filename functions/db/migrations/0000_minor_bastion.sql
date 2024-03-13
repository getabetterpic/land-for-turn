CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`password_hash` text NOT NULL,
	`confirmed_at` text,
	`confirmation_token` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_confirmation_token_unique` ON `users` (`confirmation_token`);