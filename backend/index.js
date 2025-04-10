require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    try {
       
        const model =  genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.send(text);

    } catch (e) {
        console.log(e);
        res.status(500).send("failed");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
