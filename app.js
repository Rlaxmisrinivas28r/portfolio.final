/**
 * Personal Portfolio - Core Interactive Engine
 * Handles Custom cursor trail, typewriter effect, 3D card tilts,
 * navbar active indicators, scroll animation reveals, and contact form handling.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Cursor Glow Following Effect ---
    const cursorGlow = document.getElementById('cursor-glow');
    let cursorX = 0, cursorY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    // Smoothly ease the glowing circle toward the mouse coordinates
    function updateCursorGlow() {
        cursorX += (targetX - cursorX) * 0.1;
        cursorY += (targetY - cursorY) * 0.1;
        
        if (cursorGlow) {
            cursorGlow.style.left = `${cursorX}px`;
            cursorGlow.style.top = `${cursorY}px`;
        }
        
        requestAnimationFrame(updateCursorGlow);
    }
    updateCursorGlow();


    // --- Mobile Navigation Menu ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });


    // --- Shrink Navigation Header on Scroll ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });


    // --- Active Link Highlighter during Scrolling ---
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveSection() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            
            // Find navigation link corresponding to this section
            const navLink = document.querySelector(`.nav-link[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active-link'));
                    navLink.classList.add('active-link');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightActiveSection);


    // --- Typewriter Effect ---
    const typewriter = document.getElementById('typewriter');
    const words = ["Software Engineer", "Java Developer", "Database Specialist", "Backend Developer"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
            typeDelay = 50; // Delete faster
        } else {
            charIndex++;
            typeDelay = 150; // Type slower
        }

        if (typewriter) {
            typewriter.textContent = currentWord.substring(0, charIndex);
        }

        // Handle states
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeDelay = 1500; // Pause at full word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeDelay = 500; // Pause before next word
        }

        setTimeout(typeEffect, typeDelay);
    }
    
    if (typewriter) {
        setTimeout(typeEffect, 1000);
    }


    // --- 3D Tilt Card Interaction ---
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Find mouse cursor relative to card center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Normalize tilt degrees (max 10 degrees)
            const rotateX = -(y / (rect.height / 2)) * 10;
            const rotateY = (x / (rect.width / 2)) * 10;
            
            // Apply transformations
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Internal items parallax glow
            const glow = card.querySelector('.project-overlay-glow');
            if (glow) {
                // Shift glow coordinate inside card
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;
                glow.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;
            }
        });

        card.addEventListener('mouseleave', () => {
            // Restore default settings smoothly
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease-out';
            
            const glow = card.querySelector('.project-overlay-glow');
            if (glow) {
                glow.style.transform = 'translate(-50%, -50%)';
                glow.style.transition = 'transform 0.5s ease-out';
            }
        });

        card.addEventListener('mouseenter', () => {
            // Remove transitions during live cursor move to prevent dragging lag
            card.style.transition = 'none';
            const glow = card.querySelector('.project-overlay-glow');
            if (glow) glow.style.transition = 'none';
        });
    });


    // --- Skill Bars Animation triggered by Scroll ---
    const skillsSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.skill-progress-bar');
    let skillAnimated = false;

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillAnimated) {
                progressBars.forEach(bar => {
                    const targetWidth = bar.parentElement.previousElementSibling.children[1].textContent;
                    bar.style.width = targetWidth;
                });
                skillAnimated = true; // Animate only once
            }
        });
    }, { threshold: 0.15 });

    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }


    // --- General Scroll Reveal Animation (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.about-card, .skill-category-card, .project-card-3d, .exp-card, .cert-card, .contact-details-box, .contact-form-box');
    
    // Set initial structural fade styling
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Unobserve once triggered to save performance
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // --- Contact Form Submission Handler & Validation ---
    const contactForm = document.getElementById('contact-form');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const feedbackMsg = document.getElementById('form-feedback-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Fetch input strings
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // Client-side validations
            if (!name || !email || !subject || !message) {
                showFeedback('Please fill out all fields.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showFeedback('Please enter a valid email address.', 'error');
                return;
            }

            // Interactive submit animations
            formSubmitBtn.disabled = true;
            const originalBtnHtml = formSubmitBtn.innerHTML;
            formSubmitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            feedbackMsg.textContent = '';

            // Simulate form submission latency
            setTimeout(() => {
                showFeedback('Thank you! Your message has been sent successfully. Srinivas will contact you shortly.', 'success');
                contactForm.reset();
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = originalBtnHtml;
                
                // Clear success message after 6 seconds
                setTimeout(() => {
                    feedbackMsg.textContent = '';
                }, 6000);
            }, 1800);
        });
    }

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showFeedback(text, status) {
        if (feedbackMsg) {
            feedbackMsg.textContent = text;
            feedbackMsg.className = `feedback-msg ${status}`;
        }
    }
});
