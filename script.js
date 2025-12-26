const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const themeToggle = document.getElementById('theme-toggle');
const garlandBtn = document.getElementById('garland-btn');
const giftBtn = document.getElementById('gift-btn');

let width, height;
let snowflakes = [];
let gifts = [];
let sparks = [];
let garlandActive = true;

// 1. Инициализация и ресайз
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 2. Таймер до 1 января 2026 года
function updateTimer() {
    const now = new Date().getTime();
    const target = new Date('January 1, 2026 00:00:00').getTime();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById('timer').innerText = "С НОВЫМ ГОДОМ!";
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('timer').innerText = 
        `${d}д ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);
updateTimer();

// 3. Логика гирлянды
const garlandColors = ['#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d', '#ff4dff'];
function createGarland() {
    const container = document.getElementById('garland-container');
    container.innerHTML = '';
    const count = Math.floor(window.innerWidth / 35);
    for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'light-bulb';
        container.appendChild(bulb);
    }
}

function flashGarland() {
    const bulbs = document.querySelectorAll('.light-bulb');
    bulbs.forEach((bulb, i) => {
        if (garlandActive) {
            const color = garlandColors[(i + Math.floor(Date.now()/500)) % garlandColors.length];
            bulb.style.background = color;
            bulb.style.boxShadow = `0 0 15px ${color}`;
        } else {
            bulb.style.background = '#444';
            bulb.style.boxShadow = 'none';
        }
    });
}
createGarland();
setInterval(flashGarland, 500);

// 4. Снег и подарки
class Snowflake {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speed = Math.random() * 1 + 0.5;
        this.r = Math.random() * 3 + 1;
    }
    update() {
        this.y += this.speed;
        if (this.y > height) this.y = -10;
    }
    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 150; i++) snowflakes.push(new Snowflake());

function spawnGifts() {
    const icons = ['🎁', '🍭', '🧸', '🎄', '⭐', '❄️'];
    for (let i = 0; i < 15; i++) {
        gifts.push({
            x: Math.random() * width,
            y: -50,
            icon: icons[Math.floor(Math.random() * icons.length)],
            speed: Math.random() * 3 + 2,
            size: Math.random() * 20 + 20
        });
    }
}

// 5. Фейерверки
function createRockets() {
    const ground = document.getElementById('ground');
    for (let i = 0; i < 5; i++) {
        const rocket = document.createElement('div');
        rocket.className = 'rocket';
        rocket.style.left = (15 + i * 18) + '%';
        rocket.onclick = function() {
            if (this.dataset.launching) return;
            this.dataset.launching = true;
            const rect = this.getBoundingClientRect();
            
            this.style.transition = 'bottom 1s ease-in';
            this.style.bottom = '100vh';
            
            setTimeout(() => {
                explode(rect.left + 6, height * 0.2);
                this.style.display = 'none';
                setTimeout(() => {
                    this.style.display = 'block';
                    this.style.bottom = '85px';
                    delete this.dataset.launching;
                }, 2000);
            }, 1000);
        };
        ground.appendChild(rocket);
    }
}
createRockets();

function explode(x, y) {
    for (let i = 0; i < 60; i++) {
        sparks.push({
            x, y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1,
            color: garlandColors[Math.floor(Math.random() * garlandColors.length)]
        });
    }
}

// 6. Основной цикл анимации
function animate() {
    ctx.clearRect(0, 0, width, height);

    snowflakes.forEach(s => { s.update(); s.draw(); });

    gifts.forEach((g, i) => {
        g.y += g.speed;
        ctx.font = `${g.size}px Arial`;
        ctx.fillText(g.icon, g.x, g.y);
        if (g.y > height) gifts.splice(i, 1);
    });

    sparks.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.015;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) sparks.splice(i, 1);
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}
animate();

// 7. Обработчики событий
themeToggle.onchange = (e) => {
    document.body.dataset.theme = e.target.checked ? 'light' : 'dark';
};

garlandBtn.onclick = () => {
    garlandActive = !garlandActive;
    garlandBtn.innerText = `💡 Гирлянда: ${garlandActive ? 'Вкл' : 'Выкл'}`;
    garlandBtn.classList.toggle('off', !garlandActive);
};

giftBtn.onclick = spawnGifts;
window.addEventListener('resize', createGarland);
