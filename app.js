const micBtn = document.querySelector('.mic-btn');
const statusText = document.querySelector('.status');

micBtn.addEventListener('click', async () => {
    try {
        // درخواست اجازه دسترسی به میکروفون
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // تغییر ظاهر به حالت در حال ضبط
        statusText.innerHTML = "در حال شنیدن... 🔴";
        statusText.style.color = "#ef4444"; 
        statusText.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        statusText.style.borderColor = "rgba(239, 68, 68, 0.2)";

        // (در مراحل بعدی، کدهای ارسال صدا به گوگل استودیو اینجا قرار می‌گیره)
        
        // برای تست اولیه: میکروفون بعد از ۳ ثانیه خودکار قطع می‌شه
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            statusText.innerHTML = "صدا دریافت شد (آماده ارسال) ✓";
            statusText.style.color = "#3b82f6";
            statusText.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            statusText.style.borderColor = "rgba(59, 130, 246, 0.2)";
        }, 3000);

    } catch (err) {
        alert("برای استفاده از این بخش باید دسترسی میکروفون رو به مرورگر بدی!");
    }
});