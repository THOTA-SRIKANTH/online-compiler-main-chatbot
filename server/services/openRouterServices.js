import axios from "axios";

const SYSTEM_PROMPT = `You are a senior AI coding assistant in a live collaborative coding meeting.

Responsibilities:
- Generate clean, production-ready code
- Detect and fix bugs
- Optimize performance
- Add comments where necessary
- Explain concepts briefly when asked

Rules:
- Always return code inside markdown fenced blocks with the language name
- Be concise and precise
- Prefer modern best practices
`;

export const streamFromOpenRouter = async ({ message, history = [], res }) => {
  try {
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: "OPENROUTER_API_KEY is not set in server .env" })}\n\n`);
      res.end();
      return;
    }

    console.log("[OpenRouter] Sending request, model: deepseek/deepseek-chat");

    const response = await axios({
      method: "post",
      url: "https://openrouter.ai/api/v1/chat/completions",
      responseType: "stream",
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "Meeting AI Assistant",
      },
      data: {
        model: "deepseek/deepseek-chat",   // valid OpenRouter model
        messages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      },
      // Treat ALL HTTP statuses as valid so axios doesn't throw on 4xx/5xx
      validateStatus: () => true,
    });

    // If OpenRouter returned an error status, read it as text and surface it
    if (response.status !== 200) {
      let errBody = "";
      response.data.on("data", (c) => { errBody += c.toString(); });
      response.data.on("end", () => {
        console.error("[OpenRouter] Non-200 response:", response.status, errBody);
        res.write(`data: ${JSON.stringify({ error: `OpenRouter error ${response.status}: ${errBody.slice(0, 200)}` })}\n\n`);
        res.end();
      });
      return;
    }

    let fullContent = "";
    let buffer = "";

    response.data.on("data", (chunk) => {
      try {
        buffer += chunk.toString();

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            if (!res.writableEnded) res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // Surface API-level errors (e.g. invalid model)
            if (parsed.error) {
              console.error("[OpenRouter] API error in stream:", parsed.error);
              res.write(`data: ${JSON.stringify({ error: parsed.error.message || "OpenRouter API error" })}\n\n`);
              if (!res.writableEnded) res.end();
              return;
            }

            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              fullContent += delta.content;
              res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
            }
          } catch (_) {
            // Ignore malformed SSE lines
          }
        }
      } catch (chunkErr) {
        console.error("[OpenRouter] Chunk processing error:", chunkErr);
      }
    });

    response.data.on("end", () => {
      if (!res.writableEnded) res.end();
    });

    response.data.on("error", (err) => {
      console.error("[OpenRouter] Stream error:", err.message);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: "Stream connection error" })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    console.error("[OpenRouter] Request failed:", error.message);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: `Request failed: ${error.message}` })}\n\n`);
      res.end();
    }
  }
};