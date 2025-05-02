import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("User", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
});

export type NewUser = typeof usersTable.$inferInsert;
type SelectUser = typeof usersTable.$inferSelect;

export type User = Omit<SelectUser, 'password'>;
export type UserWithPassword = SelectUser;
