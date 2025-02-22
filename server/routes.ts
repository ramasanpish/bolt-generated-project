import { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertCharacterSchema } from "@shared/schema";
import { generateResponse } from "./openrouter";

// Middleware to check if user is authenticated
const requireAuth = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express) {
  // Public routes
  app.get("/api/characters", async (_req, res) => {
    const characters = await storage.getCharacters();
    res.json(characters);
  });

  app.get("/api/characters/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const character = await storage.getCharacter(id);

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.json(character);
  });

  app.get("/api/characters/:id/messages", async (req, res) => {
    const characterId = parseInt(req.params.id);
    const messages = await storage.getMessages(characterId);
    res.json(messages);
  });

  app.post("/api/characters/:id/messages", async (req, res) => {
    const characterId = parseInt(req.params.id);
    const result = insertMessageSchema.safeParse({
      ...req.body,
      characterId
    });

    if (!result.success) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const userMessage = await storage.createMessage(result.data);

    try {
      const character = await storage.getCharacter(characterId);
      if (!character) {
        throw new Error("Character not found");
      }

      const aiResponseContent = await generateResponse(
        character.name,
        character.personality,
        result.data.content
      );

      const aiResponse = await storage.createMessage({
        characterId,
        content: aiResponseContent,
        isUser: false,
      });

      res.json([userMessage, aiResponse]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.json([userMessage]);
    }
  });

  // Protected admin routes
  app.post("/api/characters", requireAuth, async (req, res) => {
    const result = insertCharacterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: "Invalid character data" });
    }

    const character = await storage.createCharacter(result.data);
    res.status(201).json(character);
  });

  app.patch("/api/characters/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertCharacterSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: "Invalid character data" });
    }

    const character = await storage.updateCharacter(id, result.data);

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.json(character);
  });

  app.delete("/api/characters/:id/messages", async (req, res) => {
    const characterId = parseInt(req.params.id);

    try {
      await storage.clearMessages(characterId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  app.delete("/api/characters/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCharacter(id);

    if (!success) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.sendStatus(204);
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.session.userId) {
      return res.sendStatus(401);
    }
    res.json({ id: req.session.userId });
  });

  return createServer(app);
}
