class ReusableCarousel {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.options = {
            autoPlay: options.autoPlay !== false,
            autoPlayDelay: options.autoPlayDelay || 3000,
            showPreviews: options.showPreviews !== false,
            showDots: options.showDots !== false,
            showArrows: options.showArrows !== false,
            ...options
        };
        
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isAutoPlaying = this.options.autoPlay;

        this.init();
    }

    init() {
        this.renderCarousel();
        this.bindEvents();
        this.updateCarousel();
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    renderCarousel() {
        // Generate HTML structure
        this.container.innerHTML = `
            <div class="carousel-main">
                <div class="carousel-wrapper">
                    <div class="carousel-track" id="${this.container.id}-track">
                        ${this.renderSlides()}
                    </div>
                    ${this.options.showArrows ? this.renderArrows() : ''}
                </div>
                ${this.options.showDots ? '<div class="carousel-dots" id="' + this.container.id + '-dots"></div>' : ''}
            </div>
            ${this.options.showPreviews ? this.renderPreviews() : ''}
        `;

        // Cache DOM elements
        this.track = this.container.querySelector('.carousel-track');
        this.slides = this.track.children;
        this.prevPreview = this.container.querySelector('.carousel-preview.prev');
        this.nextPreview = this.container.querySelector('.carousel-preview.next');

        if (this.options.showDots) {
            this.createDots();
        }
    }

    renderSlides() {
        return this.data.map(item => `
            <div class="carousel-slide">
                ${this.renderSlideContent(item)}
            </div>
        `).join('');
    }

    renderSlideContent(item) {
        if (item.type === 'image') {
            return `<img src="${item.src}" alt="${item.alt || ''}" />`;
        } else if (item.type === 'card') {
            return this.renderCardTemplate(item);
        }
        return '';
    }

    renderCardTemplate(item) {
        switch (item.template) {
            case 'testimonial':
                return `
                    <div class="card testimonial-card">
                        <div class="testimonial-content">
                            <div class="quote-icon">"</div>
                            <p class="testimonial-quote">${item.content.quote}</p>
                            <div class="testimonial-author">
                                <img src="${item.content.avatar}" alt="${item.content.author}" class="author-avatar">
                                <div class="author-info">
                                    <h4>${item.content.author}</h4>
                                    <span>${item.content.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            case 'product':
                return `
                    <div class="card product-card">
                        <img src="${item.content.image}" alt="${item.content.title}" class="product-image">
                        <div class="product-info">
                            <h3>${item.content.title}</h3>
                            <p>${item.content.description}</p>
                            <div class="product-price">${item.content.price}</div>
                        </div>
                    </div>
                `;
            default:
                return `
                    <div class="card">
                        ${item.content.title ? `<h2>${item.content.title}</h2>` : ''}
                        ${item.content.description ? `<p>${item.content.description}</p>` : ''}
                    </div>
                `;
        }
    }

    renderArrows() {
        return `
            <button class="carousel-btn prev" data-action="prev">‹</button>
            <button class="carousel-btn next" data-action="next">›</button>
        `;
    }

    renderPreviews() {
        return `
            <div class="carousel-preview prev" data-action="prev"></div>
            <div class="carousel-preview next" data-action="next"></div>
        `;
    }

    createDots() {
        const dotsContainer = this.container.querySelector('.carousel-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        for (let i = 0; i < this.data.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        // Arrow buttons
        this.container.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'prev') this.prevSlide();
            if (action === 'next') this.nextSlide();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Pause auto-play on hover
        if (this.options.autoPlay) {
            const mainContainer = this.container.querySelector('.carousel-main');
            mainContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
            mainContainer.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
    }

    updateCarousel() {
        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update dots
        if (this.options.showDots) {
            const dots = this.container.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }

        // Update preview slides
        if (this.options.showPreviews) {
            this.updatePreviews();
        }
    }

    updatePreviews() {
        if (!this.prevPreview || !this.nextPreview) return;

        const totalSlides = this.data.length;
        const prevIndex = (this.currentIndex - 1 + totalSlides) % totalSlides;
        const nextIndex = (this.currentIndex + 1) % totalSlides;

        // Update preview content
        this.prevPreview.innerHTML = this.renderSlideContent(this.data[prevIndex]);
        this.nextPreview.innerHTML = this.renderSlideContent(this.data[nextIndex]);
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.data.length;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.data.length) % this.data.length;
        this.updateCarousel();
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), this.options.autoPlayDelay);
        this.isAutoPlaying = true;
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    pauseAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }
    }

    resumeAutoPlay() {
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    // Public methods for external control
    destroy() {
        this.stopAutoPlay();
        this.container.innerHTML = '';
    }

    updateData(newData) {
        this.data = newData;
        this.currentIndex = 0;
        this.renderCarousel();
        this.bindEvents();
        this.updateCarousel();
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }
}

// Initialize carousels when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Image slider example
    new ReusableCarousel('image-carousel', imageSliderData, {
        autoPlay: true,
        autoPlayDelay: 4000
    });

    // Testimonials carousel
    new ReusableCarousel('testimonials-carousel', testimonialsData, {
        autoPlay: true,
        autoPlayDelay: 5000
    });

    // Product showcase (no auto-play)
    new ReusableCarousel('products-carousel', productShowcaseData, {
        autoPlay: false,
        showPreviews: true
    });
});