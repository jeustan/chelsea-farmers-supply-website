


function applyURLParameters() {
    const params = new URLSearchParams(window.location.search);
    
    const businessName = params.get('business');
    const primaryColor = params.get('primary');
    const titleFont = params.get('titleFont');
    const bodyFont = params.get('bodyFont');
    
    // Get palette colors from URL parameters
    const paletteColors = [];
    for (let i = 0; i < 10; i++) {
        const color = params.get(`color${i}`);
        if (color) {
            paletteColors.push(color.startsWith('#') ? color : `#${color}`);
        }
    }
    
    // Update business name
    if (businessName) {
        const nameElements = document.querySelectorAll('.business-name');
        if (nameElements.length > 0) {
            nameElements.forEach(el => {
                if (el) el.textContent = businessName;
            });
        }
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = businessName;
        }
    }
    
    // Update colors using palette if available, otherwise fallback to primary
    if (paletteColors.length > 0) {
        // Use generated palette colors
        if (paletteColors[0]) {
            document.documentElement.style.setProperty('--primary-color', paletteColors[0]);
        }
        if (paletteColors[1]) {
            document.documentElement.style.setProperty('--secondary-color', paletteColors[1]);
        }
        if (paletteColors[2]) {
            document.documentElement.style.setProperty('--accent-color', paletteColors[2]);
        }
        if (paletteColors[3]) {
            document.documentElement.style.setProperty('--tertiary-color', paletteColors[3]);
        }
        
        // Create a lighter version of primary for hover states if primary exists
        if (paletteColors[0]) {
            const lightPrimary = adjustBrightness(paletteColors[0], 15);
            if (lightPrimary) {
                document.documentElement.style.setProperty('--primary-light', lightPrimary);
            }
        }
        
    } else if (primaryColor) {
        // Fallback to single primary color
        const fullHex = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
        if (fullHex && fullHex.length >= 7) {
            document.documentElement.style.setProperty('--primary-color', fullHex);
        }
    }
    
    // Update fonts
    if (titleFont && typeof titleFont === 'string' && titleFont.trim()) {
        document.documentElement.style.setProperty('--heading-font', `'${titleFont}', serif`);
        document.documentElement.style.setProperty('--font-heading', `'${titleFont}', serif`);
    }
    
    if (bodyFont && typeof bodyFont === 'string' && bodyFont.trim()) {
        document.documentElement.style.setProperty('--body-font', `'${bodyFont}', sans-serif`);
        document.documentElement.style.setProperty('--font-body', `'${bodyFont}', sans-serif`);
    }
}

// Helper function to adjust brightness with safety checks
function adjustBrightness(hex, percent) {
    if (!hex || typeof hex !== 'string') return null;
    
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return null;
    
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return null;
    
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Apply parameters when page loads with error handling
try {
    document.addEventListener('DOMContentLoaded', applyURLParameters);
} catch (error) {
    console.warn('Error applying URL parameters:', error);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const isSign = this.classList.contains('sign-link');

        if(target && isSign) {
            accordionToggle(this.getAttribute("href"));
            const headerOffset = 180;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            console.log(headerOffset);
            scrollTo(offsetPosition);
        } else if (target && !isSign) {
            const headerOffset = 140;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            scrollTo(offsetPosition);
        }
    });

    function scrollTo(offset) {
        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    }
});


// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will contact you soon to discuss your demolition project.');
        this.reset();
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = `linear-gradient(135deg, ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')} 0%, ${getComputedStyle(document.documentElement).getPropertyValue('--secondary-header-color')} 100%)`;
        header.style.backdropFilter = 'blur(10px)';
        header.style.opacity = '0.95';
    } else {
        header.style.background = `linear-gradient(135deg, ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')} 0%, ${getComputedStyle(document.documentElement).getPropertyValue('--secondary-header-color')} 100%)`;
        header.style.backdropFilter = 'none';
        header.style.opacity = '1';
    }
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .about-content, .contact-content, .carousel-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Loading animation for page
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Initialize page
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.3s ease';

// Enhanced mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav ul');
    let isMenuOpen = false;
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                nav.classList.add('mobile-open');
                mobileMenuBtn.classList.add('active');
            } else {
                nav.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
            }
        });

        // Close menu when clicking on links
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
                isMenuOpen = false;
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
                isMenuOpen = false;
            }
        });
    }
});

// Enhanced form validation and submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        
        // Add real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
        
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form form');
    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateField);
            emailInput.addEventListener('input', clearError);
        }

        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    clearError({ target: field });

    // Validate based on field type
    switch(field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            case 'tel':
                const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
                if (value && !phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                default:
                    if (field.required && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
        }

    if (!isValid) {
        showError(field, errorMessage);
    }
    
    return isValid;
}

function clearError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    field.style.borderColor = '';
}

