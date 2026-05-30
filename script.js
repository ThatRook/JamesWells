// Kontrolní výpis do konzole pro ověření správného propojení souboru
console.log("LOG: script.js je úspěšně propojen a načten.");

// Globální datový objekt pro hardwarový rack studia
const studioRackData = {
    workstation: { protocol: "BUS_01 // NODE_AUDIO_CORE // ONLINE", title: "CORE" },
    capture: { protocol: "BUS_02 // NODE_GEAR_ARSENAL // ONLINE", title: "GEAR" },
    chill: { protocol: "BUS_03 // NODE_LOUNGE // ONLINE", title: "CHILL" },
    minibar: { protocol: "BUS_04 // NODE_REFRESH // ONLINE", title: "MINIBAR" }
};

// ==========================================================================
// 🎛️ GLOBÁLNÍ LOGIKA MINIMALISTICKÉHO LOADERU (PRO VŠECHNY DISPLEJE)
// ==========================================================================
(function () {
    const percentEl = document.getElementById('loader-percentage');
    const fillEl = document.getElementById('loader-line-fill');
    const loaderEl = document.getElementById('site-loader');

    let currentPercent = 0;

    // Umělá plynulá animace startu (aby čísla hned skočila a nestála na nule)
    const fastProgress = setInterval(() => {
        if (currentPercent < 75) {
            currentPercent += Math.floor(Math.random() * 5) + 1;
            if (currentPercent > 75) currentPercent = 75;
            updateLoader(currentPercent);
        }
    }, 80);

    // 🎯 TADY JE TA JEDINÁ ZMĚNA UVNITŘ:
    function updateLoader(percent) {
        if (percentEl) {
            percentEl.textContent = String(percent).padStart(2, '0') + ' %';

            // 🛠️ Propisujeme už jen čisté procento pro výpočet opacity v CSS
            percentEl.style.setProperty('--progress', percent);
        }
        if (fillEl) fillEl.style.width = percent + '%';
    }

    // Jakmile prohlížeč ohlásí: "Mám komplet stažený celý web, videa i styly"
    window.addEventListener('load', () => {
        clearInterval(fastProgress);

        // Skočíme bleskově do finále (100 %)
        let finalPercent = currentPercent;
        const finishProgress = setInterval(() => {
            if (finalPercent < 100) {
                finalPercent += 5;
                if (finalPercent > 100) finalPercent = 100;
                updateLoader(finalPercent);
            } else {
                clearInterval(finishProgress);

                // Krátká pauza na 100% pro vizuální uspokojení a plynulé zhasnutí
                setTimeout(() => {
                    if (loaderEl) {
                        loaderEl.classList.add('loader-fade-out');
                    }
                }, 400);
            }
        }, 30);
    });
})();
// ==========================================================================
// ⚡ JEDNOTNÝ SKRIPT PRO CELÝ WEB (ZÁKLADNÍ DOM NAČTENÍ)
// ==========================================================================
window.addEventListener("DOMContentLoaded", () => {

    // 1. MECHANIKA ROZJÍŽDĚNÍ KARET (GSAP) - POUZE DESKTOP
    const container = document.querySelector('.music-container .container');

    if (container) {
        if (window.innerWidth > 1024) {
            const containerW = container.clientWidth;
            const cards = document.querySelectorAll('.card');
            const cardsLength = cards.length;
            const cardContent = document.querySelectorAll('.card .content');
            let currentPortion = 0;

            cards.forEach(card => {
                gsap.set(card, {
                    xPercent: (Math.random() - 0.5) * 15,
                    yPercent: (Math.random() - 0.5) * 15,
                    rotation: (Math.random() - 0.5) * 15,
                });
            });

            container.addEventListener("mousemove", e => {
                const mouseX = e.clientX - container.getBoundingClientRect().left;
                const percentage = mouseX / containerW;
                const activePortion = Math.ceil(percentage * cardsLength);

                if (activePortion !== currentPortion && activePortion > 0 && activePortion <= cardsLength) {
                    if (currentPortion !== 0) { resetPortion(currentPortion - 1); }
                    currentPortion = activePortion;
                    newPortion(currentPortion - 1);
                }
            });

            container.addEventListener("mouseleave", () => {
                resetPortion(currentPortion - 1);
                currentPortion = 0;
                gsap.to(cardContent, {
                    xPercent: 0,
                    ease: 'elastic.out(1, 0.75)',
                    duration: 0.8
                });
            });

            function resetPortion(index) {
                if (cards[index]) {
                    gsap.to(cards[index], {
                        xPercent: (Math.random() - 0.5) * 10,
                        yPercent: (Math.random() - 0.5) * 10,
                        rotation: (Math.random() - 0.5) * 15,
                        scale: 1,
                        duration: 0.8,
                        ease: 'elastic.out(1, 0.75)',
                    });
                }
            }

            function newPortion(i) {
                if (cards[i]) {
                    gsap.to(cards[i], {
                        xPercent: 0,
                        yPercent: 0,
                        rotation: 0,
                        duration: 0.8,
                        scale: 1.1,
                        ease: 'elastic.out(1, 0.75)'
                    });
                }

                cardContent.forEach((content, index) => {
                    if (index !== i) {
                        gsap.to(content, {
                            xPercent: 75 / (index - i),
                            ease: 'elastic.out(1, 0.75)',
                            duration: 0.8
                        });
                    } else {
                        gsap.to(content, { xPercent: 0, ease: 'elastic.out(1, 0.75)', duration: 0.8 });
                    }
                });
            }
        }
    }

    // 2. LOGIKA AUDIO PŘEHRÁVAČE (DESKTOP)
    const audioCards = document.querySelectorAll('.js-audio-card');

    audioCards.forEach(card => {
        const audio = card.querySelector('.js-audio-element');
        const playTrigger = card.querySelector('.js-play-trigger');
        const playText = card.querySelector('.js-play-text');

        if (audio && playTrigger) {
            audio.volume = 0.4;

            playTrigger.addEventListener('click', (e) => {
                e.stopPropagation();

                if (audio.paused) {
                    audio.play();
                    if (playText) playText.textContent = 'PAUSE';
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    if (playText) playText.textContent = 'PLAY';
                }
            });

            audio.addEventListener('ended', () => {
                if (playText) playText.textContent = 'PLAY';
            });
        }
    });

    // 3. INTERAKTIVNÍ KOPÍROVÁNÍ EMAILU (DESKTOP)
    const emailBtn = document.getElementById("copy-email-btn");
    const emailAddress = "james@jameswells.uk";

    if (emailBtn) {
        emailBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(emailAddress).then(() => {
                emailBtn.innerText = "[ COPIED! ]";
                emailBtn.style.color = "#f248b6";
                emailBtn.style.opacity = "1";

                setTimeout(() => {
                    emailBtn.innerText = "EMAIL";
                    emailBtn.style.color = "";
                    emailBtn.style.opacity = "";
                }, 1200);
            }).catch(err => console.error("Chyba: ", err));
        });
    }

    // ==========================================================================
    // 4. INTERAKTIVNÍ HARDWAROVÝ RACK - SPOLEČNÉ ELEMENTY A UNIVERZÁLNÍ ENGINE
    // ==========================================================================
    const hotspots = document.querySelectorAll('.js-hotspot');
    const imageContainer = document.querySelector('.studio-image-container');
    const pProto = document.getElementById('st-protocol');
    const pTitle = document.getElementById('st-title');
    const bootScreen = document.getElementById('boot-screen');
    const globalStartBtn = document.getElementById('start-boot-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('boot-progress-bar');
    const percentageText = document.getElementById('boot-percentage-text');
    const terminalContent = document.getElementById('terminal-content');
    const terminalFooter = document.getElementById('terminal-footer');

    const nodeOrder = ["workstation", "capture", "chill", "minibar"];
    let currentNodeIndex = 0;

    window.isStudioSystemOnline = false;

    if (imageContainer) {
        imageContainer.classList.add('locked-nodes');
    }

    if (globalStartBtn) {
        const executeBootSequence = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            globalStartBtn.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'block';

            let progress = 0;
            const bootInterval = setInterval(() => {
                progress += Math.floor(Math.random() * 8) + 4;

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(bootInterval);

                    setTimeout(() => {
                        if (bootScreen) {
                            bootScreen.style.opacity = '0';
                            setTimeout(() => bootScreen.style.display = 'none', 500);
                        }

                        if (terminalContent) terminalContent.classList.add('system-ready');
                        if (terminalFooter) terminalFooter.classList.add('system-ready');
                        if (imageContainer) imageContainer.classList.remove('locked-nodes');

                        window.isStudioSystemOnline = true;

                        const defaultHotspot = document.querySelector('.js-hotspot[data-space="workstation"]');
                        if (defaultHotspot) {
                            activateRackNode(defaultHotspot);
                        }
                    }, 300);
                }

                if (progressBar) progressBar.style.width = `${progress}%`;
                if (percentageText) percentageText.innerText = `${progress}%`;
            }, 45);
        };

        globalStartBtn.addEventListener('click', executeBootSequence);
        globalStartBtn.addEventListener('touchstart', executeBootSequence, { passive: false });
    }

    function activateRackNode(hotspot) {
        const spaceType = hotspot.getAttribute('data-space');
        const data = studioRackData[spaceType];

        if (data) {
            hotspots.forEach(h => h.classList.remove('active-hotspot'));
            hotspot.classList.add('active-hotspot');

            if (pProto) pProto.textContent = data.protocol;
            if (pTitle) pTitle.textContent = data.title;

            document.querySelectorAll('.studio-promo-text').forEach(p => { p.style.display = 'none'; });
            const activePromoElement = document.getElementById(`promo-${spaceType}`);
            if (activePromoElement) activePromoElement.style.display = 'block';

            document.querySelectorAll('.studio-gear-specs').forEach(specBox => { specBox.style.display = 'none'; });
            const activeSpecsElement = document.getElementById(`specs-${spaceType}`);
            if (activeSpecsElement) activeSpecsElement.style.display = 'flex';
        }
    }

    if (hotspots.length > 0) {
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('mouseenter', () => {
                if (window.isStudioSystemOnline && window.innerWidth > 1024) {
                    activateRackNode(hotspot);
                }
            });
        });
    }

    const terminalZone = document.getElementById('studio-terminal-zone');
    let touchStartX = 0;
    let touchEndX = 0;

    if (terminalZone) {
        terminalZone.addEventListener('touchstart', (e) => {
            if (!window.isStudioSystemOnline || window.innerWidth > 1024) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        terminalZone.addEventListener('touchend', (e) => {
            if (!window.isStudioSystemOnline || window.innerWidth > 1024) return;
            touchEndX = e.changedTouches[0].screenX;
            handleTerminalSwipe();
        }, { passive: true });
    }

    function handleTerminalSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;

        if (diffX > swipeThreshold) {
            if (currentNodeIndex < nodeOrder.length - 1) {
                currentNodeIndex++;
                triggerNodeChange();
            }
        }
        else if (diffX < -swipeThreshold) {
            if (currentNodeIndex > 0) {
                currentNodeIndex--;
                triggerNodeChange();
            }
        }
    }

    function triggerNodeChange() {
        const targetSpace = nodeOrder[currentNodeIndex];
        const targetHotspot = document.querySelector(`.js-hotspot[data-space="${targetSpace}"]`);

        if (targetHotspot) {
            activateRackNode(targetHotspot);
        }
    }

    const loopVideos = document.querySelectorAll('.js-custom-loop');
    loopVideos.forEach(video => {
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= 8.50) {
                video.currentTime = 0;
                video.play();
            }
        });
    });

    const menuToggle = document.querySelector(".js-menu-toggle");
    const menuNav = document.querySelector(".js-menu-navigation");
    const menuLinks = document.querySelectorAll(".fixed-menu-link");
    const mobileEmailBtn = document.getElementById("mobile-copy-email-btn");

    if (menuToggle && menuNav) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("menu-open");
            menuNav.classList.toggle("nav-open");
        });

        menuLinks.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("menu-open");
                menuNav.classList.remove("nav-open");
            });
        });

        if (mobileEmailBtn) {
            mobileEmailBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                navigator.clipboard.writeText(emailAddress).then(() => {
                    mobileEmailBtn.innerText = "[ COPIED! ]";
                    mobileEmailBtn.style.color = "#f248b6";
                    mobileEmailBtn.style.opacity = "1";

                    setTimeout(() => {
                        mobileEmailBtn.innerText = "EMAIL";
                        mobileEmailBtn.style.color = "";
                        mobileEmailBtn.style.opacity = "";
                    }, 2000);
                }).catch(err => console.error("Chyba kopírování: ", err));
            });
        }
    }

    // ⛔ STOPKA PRO VELKÁ OKNA (VŠE POD TÍMTO REZERVUJE MÍSTO POUZE PRO MOBILNÍ SWIPE KARTY)
    if (window.innerWidth > 1024) return;

    // --- B. MODERNÍ NATIVNÍ CAROUSEL ENGINE PRO MOBILY (BEZ ČÍSEL) ---
    const carouselContainer = document.querySelector(".music-container .container");
    const carouselCards = document.querySelectorAll(".music-container .card");

    if (carouselContainer && carouselCards.length > 0) {

        const carouselOptions = {
            root: carouselContainer,
            rootMargin: "0px -40% 0px -40%", // Hlídá kartu přesně ve středovém výřezu displeje
            threshold: 0.1
        };

        const carouselObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Zhasneme všechny ostatní karty
                    carouselCards.forEach(c => c.classList.remove("carousel-active"));

                    // 2. Rozsvítíme pouze tu kartu, která je přesně uprostřed obrazovky
                    entry.target.classList.add("carousel-active");
                }
            });
        }, carouselOptions);

        // Aktivujeme sledování pozice pro každou kartu zvlášť
        carouselCards.forEach(card => carouselObserver.observe(card));

        // INTERAKCE: Přehrávání hudby na mobilní kliknutí
        carouselCards.forEach(card => {
            card.addEventListener('click', () => {
                const audio = card.querySelector('.js-audio-element');
                const playText = card.querySelector('.js-play-text');

                if (audio) {
                    audio.volume = 0.4;

                    // Stopneme ostatní případně hrající skladby na webu
                    document.querySelectorAll('.js-audio-element').forEach(el => {
                        if (el !== audio) {
                            el.pause();
                            const otherCard = el.closest('.card');
                            if (otherCard) {
                                const otherText = otherCard.querySelector('.js-play-text');
                                if (otherText) otherText.textContent = 'PLAY';
                            }
                        }
                    });

                    // Přepínáme stav hraje / nehraje
                    if (audio.paused) {
                        audio.play().then(() => {
                            if (playText) playText.textContent = 'PAUSE';
                        }).catch(err => console.error("Audio block:", err));
                    } else {
                        audio.pause();
                        if (playText) playText.textContent = 'PLAY';
                    }
                }
            });
        });
    }

    const serviceCards = document.querySelectorAll(".services-section .service-card");

    if (serviceCards.length > 0) {
        serviceCards.forEach(card => {
            const video = card.querySelector("video") || card.querySelector('.js-custom-loop');
            if (video) video.pause();
        });

        if ('IntersectionObserver' in window) {
            const observerOptions = { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0.01 };
            const serviceObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target.querySelector("video") || entry.target.querySelector('.js-custom-loop');
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active-scroll-card");
                        if (video) video.play().catch(() => { });
                    } else {
                        entry.target.classList.remove("active-scroll-card");
                        if (video) video.pause();
                    }
                });
            }, observerOptions);
            serviceCards.forEach(card => serviceObserver.observe(card));
        }
    }
});