// Kontrolní výpis do konzole pro ovìøení správného propojení souboru
console.log("LOG: script.js je úspìšnì propojen a naèten.");

// Globální datový objekt pro hardwarový rack studia
const studioRackData = {
    workstation: { protocol: "BUS_01 // NODE_AUDIO_CORE // ONLINE", title: "CORE" },
    capture: { protocol: "BUS_02 // NODE_GEAR_ARSENAL // ONLINE", title: "GEAR" },
    chill: { protocol: "BUS_03 // NODE_LOUNGE // ONLINE", title: "CHILL" },
    minibar: { protocol: "BUS_04 // NODE_REFRESH // ONLINE", title: "MINIBAR" }
};

window.addEventListener("DOMContentLoaded", () => {

    // ==========================================================================
    // 1. MECHANIKA ROZJÍŽDÌNÍ KARET (GSAP)
    // ==========================================================================
    const container = document.querySelector('.music-container .container');

    if (container) {
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

    // ==========================================================================
    // 2. LOGIKA AUDIO PØEHRÁVAÈE
    // ==========================================================================
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
                    audio.currentTime = 0; // Pøetoèí stopu okamžitì na zaèátek
                    if (playText) playText.textContent = 'PLAY';
                }
            });

            audio.addEventListener('ended', () => {
                if (playText) playText.textContent = 'PLAY';
            });
        }
    });

    // ==========================================================================
    // 3. INTERAKTIVNÍ KOPÍROVÁNÍ EMAILU DO SCHRÁNKY
    // ==========================================================================
    const emailBtn = document.getElementById("copy-email-btn");
    const emailAddress = "james@jameswells.uk";

    if (emailBtn) {
        emailBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(emailAddress).then(() => {
                emailBtn.innerText = "[ COPIED! ]";
                emailBtn.style.color = "#f248b6"; // Svítící rùžová
                emailBtn.style.opacity = "1";

                setTimeout(() => {
                    emailBtn.innerText = "EMAIL";
                    emailBtn.style.color = "";
                    emailBtn.style.opacity = "";
                }, 1200);
            }).catch(err => {
                console.error("Chyba pøi kopírování: ", err);
            });
        });
    }

    // ==========================================================================
    // 4. INTERAKTIVNÍ HARDWAROVÝ RACK 6x2M - LOGIKA S BOOTEM A LOGOUTEM
    // ==========================================================================
    const hotspots = document.querySelectorAll('.js-hotspot');
    const imageContainer = document.querySelector('.studio-image-container');

    const pProto = document.getElementById('st-protocol');
    const pTitle = document.getElementById('st-title');

    const bootScreen = document.getElementById('boot-screen');
    const startBtn = document.getElementById('start-boot-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('boot-progress-bar');
    const percentageText = document.getElementById('boot-percentage-text');
    const terminalContent = document.getElementById('terminal-content');
    const terminalFooter = document.getElementById('terminal-footer');
    const logoutBtn = document.getElementById('stop-logout-btn');

    let isSystemOnline = false;

    if (imageContainer) {
        imageContainer.classList.add('locked-nodes');
    }

    // SPUŠTÌNÍ SYSTÉMU (BOOT SEQUENCE)
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
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

                        if (imageContainer) {
                            imageContainer.classList.remove('locked-nodes');
                        }

                        isSystemOnline = true;
                    }, 300);
                }

                if (progressBar) progressBar.style.width = `${progress}%`;
                if (percentageText) percentageText.innerText = `${progress}%`;
            }, 60);
        });
    }

    // UKONÈENÍ SYSTÉMU (LOGOUT SEQUENCE)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            isSystemOnline = false;

            if (terminalContent) terminalContent.classList.remove('system-ready');
            if (terminalFooter) terminalFooter.classList.remove('system-ready');

            if (imageContainer) {
                imageContainer.classList.add('locked-nodes');
            }

            if (progressBar) progressBar.style.width = '0%';
            if (percentageText) percentageText.innerText = '0%';

            setTimeout(() => {
                if (bootScreen) {
                    bootScreen.style.display = 'flex';
                    setTimeout(() => {
                        bootScreen.style.opacity = '1';
                        if (startBtn) startBtn.style.display = 'block';
                        if (progressContainer) progressContainer.style.display = 'none';
                    }, 50);
                }
            }, 400);
        });
    }

    // LOGIKA HOVERU NA HOTSPOTY
    if (hotspots.length > 0) {
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('mouseenter', () => {
                if (isSystemOnline) {
                    const spaceType = hotspot.getAttribute('data-space');
                    const data = studioRackData[spaceType];

                    if (data) {
                        hotspots.forEach(h => h.classList.remove('active-hotspot'));
                        hotspot.classList.add('active-hotspot');

                        if (pProto) pProto.textContent = data.protocol;
                        if (pTitle) pTitle.textContent = data.title;

                        document.querySelectorAll('.studio-promo-text').forEach(p => {
                            p.style.display = 'none';
                        });
                        const activePromoElement = document.getElementById(`promo-${spaceType}`);
                        if (activePromoElement) {
                            activePromoElement.style.display = 'block';
                        }

                        document.querySelectorAll('.studio-gear-specs').forEach(specBox => {
                            specBox.style.display = 'none';
                        });
                        const activeSpecsElement = document.getElementById(`specs-${spaceType}`);
                        if (activeSpecsElement) {
                            activeSpecsElement.style.display = 'flex';
                        }
                    }
                }
            });
        });
    }

    // ==========================================================================
    // 5. CUSTOM VIDEO LOOP TIMING ENGINE (RESET AT 8.50s)
    // ==========================================================================
    const loopVideos = document.querySelectorAll('.js-custom-loop');

    loopVideos.forEach(video => {
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= 8.50) {
                video.currentTime = 0;
                video.play();
            }
        });
    });
});