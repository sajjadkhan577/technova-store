  // ---------- PRODUCT DATABASE ----------
  const products = [
    { id: 1, name: "ZenBook Pro 15", price: 1499, category: "Laptops", description: "Ultra-slim OLED laptop, Intel i9, 32GB RAM, premium design.", image: "https://picsum.photos/id/0/300/200" },
    { id: 2, name: "NovaBook Air", price: 999, category: "Laptops", description: "Lightweight, all-day battery, perfect for creators.", image: "https://picsum.photos/id/1/300/200" },
    { id: 3, name: "SonicWave Pro", price: 349, category: "Headphones", description: "Noise cancelling, 40h battery, spatial audio.", image: "https://picsum.photos/id/20/300/200" },
    { id: 4, name: "AuraBuds X2", price: 199, category: "Headphones", description: "True wireless earbuds, adaptive EQ.", image: "https://picsum.photos/id/21/300/200" },
    { id: 5, name: "Chronos Watch S8", price: 399, category: "Smart Watches", description: "Fitness tracking, ECG, always-on display.", image: "https://picsum.photos/id/22/300/200" },
    { id: 6, name: "Nova Loop", price: 279, category: "Smart Watches", description: "Hybrid smartwatch, 2-week battery.", image: "https://picsum.photos/id/23/300/200" },
    { id: 7, name: "MagStand Pro", price: 59, category: "Accessories", description: "Magnetic laptop stand, ergonomic aluminum.", image: "https://picsum.photos/id/24/300/200" },
    { id: 8, name: "HyperDrive Hub", price: 89, category: "Accessories", description: "8-in-1 USB-C hub, 4K HDMI, SD card slot.", image: "https://picsum.photos/id/26/300/200" }
  ];

  // Cart handling
  let cart = JSON.parse(localStorage.getItem("technova_cart")) || [];
  function saveCart() { localStorage.setItem("technova_cart", JSON.stringify(cart)); updateCartUI(); }
  function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartCountBadge").innerText = count;
    if (window.currentSection === "cart") renderCartPage();
  }
  function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toast-popup";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // Theme handling
  const savedTheme = localStorage.getItem("technova_theme");
  let currentTheme = savedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      document.getElementById("themeToggleBtn").innerHTML = '<i class="fas fa-sun"></i>';
      document.getElementById("themeModeLabel").innerText = "Light mode";
    } else {
      document.body.classList.remove("light-theme");
      document.getElementById("themeToggleBtn").innerHTML = '<i class="fas fa-moon"></i>';
      document.getElementById("themeModeLabel").innerText = "Dark mode";
    }
    localStorage.setItem("technova_theme", theme);
  }
  function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
  }
  function addToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += qty;
    else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
    saveCart();
    showToast(`✓ ${product.name} added to cart`);
  }
  function updateCartItemQty(id, newQty) {
    const item = cart.find(i => i.id === id);
    if (item) {
      if (newQty <= 0) cart = cart.filter(i => i.id !== id);
      else item.quantity = newQty;
      saveCart();
    }
  }
  function removeCartItem(id) { cart = cart.filter(i => i.id !== id); saveCart(); }

  // Render cart page
  function renderCartPage() {
    const container = document.getElementById("cartItemsContainer");
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = "<p>Your cart is empty.</p>"; document.getElementById("cartTotal").innerHTML = ""; return; }
    let html = "";
    cart.forEach(item => {
      html += `<div class="cart-item">
        <div class="cart-item-details"><strong>${item.name}</strong> - $${item.price}</div>
        <div class="cart-quantity"><input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="cart-qty-input"> <button class="btn-remove" data-id="${item.id}">Remove</button></div>
        <div>$${(item.price * item.quantity).toFixed(2)}</div>
      </div>`;
    });
    container.innerHTML = html;
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    document.getElementById("cartTotal").innerHTML = `Total: $${total.toFixed(2)}`;
    document.querySelectorAll(".cart-qty-input").forEach(inp => {
      inp.addEventListener("change", (e) => updateCartItemQty(parseInt(inp.dataset.id), parseInt(inp.value)));
    });
    document.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", (e) => removeCartItem(parseInt(btn.dataset.id)));
    });
  }

  // Product card rendering (reusable)
  function renderProductCards(productsArray, containerId, showDetailBtn = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!productsArray.length) { container.innerHTML = "<p>No products found</p>"; return; }
    container.innerHTML = productsArray.map(p => `
      <div class="product-card">
        <img class="product-img" src="${p.image}" alt="${p.name}">
        <div class="product-info">
          <div class="product-title">${p.name}</div>
          <div class="product-price">$${p.price}</div>
          <button class="btn-add" data-id="${p.id}">Add to Cart</button>
          ${showDetailBtn ? `<div class="btn-detail" data-id="${p.id}">View Details →</div>` : ""}
        </div>
      </div>
    `).join("");
    container.querySelectorAll(".btn-add").forEach(btn => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id), 1); });
    });
    if (showDetailBtn) {
      container.querySelectorAll(".btn-detail").forEach(btn => {
        btn.addEventListener("click", (e) => { showProductDetail(parseInt(btn.dataset.id)); });
      });
    }
  }

  // featured & trending
  function renderHomeProducts() {
    renderProductCards(products.slice(0, 4), "featuredProductsGrid", true);
    renderProductCards(products.slice(4, 8), "trendingProductsGrid", true);
  }

  // product listing with filters & search
  let currentFilters = { category: "all", minPrice: 0, maxPrice: 2000, searchTerm: "" };
  function filterProducts() {
    let filtered = [...products];
    if (currentFilters.category !== "all") filtered = filtered.filter(p => p.category === currentFilters.category);
    filtered = filtered.filter(p => p.price >= currentFilters.minPrice && p.price <= currentFilters.maxPrice);
    if (currentFilters.searchTerm.trim() !== "") {
      const term = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }
    return filtered;
  }
  function renderListing() {
    const filtered = filterProducts();
    renderProductCards(filtered, "productsListingGrid", true);
  }
  function applyFilterUI() {
    currentFilters.category = document.getElementById("filterCategory").value;
    currentFilters.minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
    currentFilters.maxPrice = parseFloat(document.getElementById("maxPrice").value) || 9999;
    renderListing();
  }
  function resetFilters() {
    document.getElementById("filterCategory").value = "all";
    document.getElementById("minPrice").value = 0;
    document.getElementById("maxPrice").value = 2000;
    currentFilters = { category: "all", minPrice: 0, maxPrice: 2000, searchTerm: currentFilters.searchTerm };
    renderListing();
  }

  // Product Detail
  function showProductDetail(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const detailContainer = document.getElementById("productDetailContainer");
    detailContainer.innerHTML = `
      <div style="flex:1"><img src="${prod.image}" style="width:100%; border-radius:1.5rem;" alt="${prod.name}"></div>
      <div style="flex:1"><h2>${prod.name}</h2><p style="color:#aaa;">${prod.description}</p><h3 style="color:#00a6ff;">$${prod.price}</h3><button id="detailAddToCart" class="btn-primary" style="margin-top:1rem;">Add to Cart</button></div>
    `;
    document.getElementById("detailAddToCart")?.addEventListener("click", () => { addToCart(prod.id, 1); });
    showSection("productDetail");
  }

  // Navigation & show section
  let currentSection = "home";
  function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(`${sectionId}Section`).classList.add("active-section");
    currentSection = sectionId;
    if (sectionId === "cart") renderCartPage();
    if (sectionId === "products") renderListing();
    if (sectionId === "home") renderHomeProducts();
    if (sectionId === "checkout") { /* nothing extra */ }
  }

  // Search from navbar
  function performGlobalSearch() {
    const searchVal = document.getElementById("globalSearchInput").value;
    currentFilters.searchTerm = searchVal;
    if (currentSection !== "products") showSection("products");
    else renderListing();
    document.getElementById("globalSearchInput").value = searchVal;
  }

  // Checkout
  document.getElementById("checkoutForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value;
    if (!name) { alert("Please fill name"); return; }
    alert(`✨ Order placed, ${name}! Thank you for shopping at TechNova.`);
    cart = [];
    saveCart();
    showSection("home");
  });

  // Event Listeners
  function init() {
    applyTheme(currentTheme);
    renderHomeProducts();
    updateCartUI();

    document.querySelectorAll("[data-nav]").forEach(link => {
      link.addEventListener("click", (e) => {
        const page = link.dataset.nav;
        if (page === "home") showSection("home");
        if (page === "products") { showSection("products"); renderListing(); }
        if (page === "cart") showSection("cart");
        if (page === "checkout") showSection("checkout");
      });
    });
    document.getElementById("cartIconBtn")?.addEventListener("click", () => showSection("cart"));
    document.getElementById("heroShopBtn")?.addEventListener("click", () => showSection("products"));
    document.getElementById("applyFiltersBtn")?.addEventListener("click", applyFilterUI);
    document.getElementById("clearFiltersBtn")?.addEventListener("click", resetFilters);
    document.getElementById("globalSearchBtn")?.addEventListener("click", performGlobalSearch);
    document.getElementById("globalSearchInput")?.addEventListener("keypress", (e) => { if(e.key === "Enter") performGlobalSearch(); });
    document.getElementById("backToProductsBtn")?.addEventListener("click", () => showSection("products"));
    document.getElementById("continueShoppingBtn")?.addEventListener("click", () => showSection("products"));
    document.getElementById("gotoCheckoutBtn")?.addEventListener("click", () => { if(cart.length===0){ alert("Cart empty"); return;} showSection("checkout"); });
    document.querySelectorAll("#homeCategories .category-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const cat = pill.dataset.cat;
        document.getElementById("filterCategory").value = cat;
        currentFilters.category = cat;
        showSection("products");
        renderListing();
      });
    });
    document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);
    document.getElementById("newsBtn")?.addEventListener("click", () => alert("📧 Thanks for subscribing! (Demo)"));
  }
  init();