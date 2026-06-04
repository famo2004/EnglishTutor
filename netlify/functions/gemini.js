// فایل: netlify/functions/gemini.js

export async function handler(event, context) {
    // فقط اجازه درخواست‌های POST را می‌دهیم
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // گرفتن پیامی که کاربر از سایت فرستاده
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        // خواندن کلید مخفی از تنظیمات نتلیفای
        const apiKey = process.env.GEMINI_API_KEY;

        // ارسال درخواست به گوگل جمینای
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();
        
        // استخراج جواب هوش مصنوعی و ارسال آن به سایت استاتیک تو
        const aiResponse = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiResponse })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "خطا در ارتباط با هوش مصنوعی" })
        };
    }
}
