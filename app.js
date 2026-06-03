const micBtn = document.querySelector('.mic-btn');
const statusText = document.querySelector('.status');
const cardsContainer = document.getElementById('flashcardsContainer');

// دریافت فلش‌کارت‌های قبلی از حافظه گوشی
let savedCards = JSON.parse(localStorage.getItem('myFlashcards')) || [];

// تابع نمایش کارت‌ها در صفحه
function renderCards() {
    cardsContainer.innerHTML = '';
    savedCards.forEach(card => {
        // استفاده از هوش مصنوعی ساخت عکس سریع (Pollinations)
        const imageUrl = card.image_keyword ? `https://image.pollinations.ai/prompt/${card.image_keyword}` : 'https://image.pollinations.ai/prompt/abstract_learning_background';
        
        cardsContainer.innerHTML += `
            <div class="card">
                <span class="badge ${card.category}">${card.category}</span>
                <img src="${imageUrl}" alt="AI Generated Image">
                <h3 style="margin:5px 0;">${card.front}</h3>
                <p style="color:#cbd5e1; font-size:14px;">${card.back}</p>
            </div>
        `;
    });
}
renderCards();

// منطق اضافه کردن دستی کارت
document.getElementById('saveManualBtn').addEventListener('click', () => {
    const front = document.getElementById('manualFront').value;
    const back = document.getElementById('manualBack').value;
    const category = document.getElementById('manualCategory').value;
    
    if(front && back) {
        // جایگزین کردن فاصله‌ها با خط تیره برای جستجوی عکس
        const image_keyword = front.replace(/\s+/g, '_');
        savedCards.unshift({ category, front, back, image_keyword });
        localStorage.setItem('myFlashcards', JSON.stringify(savedCards));
        renderCards();
        document.getElementById('manualFront').value = '';
        document.getElementById('manualBack').value = '';
    }
});

// منطق میکروفون و دریافت کارت از هوش مصنوعی
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

micBtn.addEventListener('click', () => {
    recognition.start();
    statusText.innerHTML = "در حال شنیدن... 🔴";
    statusText.style.color = "#ef4444";
});

recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    statusText.innerHTML = "در حال تحلیل و ساخت عکس... ⏳";
    statusText.style.color = "#eab308";

    try {
        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            body: JSON.stringify({ userInput: spokenText, userPath: localStorage.getItem('userPath') || "General" })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
            let parsedData = JSON.parse(jsonMatch[0].replace(/```json/g, '').replace(/```/g, ''));
            
            if (parsedData.flashcards && parsedData.flashcards.length > 0) {
                // اضافه کردن کارت‌های جدید هوش مصنوعی به لیست
                parsedData.flashcards.forEach(card => savedCards.unshift(card));
                localStorage.setItem('myFlashcards', JSON.stringify(savedCards));
                renderCards();
            }
            statusText.innerHTML = "کارت‌های جدید اضافه شدند! ✅";
            statusText.style.color = "#10b981";
        }
    } catch (error) {
        statusText.innerHTML = "خطا در ارتباط ❌";
    }
};