/**
 * Presentation Controller
 * Handles navigation, keyboard controls, and animations
 */

class Presentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.nav-btn.prev');
        this.nextBtn = document.querySelector('.nav-btn.next');
        this.currentDisplay = document.querySelector('.slide-counter .current');
        this.totalDisplay = document.querySelector('.slide-counter .total');
        this.progressFill = document.querySelector('.progress-fill');
        
        // Restore last viewed slide from localStorage
        const savedSlide = localStorage.getItem('currentSlide');
        this.currentSlide = savedSlide ? parseInt(savedSlide) : 1;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        
        // Validate saved slide number
        if (this.currentSlide < 1 || this.currentSlide > this.totalSlides) {
            this.currentSlide = 1;
        }
        
        this.init();
    }
    
    init() {
        // Set total slides
        this.totalDisplay.textContent = this.totalSlides;
        
        // Event listeners
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Dot navigation
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideNum = parseInt(e.target.dataset.slide);
                this.goTo(slideNum);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe support
        this.initTouchSupport();
        
        // Mouse wheel support
        this.initWheelSupport();
        
        // Restore saved slide position
        if (this.currentSlide !== 1) {
            // Remove active from first slide
            this.slides[0].classList.remove('active');
            // Add active to saved slide
            this.slides[this.currentSlide - 1].classList.add('active');
        }
        
        // Update initial state
        this.updateUI();
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.next();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.prev();
                break;
            case 'Home':
                e.preventDefault();
                this.goTo(1);
                break;
            case 'End':
                e.preventDefault();
                this.goTo(this.totalSlides);
                break;
        }
    }
    
    initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }
    
    initWheelSupport() {
        let wheelTimeout = null;
        
        document.addEventListener('wheel', (e) => {
            if (wheelTimeout) return;
            
            wheelTimeout = setTimeout(() => {
                wheelTimeout = null;
            }, 800);
            
            if (e.deltaY > 0) {
                this.next();
            } else {
                this.prev();
            }
        }, { passive: true });
    }
    
    next() {
        if (this.isAnimating || this.currentSlide >= this.totalSlides) return;
        this.goTo(this.currentSlide + 1);
    }
    
    prev() {
        if (this.isAnimating || this.currentSlide <= 1) return;
        this.goTo(this.currentSlide - 1);
    }
    
    goTo(slideNum) {
        if (this.isAnimating || slideNum === this.currentSlide) return;
        if (slideNum < 1 || slideNum > this.totalSlides) return;
        
        this.isAnimating = true;
        
        const goingForward = slideNum > this.currentSlide;
        const currentSlideEl = this.slides[this.currentSlide - 1];
        const targetSlideEl = this.slides[slideNum - 1];
        
        // Remove active from current slide
        currentSlideEl.classList.remove('active');
        
        // Set exit direction for current slide
        if (goingForward) {
            currentSlideEl.classList.add('exit-left');
        } else {
            currentSlideEl.classList.add('exit-right');
        }
        
        // Set entry direction for target slide
        if (goingForward) {
            targetSlideEl.classList.add('enter-right');
        } else {
            targetSlideEl.classList.add('enter-left');
        }
        
        // Small delay to trigger transition
        requestAnimationFrame(() => {
            targetSlideEl.classList.remove('enter-right', 'enter-left');
            targetSlideEl.classList.add('active');
        });
        
        this.currentSlide = slideNum;
        
        // Save to localStorage
        localStorage.setItem('currentSlide', this.currentSlide);
        
        this.updateUI();
        
        // Reset animation lock
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('exit-left', 'exit-right', 'enter-left', 'enter-right');
            });
            this.isAnimating = false;
        }, 400);
    }
    
    updateUI() {
        // Update counter
        this.currentDisplay.textContent = this.currentSlide;
        
        // Update progress bar
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide - 1);
        });
        
        // Update button states
        this.prevBtn.style.opacity = this.currentSlide === 1 ? '0.5' : '1';
        this.nextBtn.style.opacity = this.currentSlide === this.totalSlides ? '0.5' : '1';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Presentation();
});

// Add subtle parallax effect to emojis on mouse move
document.addEventListener('mousemove', (e) => {
    const emojis = document.querySelectorAll('.slide.active .emoji-3d');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    emojis.forEach(emoji => {
        if (!emoji.classList.contains('floating')) {
            emoji.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        }
    });
});

