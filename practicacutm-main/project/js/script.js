/* ==========================================================================
   1. INIȚIALIZARE ȘI ECRAN DE ÎNCĂRCARE (PRELOADER)
   ========================================================================== */
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-wrapper');
    if (loader) loader.classList.add('loader-hidden'); 
});

// Arată ecranul de încărcare la click pe link-uri (Tranziție fluidă)
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        const target = this.getAttribute('href');
        if (target && target.includes('.html') && !target.startsWith('#')) {
            e.preventDefault();
            const loader = document.querySelector('.loader-wrapper');
            if (loader) loader.classList.remove('loader-hidden'); 
            setTimeout(() => { window.location.href = target; }, 600);
        }
    });
});

/* ==========================================================================
   2. EFECTE NAVBAR & ANIMAȚII GLOBALE
   ========================================================================== */
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

// Animație de apariție pentru carduri la scroll (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cat-card, .product-card-custom, .valoare-card, .stat-box, .info-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.6s ease-out';
  observer.observe(card);
});

/* ==========================================================================
   3. LOGICĂ COȘ DE CUMPĂRĂTURI (GLOBAL)
   ========================================================================== */
let cart = JSON.parse(localStorage.getItem('v_energy_cart')) || [];

function updateCartBadge() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = cart.length;
        cartCountElement.innerText = count;
        cartCountElement.style.display = count > 0 ? 'block' : 'none';
    }
}

