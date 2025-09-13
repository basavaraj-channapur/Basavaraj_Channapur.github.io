/**
 * Professional Portfolio JavaScript
 * Basavaraj Channapur - VLSI Design Engineer
 * Advanced interactions, animations, and modern features
 */

// ============================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================

const CONFIG = {
    // Animation settings
    SCROLL_THRESHOLD: 50,
    TYPING_SPEED: 100,
    TYPING_DELAY: 2000,
    PARTICLE_COUNT: 50,
    
    // API endpoints (if needed)
    FORM_ENDPOINT: 'https://formspree.io/f/your-form-id', // Replace with actual form endpoint
    
    // Feature flags
    ENABLE_PARTICLES: true,
    ENABLE_TYPING_ANIMATION: true,
    ENABLE_SKILL_ANIMATIONS: true
};

// Dynamic titles for typing animation
const DYNAMIC_TITLES = [
    'VLSI Design Engineer',
    'Electronics Engineer',
    'IC Design Specialist',
    'Hardware Designer',
    'RTL Developer',
    'Analog Designer'
];

// Global state
let isScrolling = false;
let currentTitleIndex = 0;
let particles = [];
let animationFrameId = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 */
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
    }
}

/**
 * Check if element is in viewport
 */
function isElementInViewport(el, threshold = 0.1) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const elementHeight = rect.height;
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    
    // Element is visible if it's at least threshold visible
    return elementTop < windowHeight * (1 - threshold) && 
           elementBottom > windowHeight * threshold;
}

/**
 * Smooth scroll to target
 */
function smoothScrollTo(target, duration = 1000) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop - 80; // Account for navbar height
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

