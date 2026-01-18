/**
 * Scroll animation utility using IntersectionObserver
 * Applies 'visible' class to elements with data-scroll attribute when they enter viewport
 */

export function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with data-scroll attribute
  const elements = document.querySelectorAll('[data-scroll]');
  elements.forEach((el) => observer.observe(el));
}

// Initialize on DOM load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
}
