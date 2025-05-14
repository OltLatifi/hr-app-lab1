import dotenv from 'dotenv';
import { findUserByEmailWithPassword, createUser } from '../services/user.service';
import db from '../db';
import { roles } from '../db/schema';
import { eq } from 'drizzle-orm';
dotenv.config();

const seedSystemAdmin = async () => {
    console.log('Starting system admin seeding...');

    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL;
    const adminPassword = process.env.SYSTEM_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('Error: SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD must be set in environment variables.');
        process.exit(1);
    }

    try {
        const roleNames = ["Admin", "HR", "Employee"]

        for (const roleName of roleNames) {
            const existingRole = await db.query.roles.findFirst({
                where: eq(roles.name, roleName),
            });

            if (!existingRole) {
                await db.insert(roles).values({
                    name: roleName,
                });
            }
        }
    } catch (error) {
        console.error('Error during system admin seeding:', error);
        process.exit(1);
    }

    try {
        console.log(`Checking for existing admin user: ${adminEmail}...`);
        const existingAdmin = await findUserByEmailWithPassword(adminEmail);

        if (existingAdmin) {
            console.log('System admin user already exists.');
        } else {
            console.log('System admin user not found. Creating...');
            const adminName = 'System Admin'; 
            await createUser(adminName, adminEmail, adminPassword, 'Admin');
            console.log('System admin user created successfully.');
        }

        console.log('System admin seeding finished.');
    } catch (error) {
        console.error('Error during system admin seeding:', error);
        process.exit(1);
    }
};

seedSystemAdmin()
    .then(() => {
        console.log('Seeder finished, exiting.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seeder failed:', error);
        process.exit(1);
    }); 