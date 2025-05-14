import {
  pgTable,
  serial,
  varchar,
  date,
  integer,
  timestamp,
  primaryKey,
  text,
  AnyPgColumn,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable("user", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
});

export const company = pgTable('company', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  adminId: integer('admin_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const companyRelations = relations(company, ({ one }) => ({
  admin: one(users, {
    fields: [company.adminId],
    references: [users.id],
  }),
}));

export const employees = pgTable('employee', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }),
  dateOfBirth: date('date_of_birth'),
  hireDate: date('hire_date').notNull(),
  jobTitleId: integer('job_title_id')
    .notNull()
    .references(() => jobTitles.id, { onDelete: 'cascade' }),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.departmentId, { onDelete: 'cascade' }),
  managerId: integer('manager_id').references((): AnyPgColumn => employees.id, { onDelete: 'cascade' }),
  employmentStatusId: integer('employment_status_id')
    .notNull()
    .references(() => employmentStatuses.id, { onDelete: 'cascade' }),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
  jobTitle: one(jobTitles, {
    fields: [employees.jobTitleId],
    references: [jobTitles.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.departmentId],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
  }),
  managedEmployees: many(employees, {
    relationName: 'managedEmployees',
  }),
  employmentStatus: one(employmentStatuses, {
    fields: [employees.employmentStatusId],
    references: [employmentStatuses.id],
  }),
  attendanceRecords: many(attendance),
  leaveRequests: many(leaveRequests),
  payrollRecords: many(payroll),
  employeeBenefits: many(employeeBenefits),
  performanceReviews: many(performanceReviews),
  employeeTraining: many(employeeTraining),
  user: one(users, {
    fields: [employees.id],
    references: [users.id],
  }),
  company: one(company, {
    fields: [employees.companyId],
    references: [company.id],
  }),
}));

// Departments
export const departments = pgTable('department', {
  departmentId: serial('department_id').primaryKey(),
  departmentName: varchar('department_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const departmentsRelations = relations(departments, ({ many, one }) => ({
  employees: many(employees),
  company: one(company, {
    fields: [departments.companyId],
    references: [company.id],
  }),
}));

// JobTitles
export const jobTitles = pgTable('jobtitle', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const jobTitlesRelations = relations(jobTitles, ({ many, one }) => ({
  employees: many(employees),
  company: one(company, {
    fields: [jobTitles.companyId],
    references: [company.id],
  }),
}));

// EmploymentStatuses
export const employmentStatuses = pgTable('employmentstatus', {
  id: serial('id').primaryKey(),
  statusName: varchar('status_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const employmentStatusesRelations = relations(
  employmentStatuses,
  ({ many, one }) => ({
    employees: many(employees),
    company: one(company, {
      fields: [employmentStatuses.companyId],
      references: [company.id],
    }),
  }),
);

// Attendance
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  recordDate: date('record_date').notNull(),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
  company: one(company, {
    fields: [attendance.companyId],
    references: [company.id],
  }),
}));

// LeaveRequests
export const leaveRequests = pgTable('leaverequest', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  leaveTypeId: integer('leave_type_id')
    .notNull()
    .references(() => leaveTypes.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveRequests.leaveTypeId],
    references: [leaveTypes.id],
  }),
  company: one(company, {
    fields: [leaveRequests.companyId],
    references: [company.id],
  }),
}));

// LeaveTypes
export const leaveTypes = pgTable('leavetype', {
  id: serial('id').primaryKey(),
  typeName: varchar('type_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const leaveTypesRelations = relations(leaveTypes, ({ many, one }) => ({
  leaveRequests: many(leaveRequests),
  company: one(company, {
    fields: [leaveTypes.companyId],
    references: [company.id],
  }),
}));

