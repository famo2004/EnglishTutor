exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const { userInput, userPath, file, mistakes } = JSON.parse(event.body);
        
        // تبدیل لیست اشتباهات کاربر به یک رشته متنی برای درک هوش مصنوعی
        const mistakesLog = (mistakes && mistakes.length > 0) 
            ? `The user has previously made these mistakes: ${JSON.stringify(mistakes)}. You MUST include at least one practice challenge or quiz in your response testing them on these exact mistakes to reinforce their learning.` 
            : ``;

        const systemPrompt = `You are a highly advanced English Tutor app.
All your explanations MUST be in Persian (Farsi).
The user is learning in this specific path: "${userPath}".
${mistakesLog}
If the user uploads a file, extract its content to teach them relevant grammar or vocabulary.

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

        let parts = [{ text: userInput }];
        if (file) {
            parts.push({
                inlineData: { mimeType: file.mimeType, data: file.data }
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