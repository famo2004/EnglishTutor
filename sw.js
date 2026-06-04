self.addEventListener('install', (e) => {
  console.log('Service Worker نصب شد.');
});
self.addEventListener('fetch', (e) => {
  // کدهای مربوط به کش کردن آفلاین در اینجا قرار می‌گیرد
});