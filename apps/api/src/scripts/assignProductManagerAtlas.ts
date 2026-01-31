// npx ts-node apps/api/src/scripts/assignProductManagerAtlas.ts
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const assignRole = async () => {
    try {
        console.log("Connecting to database...");
        await connectDB();
        console.log("Connected.");

        const email = "gstarbabe931@gmail.com";
        const role = "product_manager";

        console.log(`Checking for user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            console.log("Listing some users to verify DB connection:");
            const users = await User.find().limit(5);
            users.forEach(u => console.log(`- ${u.email} (${u.role})`));
            process.exit(1);
        }

        console.log(`Found user ${user.username} with role: ${user.role}`);

        if (user.role === role) {
            console.log("User already has this role.");
        } else {
            user.role = role as any;
            await user.save();
            console.log(`✅ Successfully updated user ${email} to role ${role}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

assignRole();
