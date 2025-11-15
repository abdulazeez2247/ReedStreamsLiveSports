// Enhanced hide on scroll script
class ScrollHideHeader {
    constructor(options = {}) {
        this.header = document.querySelector('.header');
        this.lastScrollTop = 0;
        this.scrollThreshold = options.scrollThreshold || 50;
        this.hideDelay = options.hideDelay || 300;
        this.mobileBreakpoint = options.mobileBreakpoint || 768;
        this.isHidden = false;
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        this.header.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease';
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        this.header.addEventListener('mouseenter', () => {
            this.showHeader();
        });
        
        document.addEventListener('touchstart', () => {
            this.showHeader();
        });
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - this.lastScrollTop;
        const isMobile = window.innerWidth < this.mobileBreakpoint;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        if (isMobile || scrollTop < 100) {
            this.showHeader();
            return;
        }
        
        if (scrollDelta > this.scrollThreshold && !this.isHidden) {
            this.hideHeader();
        } else if (scrollDelta < -this.scrollThreshold && this.isHidden) {
            this.showHeader();
        } else if (scrollDelta === 0 && this.isHidden) {
            this.timeout = setTimeout(() => {
                this.showHeader();
            }, this.hideDelay);
        }
        
        this.lastScrollTop = scrollTop;
    }
    
    hideHeader() {
        this.header.style.transform = 'translateY(-100%)';
        this.isHidden = true;
    }
    
    showHeader() {
        this.header.style.transform = 'translateY(0)';
        this.isHidden = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ScrollHideHeader({
        scrollThreshold: 50, 
        hideDelay: 1000,     
        mobileBreakpoint: 768
    });
});