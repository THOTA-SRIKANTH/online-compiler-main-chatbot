import  {streamFromOpenRouter}  from "../services/openRouterServices.js";

export const chatStream = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // SSE HEADERS
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await streamFromOpenRouter({
      message,
      history,
      res,
    });
  } catch (err) {
    console.error(err);

    res.write(`data: ${JSON.stringify({ error: "Server error" })}\n\n`);
    res.end();
  }
};

