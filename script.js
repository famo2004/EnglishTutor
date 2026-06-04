// --- مدیریت تب‌ها ---
function openTab(evt, tabName) {
let i, tabcontent, tablinks;

// مخفی کردن تمام تب‌ها
tabcontent = document.getElementsByClassName("tabcontent");
for (i = 0; i < tabcontent.length; i++) {
tabcontent[i].style.display = "none";
}

// حذف کلاس active از تمام دکمه‌های تب
tablinks = document.getElementsByClassName("tablink");
for (i = 0; i < tablinks.length; i++) {
tablinks[i].className = tablinks[i].className.replace(" active", "");
}

// نمایش تب انتخاب شده و اضافه کردن کلاس active به دکمه آن
document.getElementById(tabName).style.display = "block";
evt.currentTarget.className += " active";
}

// --- مدیریت پاپ‌آپ‌ها و خطاها ---
window.onload = function() {
// نمایش پاپ‌آپ راهنمای نصب به محض لود شدن صفحه (بعد از 1 ثانیه)
setTimeout(() => {
document.getElementById('installModal').style.display = 'block';
}, 1000);
};

function closeModal(modalId) {
document.getElementById(modalId).style.display = 'none';
}

function hideError() {
document.getElementById('serverErrorBanner').style.display = 'none';
}

// تابعی برای نمایش خطای سرور (وقتی API قطع است یا فیلترشکن خاموش است)
function showServerError() {
document.getElementById('serverErrorBanner').style.display = 'block';
}

// --- مدیریت ضبط صدا (میکروفون تا ۱۰ دقیقه) ---
let timerInterval;
let seconds = 0;
let isRecording = false;
const maxDuration = 600; // 600 ثانیه = 10 دقیقه

document.getElementById('recordBtn').addEventListener('click', function() {
if (!isRecording) {
startRecording();
} else {
stopRecording();
}
});

function startRecording() {
isRecording = true;
seconds = 0;

const recordBtn = document.getElementById('recordBtn');
recordBtn.innerText = '⏹️ توقف ضبط';
recordBtn.style.backgroundColor = '#d32f2f'; // رنگ قرمز برای توقف

document.getElementById('responseArea').innerText = "در حال گوش دادن...";

timerInterval = setInterval(() => {
seconds++;

// فرمت کردن زمان به صورت MM:SS
let m = Math.floor(seconds / 60).toString().padStart(2, '0');
let s = (seconds % 60).toString().padStart(2, '0');
document.getElementById('timerDisplay').innerText = ${m}:${s};

// توقف خودکار بعد از ۱۰ دقیقه
if (seconds >= maxDuration) {
stopRecording();
}
}, 1000);
}

function stopRecording() {
isRecording = false;
clearInterval(timerInterval);

const recordBtn = document.getElementById('recordBtn');
recordBtn.innerText = '🔴 شروع ضبط';
recordBtn.style.backgroundColor = 'var(--accent-color)';

document.getElementById('responseArea').innerText = "در حال پردازش و ارتباط با هوش مصنوعی...";

// شبیه‌سازی ارسال به سرور (برای تست خطای سرور که خواسته بودید)
setTimeout(() => {
// اگر ارتباط با سرور برقرار نشود، این تابع فراخوانی می‌شود
showServerError();
document.getElementById('responseArea').innerText = "خطا در دریافت پاسخ. لطفاً وضعیت اینترنت و فیلترشکن را بررسی کنید.";
}, 2000);
}

// --- قابلیت کلیک روی کلمات داستان و موزیک ---
function makeWordsClickable(elementId) {
const el = document.getElementById(elementId);
if (!el) return;

const text = el.innerText;
// جدا کردن کلمات بر اساس فاصله
const words = text.split(/\s+/);
el.innerHTML = '';

words.forEach(word => {
if (word.trim() === '') return;

let span = document.createElement('span');
span.innerText = word + ' ';
// حذف علائم نگارشی برای جستجوی دقیق‌تر کلمه
let cleanWord = word.replace(/[.,!?;:()"]/g, '').trim();

span.onclick = () => showWordPopup(cleanWord);
el.appendChild(span);
});
}

document.addEventListener('DOMContentLoaded', () => {
// اعمال قابلیت کلیک روی متن داستان و موزیک بعد از لود شدن صفحه
makeWordsClickable('storyText');
makeWordsClickable('musicLyrics');
});

// --- پاپ‌آپ دیکشنری برای کلمات ---
function showWordPopup(word) {
if (!word) return;

document.getElementById('popupWord').innerText = word;

// در نسخه واقعی، اینجا به API دیکشنری وصل می‌شود
// فعلاً مقادیر تستی قرار می‌دهیم
document.getElementById('popupPhonetic').innerText = /${word}/`;
document.getElementById('popupMeaning').innerText = "در حال جستجوی معنی...";

document.getElementById('wordPopup').style.display = 'block';

// شبیه‌سازی دریافت معنی
setTimeout(() => {
document.getElementById('popupMeaning').innerText = "(معنی فرضی برای: " + word + ")";
}, 500);
}

function closeWordPopup() {
document.getElementById('wordPopup').style.display = 'none';
}

// --- دیکشنری اصلی تب اول ---
document.getElementById('dictSearchBtn').addEventListener('click', () => {
const word = document.getElementById('dictInput').value;
const mode = document.getElementById('dictMode').value;
const output = document.getElementById('dictOutput');

if (word.trim() === "") {
output.innerText = "لطفاً یک کلمه وارد کنید.";
return;
}

output.innerText = در حال ترجمه "${word}" در حالت ${mode}...`;
// محل قرارگیری API دیکشنری
});