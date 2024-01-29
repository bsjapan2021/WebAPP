const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');



const app = express();
const port = 3000;

const API_KEY = "Your API Key"; // 여기에 실제 API 키를 입력하세요
const MODEL_NAME = "gemini-pro-vision";



// 모든 도메인에 대한 CORS 요청을 허용합니다.
app.use(cors());

app.use(bodyParser.json());
app.use(express.static('public')); // 'public' 폴더에 정적 파일을 제공합니다.

app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No image file provided.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    };

    const safetySettings = [
      // 안전 설정 추가
    ];

    const imageBase64 = fs.readFileSync(req.file.path).toString("base64");
    const parts = [
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageBase64
        }
      },
      { text: "\n위 이미지에 맞는 레시피를 알려주세요\n" }
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    fs.unlinkSync(req.file.path); // 업로드된 이미지 삭제
    res.json({ success: true, data: result.response });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in content generation");
  }
});

  
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

