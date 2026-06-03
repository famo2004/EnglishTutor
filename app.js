// تب‌ها (جابجایی بین صفحات)
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    element.classList.add('active');
}

// تلفظ کلمات با کلیک (TTS)
function speakText(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
}

// متغیر برای ذخیره فایل آپلود شده
let uploadedFile = null;
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        uploadedFile = { mimeType: file.type, data: reader.result.split(',')[1] };
        alert('فایل با موفقیت بارگذاری شد! حالا یک جمله به هوش مصنوعی بگو تا از روی فایلت بهت درس بده.');
    };
});

// لود کردن فلش کارت ها
let savedCards = JSON.parse(localStorage.getItem('myFlashcards')) || [];
function renderCards() {
    const grid = document.getElementById('flashcardsGrid');
    grid.innerHTML = '';
    savedCards.forEach(card => {
        const img = card.image_keyword ? `https://image.pollinations.ai/prompt/${card.image_keyword}?width=300&height=300` : 'https://image.pollinations.ai/prompt/learning?width=300';
        grid.innerHTML += `
            <div class="card">
                <img src="${img}" alt="Flashcard Image">
                <h3 style="margin:5px 0; font-family: Tahoma;">${card.front}</h3>
                <p style="font-size:13px; color:#afafaf;">${card.back}</p>
            </div>`;
    });
}
renderCards();

// میکروفون و ارتباط با سرور
const micBtn = document.getElementById('micBtn');
const statusText = document.getElementById('statusText');
const teachingBox = document.getElementById('teachingBox');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

micBtn.addEventListener('click', () => {
    recognition.start();
    statusText.innerText = "در حال شنیدن... صحبت کن 🔴";
});

recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    statusText.innerText = "در حال تحلیل... ⏳";

    try {
        const payload = {
            userInput: spokenText,
            userPath: document.getElementById('pathSelect').value,
            file: uploadedFile // ارسال فایل به سرور
        };

        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        // استخراج کدهای JSON
        const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            let parsedData = JSON.parse(jsonMatch[0].replace(/```json/g, '').replace(/```/g, ''));
            
            // نمایش کلمات با فونتیک (سبک دولینگو)
            if (parsedData.teaching_sentence) {
                teachingBox.innerHTML = '<p style="font-size:14px; color:#58cc02; margin-bottom:15px;">برای شنیدن تلفظ روی کلمات کلیک کن:</p>';
                parsedData.teaching_sentence.forEach(item => {
                    teachingBox.innerHTML += `
                    <div class="word-box" onclick="speakText('${item.word}')">
                        <span class="en-word">${item.word}</span>
                        <span class="ipa">${item.ipa}</span>
                    </div>`;
                });
            }

            // ذخیره فلش کارت ها
            if (parsedData.flashcards) {
                parsedData.flashcards.forEach(card => savedCards.unshift(card));
                localStorage.setItem('myFlashcards', JSON.stringify(savedCards));
                renderCards();
            }
            statusText.innerText = "تحلیل تمام شد! ✅";
        }
    } catch (error) {
        statusText.innerText = "خطا در ارتباط با سرور ❌";
    }
};