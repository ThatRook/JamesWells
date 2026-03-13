document.addEventListener('DOMContentLoaded', () => {

    // --- 1. AUDIO PŘEHRÁVAČ ---
    const audioCards = document.querySelectorAll('.js-audio-card');

    audioCards.forEach(card => {
        const audio = card.querySelector('.js-audio-element');
        const playBtn = card.querySelector('.js-play-trigger');
        const statusIcon = card.querySelector('.play-status-icon');
        const progressContainer = card.querySelector('.js-progress-container');
        const progressFill = card.querySelector('.js-progress-fill');

        if (!audio || !playBtn) return;

        audio.volume = 0.4;

        // --- PLAY / PAUSE LOGIKA ---
        playBtn.addEventListener('click', () => {
            audioCards.forEach(otherCard => {
                const otherAudio = otherCard.querySelector('.js-audio-element');
                if (otherAudio && otherAudio !== audio) {
                    otherAudio.pause();
                    // ODPORUČENO: Odebrat třídu i ostatním kartám při přepnutí
                    otherCard.classList.remove('is-playing');
                    const otherIcon = otherCard.querySelector('.play-status-icon');
                    if (otherIcon) otherIcon.textContent = '▶';
                }
            });

            if (audio.paused) {
                audio.play();
                card.classList.add('is-playing'); // TADY SE SPOUŠTÍ ANIMACE
                statusIcon.textContent = 'II';
            } else {
                audio.pause();
                card.classList.remove('is-playing'); // TADY SE ZASTAVUJE
                statusIcon.textContent = '▶';
            }
        });

        // --- AKTUALIZACE PROGRESS BARU ---
        audio.addEventListener('timeupdate', () => {
            if (audio.duration && progressFill) {
                const percentage = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = percentage + "%";
            }
        });

        // --- KLIKNUTÍ DO PROGRESS BARU ---
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
            });
        }

        // --- RESET PO SKONČENÍ SKLADBY ---
        audio.addEventListener('ended', () => {
            card.classList.remove('is-playing'); // VYPNUTÍ ANIMACE NA KONCI
            statusIcon.textContent = '▶';
            progressFill.style.width = "0%";
        });
    });

    // --- 2. UNIVERZÁLNÍ SCROLL LOGIKA ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Ignorujeme prázdné nebo jen mřížkové odkazy
            if (targetId === "#") return;

            e.preventDefault();

            // Pokud klikneš na #top (včetně loga a patičky, pokud tam mají #top)
            if (targetId === '#top') {
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- 3. GEAR FILTR + SLIDER ---
    const allGearCards = document.querySelectorAll('.gear-card');
    const gearTabBtns = document.querySelectorAll('.gear-tab-btn');
    const nextGearBtn = document.getElementById('nextGear');
    const prevGearBtn = document.getElementById('prevGear');

    let filteredCards = [];
    let currentCardIndex = 0;

    function updateGearFilter(category) {
        filteredCards = Array.from(allGearCards).filter(card => card.dataset.cat === category);
        currentCardIndex = 0;
        renderCard();
    }

    function renderCard() {
        allGearCards.forEach(card => card.classList.remove('active'));
        if (filteredCards.length > 0 && filteredCards[currentCardIndex]) {
            filteredCards[currentCardIndex].classList.add('active');
        }
    }

    gearTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gearTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateGearFilter(btn.getAttribute('data-category'));
        });
    });

    if (nextGearBtn) {
        nextGearBtn.addEventListener('click', () => {
            if (filteredCards.length > 0) {
                currentCardIndex = (currentCardIndex + 1) % filteredCards.length;
                renderCard();
            }
        });
    }

    if (prevGearBtn) {
        prevGearBtn.addEventListener('click', () => {
            if (filteredCards.length > 0) {
                currentCardIndex = (currentCardIndex - 1 + filteredCards.length) % filteredCards.length;
                renderCard();
            }
        });
    }

    if (allGearCards.length > 0) updateGearFilter('monitoring');

    // Funkce pro kopírování e-mailu do schránky
    const emailCard = document.getElementById('copy-email');

    if (emailCard) {
        emailCard.addEventListener('click', () => {
            const email = document.getElementById('email-text').innerText;
            const btnText = document.getElementById('copy-btn-text');

            navigator.clipboard.writeText(email).then(() => {
                // Uložíme si původní text, abychom ho mohli vrátit
                const originalText = btnText.innerText;

                // Změna textu na potvrzení
                btnText.innerText = 'ZKOPIROVÁNO!';
                btnText.style.color = '#ff5500';

                // Po 2 sekundách vrátíme původní stav
                setTimeout(() => {
                    btnText.innerText = originalText;
                    btnText.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Chyba při kopírování: ', err);
            });
        });
    }

    // --- 4. ANIMACE PŘI SCROLLOVÁNÍ ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card, .section-title, .audio-card, .gear-tabs, .contact-wrapper').forEach(el => {
        observer.observe(el);
    });

    // Funkce pro návrat na pevný bod (Hero sekci)
    const goToTop = (e) => {
        e.preventDefault();
        const topElement = document.getElementById('hero-top');
        if (topElement) {
            // Okamžitý skok (instantní)
            window.scrollTo({
                top: topElement.offsetTop,
                behavior: 'auto'
            });
            // Vyčistíme URL od mřížek
            history.replaceState(null, null, ' ');
        }
    };

    // Připojení na logo
    const logo = document.querySelector('.nav-logo');
    if (logo) logo.addEventListener('click', goToTop);

    // Připojení na tlačítko v patičce
    const footerBtn = document.getElementById('scrollToTop');
    if (footerBtn) footerBtn.addEventListener('click', goToTop);

    // --- FAQ ACCORDION ---
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Zavřít ostatní otevřené dotazy
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

            // Pokud nebyl aktivní, otevřít ho
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });



    // MOBILNÍ VERZE SCRIPTU

    // OVLÁDÁNÍ MENU PRO MOBIL
    const menuBtn = document.querySelector('#mobile-menu');
    const navList = document.querySelector('#nav-list');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Funkce pro otevření/zavření
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navList.classList.toggle('active');
    });

    // Zavření menu po kliknutí na odkaz (aby se člověk mohl posunout na sekci)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navList.classList.remove('active');
        });
    });

    // --- LOGIKA SWIPOVÁNÍ PRO GEAR SLIDER ---
    const gearContainer = document.querySelector('.gear-slider-container');
    let touchStartX = 0;
    let touchEndX = 0;

    if (gearContainer) {
        gearContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        gearContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50; // Minimální vzdálenost v px pro detekci swipu

        // Swipe DOLEVA (další karta)
        if (touchStartX - touchEndX > swipeThreshold) {
            if (filteredCards.length > 0) {
                currentCardIndex = (currentCardIndex + 1) % filteredCards.length;
                renderCard();
            }
        }

        // Swipe DOPRAVA (předchozí karta)
        if (touchEndX - touchStartX > swipeThreshold) {
            if (filteredCards.length > 0) {
                currentCardIndex = (currentCardIndex - 1 + filteredCards.length) % filteredCards.length;
                renderCard();
            }
        }
    }
});