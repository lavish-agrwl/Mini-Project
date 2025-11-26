import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Match from "./models/Match.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Match.deleteMany({});
    console.log("Cleared existing data");

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("demo123", salt);

    const demoUser = await User.create({
      email: "demo@cricket.com",
      passwordHash,
      name: "Demo User",
    });

    console.log("Created demo user:", demoUser.email);

    // Create a sample match
    const sampleMatch = await Match.create({
      owner: demoUser._id,
      name: "India vs Australia - Practice Match",
      oversPerInnings: 5,
      teams: [
        {
          name: "India",
          players: [
            { name: "Rohit Sharma" },
            { name: "Virat Kohli" },
            { name: "KL Rahul" },
            { name: "Hardik Pandya" },
            { name: "Ravindra Jadeja" },
            { name: "MS Dhoni" },
          ],
        },
        {
          name: "Australia",
          players: [
            { name: "David Warner" },
            { name: "Steve Smith" },
            { name: "Glenn Maxwell" },
            { name: "Pat Cummins" },
            { name: "Mitchell Starc" },
            { name: "Josh Hazlewood" },
          ],
        },
      ],
      matchDate: new Date(),
      notes: "Practice match for demonstration",
      status: "not_started",
    });

    console.log("Created sample match:", sampleMatch.name);

    console.log("\n=== SEED DATA COMPLETE ===");
    console.log("Demo User Credentials:");
    console.log("Email: demo@cricket.com");
    console.log("Password: demo123");
    console.log("===========================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
