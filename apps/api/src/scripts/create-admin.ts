#!/usr/bin/env node
/**
 * Create Admin Script
 * 
 * This script creates the first super admin account for the platform.
 * Usage: npm run create-admin
 * 
 * The super admin email is: admint@glotrade.online
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "readline";
import { connectDB } from "../config/db";
import User from "../models/User";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function createSuperAdmin() {
    try {
        await connectDB();
        console.log("✓ Connected to database");

        const SUPER_ADMIN_EMAIL = "admint@glotrade.online";

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });

        if (existingAdmin) {
            console.log("\n⚠️  Super admin already exists!");
            console.log(`Email: ${existingAdmin.email}`);
            console.log(`Username: ${existingAdmin.username}`);
            console.log(`Role: ${existingAdmin.role}`);
            console.log(`Super Admin: ${existingAdmin.isSuperAdmin}`);

            const update = await question("\nDo you want to update this user to super admin? (yes/no): ");

            if (update.toLowerCase() === "yes" || update.toLowerCase() === "y") {
                existingAdmin.role = "admin";
                existingAdmin.isSuperAdmin = true;
                existingAdmin.isVerified = true;
                existingAdmin.emailVerified = true;
                await existingAdmin.save();

                console.log("\n✓ User updated to super admin successfully!");
                console.log(`Email: ${existingAdmin.email}`);
                console.log(`Username: ${existingAdmin.username}`);
            } else {
                console.log("\nOperation cancelled.");
            }

            rl.close();
            await mongoose.connection.close();
            process.exit(0);
            return;
        }

        console.log("\n=== Creating Super Admin Account ===");
        console.log(`Email: ${SUPER_ADMIN_EMAIL}`);

        const username = await question("Enter username (default: superadmin): ");
        const password = await question("Enter password (min 8 characters): ");
        const firstName = await question("Enter first name (optional): ");
        const lastName = await question("Enter last name (optional): ");

        // Validate password
        if (!password || password.length < 8) {
            console.error("\n❌ Password must be at least 8 characters long");
            rl.close();
            await mongoose.connection.close();
            process.exit(1);
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create super admin user
        const superAdmin = await User.create({
            email: SUPER_ADMIN_EMAIL,
            username: username.trim() || "superadmin",
            passwordHash,
            firstName: firstName.trim() || "Super",
            lastName: lastName.trim() || "Admin",
            role: "admin",
            isSuperAdmin: true,
            isVerified: true,
            emailVerified: true,
            country: "Nigeria",
        });

        console.log("\n✓ Super admin created successfully!");
        console.log("\n=== Account Details ===");
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Username: ${superAdmin.username}`);
        console.log(`Name: ${superAdmin.firstName} ${superAdmin.lastName}`);
        console.log(`Role: ${superAdmin.role}`);
        console.log(`Super Admin: ${superAdmin.isSuperAdmin}`);
        console.log("\n⚠️  Please save these credentials securely!");
        console.log("\nYou can now login at: http://localhost:3000/auth/login");

        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error creating super admin:", error);
        rl.close();
        await mongoose.connection.close();
        process.exit(1);
    }
}

createSuperAdmin();
