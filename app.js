const micBtn = document.querySelector('.mic-btn');
const statusText = document.querySelector('.status');
const cardContainer = document.querySelector('.card-container');

// روشن کردن سیستم تشخیص صدای مرورگر
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // تنظیم روی لهجه امریکن

micBtn.addEventListener('click', () => {
    recognition.start();
    statusText.innerHTML = "در حال شنیدن... صحبت کن 🔴";
    statusText.style.color = "#ef4444";
});

recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    statusText.innerHTML = `شنیدم: "${spokenText}" - در حال تحلیل... ⏳`;
    statusText.style.color = "#eab308";

    try {
        // ارسال متن به سرور امن نتلیفای
        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            body: JSON.stringify({ userInput: spokenText })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        // پیدا کردن فلش‌کارت از توی جواب هوش مصنوعی
        const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
            let jsonString = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '');
            const parsedData = JSON.parse(jsonString);
            
            if (parsedData.flashcards && parsedData.flashcards.length > 0) {
                const card = parsedData.flashcards[0];
                cardContainer.innerHTML = `
                    <span class="english-word">${card.front}</span>
                    <div class="persian-meaning">${card.back}</div>
                `;
            }
            statusText.innerHTML = "تحلیل تمام شد! ✅";
            statusText.style.color = "#10b981";
        }
    } catch (error) {
        statusText.innerHTML = "خطا در ارتباط با سرور ❌";
    }
};