function showError(field, message) {
    field.style.borderColor = '#e74c3c';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.9rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    let isFormValid = true;
    
    // Validate all required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isFormValid = false;
        }
    });

    if (isFormValid) {
        // Show success message
        showSuccessMessage();
        form.reset();
    } else {
        // Show error message
        showFormError('Please correct the errors above and try again.');
    }
}

function showSuccessMessage() {
    const form = document.querySelector('.contact-form form');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
        border: 1px solid #c3e6cb;
        `;
        successDiv.innerHTML = `
        <strong>Thank you!</strong> Your message has been sent successfully. 
        We'll contact you soon to discuss your demolition project.
        `;
        
        form.insertBefore(successDiv, form.firstChild);
        
        // Remove success message after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

function showFormError(message) {
    const form = document.querySelector('.contact-form form');
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
    `;
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.firstChild);
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNewsletterError('Please enter a valid email address.');
        return;
    }
    
    // Show success message
    showNewsletterSuccess();
    form.reset();
}

function showNewsletterSuccess() {
    const form = document.querySelector('.newsletter-form form');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
    background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
        border: 1px solid #c3e6cb;
        `;
        successDiv.innerHTML = `
        <strong>Thank you!</strong> You've been subscribed to our newsletter.
        `;
        
        form.insertBefore(successDiv, form.firstChild);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

function showNewsletterError(message) {
    const form = document.querySelector('.newsletter-form form');
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
    background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
        `;
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.firstChild);
}

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let autoplayInterval;
    
    // Create indicators
    slides.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    function updateCarousel() {
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoplay();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });
    
    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            nextSlide();
            resetAutoplay();
        } else if (touchEndX - touchStartX > 50) {
            prevSlide();
            resetAutoplay();
        }
    }
    
    // Start autoplay
    startAutoplay();
    
    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.addEventListener('mouseleave', startAutoplay);
});

function closeAccordionItems() {
    document.querySelectorAll('.accordion-item').forEach(accItem => {
        accItem.classList.remove('active');
    });
}

// Sign text in footer navs to products accordion
function accordionToggle(category) {
    const header = document.querySelector(category);
    const item = header.parentElement;
    var isActive = item.classList.contains('active');

    if(isActive) {
        item.classList.remove("active");
        return;
    }

    // Close all accordion items
    closeAccordionItems();

    // Check again if active and apply active class
    isActive = item.classList.contains('active');
    if (!isActive) {
        item.classList.add('active');
    }
}

// Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const closeButtons = document.querySelectorAll('.close-accordion');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            accordionToggle(`#${header.id}`);
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAccordionItems();
        });
    });
});

// Utility function to ensure script compatibility
function ensureScriptCompatibility() {
    // Make sure all elements needed by the script exist
    if (!document.getElementById('page-title')) {
        console.warn('Page title element not found');
    }
    
    const businessNameElements = document.querySelectorAll('.business-name');
    if (businessNameElements.length === 0) {
        console.warn('Business name elements not found');
    }
    
    // Verify CSS custom properties are supported
    if (!CSS.supports('color', 'var(--primary-color)')) {
        console.warn('CSS custom properties not supported');
    }
}

function marqueeIndex() {
    const marqueeItems = document.querySelectorAll('.marquee__item');
    let i = 0;
    marqueeItems.forEach(item => {
        item.style.setProperty('--marquee-item-index', i);
        i++;
    })
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    ensureScriptCompatibility();
    marqueeIndex();

    // Apply any URL parameters that might already be present
    if (window.location.search) {
        applyURLParameters();
    }
});

async function loadDeferredIframe() {
    const sub = document.getElementById("subscribeStack");
    const map = document.getElementById("map-iframe");

    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

    if(sub) sub.src = 'https://chelseafarmerssupply.substack.com/embed';
    await yieldToMain();

    if(map) map.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1608.528046909094!2d-84.0224308770352!3d42.32006010989635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883ccc01ab9c8f33%3A0x7a8fb28bf5f296ec!2sChelsea%20Farmers%20Supply!5e0!3m2!1sen!2sus!4v1769795936137!5m2!1sen!2sus";
    await yieldToMain();
    
    function tryRSS() {
        if(typeof embedSubstackRSS === "function") {
            embedSubstackRSS();
        } else {
            setTimeout(tryRSS, 200);
        }
    }
    tryRSS();
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        loadDeferredIframe(); 
    }, 50);
});