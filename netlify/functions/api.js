exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const { userInput, userPath, file } = JSON.parse(event.body);

        const systemPrompt = `You are a highly advanced English Tutor app.
All explanations MUST be in Persian. 
The user is learning in this specific path: "${userPath}".
If the user uploads a file, extract its content to teach them relevant grammar, vocabulary, or answer their questions.

CRITICAL: You MUST output a JSON block at the very end of your response. Use this exact schema:
{
  "teaching_sentence": [
    {"word": "Hello", "ipa": "/həˈloʊ/"}
  ],
  "flashcards": [
    {
      "category": "word",
      "front": "English word",
      "back": "Persian translation",
      "image_keyword": "A_single_english_keyword_for_image_search"
    }
  ]
}`;

        // آماده سازی پیام کاربر و فایل (در صورت وجود)
        let parts = [{ text: userInput }];
        if (file) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data
                }
            });
        }

        const requestBody = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: parts }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server Error" }) };
    }
};