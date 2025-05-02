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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable("user", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
});

// Any because it references itself
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
    .references(() => jobTitles.id),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.departmentId),
  managerId: integer('manager_id').references((): AnyPgColumn => employees.id),
  employmentStatusId: integer('employment_status_id')
    .notNull()
    .references(() => employmentStatuses.id),
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
}));

// Departments
export const departments = pgTable('department', {
  departmentId: serial('department_id').primaryKey(),
  departmentName: varchar('department_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

// JobTitles
export const jobTitles = pgTable('jobtitle', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobTitlesRelations = relations(jobTitles, ({ many }) => ({
  employees: many(employees),
}));

// EmploymentStatuses
export const employmentStatuses = pgTable('employmentstatus', {
  id: serial('id').primaryKey(),
  statusName: varchar('status_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employmentStatusesRelations = relations(
  employmentStatuses,
  ({ many }) => ({
    employees: many(employees),
  }),
);

// Attendance
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id),
  recordDate: date('record_date').notNull(),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

// LeaveRequests
export const leaveRequests = pgTable('leaverequest', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id),
  leaveTypeId: integer('leave_type_id')
    .notNull()
    .references(() => leaveTypes.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
}));

// LeaveTypes
export const leaveTypes = pgTable('leavetype', {
  id: serial('id').primaryKey(),
  typeName: varchar('type_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leaveTypesRelations = relations(leaveTypes, ({ many }) => ({
  leaveRequests: many(leaveRequests),
}));

// Payroll
export const payroll = pgTable('payroll', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id),
  payPeriodStartDate: date('pay_period_start_date').notNull(),
  payPeriodEndDate: date('pay_period_end_date').notNull(),
  netPay: integer('net_pay').notNull(), // Using integer for simplicity, consider numeric/decimal for currency
  paymentDate: date('payment_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payrollRelations = relations(payroll, ({ one }) => ({
  employee: one(employees, {
    fields: [payroll.employeeId],
    references: [employees.id],
  }),
}));

// Benefits
export const benefits = pgTable('benefit', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const benefitsRelations = relations(benefits, ({ many }) => ({
  employeeBenefits: many(employeeBenefits),
}));

// EmployeeBenefits (Linking Table)
export const employeeBenefits = pgTable(
  'employeebenefit',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id),
    benefitId: integer('benefit_id')
      .notNull()
      .references(() => benefits.id),
    enrollmentDate: date('enrollment_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  }),
);

// PerformanceReviews
export const performanceReviews = pgTable('performancereview', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id),
  reviewDate: date('review_date').notNull(),
  overallRating: integer('overall_rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const performanceReviewsRelations = relations(
  performanceReviews,
  ({ one }) => ({
    employee: one(employees, {
      fields: [performanceReviews.employeeId],
      references: [employees.id],
    }),
  }),
);

// TrainingPrograms
export const trainingPrograms = pgTable('trainingprogram', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const trainingProgramsRelations = relations(
  trainingPrograms,
  ({ many }) => ({
    employeeTraining: many(employeeTraining),
  }),
);

export const employeeTraining = pgTable(
  'employeetraining',
  {
    employeeTrainingId: serial('employee_training_id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id),
    programId: integer('program_id')
      .notNull()
      .references(() => trainingPrograms.id),
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


export type NewUser = typeof users.$inferInsert;
type SelectUser = typeof users.$inferSelect;

export type User = Omit<SelectUser, 'password'>;
export type UserWithPassword = SelectUser;
