const DEFAULT_BASE_URL = "https://api.mulerouter.ai/vendors/openai/v1";
const DEFAULT_MODEL = "qwen-plus";

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: Message[], options?: { maxTokens?: number }): Promise<string> {
  const apiKey = process.env.LLM_API_KEY || process.env.QWEN_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || process.env.QWEN_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.LLM_MODEL || process.env.QWEN_MODEL || DEFAULT_MODEL;

  if (!apiKey) throw new Error("LLM_API_KEY (or QWEN_API_KEY) is not set");

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const body = {
    model,
    messages,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: 0.4,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    error?: { message?: string };
  };

  if (data.error?.message) throw new Error(data.error.message);
  const content = data.choices?.[0]?.message?.content;
  if (content == null) throw new Error("No content in LLM response");
  return content;
}

/**
 * Call the LLM and parse the response as JSON. Expects the model to return a single JSON object.
 * Strips markdown code blocks if present.
 */
export async function chatJSON<T>(messages: Message[], options?: { maxTokens?: number }): Promise<T> {
  const raw = await chat(messages, options);
  let text = raw.trim();
  const codeBlock = /^```(?:json)?\s*([\s\S]*?)```\s*$/m;
  const match = text.match(codeBlock);
  if (match) text = match[1].trim();
  return JSON.parse(text) as T;
}