/**
 * Generate random number between min and max
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ============================================
// LOADING SCREEN
// ============================================

class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.querySelector('.loading-progress');
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isLoading = true;
        
        this.init();
    }
    
    init() {
        // Simulate loading progress
        this.simulateLoading();
        
        // Hide loading screen when everything is loaded
        window.addEventListener('load', () => {
            this.targetProgress = 100;
            setTimeout(() => this.hideLoadingScreen(), 500);
        });
        
        // Fallback: hide loading screen after maximum time
        setTimeout(() => {
            if (this.isLoading) {
                this.hideLoadingScreen();
            }
        }, 5000);
    }
    
    simulateLoading() {
        const updateProgress = () => {
            if (this.currentProgress < this.targetProgress) {
                this.currentProgress += Math.random() * 3;
                this.loadingProgress.style.width = `${Math.min(this.currentProgress, 100)}%`;
            }
            
            if (this.currentProgress < 95 && this.isLoading) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        // Simulate different loading stages
        setTimeout(() => this.targetProgress = 30, 200);
        setTimeout(() => this.targetProgress = 60, 800);
        setTimeout(() => this.targetProgress = 85, 1500);
        
        updateProgress();
    }
    
    hideLoadingScreen() {
        this.isLoading = false;
        this.currentProgress = 100;
        this.loadingProgress.style.width = '100%';
        
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            
            // Initialize other components after loading is complete
            setTimeout(() => {
                this.initializeComponents();
            }, 500);
        }, 300);
    }
    
    initializeComponents() {
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50
            });
        }
        
        // Initialize other components
        new Navigation();
        new HeroSection();
        new SkillsSection();
        new ContactForm();
        new ScrollAnimations();
        
        // Initialize particles if enabled
        if (CONFIG.ENABLE_PARTICLES) {
            new ParticleSystem();
        }
    }
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.handleScroll();
        this.updateActiveLink();
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.closeMobileMenu();
                smoothScrollTo(target);
                setTimeout(() => this.updateActiveLink(), 100);
            });
        });
        
        // Handle scroll events
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
            this.updateActiveLink();
        }, 10));
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu.classList.toggle('active');
        this.animateHamburger();
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navMenu.classList.remove('active');
        this.animateHamburger();
    }
    
    animateHamburger() {
        const hamburger = this.navToggle?.querySelector('.hamburger');
        if (hamburger) {
            hamburger.style.transform = this.isMenuOpen 
                ? 'rotate(45deg)' 
                : 'rotate(0deg)';
        }
    }
    
    handleScroll() {
        const scrolled = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;
        this.navbar.classList.toggle('scrolled', scrolled);
    }
    
    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ============================================
// HERO SECTION
// ============================================

class HeroSection {
    constructor() {
        this.dynamicTitle = document.getElementById('dynamic-title');
        this.heroStats = document.querySelectorAll('.stat-number');
        this.techItems = document.querySelectorAll('.tech-item');
        
        if (CONFIG.ENABLE_TYPING_ANIMATION) {
            this.initTypingAnimation();
        }
        
        this.initStatsAnimation();
        this.initTechItemsAnimation();
    }
    
    initTypingAnimation() {
        if (!this.dynamicTitle) return;
        
        let charIndex = 0;
        let isDeleting = false;
        let currentText = '';
        
        const typeText = () => {
            const fullText = DYNAMIC_TITLES[currentTitleIndex];
            
            if (isDeleting) {
                currentText = fullText.substring(0, currentText.length - 1);
            } else {
                currentText = fullText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            this.dynamicTitle.textContent = currentText;
            
            let typeSpeed = CONFIG.TYPING_SPEED;
            
            if (isDeleting) {
                typeSpeed /= 2;
            }
            
            if (!isDeleting && currentText === fullText) {
                typeSpeed = CONFIG.TYPING_DELAY;
                isDeleting = true;
            } else if (isDeleting && currentText === '') {
                isDeleting = false;
                charIndex = 0;
                currentTitleIndex = (currentTitleIndex + 1) % DYNAMIC_TITLES.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeText, typeSpeed);
        };
        
        // Start typing animation after a short delay
        setTimeout(typeText, 1000);
    }
    
    initStatsAnimation() {
        const animateStats = () => {
            this.heroStats.forEach(stat => {
                if (isElementInViewport(stat)) {
                    const finalValue = stat.textContent;
                    const isNumber = !isNaN(parseFloat(finalValue));
                    
                    if (isNumber) {
                        const startValue = 0;
                        const endValue = parseFloat(finalValue);
                        const duration = 2000;
                        const startTime = performance.now();
                        
                        const updateValue = (currentTime) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const current = startValue + (endValue - startValue) * this.easeOutCubic(progress);
                            
                            if (finalValue.includes('.')) {
                                stat.textContent = current.toFixed(1);
                            } else if (finalValue.includes('+')) {
                                stat.textContent = Math.floor(current) + '+';
                            } else {
                                stat.textContent = Math.floor(current);
                            }
                            
                            if (progress < 1) {
                                requestAnimationFrame(updateValue);
                            }
                        };
                        
                        requestAnimationFrame(updateValue);
                    }
                }
            });
        };
        
        // Animate stats when they come into view
        window.addEventListener('scroll', throttle(animateStats, 100));
        animateStats(); // Initial check
    }
    
    initTechItemsAnimation() {
        this.techItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.2}s`;
            
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-10px) scale(1.1) rotateY(10deg)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
            });
        });
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        if (!this.container) return;
        
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }
    
    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            this.particles.push({
                x: random(0, this.container.offsetWidth),
                y: random(0, this.container.offsetHeight),
                size: random(2, 5),
                speedX: random(-1, 1),
                speedY: random(-1, 1),
                opacity: random(0.1, 0.3),
                element: null
            });
        }
        
        this.particles.forEach(particle => {
            const element = document.createElement('div');
            element.className = 'particle';
            element.style.cssText = `
                position: absolute;
                width: ${particle.size}px;
                height: ${particle.size}px;
                background: #1a237e;
                border-radius: 50%;
                opacity: ${particle.opacity};
                pointer-events: none;
            `;
            particle.element = element;
            this.container.appendChild(element);
        });
    }
    
    bindEvents() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }
    
    animate() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off walls
            if (particle.x <= 0 || particle.x >= this.container.offsetWidth) {
                particle.speedX *= -1;
            }
            if (particle.y <= 0 || particle.y >= this.container.offsetHeight) {
                particle.speedY *= -1;
            }
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(particle.x, this.container.offsetWidth));
            particle.y = Math.max(0, Math.min(particle.y, this.container.offsetHeight));
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                particle.speedX -= Math.cos(angle) * 0.1;
                particle.speedY -= Math.sin(angle) * 0.1;
            }
            
            // Update element position
            if (particle.element) {
                particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
            }
        });
        
        animationFrameId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
    }
}

// ============================================
// SKILLS SECTION
// ============================================

class SkillsSection {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.chartCircles = document.querySelectorAll('.chart-circle');
        this.animated = false;
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', throttle(() => {
            if (!this.animated && this.isSkillsSectionVisible()) {
                this.animateSkills();
                this.animateCharts();
                this.animated = true;
            }
        }, 100));
    }
    
    isSkillsSectionVisible() {
        const skillsSection = document.getElementById('skills');
        return skillsSection && isElementInViewport(skillsSection, 0.3);
    }
    
    animateSkills() {
        this.skillBars.forEach((bar, index) => {
            const progress = bar.getAttribute('data-progress');
            
            setTimeout(() => {
                bar.style.width = `${progress}%`;
                
                // Add shimmer effect
                bar.classList.add('animating');
                setTimeout(() => {
                    bar.classList.remove('animating');
                }, 2000);
            }, index * 200);
        });
    }
    
    animateCharts() {
        this.chartCircles.forEach((circle, index) => {
            const percentage = circle.getAttribute('data-percentage');
            
            setTimeout(() => {
                // Create animated conic gradient
                let currentPercentage = 0;
                const targetPercentage = parseInt(percentage);
                const duration = 2000;
                const startTime = performance.now();
                
                const updateChart = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    currentPercentage = targetPercentage * this.easeOutCubic(progress);
                    
                    const angle = (currentPercentage / 100) * 360;
                    circle.style.background = `conic-gradient(
                        #1a237e 0deg,
                        #00695c ${angle}deg,
                        #e0e0e0 ${angle}deg,
                        #e0e0e0 360deg
                    )`;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateChart);
                    }
                };
                
                requestAnimationFrame(updateChart);
            }, index * 300);
        });
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// ============================================
// CONTACT FORM
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = document.querySelector('.btn-submit');
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addFormValidation();
        this.addFormAnimations();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        if (!this.validateForm(data)) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        this.setSubmitting(true);
        
        try {
            // Simulate form submission (replace with actual endpoint)
            await this.simulateSubmission(data);
            this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            this.setSubmitting(false);
        }
    }
    
    async simulateSubmission(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real application, you would send the data to your server
        console.log('Form data:', data);
        
        // Uncomment and configure for actual form submission
        /*
        const response = await fetch(CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Form submission failed');
        }
        */
    }
    
    validateForm(data) {
        return data.name && data.email && data.subject && data.message;
    }
    
    setSubmitting(isSubmitting) {
        this.isSubmitting = isSubmitting;
        this.submitButton.classList.toggle('loading', isSubmitting);
        this.submitButton.disabled = isSubmitting;
    }
    
    showMessage(message, type) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            messageElement.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 4000);
    }
    
    addFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isValid = field.required ? value !== '' : true;
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: #f44336;
                font-size: 0.75rem;
                margin-top: 0.25rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.style.opacity = '1';
        }, 10);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.opacity = '0';
            setTimeout(() => {
                errorElement.remove();
            }, 300);
        }
    }
    
    addFormAnimations() {
        const formGroups = this.form.querySelectorAll('.form-group');
        
        formGroups.forEach((group, index) => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                input.addEventListener('focus', () => {
                    group.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        group.classList.remove('focused');
                    }
                });
            }
        });
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.init();
    }
    
    init() {
        // Additional scroll-triggered animations
        window.addEventListener('scroll', throttle(() => {
            this.handleScrollEffects();
        }, 16));
        
        // Smooth reveal animations for elements without AOS
        this.initCustomAnimations();
    }
    
    handleScrollEffects() {
        // Parallax effect for hero background
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
        
        // Scale effect for project images
        const projectImages = document.querySelectorAll('.project-image');
        projectImages.forEach(image => {
            if (isElementInViewport(image, 0.2)) {
                const rect = image.getBoundingClientRect();
                const scrollProgress = Math.max(0, Math.min(1, 
                    1 - rect.top / window.innerHeight
                ));
                const scale = 1 + scrollProgress * 0.1;
                image.style.transform = `scale(${scale})`;
            }
        });
    }
    
    initCustomAnimations() {
        // Fade in elements on scroll
        const fadeElements = document.querySelectorAll('.fade-in');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.optimizeImages();
        this.preloadCriticalResources();
        this.setupServiceWorker();
    }
    
    optimizeImages() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    preloadCriticalResources() {
        // Preload critical fonts and resources
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }
    
    setupServiceWorker() {
        // Register service worker for caching (if needed)
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }
}

