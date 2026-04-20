// --- NAVBAR SCROLL (70% Transparent -> 95% la scroll) ---
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(8,10,13,0.95)'; 
      navbar.style.height = '70px';
    } else {
      navbar.style.background = 'rgba(8,10,13,0.7)'; 
      navbar.style.height = '80px';
    }
  }
});

// --- LOGICĂ SLIDER PREȚ INTERACTIV ---
const priceSlider = document.getElementById('price-range');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');

if (priceSlider && minPriceInput) {
    priceSlider.addEventListener('input', (e) => {
        minPriceInput.value = e.target.value;
    });
    minPriceInput.addEventListener('input', (e) => {
        priceSlider.value = e.target.value;
    });
}

// --- ANIMAȚIE CARDURI (Toate paginile) ---
const allCards = document.querySelectorAll('.cat-card, .product-card-custom, .valoare-card, .stat-box, .info-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

allCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  observer.observe(card);
});