exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const API_KEY = process.env.GEMINI_API_KEY; // رمزی که تو نتلیفای وارد کردی

    try {
        const { userInput } = JSON.parse(event.body);

        // پرامپت و شخصیت معلم تو
        const systemPrompt = `You are a strict English tutor. Explain in Persian. 
        Analyze the user's sentence. Correct grammar. 
        Use vocabulary from daily routines, jobs, or weather, and blend them with examples from civil engineering, architecture, or Excel.
        You MUST output a JSON block at the end like this:
        {
          "flashcards": [
            {"front": "Corrected Sentence or New Word", "back": "Persian translation + Pronunciation"}
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