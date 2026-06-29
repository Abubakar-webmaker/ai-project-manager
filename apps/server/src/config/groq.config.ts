// src/config/groq.config.ts
import Groq from "groq-sdk";
import { env } from "./env.config";

export const groqClient = new Groq({
  apiKey: env.GROQ_API_KEY,
});