import { 
  Character, InsertCharacter,
  Message, InsertMessage,
  User, InsertUser,
  characters, messages, users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Character operations
  getCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Message operations
  getMessages(characterId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(characterId: number): Promise<void>; // New method

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));
    return character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [updated] = await db
      .update(characters)
      .set({ ...character, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    return updated;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(characters)
      .where(eq(characters.id, id))
      .returning();
    return !!deleted;
  }

  async getMessages(characterId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.characterId, characterId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }
  async clearMessages(characterId: number): Promise<void> {
    await db
      .delete(messages)
      .where(eq(messages.characterId, characterId));
  }
}

export const storage = new DatabaseStorage();
