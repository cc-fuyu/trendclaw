// ─── TrendClaw — Multi-LLM Backend ───
//
// Unified interface supporting:
// 1. OpenAI API (GPT-4.1-mini, etc.)
// 2. Ollama (local models, zero cost)
// 3. OpenClaw native (llm-task via Gateway)
//
// This abstraction means the plugin works everywhere:
// - Cloud users → OpenAI
// - Privacy-first / offline → Ollama
// - Inside OpenClaw → native llm-task

import OpenAI from "openai";
import type { LLMConfig, LLMBackend } from "../types.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  backend: LLMBackend;
  tokensUsed?: number;
}

/**
 * Create an LLM client based on the configured backend.
 */
function createClient(config: LLMConfig): OpenAI {
  switch (config.backend) {
    case "ollama":
      return new OpenAI({
        baseURL: config.baseUrl || "http://localhost:11434/v1",
        apiKey: "ollama", // Ollama doesn't need a real key
      });

    case "openclaw":
      // OpenClaw's Gateway exposes an OpenAI-compatible endpoint
      // When running inside OpenClaw, the env vars are auto-set
      return new OpenAI({
        baseURL: config.baseUrl || process.env.OPENCLAW_GATEWAY_URL || "http://localhost:3579/v1",
        apiKey: config.apiKey || process.env.OPENCLAW_API_KEY || "openclaw",
      });

    case "openai":
    default:
      return new OpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        baseURL: config.baseUrl, // undefined = default OpenAI
      });
  }
}

/**
 * Send a chat completion request to the configured LLM backend.
 */
export async function chatCompletion(
  config: LLMConfig,
  messages: ChatMessage[],
  options: {
    jsonMode?: boolean;
    maxTokens?: number;
  } = {},
): Promise<LLMResponse> {
  const client = createClient(config);

  const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
    model: config.model,
    temperature: config.temperature ?? 0.5,
    messages,
  };

  if (options.jsonMode) {
    params.response_format = { type: "json_object" };
  }
  if (options.maxTokens) {
    params.max_tokens = options.maxTokens;
  }

  const response = await client.chat.completions.create(params);

  return {
    content: response.choices[0]?.message?.content || "",
    model: response.model || config.model,
    backend: config.backend,
    tokensUsed: response.usage?.total_tokens,
  };
}

/**
 * Get a human-readable label for the LLM backend.
 */
export function backendLabel(config: LLMConfig): string {
  switch (config.backend) {
    case "ollama": return `Ollama (${config.model})`;
    case "openclaw": return `OpenClaw Gateway (${config.model})`;
    case "openai": return `OpenAI (${config.model})`;
    default: return config.model;
  }
}
