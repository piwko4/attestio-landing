/**
 * Attestio Landing Page - JavaScript
 * ================================================
 * Modern AI aesthetic with particles, scroll animations, and form handling.
 * Email capture powered by Formspree (free tier).
 *
 * SETUP: Replace the FORM_ENDPOINT below with your Formspree URL.
 *        1. Go to https://formspree.io  →  New Form  →  copy the endpoint
 *        2. Paste it below (looks like https://formspree.io/f/xAbCdEfG)
 */

// ── Configuration ──────────────────────────────────────────────────────────────
const FORM_ENDPOINT = 'https://formspree.io/f/FORMSPREE_ID'; // ← swap this
// ────────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initScrollReveal();
    initFAQ();
    initForm();
    initSmoothScroll();
    initModal();
});

/* =========================================================================
   Particle Animation
   ========================================================================= */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        
        // Random delay
        particle.style.animationDelay = Math.random() * 20 + 's';
        
        // Random duration (between 15-25s)
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        // Random size (1-3px)
        const size = 1 + Math.random() * 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random opacity
        particle.style.opacity = 0.1 + Math.random() * 0.3;
        
        container.appendChild(particle);
    }
}

/* =========================================================================
   Scroll Reveal Animation
   ========================================================================= */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    // Initial check for elements already in view
    checkReveal();
    
    // Check on scroll
    window.addEventListener('scroll', throttle(checkReveal, 100), { passive: true });
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        const revealPoint = 120; // Pixels from bottom of viewport
        
        reveals.forEach((element, index) => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                // Add staggered delay for elements in same row
                setTimeout(() => {
                    element.classList.add('visible');
                }, index * 50); // 50ms stagger
            }
        });
    }
}

// Throttle helper
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* =========================================================================
   FAQ Accordion
   ========================================================================= */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }

            // Update aria-expanded
            faqItems.forEach(i => {
                const btn = i.querySelector('.faq-question');
                btn.setAttribute('aria-expanded', i.classList.contains('active'));
            });
        });
    });
}

/* =========================================================================
   Lead Capture Form  →  Formspree
   ========================================================================= */
function initForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');

        // ── client-side validation ──
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // ── build payload (Formspree expects FormData or JSON) ──
        const payload = {
            email:       form.email.value.trim(),
            firstName:   form.firstName.value.trim(),
            company:     form.company.value.trim() || '(not provided)',
            companySize: form.companySize.value || '(not provided)',
            _subject:    'New Attestio Lead'
        };

        // ── UI: loading ──
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        hideError();

        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showSuccess();
                form.reset();
                trackConversion(payload.email);
            } else {
                // Formspree returns { errors: [{ field, message, code }] }
                let msg = 'Something went wrong. Please try again.';
                try {
                    const body = await res.json();
                    if (body.errors && body.errors.length) {
                        msg = body.errors.map(e => e.message).join(' ');
                    }
                } catch (_) { /* ignore parse errors */ }

                if (res.status === 429) {
                    msg = 'Too many requests — please wait a minute and try again.';
                }

                showError(msg);
            }
        } catch (err) {
            // Network failure / CORS / offline
            console.error('Form submission error:', err);
            showError(
                'Network error — check your connection and try again.'
            );
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

/* =========================================================================
   Error toast
   ========================================================================= */
function showError(message) {
    let toast = document.getElementById('form-error');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'form-error';
        toast.className = 'form-error';
        toast.setAttribute('role', 'alert');
        const form = document.getElementById('lead-form');
        if (form) form.prepend(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
}

function hideError() {
    const toast = document.getElementById('form-error');
    if (toast) toast.classList.remove('visible');
}

/* =========================================================================
   Success modal
   ========================================================================= */
function showSuccess() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }
}

/* =========================================================================
   Modal handling
   ========================================================================= */
function initModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

/* =========================================================================
   Analytics helper
   ========================================================================= */
function trackConversion(email) {
    if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
            event_category: 'Lead Magnet',
            event_label:    'CMMC Survival Guide'
        });
    }
    // Future: Meta Pixel, LinkedIn Insights, etc.
}

/* =========================================================================
   Smooth scroll for anchor links
   ========================================================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();

                const headerOffset = 20;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =========================================================================
   Optional: scroll-depth tracking
   ========================================================================= */
function initScrollTracking() {
    let tracked = { 25: false, 50: false, 75: false, 100: false };

    window.addEventListener('scroll', function () {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        [25, 50, 75, 100].forEach(milestone => {
            if (scrollPercent >= milestone && !tracked[milestone]) {
                tracked[milestone] = true;

                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        event_category: 'Engagement',
                        event_label:    `${milestone}%`
                    });
                }
            }
        });
    }, { passive: true });
}

// Uncomment to enable scroll tracking
// initScrollTracking();

/* =========================================================================
   Mouse parallax effect for hero (subtle)
   ========================================================================= */
function initMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const orbs = document.querySelectorAll('.glow-orb');
    
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;
        
        orbs.forEach((orb, index) => {
            const factor = (index + 1) * 0.5;
            orb.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
        });
    });
}

// Enable mouse parallax (optional - can be intensive)
// initMouseParallax();
