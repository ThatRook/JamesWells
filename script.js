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


    // 🎯 NOVÉ: Globální definice pořadí uzlů pro správný reset při Logoutu
    const nodeOrder = ["workstation", "capture", "chill", "minibar"];
    let currentNodeIndex = 0;

    window.isStudioSystemOnline = false;

    window.isStudioSystemOnline = false;

    if (imageContainer) {
        imageContainer.classList.add('locked-nodes');
    }

    // UNIVERZÁLNÍ SPOUŠTĚČ BOOTU (SPOLEHLIVÝ PRO DESKTOP I PRO MOBILNÍ DOTYK)
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

                        // 🎯 TADY: Hned po odemčení systému rozsvítíme výchozí uzel (CORE)
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



    // SPOLEČNÁ FUNKCE PRO AKTIVACI UZLU
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

    // INTERAKCE UZLŮ (HOVER PRO DESKTOP, SWIPE PRO MOBIL)


    if (hotspots.length > 0) {
        hotspots.forEach(hotspot => {
            // Desktop hover – zůstává plně funkční pro počítače s myší
            hotspot.addEventListener('mouseenter', () => {
                if (window.isStudioSystemOnline && window.innerWidth > 1024) {
                    activateRackNode(hotspot);
                }
            });
        });
    }

    // 🌟 NOVÝ MOBILNÍ SWIPE ENGINE PRO TEXTOVÝ TERMINÁL
    const terminalZone = document.getElementById('studio-terminal-zone');
    let touchStartX = 0;
    let touchEndX = 0;

    if (terminalZone) {
        // Zaznamenáme, kde se prst dotkl displeje
        terminalZone.addEventListener('touchstart', (e) => {
            if (!window.isStudioSystemOnline || window.innerWidth > 1024) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Zaznamenáme, kde prst z displeje odešel
        terminalZone.addEventListener('touchend', (e) => {
            if (!window.isStudioSystemOnline || window.innerWidth > 1024) return;
            touchEndX = e.changedTouches[0].screenX;
            handleTerminalSwipe();
        }, { passive: true });
    }

    function handleTerminalSwipe() {
        const swipeThreshold = 50; // Minimální vzdálenost v pixelech pro uznání swipu
        const diffX = touchStartX - touchEndX;

        // SWIPE DOLEVA (Prst jede doleva -> chceme DALŠÍ text)
        if (diffX > swipeThreshold) {
            if (currentNodeIndex < nodeOrder.length - 1) {
                currentNodeIndex++;
                triggerNodeChange();
            }
        }
        // SWIPE DOPRAVA (Prst jede doprava -> chceme PŘEDCHOZÍ text)
        else if (diffX < -swipeThreshold) {
            if (currentNodeIndex > 0) {
                currentNodeIndex--;
                triggerNodeChange();
            }
        }
    }

    // Pomocná funkce, která vyhledá správný hotspot podle indexu a aktivuje ho
    function triggerNodeChange() {
        const targetSpace = nodeOrder[currentNodeIndex];
        const targetHotspot = document.querySelector(`.js-hotspot[data-space="${targetSpace}"]`);

        if (targetHotspot) {
            activateRackNode(targetHotspot);
        }
    }

    // 5. CUSTOM VIDEO LOOP TIMING ENGINE
    const loopVideos = document.querySelectorAll('.js-custom-loop');
    loopVideos.forEach(video => {
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= 8.50) {
                video.currentTime = 0;
                video.play();
            }
        });
    });

    // 5. CUSTOM VIDEO LOOP TIMING ENGINE
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

    // ⛔ STOPKA PRO VELKÁ OKNA (VŠE POD TÍMTO ŘÁDKEM BĚŽÍ POUZE NA MOBILU)
    if (window.innerWidth > 1024) return;

    // --- B. TINDER/SPOTIFY SWIPE CARD EFFECT FOR MOBILE ---
    const mCardsContainer = document.querySelector(".music-container .container");
    if (mCardsContainer) {
        let cards = Array.from(mCardsContainer.querySelectorAll(".music-container .card"));

        function updateStack() {
            cards.forEach((card, index) => {
                card.style.zIndex = cards.length - index;
                if (index === 0) {
                    card.style.transform = "translateX(-50%) translateY(0) scale(1)";
                    card.style.opacity = "1";
                    card.style.pointerEvents = "auto";
                } else if (index <= 3) {
                    const depth = index;
                    card.style.transform = `translateX(-50%) translateY(${depth * 12}px) scale(${1 - depth * 0.04})`;
                    card.style.opacity = "1";
                    card.style.pointerEvents = "none";
                } else {
                    card.style.opacity = "0";
                    card.style.pointerEvents = "none";
                }
            });
        }

        if (cards.length > 0) {
            updateStack();

            setTimeout(() => {
                const topCard = cards[0];
                if (topCard) {
                    topCard.style.transition = "transform 0.4s ease-out";
                    topCard.style.transform = "translateX(calc(-50% - 40px)) rotate(-3deg)";
                    setTimeout(() => {
                        topCard.style.transition = "transform 0.5s ease-in-out";
                        topCard.style.transform = "translateX(-50%)";
                        setTimeout(() => { topCard.style.transition = ""; }, 500);
                    }, 450);
                }
            }, 1000);

            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let activeCard = null;

            mCardsContainer.addEventListener("touchstart", (e) => {
                activeCard = cards[0];
                if (activeCard) {
                    isDragging = true;
                    startX = e.touches[0].clientX;
                    activeCard.style.transition = "none";
                }
            }, { passive: true });

            mCardsContainer.addEventListener("touchmove", (e) => {
                if (!isDragging || !activeCard) return;
                currentX = e.touches[0].clientX - startX;
                if (e.cancelable) e.preventDefault();
                activeCard.style.transform = `translateX(calc(-50% + ${currentX}px)) rotate(${currentX * 0.05}deg)`;
            });

            mCardsContainer.addEventListener("touchend", () => {
                if (!isDragging || !activeCard) return;
                isDragging = false;

                const swipeDistance = Math.abs(currentX);

                if (swipeDistance < 10) {
                    activeCard.style.transition = "transform 0.1s ease";
                    activeCard.style.transform = "translateX(-50%)";

                    const audio = activeCard.querySelector('.js-audio-element');
                    const playText = activeCard.querySelector('.js-play-text');

                    if (audio) {
                        audio.volume = 0.4;
                        document.querySelectorAll('.js-audio-element').forEach(el => {
                            if (el !== audio) {
                                el.pause();
                                const otherText = el.closest('.card').querySelector('.js-play-text');
                                if (otherText) otherText.textContent = 'PLAY';
                            }
                        });

                        if (audio.paused) {
                            audio.play().then(() => {
                                if (playText) playText.textContent = 'PAUSE';
                            }).catch(err => console.error("Audio block: ", err));
                        } else {
                            audio.pause();
                            audio.currentTime = 0;
                            if (playText) playText.textContent = 'PLAY';
                        }
                    }
                    currentX = 0;
                    activeCard = null;
                    return;
                }

                if (currentX < -80 || currentX > 80) {
                    activeCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";
                    activeCard.style.transform = currentX < 0 ? "translateX(-200%) rotate(-20deg)" : "translateX(200%) rotate(20deg)";
                    activeCard.style.opacity = "0";

                    setTimeout(() => {
                        const movedCard = cards.shift();
                        movedCard.style.zIndex = 0;
                        movedCard.style.transform = "translateX(-50%) translateY(30px) scale(0.9)";
                        cards.push(movedCard);

                        requestAnimationFrame(() => {
                            movedCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
                            movedCard.style.opacity = "1";
                            updateStack();
                        });
                    }, 300);
                } else {
                    activeCard.style.transition = "transform 0.3s ease";
                    activeCard.style.transform = "translateX(-50%)";
                }

                currentX = 0;
                activeCard = null;
            });
        }
    }

    // --- C. AUTOMATICKÉ SPOUŠTĚNÍ ASCII VIDEÍ ---
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

}); // 👈 TATO JEDINÁ ZÁVORKA TEĎ ČISTĚ UZAVÍRÁ CELÝ SOUBOR SCRIPT.JS