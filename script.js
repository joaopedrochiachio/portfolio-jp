// ==========================================================================
// MENU MOBILE TOGGLE & AUTO-CLOSE
// ==========================================================================

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Fecha o menu após clicar em qualquer link de navegação
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });
}

// ==========================================================================
// ELEVAÇÃO SUTIL DO HEADER AO ROLAR
// ==========================================================================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
        header.style.boxShadow = "0 2px 12px rgba(22, 22, 22, 0.05)";
    } else {
        header.style.boxShadow = "none";
    }
}, { passive: true });

// ==========================================================================
// ANIMAÇÃO DE REVEAL AO ROLAR & BARRAS DE SKILLS (SCROLL OBSERVER)
// ==========================================================================

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
    (entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");

                // Anima o preenchimento das barras de progresso nas Skills
                const skillFills = entry.target.querySelectorAll(".skill-fill");
                skillFills.forEach(fill => {
                    if (fill.dataset.progress) {
                        fill.style.width = fill.dataset.progress;
                    }
                });

                obs.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
    }
);

revealElements.forEach(element => {
    observer.observe(element);
});

// ==========================================================================
// CANVAS DE PARTÍCULAS ORGÂNICAS NO HERO (VANILLA JAVASCRIPT)
// ==========================================================================

const heroCanvas = document.getElementById("hero-particles");
const heroSection = document.getElementById("home");

if (heroCanvas && heroSection) {
    const ctx = heroCanvas.getContext("2d");
    let particles = [];
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let mouse = { x: null, y: null, maxDist: 130 };

    // Respeita preferência do usuário de movimento reduzido
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Detecta se é dispositivo com touch para desabilitar mouse interaction
    const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    // Redimensionamento preciso baseado nas dimensões reais do Hero
    const resizeCanvas = () => {
        width = heroSection.clientWidth;
        height = heroSection.clientHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        heroCanvas.width = width * dpr;
        heroCanvas.height = height * dpr;
        heroCanvas.style.width = `${width}px`;
        heroCanvas.style.height = `${height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        initParticles();
    };

    // Inicialização e distribuição uniforme por todo o Hero
    const initParticles = () => {
        particles = [];
        const isMobile = width < 768;
        // Desktop: 65 a 85 partículas; Mobile: 30 a 40 partículas
        const targetCount = isMobile ? 35 : 75;

        for (let i = 0; i < targetCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4, // Movimento calmo e contínuo
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 0.7 + 1.1 // Entre 1.1px e 1.8px
            });
        }
    };

    // Renderização e animação
    const render = () => {
        ctx.clearRect(0, 0, width, height);

        const connectionDistance = width < 768 ? 100 : 130;
        const connectionDistanceSq = connectionDistance * connectionDistance;

        // Conexões entre partículas próximas
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < connectionDistanceSq) {
                    const dist = Math.sqrt(distSq);
                    // Opacidade proporcional à distância (máx ~0.07 conforme especificado)
                    const opacity = (1 - dist / connectionDistance) * 0.07;
                    ctx.strokeStyle = `rgba(35, 45, 40, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Conexão suave com o cursor do mouse (apenas desktop)
            if (!isTouchDevice() && mouse.x !== null && mouse.y !== null) {
                const mDx = p1.x - mouse.x;
                const mDy = p1.y - mouse.y;
                const mDistSq = mDx * mDx + mDy * mDy;
                const mouseDist = mouse.maxDist;

                if (mDistSq < mouseDist * mouseDist) {
                    const dist = Math.sqrt(mDistSq);
                    const opacity = (1 - dist / mouseDist) * 0.08;
                    ctx.strokeStyle = `rgba(35, 45, 40, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();

                    // Atração muito sutil em direção ao cursor sem fuga brusca
                    p1.x -= (mDx / dist) * 0.15;
                    p1.y -= (mDy / dist) * 0.15;
                }
            }

            // Desenho do ponto da partícula
            ctx.fillStyle = "rgba(35, 45, 40, 0.14)";
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
            ctx.fill();

            // Atualização da posição com movimento contínuo
            p1.x += p1.vx;
            p1.y += p1.vy;

            // Envoltório suave nas bordas para manter distribuição uniforme
            if (p1.x < -10) p1.x = width + 10;
            else if (p1.x > width + 10) p1.x = -10;

            if (p1.y < -10) p1.y = height + 10;
            else if (p1.y > height + 10) p1.y = -10;
        }

        if (!prefersReducedMotion) {
            animationFrameId = requestAnimationFrame(render);
        }
    };

    // Interação de mouse suave no Hero (desktop apenas)
    if (!isTouchDevice()) {
        heroSection.addEventListener("mousemove", (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, { passive: true });

        heroSection.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // Inicialização
    resizeCanvas();

    if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
    } else {
        render(); // Renderiza um único frame estático se reduced motion
    }

    // Listener de redimensionamento da janela com debounce
    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            resizeCanvas();
            if (!prefersReducedMotion) {
                animationFrameId = requestAnimationFrame(render);
            } else {
                render();
            }
        }, 120);
    }, { passive: true });
}