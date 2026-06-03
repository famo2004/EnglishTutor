// تب‌ها
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    element.classList.add('active');
}

// تلفظ صوتی کلمات
function speakText(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
}

// مدیریت آپلود فایل
let uploadedFile = null;
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        uploadedFile = { mimeType: file.type, data: reader.result.split(',')[1] };
        alert('✅ فایل بارگذاری شد! حالا یک سوال از هوش مصنوعی بپرس.');
    };
});

// مدیریت فلش‌کارت‌ها
let savedCards = JSON.parse(localStorage.getItem('myFlashcards')) || [];
function renderCards() {
    const grid = document.getElementById('flashcardsGrid');
    grid.innerHTML = '';
    savedCards.forEach(card => {
        const img = card.image_keyword ? `https://image.pollinations.ai/prompt/${card.image_keyword}?width=300&height=300` : 'https://image.pollinations.ai/prompt/learning?width=300';
        grid.innerHTML += `
            <div class="flashcard">
                <img src="${img}" alt="Flashcard">
                <h3 style="margin:5px 0; font-family: Tahoma; font-size: 16px; color: #cae3ff;">${card.front}</h3>
                <p style="font-size:12px; color:#7aafff;">${card.back}</p>
            </div>`;
    });
}
renderCards();

// ================= مدیریت دفتر اشتباهات =================
let savedMistakes = JSON.parse(localStorage.getItem('myMistakes')) || [];

function saveMistake() {
    const wrong = document.getElementById('wrongSentence').value;
    const correct = document.getElementById('correctSentence').value;
    if(wrong && correct) {
        savedMistakes.unshift({ wrong, correct });
        localStorage.setItem('myMistakes', JSON.stringify(savedMistakes));
        renderMistakes();
        document.getElementById('wrongSentence').value = '';
        document.getElementById('correctSentence').value = '';
    }
}

function renderMistakes() {
    const list = document.getElementById('mistakesList');
    list.innerHTML = '';
    savedMistakes.forEach(item => {
        list.innerHTML += `
            <div>
                <div class="item-card">❌ ${item.wrong}</div>
                <div class="item-card correct">✅ ${item.correct}</div>
            </div>`;
    });
}
renderMistakes();
// =========================================================

// میکروفون و سرور
const micBtn = document.getElementById('micBtn');
const statusText = document.getElementById('statusText');
const teachingBox = document.getElementById('teachingBox');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

micBtn.addEventListener('click', () => {
    recognition.start();
    statusText.innerText = "🔴 در حال شنیدن... صحبت کن";
    statusText.style.color = "#ef4444";
});

recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    statusText.innerText = "⏳ در حال تحلیل حرف‌های شما...";
    statusText.style.color = "#eab308";

    try {
        const payload = {
            userInput: spokenText,
            userPath: document.getElementById('pathSelect').value,
            file: uploadedFile,
            mistakes: savedMistakes // ارسال اشتباهات کاربر به هوش مصنوعی برای تمرین
        };

        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            let parsedData = JSON.parse(jsonMatch[0].replace(/```json/g, '').replace(/```/g, ''));
            
            if (parsedData.teaching_sentence) {
                teachingBox.innerHTML = '<p style="font-size:13px; color:#bbd4ff; margin-bottom:15px;">برای شنیدن تلفظ روی کلمات کلیک کن:</p>';
                parsedData.teaching_sentence.forEach(item => {
                    teachingBox.innerHTML += `
                    <div class="word-box" onclick="speakText('${item.word}')">
                        <span class="en-word">${item.word}</span>
                        <span class="ipa">${item.ipa}</span>
                    </div>`;
                });
            }

            if (parsedData.flashcards) {
                parsedData.flashcards.forEach(card => savedCards.unshift(card));
                localStorage.setItem('myFlashcards', JSON.stringify(savedCards));
                renderCards();
            }
            statusText.innerText = "✅ تحلیل تمام شد!";
            statusText.style.color = "#10b981";
        }
    } catch (error) {
        statusText.innerText = "❌ خطا در ارتباط با سرور";
        statusText.style.color = "#ef4444";
    }
};