// ============================================
// ACCESSIBILITY FEATURES
// ============================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotion();
    }
    
    setupKeyboardNavigation() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: fixed;
            top: -100px;
            left: 0;
            background: #1a237e;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            z-index: 10001;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-100px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Enhanced keyboard navigation for interactive elements
        const interactiveElements = document.querySelectorAll(
            'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        interactiveElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && element.tagName === 'A') {
                    element.click();
                }
            });
        });
    }
    
    setupFocusManagement() {
        // Visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #1a237e !important;
                outline-offset: 2px !important;
            }
            
            .btn:focus {
                box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupScreenReaderSupport() {
        // Add ARIA labels where needed
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.textContent.trim() === '') {
                const icon = button.querySelector('i');
                if (icon && icon.className) {
                    button.setAttribute('aria-label', this.getAriaLabelFromIcon(icon.className));
                }
            }
        });
        
        // Add live region for dynamic content updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        // Store reference for dynamic announcements
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }
    
    setupReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Disable animations for users who prefer reduced motion
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getAriaLabelFromIcon(className) {
        const iconMap = {
            'fa-envelope': 'Email',
            'fa-phone': 'Phone',
            'fa-linkedin': 'LinkedIn',
            'fa-bars': 'Menu',
            'fa-times': 'Close',
            'fa-arrow-right': 'Next',
            'fa-arrow-left': 'Previous'
        };
        
        for (const [iconClass, label] of Object.entries(iconMap)) {
            if (className.includes(iconClass)) {
                return label;
            }
        }
        
        return 'Button';
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize the loading screen and other components
document.addEventListener('DOMContentLoaded', () => {
    new LoadingScreen();
    new PerformanceOptimizer();
    new AccessibilityEnhancer();
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    } else {
        // Resume animations when page becomes visible
        const particleSystem = window.particleSystem;
        if (particleSystem) {
            particleSystem.animate();
        }
    }
});

