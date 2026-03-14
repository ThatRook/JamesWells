document.addEventListener('DOMContentLoaded', () => {

    // --- 1. POMOCNÉ FUNKCE PRO MENU ---
    const menuBtn = document.querySelector('#mobile-menu');
    const navList = document.querySelector('#nav-list');
    
    const closeMenu = () => {
        if (menuBtn && navList) {
            menuBtn.classList.remove('active');
            navList.classList.remove('active');
        }
    };

    if (menuBtn && navList) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            menuBtn.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }

    // --- 2. AUDIO PŘEHRÁVAČ ---
    const audioCards = document.querySelectorAll('.js-audio-card');
    audioCards.forEach(card => {
        const audio = card.querySelector('.js-audio-element');
        const playBtn = card.querySelector('.js-play-trigger');
        const statusIcon = card.querySelector('.play-status-icon');
        const progressFill = card.querySelector('.js-progress-fill');
        const progressContainer = card.querySelector('.js-progress-container');

        if (!audio || !playBtn) return;
        audio.volume = 0.4;

        playBtn.addEventListener('click', () => {
            audioCards.forEach(otherCard => {
                const otherAudio = otherCard.querySelector('.js-audio-element');
                if (otherAudio && otherAudio !== audio) {
                    otherAudio.pause();
                    otherCard.classList.remove('is-playing');
                    const otherIcon = otherCard.querySelector('.play-status-icon');
                    if (otherIcon) otherIcon.textContent = '▶';
                }
            });

            if (audio.paused) {
                audio.play();
                card.classList.add('is-playing');
                statusIcon.textContent = 'II';
            } else {
                audio.pause();
                card.classList.remove('is-playing');
                statusIcon.textContent = '▶';
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration && progressFill) {
                const percentage = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = percentage + "%";
            }
        });

        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
            });
        }
    });

    // --- 3. UNIVERZÁLNÍ SCROLL LOGIKA (Build 04/04 Fix) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#" || targetId === "") return;

            e.preventDefault();
            closeMenu(); // Zavře menu na mobilu

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Malý timeout, aby se stihlo zavřít menu před výpočtem pozice
                setTimeout(() => {
                    const headerOffset = 80; // Rezerva pro fixní menu
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 50);
            }
        });
    });

    // --- 4. GEAR FILTR + SLIDER ---
    const allGearCards = document.querySelectorAll('.gear-card');
    const gearTabBtns = document.querySelectorAll('.gear-tab-btn');
    const gearDotsContainer = document.getElementById('gear-dots');
    let filteredCards = [];
    let currentCardIndex = 0;

    function renderCard() {
        if (filteredCards.length === 0) return;
        allGearCards.forEach(card => card.classList.remove('active'));
        if (currentCardIndex >= filteredCards.length) currentCardIndex = 0;
        if (currentCardIndex < 0) currentCardIndex = filteredCards.length - 1;
        filteredCards[currentCardIndex].classList.add('active');
        updateDots();
    }

    function updateDots() {
        if (!gearDotsContainer) return;
        gearDotsContainer.innerHTML = '';
        if (filteredCards.length > 1) {
            filteredCards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = (index === currentCardIndex) ? 'dot active' : 'dot';
                dot.onclick = () => { currentCardIndex = index; renderCard(); };
                gearDotsContainer.appendChild(dot);
            });
        }
    }

    function updateGearFilter(category) {
        filteredCards = Array.from(allGearCards).filter(card => card.dataset.cat === category);
        currentCardIndex = 0;
        renderCard();
    }

    gearTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            gearTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateGearFilter(btn.getAttribute('data-category'));
        });
    });

    // Inicializace gearu
    updateGearFilter('monitoring');

    // --- 5. OSTATNÍ FUNKCE (Email, FAQ, Observer) ---
    const emailCard = document.getElementById('copy-email');
    if (emailCard) {
        emailCard.addEventListener('click', () => {
            const email = document.getElementById('email-text').innerText;
            const btnText = document.getElementById('copy-btn-text');
            navigator.clipboard.writeText(email).then(() => {
                const originalText = btnText.innerText;
                btnText.innerText = btnText.getAttribute('data-success') || 'ZKOPIROVÁNO!';
                btnText.style.color = '#ff5500';
                setTimeout(() => { btnText.innerText = originalText; btnText.style.color = ''; }, 2000);
            });
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('appear');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card, .section-title, .audio-card, .gear-tabs, .contact-wrapper').forEach(el => observer.observe(el));

    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
});
