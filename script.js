// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Mobile dropdown functionality
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const dropdownLink = dropdown.querySelector('a');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    
    dropdownLink.addEventListener('click', (e) => {
        // Only handle on mobile devices
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Close all dropdowns
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Animate elements on scroll
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

// Observe all cards and sections
document.querySelectorAll('.course-card, .feature-card, .program-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Contact form handling for Formspree
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
    const phoneInput = contactForm.querySelector('input[type="tel"]');
    
    // Format phone number as user types
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
        
        // Validate phone number on blur
        phoneInput.addEventListener('blur', function() {
            validatePhoneNumber(this);
        });
    }
    
    // Handle form submission for Formspree (AJAX)
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Get form data
        const name = this.querySelector('#name').value;
        const email = this.querySelector('#email').value;
        const phone = this.querySelector('#phone').value;
        const course = this.querySelector('#course').value;
        const message = this.querySelector('#message').value;
        
        // Simple validation (re-checking here for client-side feedback)
        if (!name || !email || !message || !course) { // Added course to validation
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        if (phoneInput && !validatePhoneNumber(phoneInput)) {
            phoneInput.focus();
            return;
        }
        
        // Disable button and show sending status
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(this); // Get form data
            const response = await fetch(this.action, { // Use form's action attribute
                method: this.method,
                body: formData,
                headers: {
                    'Accept': 'application/json' // Essential for Formspree AJAX
                }
            });

            if (response.ok) {
                showNotification('Thank you! Your message has been sent successfully. We will contact you soon.', 'success');
                this.reset(); // Clear form fields
            } else {
                const data = await response.json();
                if (data.errors) {
                    showNotification('Form submission failed: ' + data.errors.map(err => err.field + ' ' + err.message).join(', '), 'error');
                } else {
                    showNotification('Form submission failed. Please try again later.', 'error');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('An error occurred during submission. Please check your internet connection and try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info', actionButton = null) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            ${actionButton ? `<button class="notification-action-btn">${actionButton.text}</button>` : ''}
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;

    if (actionButton) {
        const actionBtnElement = notification.querySelector('.notification-action-btn');
        actionBtnElement.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease;
        `;
        actionBtnElement.addEventListener('click', () => {
            actionButton.onClick();
            notification.remove(); // Close notification after clicking download
        });
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 7 seconds (longer for download prompt)
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 7000);
}

// Enquiry button functionality - Enhanced version
function initializeEnquiryButton() {
    const enquiryBtn = document.querySelector('.enquiry-btn');
    if (enquiryBtn) {
        console.log('Enquiry button found and event listener added');
        
        // Remove any existing event listeners to prevent duplicates
        enquiryBtn.removeEventListener('click', handleEnquiryClick);
        enquiryBtn.addEventListener('click', handleEnquiryClick);
    } else {
        console.log('Enquiry button not found');
    }
}

function handleEnquiryClick() {
    console.log('Enquiry button clicked');
    
    // Check if we're on the homepage (index.html) based on the current URL pathname
    const currentPathname = window.location.pathname;
    const isHomePage = currentPathname.endsWith('/') || currentPathname.endsWith('/index.html') || currentPathname.endsWith('/index.htm');

    if (isHomePage) {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            console.log('On homepage, scrolling to contact section');
            contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            console.log('On homepage, but contact section not found. No action needed for scroll.');
        }
    } else {
        // Not on the homepage, redirect to homepage and then scroll to contact section
        console.log('Not on homepage, redirecting to homepage contact section');
        let redirectPath = 'index.html#contact'; // Default for pages in root like blog.html, gallery.html

        // If the current page is in a subdirectory (e.g., courses/english-spoken-classes.html)
        if (currentPathname.includes('/courses/')) {
            redirectPath = '../index.html#contact';
        }
        window.location.href = redirectPath;
    }
}

// Initialize enquiry button when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnquiryButton);
} else {
    initializeEnquiryButton();
}

// Also try to initialize after a short delay to ensure everything is loaded
setTimeout(initializeEnquiryButton, 100);

// CTA Button (General) - this handles the 'Call Us to Consult Now' on homepage and 'Call Us' on course pages
const ctaBtns = document.querySelectorAll('.cta-btn');

ctaBtns.forEach(btn => {
    // Remove existing listeners to prevent duplicates if script is re-run
    btn.removeEventListener('click', handleCtaButtonClick);
    btn.addEventListener('click', handleCtaButtonClick);
});

function handleCtaButtonClick() {
    if (this.classList.contains('secondary')) {
        // This is a 'Call Us' button, initiate phone call
        window.location.href = 'tel:+917759810531';
        showNotification('Calling +91 7759-810-531...', 'info');
    } else if (this.classList.contains('course-enroll-btn')) {
        // This is an 'Enroll Now' button, redirect to contact section
        const currentPathname = window.location.pathname;
        let redirectPath = 'index.html#contact'; // Default for pages in root like blog.html, gallery.html

        if (currentPathname.includes('/courses/')) {
            redirectPath = '../index.html#contact';
        }
        window.location.href = redirectPath;
    } else if (this.textContent.includes('Call Us to Consult Now')) {
        // This is the main CTA on homepage, initiate phone call
        window.location.href = 'tel:+917759810531';
        showNotification('Calling +91 7759-810-531...', 'info');
    }
}

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('h3');
            const text = statNumber.textContent;
            const number = parseInt(text.replace(/[^\d]/g, ''));
            
            if (number) {
                statNumber.textContent = '0';
                animateCounter(statNumber, number);
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Show PDF download notification on homepage load
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    if (isHomePage) {
        showNotification('Download our brochure for more details!', 'info', {
            text: 'Download Brochure',
            onClick: () => {
                const downloadLink = document.createElement('a');
                downloadLink.href = 'ideal_eyes_brochure.pdf';
                downloadLink.target = '_blank';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        });
    }
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
    }
});

// Add hover effects for course cards
document.querySelectorAll('.course-card, .program-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click effects for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add scroll to top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to scroll to top button
scrollToTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-3px) scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
});

console.log('Ideal Eyes website clone loaded successfully! 🎓');

// Mobile Number Validation and Formatting
function formatPhoneNumber(input) {
    // Remove all non-digit characters except +, -, (, ), and spaces
    let value = input.value.replace(/[^\d\s\+\-\(\)]/g, '');
    
    // Ensure it starts with +91 for Indian numbers if not already present
    if (!value.startsWith('+') && value.length > 0) {
        if (value.startsWith('91') && value.length > 2) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+91' + value.substring(1);
        } else if (value.length >= 10 && !value.startsWith('91')) {
            value = '+91' + value;
        }
    }
    
    // Format the number for better readability
    if (value.startsWith('+91')) {
        const number = value.substring(3).replace(/\D/g, '');
        if (number.length >= 10) {
            // Format as +91 98765-43210
            const formatted = '+91 ' + number.substring(0, 5) + '-' + number.substring(5, 10);
            input.value = formatted;
        } else {
            input.value = value;
        }
    } else {
        input.value = value;
    }
}

// Phone number validation
function validatePhoneNumber(input) {
    const phoneRegex = /^(\+91\s)?[0-9]{5}-[0-9]{5}$|^(\+91\s)?[0-9]{10}$|^[0-9]{10}$/;
    const value = input.value.trim();
    
    if (value === '') {
        input.setCustomValidity('Phone number is required');
        return false;
    }
    
    if (!phoneRegex.test(value)) {
        input.setCustomValidity('Please enter a valid 10-digit phone number (e.g., +91 98765-43210 or 9876543210)');
        return false;
    }
    
    input.setCustomValidity('');
    return true;
}

// Add CSS for better form styling
const formStyles = document.createElement('style');
formStyles.textContent = `
    .contact-form input[type="tel"]:invalid {
        border-color: #ff4444;
    }
    
    .contact-form input[type="tel"]:valid {
        border-color: #4CAF50;
    }
    
    .contact-form input[type="tel"]:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
    
    .contact-form input::placeholder {
        color: #999;
        font-size: 0.9rem;
    }
    
    .contact-form input[type="tel"]::placeholder {
        color: #999;
        font-size: 0.85rem;
    }
`;
document.head.appendChild(formStyles); 