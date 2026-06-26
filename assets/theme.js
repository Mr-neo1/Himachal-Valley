/* ============================================
   HIMACHAL VALLEY — Theme JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---- Sticky Header ---- */
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  /* ---- Mobile Menu ---- */
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileClose = mobileMenu?.querySelector('.mobile-menu__close');
  const mobileOverlay = mobileMenu?.querySelector('.mobile-menu__overlay');

  function openMobileMenu() {
    mobileMenu?.classList.add('open');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileMenu?.classList.remove('open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', openMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);

  /* ---- Search Bar ---- */
  const searchBar = document.getElementById('search-bar');
  const searchToggle = document.getElementById('search-toggle');
  const searchClose = document.getElementById('search-close');

  searchToggle?.addEventListener('click', () => {
    searchBar?.classList.toggle('open');
    searchBar?.setAttribute('aria-hidden', searchBar.classList.contains('open') ? 'false' : 'true');
    if (searchBar?.classList.contains('open')) {
      searchBar.querySelector('input')?.focus();
    }
  });
  searchClose?.addEventListener('click', () => {
    searchBar?.classList.remove('open');
    searchBar?.setAttribute('aria-hidden', 'true');
  });

  /* ---- Cart Drawer ---- */
  const cartDrawer = document.getElementById('cart-drawer');
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = cartDrawer?.querySelector('.cart-drawer__close');
  const cartOverlay = cartDrawer?.querySelector('.cart-drawer__overlay');
  const cartCount = document.getElementById('cart-count');
  const cartBody = document.getElementById('cart-drawer-body');
  const cartSubtotal = document.getElementById('cart-subtotal');

  function openCartDrawer() {
    cartDrawer?.classList.add('open');
    cartDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    fetchCart();
  }
  function closeCartDrawer() {
    cartDrawer?.classList.remove('open');
    cartDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cartToggle?.addEventListener('click', openCartDrawer);
  cartClose?.addEventListener('click', closeCartDrawer);
  cartOverlay?.addEventListener('click', closeCartDrawer);

  /* ---- Fetch & Render Cart ---- */
  function fetchCart() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        updateCartCount(cart.item_count);
        renderCartItems(cart);
        if (cartSubtotal) {
          cartSubtotal.textContent = formatMoney(cart.total_price);
        }
      })
      .catch(console.error);
  }

  function updateCartCount(count) {
    if (!cartCount) return;
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
  }

  function formatMoney(cents) {
    return '₹' + (cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 });
  }

  function renderCartItems(cart) {
    if (!cartBody) return;
    if (cart.item_count === 0) {
      cartBody.innerHTML = `
        <div class="cart-drawer__empty">
          <svg class="cart-drawer__empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3>Your cart is empty</h3>
          <p>Add some delicious honey to get started!</p>
          <a href="/collections/all" class="btn btn--primary" style="margin-top:16px;" onclick="closeCartDrawer()">Shop Now</a>
        </div>`;
      return;
    }
    cartBody.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.product_title}" class="cart-item__img" loading="lazy">
        <div class="cart-item__info">
          <p class="cart-item__title">${item.product_title}</p>
          ${item.variant_title !== 'Default Title' ? `<p class="cart-item__variant">${item.variant_title}</p>` : ''}
          <div class="cart-item__bottom">
            <div class="cart-item__qty">
              <button class="cart-item__qty-btn" onclick="updateCartItem('${item.key}', ${item.quantity - 1})" aria-label="Decrease">−</button>
              <span class="cart-item__qty-val">${item.quantity}</span>
              <button class="cart-item__qty-btn" onclick="updateCartItem('${item.key}', ${item.quantity + 1})" aria-label="Increase">+</button>
            </div>
            <span class="cart-item__price">${formatMoney(item.line_price)}</span>
          </div>
          <button class="cart-item__remove" onclick="updateCartItem('${item.key}', 0)">Remove</button>
        </div>
      </div>`).join('');
  }

  /* ---- Add to Cart ---- */
  window.addToCart = function (variantId, quantity = 1, btn) {
    if (btn) {
      btn.textContent = 'Adding...';
      btn.disabled = true;
    }
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    })
      .then(r => r.json())
      .then(() => {
        fetchCart();
        openCartDrawer();
        if (btn) {
          btn.textContent = 'Added!';
          setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.disabled = false;
          }, 2000);
        }
      })
      .catch(err => {
        console.error(err);
        if (btn) {
          btn.textContent = 'Error — try again';
          btn.disabled = false;
        }
      });
  };

  /* ---- Update Cart Item ---- */
  window.updateCartItem = function (key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    })
      .then(r => r.json())
      .then(cart => {
        updateCartCount(cart.item_count);
        renderCartItems(cart);
        if (cartSubtotal) cartSubtotal.textContent = formatMoney(cart.total_price);
      })
      .catch(console.error);
  };

  /* ---- Add to Cart Form (Product Page) ---- */
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const variantId = document.getElementById('variant-id')?.value;
      const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
      const btn = this.querySelector('.product-page__atc');
      if (variantId) addToCart(parseInt(variantId), quantity, btn);
    });
  }

  /* ---- Collection Sidebar Toggle ---- */
  const filterToggle = document.getElementById('filter-toggle');
  const sidebar = document.getElementById('collection-sidebar');
  filterToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  /* ---- View Toggle (Grid/List) ---- */
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('view-btn--active'));
      this.classList.add('view-btn--active');
      const grid = document.getElementById('products-grid');
      if (grid) {
        grid.dataset.view = this.dataset.view;
        if (this.dataset.view === 'list') {
          grid.style.gridTemplateColumns = '1fr';
        } else {
          grid.style.gridTemplateColumns = '';
        }
      }
    });
  });

  /* ---- Testimonials Slider ---- */
  const slider = document.getElementById('testimonials-slider');
  if (slider) {
    const cards = slider.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('testimonials-dots');
    const prevBtn = slider.querySelector('.testimonials__nav--prev');
    const nextBtn = slider.querySelector('.testimonials__nav--next');
    const perPage = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 2 : 1;
    const totalPages = Math.ceil(cards.length / perPage);
    let currentPage = 0;

    if (totalPages > 1 && dotsContainer) {
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'testimonials__dot' + (i === 0 ? ' testimonials__dot--active' : '');
        dot.setAttribute('aria-label', `Go to page ${i + 1}`);
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
      }
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
    }

    function goToPage(page) {
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      const track = slider.querySelector('.testimonials__track');
      if (track) {
        track.style.transform = `translateX(-${currentPage * 100 / totalPages}%)`;
      }
      dotsContainer?.querySelectorAll('.testimonials__dot').forEach((d, i) => {
        d.classList.toggle('testimonials__dot--active', i === currentPage);
      });
    }

    prevBtn?.addEventListener('click', () => goToPage(currentPage > 0 ? currentPage - 1 : totalPages - 1));
    nextBtn?.addEventListener('click', () => goToPage(currentPage < totalPages - 1 ? currentPage + 1 : 0));

    // Auto-advance
    let autoPlay = setInterval(() => goToPage(currentPage < totalPages - 1 ? currentPage + 1 : 0), 5000);
    slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
    slider.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goToPage(currentPage < totalPages - 1 ? currentPage + 1 : 0), 5000);
    });
  }

  /* ---- Announcement Bar Scroll Ticker ---- */
  const announcementText = document.querySelector('.announcement-bar__text');
  if (announcementText && announcementText.offsetWidth > announcementText.parentElement.offsetWidth) {
    announcementText.style.animation = 'ticker 20s linear infinite';
  }

  /* ---- Intersection Observer Animations ---- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, .product-card, .why-choose__item, .testimonial-card, .process__step').forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  /* ---- Price Filter ---- */
  window.applyPriceFilter = function () {
    const min = document.getElementById('price-min')?.value;
    const max = document.getElementById('price-max')?.value;
    const params = new URLSearchParams(window.location.search);
    if (min) params.set('filter.v.price.gte', min);
    if (max) params.set('filter.v.price.lte', max);
    window.location.search = params.toString();
  };

  /* ---- Escape Key Handler ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeCartDrawer();
      if (searchBar?.classList.contains('open')) {
        searchBar.classList.remove('open');
        searchBar.setAttribute('aria-hidden', 'true');
      }
    }
  });

  /* ---- Fetch cart on page load to update count ---- */
  fetchCart();

  /* ---- Smooth anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
