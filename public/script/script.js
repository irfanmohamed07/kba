// Dropdown Toggle Function
function toggleDropdown() {
    var dropdown = document.getElementById('dropdown-menu');
    var isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        var rect = dropdown.getBoundingClientRect();
        var viewportWidth = window.innerWidth;

        if (rect.left) {
            dropdown.style.left = 'auto';
            dropdown.style.right = 0;
        }
    }
}

// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuToggle = document.getElementById('mobile-menu-toggle');

    mobileNav.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const userProfile = document.querySelector('.user-profile');

    if (dropdown && userProfile) {
        if (!userProfile.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function () {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileNav = document.getElementById('mobile-nav');
    const menuToggle = document.getElementById('mobile-menu-toggle');

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (mobileNav) mobileNav.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        });
    });

    // Hero Slideshow
    let heroSlideIndex = 0;
    const heroSlides = document.querySelectorAll('.hero-slide');

    if (heroSlides.length > 0) {
        showHeroSlides();
    }

    function showHeroSlides() {
        heroSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        heroSlideIndex++;
        if (heroSlideIndex > heroSlides.length) {
            heroSlideIndex = 1;
        }

        heroSlides[heroSlideIndex - 1].classList.add('active');
        setTimeout(showHeroSlides, 4000); // Change slide every 4 seconds
    }

    // Old slideshow for other pages (backward compatibility)
    let slideIndex = 0;
    const oldSlides = document.querySelectorAll('.slide');

    if (oldSlides.length > 0 && !document.querySelector('.hero-section')) {
        showSlides();
    }

    function showSlides() {
        for (let i = 0; i < oldSlides.length; i++) {
            oldSlides[i].style.display = "none";
        }

        slideIndex++;
        if (slideIndex > oldSlides.length) {
            slideIndex = 1;
        }

        oldSlides[slideIndex - 1].style.display = "block";
        setTimeout(showSlides, 2000);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
