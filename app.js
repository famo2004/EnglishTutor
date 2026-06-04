// مدیریت تب‌ها
function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ۱. سیستم ضبط و تحلیل صدا (Web Speech API)
let isRecording = false;
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'fa-IR'; // پیش‌فرض فارسی

function toggleRecording() {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
    } else {
        recognition.stop();
        isRecording = false;
    }
}

recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    // ارسال به API برای تحلیل (در فایل api.js)
    analyzeVoiceInput(text);
};

// ۲. دیکشنری
function lookupWord() {
    const word = document.getElementById('wordInput').value;
    alert("در حال جستجوی دیکشنری برای: " + word);
}

// ۳. مکالمه روزانه
function sendChatMessage() {
    const msg = document.getElementById('chatInput').value;
    // ارسال پیام به هوش مصنوعی و دریافت پاسخ با لهجه امریکن
    alert("ارسال به هوش مصنوعی: " + msg);
}

// ۴. آزمون روزانه
function startExam() {
    alert("شروع آزمون ۲۰ سوالی...");
}