(() => {
  // -----------------------------
  // Enhanced button interactions
  // -----------------------------
  
  // Add ripple effect to buttons
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Initialize ripple effects
  function initRipples() {
    document.querySelectorAll('.btn, .nav-item').forEach(button => {
      button.addEventListener('click', createRipple);
    });
  }
  
  // Smooth scroll for anchor links
  function initSmoothScroll() {
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
  }
  
  // Form validation enhancement
  function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
          } else {
            field.classList.remove('error');
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          // Show general error message
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'Пожалуйста, заполните все обязательные поля';
          form.insertBefore(errorMsg, form.firstChild);
          
          setTimeout(() => {
            errorMsg.remove();
          }, 5000);
        }
      });
    });
  }
  
  // Loading states for buttons
  function initLoadingStates() {
    document.querySelectorAll('[data-loading]').forEach(button => {
      button.addEventListener('click', function() {
        const originalText = this.textContent;
        this.classList.add('loading');
        this.disabled = true;
        this.textContent = 'Загрузка...';
        
        // Simulate loading completion (remove this in production)
        setTimeout(() => {
          this.classList.remove('loading');
          this.disabled = false;
          this.textContent = originalText;
        }, 2000);
      });
    });
  }
  
  // Initialize all features
  document.addEventListener('DOMContentLoaded', () => {
    initRipples();
    initSmoothScroll();
    initFormValidation();
    initLoadingStates();
  });
})();
