// Update your existing mobile menu JavaScript
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const overlay = document.querySelector('.overlay');
const closeSidebar = document.querySelector('.close-sidebar');
const body = document.body;

function toggleMobileMenu() {
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
    body.classList.toggle('sidebar-open');
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', toggleMobileMenu);
closeSidebar.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on a link
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});