// Handle resize events
window.addEventListener('resize', debounce(() => {
    // Recalculate layouts if needed
    const event = new CustomEvent('portfolioResize');
    document.dispatchEvent(event);
}, 250));

// Export for debugging (remove in production)
if (typeof window !== 'undefined') {
    window.PortfolioDebug = {
        CONFIG,
        DYNAMIC_TITLES,
        particles,
        smoothScrollTo,
        isElementInViewport
    };
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);
    // Log to analytics service in production
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    // Log to analytics service in production
});

// ============================================
// ANALYTICS & TRACKING (Optional)
// ============================================

class Analytics {
    constructor() {
        this.events = [];
        this.init();
    }
    
    init() {
        this.trackScrollDepth();
        this.trackInteractions();
        this.trackPerformance();
    }
    
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();
        
        window.addEventListener('scroll', throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        this.track('scroll_depth', { percent: milestone });
                        tracked.add(milestone);
                    }
                });
            }
        }, 500));
    }
    
    trackInteractions() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button) {
                this.track('button_click', {
                    button_text: button.textContent.trim(),
                    button_class: button.className
                });
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contactForm') {
                this.track('form_submission', { form_id: 'contact' });
            }
        });
    }
    
    trackPerformance() {
        // Track page load time
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.track('page_performance', {
                    load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)
                });
            }, 0);
        });
    }
    
    track(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.events.push(event);
        console.log('Analytics Event:', event);
        
        // Send to analytics service in production
        // this.sendToAnalytics(event);
    }
    
    sendToAnalytics(event) {
        // Implementation for sending to analytics service
        // Example: Google Analytics, Mixpanel, etc.
    }
}

// Initialize analytics (optional)
if (window.location.hostname !== 'localhost') {
    new Analytics();
}