// Payroll
export const payroll = pgTable('payroll', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  payPeriodStartDate: date('pay_period_start_date').notNull(),
  payPeriodEndDate: date('pay_period_end_date').notNull(),
  netPay: integer('net_pay').notNull(),
  grossPay: integer('gross_pay').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const payrollRelations = relations(payroll, ({ one }) => ({
  employee: one(employees, {
    fields: [payroll.employeeId],
    references: [employees.id],
  }),
  company: one(company, {
    fields: [payroll.companyId],
    references: [company.id],
  }),
}));

export const payLimits = pgTable('paylimit', {
  id: serial('id').primaryKey(),
  limit: integer('limit').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.departmentId, { onDelete: 'cascade' }),
});

export const payLimitsRelations = relations(payLimits, ({ one }) => ({
  department: one(departments, {
    fields: [payLimits.departmentId],
    references: [departments.departmentId],
  }),
}));

// Benefits
export const benefits = pgTable('benefit', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const benefitsRelations = relations(benefits, ({ many, one }) => ({
  employeeBenefits: many(employeeBenefits),
  company: one(company, {
    fields: [benefits.companyId],
    references: [company.id],
  }),
}));

// EmployeeBenefits (Linking Table)
export const employeeBenefits = pgTable(
  'employeebenefit',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    benefitId: integer('benefit_id')
      .notNull()
      .references(() => benefits.id, { onDelete: 'cascade' }),
    enrollmentDate: date('enrollment_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    companyId: integer('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
  }
);

export const employeeBenefitsRelations = relations(
  employeeBenefits,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeBenefits.employeeId],
      references: [employees.id],
    }),
    benefit: one(benefits, {
      fields: [employeeBenefits.benefitId],
      references: [benefits.id],
    }),
    company: one(company, {
      fields: [employeeBenefits.companyId],
      references: [company.id],
    }),
  }),
);

// PerformanceReviews
export const performanceReviews = pgTable('performancereview', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  reviewDate: date('review_date').notNull(),
  overallRating: integer('overall_rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const performanceReviewsRelations = relations(
  performanceReviews,
  ({ one }) => ({
    employee: one(employees, {
      fields: [performanceReviews.employeeId],
      references: [employees.id],
    }),
    company: one(company, {
      fields: [performanceReviews.companyId],
      references: [company.id],
    }),
  }),
);

// TrainingPrograms
export const trainingPrograms = pgTable('trainingprogram', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
});

export const trainingProgramsRelations = relations(
  trainingPrograms,
  ({ many, one }) => ({
    employeeTraining: many(employeeTraining),
    company: one(company, {
      fields: [trainingPrograms.companyId],
      references: [company.id],
    }),
  }),
);

export const employeeTraining = pgTable(
  'employeetraining',
  {
    employeeTrainingId: serial('employee_training_id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    programId: integer('program_id')
      .notNull()
      .references(() => trainingPrograms.id, { onDelete: 'cascade' }),
    completionDate: date('completion_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const employeeTrainingRelations = relations(
  employeeTraining,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeTraining.employeeId],
      references: [employees.id],
    }),
    trainingProgram: one(trainingPrograms, {
      fields: [employeeTraining.programId],
      references: [trainingPrograms.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ one }) => ({
  employee: one(employees, {
    fields: [users.id],
    references: [employees.id],
  }),
  role: one(roles, {
    fields: [users.id],
    references: [roles.id],
  }),
  administeredCompany: one(company, {
    fields: [users.id],
    references: [company.adminId],
  })
}));

export const roles = pgTable('role', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

// Admin Invitations Table
export const adminInvitations = pgTable('admin_invitation', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .notNull()
    .references(() => company.id, { onDelete: 'cascade' }),
  invitedUserEmail: varchar('invited_user_email', { length: 255 }).notNull(),
  invitationToken: varchar('invitation_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  invitedById: integer('invited_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminInvitationsRelations = relations(adminInvitations, ({ one }) => ({
  company: one(company, {
    fields: [adminInvitations.companyId],
    references: [company.id],
  }),
  invitedBy: one(users, {
    fields: [adminInvitations.invitedById],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [adminInvitations.roleId],
    references: [roles.id],
  }),
}));

export type NewUser = typeof users.$inferInsert;
type SelectUser = typeof users.$inferSelect;

export type User = Omit<SelectUser, 'password'>;
export type UserWithPassword = SelectUser;