function renderCart() {
    const cartItemsBody = document.getElementById('cart-items-body');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table-container');
    const cartSummary = document.querySelector('.cart-summary-panel');
    const totalElement = document.getElementById('cart-total-value');

    if (!cartItemsBody) return; 

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (cartTable) cartTable.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (cartTable) cartTable.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsBody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price} LEI</td>
            <td><button class="btn-remove-item" onclick="removeFromCart(${index})">ȘTERGE</button></td>
        `;
        cartItemsBody.appendChild(row);
        total += item.price;
    });

    if (totalElement) totalElement.innerText = `${total} LEI`;
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('v_energy_cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
};

// Adăugare în coș din paginile de produse
document.querySelectorAll('.btn-add-custom').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name') || "Produs";
        const price = parseFloat(button.getAttribute('data-price')) || 0;
        cart.push({ id: Date.now(), name: name, price: price });
        localStorage.setItem('v_energy_cart', JSON.stringify(cart));
        updateCartBadge();

        const originalText = button.innerText;
        button.innerText = "ADĂUGAT!";
        button.classList.add('btn-added-success');
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove('btn-added-success');
        }, 1000);
    });
});

/* ==========================================================================
   4. LOGICĂ PAGINA PRODUSE (FILTRARE, SORTARE, PAGINARE)
   ========================================================================== */
let currentPage = 1;
const productsPerPage = 8;
let filteredProducts = [];

// Sincronizare Slider Preț
const priceSlider = document.getElementById('price-range');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
if (priceSlider && minPriceInput) {
    priceSlider.addEventListener('input', (e) => minPriceInput.value = e.target.value);
    minPriceInput.addEventListener('input', (e) => priceSlider.value = e.target.value);
}

// Funcția Centrală de Filtrare
const filterProducts = () => {
    const selectedCats = Array.from(document.querySelectorAll('.sidebar-sect .filter-group:nth-child(2) input:checked')).map(cb => cb.nextElementSibling.innerText);
    const selectedPowers = Array.from(document.querySelectorAll('.sidebar-sect .filter-group:nth-child(4) input:checked')).map(cb => cb.nextElementSibling.innerText);
    const selectedBrands = Array.from(document.querySelectorAll('.sidebar-sect .filter-group:nth-child(5) input:checked')).map(cb => cb.nextElementSibling.innerText);
    const maxPrice = parseInt(document.getElementById('price-range')?.value || 10000);

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase() || "";

    const allProducts = document.querySelectorAll('.product-card-custom');
    filteredProducts = []; 

    allProducts.forEach(card => {
        const cat = card.dataset.category;
        const price = parseInt(card.dataset.price);
        const brand = card.dataset.brand;
        const power = parseInt(card.dataset.power);
        const name = card.querySelector('h3').innerText.toLowerCase();

        const matchCat = selectedCats.length === 0 || selectedCats.includes(cat);
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
        const matchPrice = price <= maxPrice;
        const matchSearch = searchQuery === "" || name.includes(searchQuery);
        
        let matchPower = true;
        if (selectedPowers.length > 0) {
            matchPower = false;
            if (selectedPowers.includes("SUB 500W") && power < 500) matchPower = true;
            if (selectedPowers.includes("500W-1000W") && power >= 500 && power <= 1000) matchPower = true;
            if (selectedPowers.includes("PESTE 1000W") && power > 1000) matchPower = true;
        }

        if (matchCat && matchBrand && matchPrice && matchPower && matchSearch) {
            filteredProducts.push(card);
        } else {
            card.style.display = 'none'; 
        }
    });

    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) resultsCount.innerText = `${filteredProducts.length} PRODUSE GĂSITE`;

    displayPage(1); 
};

// Funcția de Paginare
function displayPage(page) {
    if (filteredProducts.length === 0) return;
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    currentPage = page;

    filteredProducts.forEach(p => p.style.display = 'none');

    const start = (page - 1) * productsPerPage;
    const end = page * productsPerPage;
    for (let i = start; i < end; i++) {
        if (filteredProducts[i]) filteredProducts[i].style.display = 'flex';
    }

    document.querySelectorAll('.page-number').forEach((btn, index) => {
        btn.classList.remove('active');
        btn.style.display = (index < totalPages) ? 'flex' : 'none'; 
        if (index + 1 === page) btn.classList.add('active');
    });
    
    const nextBtn = document.querySelector('.page-next');
    if (nextBtn) nextBtn.style.display = (currentPage >= totalPages) ? 'none' : 'flex';
}

// Evenimente Filtrare Produse
document.querySelectorAll('.sidebar-sect input').forEach(input => {
    input.addEventListener('change', filterProducts);
    input.addEventListener('input', filterProducts);
});

document.querySelector('.btn-reset-filt')?.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-sect input[type="checkbox"]').forEach(cb => cb.checked = false);
    if(document.getElementById('price-range')) document.getElementById('price-range').value = 10000;
    if(document.getElementById('max-price')) document.getElementById('max-price').value = 10000;
    window.history.replaceState({}, document.title, window.location.pathname); 
    filterProducts();
});

// Evenimente Butoane Paginare
document.querySelectorAll('.page-number').forEach((button, index) => {
    button.addEventListener('click', () => {
        displayPage(index + 1);
        window.scrollTo({ top: 400, behavior: 'smooth' }); 
    });
});

document.querySelector('.page-next')?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        displayPage(currentPage + 1);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    }
});

// Sortare Dropdown (TOP BAR)
document.querySelectorAll('.sort-select').forEach(select => {
    select.addEventListener('change', () => {
        if(select.id.includes('filter')) {
            filterProducts(); 
        } else {
            const sortVal = document.getElementById('sort-price')?.value;
            if (!sortVal || sortVal === 'default') return;
            filteredProducts.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price'));
                const priceB = parseInt(b.getAttribute('data-price'));
                return sortVal === 'asc' ? priceA - priceB : priceB - priceA;
            });
            filteredProducts.forEach(p => document.querySelector('.products-grid-custom').appendChild(p));
            displayPage(currentPage);
        }
    });
});

/* ==========================================================================
   5. BARA DE CĂUTARE (SEARCH OVERLAY)
   ========================================================================== */
document.addEventListener('click', (e) => {
    const isSearchBtn = e.target.closest('.icon-btn') && e.target.closest('.icon-btn').querySelector('img[alt="Search"]');
    if (isSearchBtn) {
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'flex';
            setTimeout(() => document.getElementById('search-input').focus(), 100);
        }
    }
});

window.executaCautare = function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const query = searchInput.value.trim();
        if (query !== "") {
            window.location.href = `produse.html?search=${encodeURIComponent(query)}`;
        }
    }
};

/* ==========================================================================
   6. MODAL CONECTARE & ÎNREGISTRARE (LOGIN)
   ========================================================================== */
const loginBtns = document.querySelectorAll('.btn-connect');
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

function afiseazaNumeUtilizator(nume) {
    const numeScurt = nume.split(' ')[0].toUpperCase(); 
    loginBtns.forEach(btn => {
        btn.innerText = numeScurt;
        btn.style.border = "1px solid var(--green)";
        btn.style.boxShadow = "0 0 10px rgba(0, 200, 150, 0.3)";
    });
}

if (loginOverlay) {
    // Deschide Modal Login
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.innerText === "CONECTARE") {
                e.preventDefault();
                loginOverlay.style.display = 'flex';
            }
        });
    });

    // Schimbă între Login și Înregistrare
    document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
        e.preventDefault(); loginSection.style.display = 'none'; registerSection.style.display = 'block';
    });
    document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
        e.preventDefault(); registerSection.style.display = 'none'; loginSection.style.display = 'block';
    });

    // Funcționalitate Submit Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = document.getElementById('login-email').value;
            const numeDinEmail = emailValue.split('@')[0]; 
            const btnSubmit = loginForm.querySelector('.btn-submit-form');
            
            btnSubmit.innerText = "TE-AI CONECTAT!";
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                afiseazaNumeUtilizator(numeDinEmail); 
                loginForm.reset();
                btnSubmit.innerText = "INTRĂ ÎN CONT";
            }, 1500);
        });
    }

    // Funcționalitate Submit Înregistrare
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const numeComplet = document.getElementById('reg-name').value; 
            const btnSubmit = registerForm.querySelector('.btn-submit-form');
            
            btnSubmit.innerText = "CONT CREAT!";
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                afiseazaNumeUtilizator(numeComplet); 
                registerForm.reset();
                btnSubmit.innerText = "ÎNREGISTREAZĂ-MĂ";
                registerSection.style.display = 'none';
                loginSection.style.display = 'block';
            }, 1500);
        });
    }
}

/* ==========================================================================
   7. FORMULARE SPECIFICE: ACHITARE (CHECKOUT) ȘI CONTACT
   ========================================================================== */
// Pagina Coș (Checkout)
const checkoutBtn = document.getElementById('btn-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const successMessage = document.getElementById('success-message');

if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Coșul tău este gol!");
        checkoutModal.style.display = 'flex';
        checkoutForm.style.display = 'block'; 
        successMessage.style.display = 'none'; 
    });

    document.querySelector('.close-modal')?.addEventListener('click', () => checkoutModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === checkoutModal) checkoutModal.style.display = 'none'; });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        checkoutForm.style.display = 'none';
        successMessage.style.display = 'block';
        cart = [];
        localStorage.setItem('v_energy_cart', JSON.stringify(cart));
        updateCartBadge(); renderCart();
        setTimeout(() => { checkoutModal.style.display = 'none'; window.location.href = "index.html"; }, 4000);
    });
}

// Pagina Contact
const contactFormMain = document.getElementById('contact-form-main');
if (contactFormMain) {
    contactFormMain.addEventListener('submit', (e) => {
        e.preventDefault();
        contactFormMain.style.display = 'none';
        document.getElementById('contact-success-msg').style.display = 'block';
    });
}

/* ==========================================================================
   8. START-UP SITE (LA ÎNCĂRCAREA CONȚINUTULUI)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
    
    // Declanșează filtrarea automată dacă există funcția și suntem pe pagina de produse
    if(document.querySelector('.products-grid-custom')) {
        filterProducts(); 
    }
});