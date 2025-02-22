import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { Express } from "express";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  // Create admin user if it doesn't exist
  const adminUsername = "admin";
  const adminPassword = "rama.56Op";

  const existingAdmin = await storage.getUserByUsername(adminUsername);
  if (!existingAdmin) {
    await storage.createUser({
      username: adminUsername,
      password: await hashPassword(adminPassword),
    });
  }

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session
    req.session.userId = user.id;
    res.json({ message: "Logged in successfully" });
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth middleware
  app.use("/api/admin/*", async (req, res, next) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.username !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  });
}
