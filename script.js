import { createElement, clearElement, appendChildren } from './dom-helpers.js';
import { imageSliderData, testimonialsData, productShowcaseData } from './carousel-data.js';

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
        clearElement(this.container);
        
        // Main carousel structure
        const carouselMain = createElement('div', { className: 'carousel-main' });
        const carouselWrapper = createElement('div', { className: 'carousel-wrapper' });
        const carouselTrack = createElement('div', { 
            className: 'carousel-track', 
            id: `${this.container.id}-track` 
        });

        // Render slides
        this.renderSlides(carouselTrack);

        // Add arrows if enabled
        if (this.options.showArrows) {
            const prevBtn = createElement('button', {
                className: 'carousel-btn prev',
                'data-action': 'prev',
                innerHTML: '‹'
            });
            const nextBtn = createElement('button', {
                className: 'carousel-btn next',
                'data-action': 'next',
                innerHTML: '›'
            });
            appendChildren(carouselWrapper, [prevBtn, nextBtn]);
        }

        carouselWrapper.appendChild(carouselTrack);

        // Add dots if enabled
        if (this.options.showDots) {
            const dotsContainer = createElement('div', {
                className: 'carousel-dots',
                id: `${this.container.id}-dots`
            });
            carouselMain.appendChild(dotsContainer);
        }

        carouselMain.appendChild(carouselWrapper);
        this.container.appendChild(carouselMain);

        // Add preview slides if enabled
        if (this.options.showPreviews) {
            const prevPreview = createElement('div', {
                className: 'carousel-preview prev',
                'data-action': 'prev'
            });
            const nextPreview = createElement('div', {
                className: 'carousel-preview next',
                'data-action': 'next'
            });
            appendChildren(this.container, [prevPreview, nextPreview]);
        }

        // Cache DOM elements
        this.track = carouselTrack;
        this.slides = this.track.children;
        this.prevPreview = this.container.querySelector('.carousel-preview.prev');
        this.nextPreview = this.container.querySelector('.carousel-preview.next');

        if (this.options.showDots) {
            this.createDots();
        }
    }

    renderSlides(trackElement) {
        this.data.forEach(item => {
            const slide = createElement('div', { className: 'carousel-slide' });
            const content = this.createSlideContent(item);
            slide.appendChild(content);
            trackElement.appendChild(slide);
        });
    }

    createSlideContent(item) {
        if (item.type === 'image') {
            return createElement('img', {
                src: item.src,
                alt: item.alt || ''
            });
        } else if (item.type === 'card') {
            return this.createCardElement(item);
        }
        return createElement('div');
    }

    createCardElement(item) {
        const card = createElement('div', { className: 'card' });

        switch (item.template) {
            case 'testimonial':
                return this.createTestimonialCard(item.content);
            case 'product':
                return this.createProductCard(item.content);
            default:
                return this.createGenericCard(item.content);
        }
    }

    createTestimonialCard(content) {
        const card = createElement('div', { className: 'testimonial-card' });
        
        // Header with client info
        const header = createElement('div', { className: 'testimonial-header' });
        const clientPhoto = createElement('div', { className: 'client-photo' });
        const img = createElement('img', {
            src: content.photo,
            alt: content.name
        });
        clientPhoto.appendChild(img);
        
        const clientInfo = createElement('div', { className: 'client-info' });
        const name = createElement('h3', { textContent: content.name });
        const title = createElement('p', { 
            className: 'client-title',
            textContent: content.title 
        });
        const company = createElement('p', { 
            className: 'client-company',
            textContent: content.company 
        });
        
        appendChildren(clientInfo, [name, title, company]);
        appendChildren(header, [clientPhoto, clientInfo]);
        
        // Rating
        const rating = createElement('div', { className: 'testimonial-rating' });
        const stars = createElement('span', { 
            className: 'stars',
            textContent: this.createStarRating(content.rating)
        });
        rating.appendChild(stars);
        
        // Testimonial text
        const testimonialText = createElement('blockquote', {
            className: 'testimonial-text',
            textContent: content.testimonial
        });
        
        appendChildren(card, [header, rating, testimonialText]);
        return card;
    }

    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            stars += '☆';
        }
        
        // Add empty stars to make 5 total
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }

    createProductCard(content) {
        const card = createElement('div', { className: 'card product-card' });
        const image = createElement('img', {
            className: 'product-image',
            src: content.image,
            alt: content.title
        });
        const productInfo = createElement('div', { className: 'product-info' });
        const title = createElement('h3', { textContent: content.title });
        const description = createElement('p', { textContent: content.description });
        const price = createElement('div', {
            className: 'product-price',
            textContent: content.price
        });

        appendChildren(productInfo, [title, description, price]);
        appendChildren(card, [image, productInfo]);
        return card;
    }

    createGenericCard(content) {
        const card = createElement('div', { className: 'card' });
        if (content.title) {
            const title = createElement('h2', { textContent: content.title });
            card.appendChild(title);
        }
        if (content.description) {
            const description = createElement('p', { textContent: content.description });
            card.appendChild(description);
        }
        return card;
    }

    createDots() {
        const dotsContainer = this.container.querySelector('.carousel-dots');
        if (!dotsContainer) return;

        clearElement(dotsContainer);
        for (let i = 0; i < this.data.length; i++) {
            const dot = createElement('div', { className: 'dot' });
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        // Arrow buttons and preview clicks
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
        clearElement(this.prevPreview);
        clearElement(this.nextPreview);
        
        const prevContent = this.createSlideContent(this.data[prevIndex]);
        const nextContent = this.createSlideContent(this.data[nextIndex]);
        
        this.prevPreview.appendChild(prevContent);
        this.nextPreview.appendChild(nextContent);
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
        clearElement(this.container);
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