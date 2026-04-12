import axios from "axios"; 

export const runCode = async (req, res) => {
  const { code, input } = req.body;

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      script: code,
      stdin: input || "", 
      language: "python3",
      versionIndex: "3",
      compileOnly: false,
    });
    console.log(response);
    return res.json({ output: response.data });
  } catch (error) {
    console.error("Error executing code:", error.message);
    return res.status(500).json({
      error: error.response?.data || "An error occurred while executing the code.",
    });
  }
};

export default {runCode};