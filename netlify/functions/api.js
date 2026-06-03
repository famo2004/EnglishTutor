exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const { userInput, userPath } = JSON.parse(event.body);

        const systemPrompt = `You are an advanced English Tutor. All explanations MUST be in Persian.
Your core functionalities:
1. The user's learning path is: "${userPath}". Adapt all examples to this path.
2. Correct grammar and provide native alternatives.
3. For any new vocabulary, idiom, grammar rule, or proverb you teach, create a flashcard.

CRITICAL JSON OUTPUT:
You MUST output a JSON block at the end of your response. Use this exact schema:
{
  "flashcards": [
    {
      "category": "word|idiom|grammar|proverb",
      "front": "The English text",
      "back": "Persian translation + English example",
      "image_keyword": "A short English description of the word/idiom (no spaces, use underscores, e.g., red_apple or running_fast)"
    }
  ]
}`;

        const requestBody = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userInput }] }]
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