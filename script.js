// Default Data in Case of Fetch Failure
const defaultData = `
//profile-title: base64:8J+XvUnhka3hkK808JOEgvCThoM=
//profile-update-interval: 24
//subscription-userinfo: upload=5368709120; download=545097156608; total=955630223360; expire=1762677732
warp://@auto4/?ifp=1-3&ifpm=m4#Local&&detour=warp://@auto4/?ifp=1-3&ifpm=m6#WoW
warp://@auto4/?ifp=1-2&ifpm=m5#Local&&detour=warp://@auto6/?ifp=2-4&ifpm=m3#WoW
`;

// Countdown Timer for Subscription Expiry
function startCountdown(expireTimestamp) {
    const expireDate = new Date(expireTimestamp * 1000);
    const countdownElement = document.getElementById('countdown');

    function updateCountdown() {
        const now = new Date();
        const timeLeft = expireDate - now;
        if (timeLeft <= 0) {
            countdownElement.textContent = 'اشتراک منقضی شده است';
            return;
        }
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        countdownElement.textContent = `${days} روز، ${hours} ساعت، ${minutes} دقیقه`;
    }
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'لینک کپی شد!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }).catch(err => {
        console.error('خطا در کپی کردن: ', err);
    });
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Parse WARP Data
function parseWarpData(data) {
    const lines = data.split('\n');
    let profileTitle = 'WARP پروفایل';
    let updateInterval = '24';
    let upload = '5.36 GB';
    let download = '545.09 GB';
    let total = '955.63 GB';
    let expire = 1762677732;
    const warpLinks = [];

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('//profile-title:')) {
            profileTitle = atob(line.split('base64:')[1]);
        } else if (line.startsWith('//profile-update-interval:')) {
            updateInterval = line.split(':')[1].trim();
        } else if (line.startsWith('//subscription-userinfo:')) {
            const info = line.split(':')[1].trim().split(';');
            upload = (parseInt(info[0].split('=')[1]) / 1e9).toFixed(2) + ' GB';
            download = (parseInt(info[1].split('=')[1]) / 1e9).toFixed(2) + ' GB';
            total = (parseInt(info[2].split('=')[1]) / 1e9).toFixed(2) + ' GB';
            expire = parseInt(info[3].split('=')[1]);
        } else if (line.startsWith('warp://')) {
            warpLinks.push(line);
        }
    });

    // Update DOM
    document.getElementById('site-title').textContent = profileTitle;
    document.getElementById('profile-title').textContent = profileTitle;
    document.getElementById('update-interval').textContent = `هر ${updateInterval} ساعت`;
    document.getElementById('upload').textContent = upload;
    document.getElementById('download').textContent = download;
    document.getElementById('total').textContent = total;

    // Update Warp Links
    const warpList = document.getElementById('warp-list');
    warpList.innerHTML = '';
    if (warpLinks.length === 0) {
        warpList.innerHTML = '<li>لینکی یافت نشد</li>';
    } else {
        warpLinks.forEach(link => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${link}</span><button class="copy-btn" onclick="copyToClipboard('${link}')">کپی</button>`;
            warpList.appendChild(li);
        });
    }

    // Start Countdown
    startCountdown(expire);
}

// Fetch Data from GitHub
async function fetchWarpData() {
    try {
        const targetUrl = 'https://raw.githubusercontent.com/darknessm427/Sub/refs/heads/main/Warp/IPv4';
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        parseWarpData(text);
    } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
        parseWarpData(defaultData); // Fallback to default data
    }
}

// Load Theme and Data
window.onload = () => {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }
    fetchWarpData();
};