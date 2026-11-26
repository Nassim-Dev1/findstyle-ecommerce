/**
 * FindStyle E-Commerce Main Script
 * Stage 3: Core Functionality (Live Search, Persistent Wishlist, Cart Controls, Toasts)
 */

// ==========================================================================
// 1. UTILITY FUNCTIONS & TOAST SYSTEM
// ==========================================================================

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Modern Toast Notification System (replaces browser alert)
 * @param {string} message - Message to display
 * @param {'success'|'warning'|'info'|'error'} type - Notification style
 * @param {number} duration - Auto-dismiss time in ms
 */
function showToast(message, type = "success", duration = 3000) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const icons = {
    success: "✓",
    warning: "⚠",
    info: "ℹ",
    error: "✕"
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "ℹ"}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button type="button" class="toast-close" aria-label="Close notification">✕</button>
  `;

  container.appendChild(toast);

  // Trigger reflow to animate
  void toast.offsetHeight;
  toast.classList.add("is-visible");

  let isDismissed = false;
  function dismiss() {
    if (isDismissed) return;
    isDismissed = true;
    toast.classList.remove("is-visible");
    toast.classList.add("is-hiding");
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }

  const timer = setTimeout(dismiss, duration);

  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      dismiss();
    });
  }

  toast.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss();
  });
}

// ==========================================================================
// 2. PERSISTENT WISHLIST SYSTEM (localStorage)
// ==========================================================================

const WISHLIST_STORAGE_KEY = "findstyle_wishlist";

function getWishlist() {
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn("Failed to read wishlist from localStorage:", err);
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save wishlist to localStorage:", err);
  }
}

function isWishlisted(productId) {
  if (!productId) return false;
  return getWishlist().includes(String(productId));
}

function toggleWishlist(productId) {
  if (!productId) return false;
  productId = String(productId);
  const list = getWishlist();
  const index = list.indexOf(productId);
  let isNowActive = false;

  if (index >= 0) {
    list.splice(index, 1);
    isNowActive = false;
    showToast("Removed from wishlist", "info");
  } else {
    list.push(productId);
    isNowActive = true;
    showToast("Added to your wishlist!", "success");
  }

  saveWishlist(list);
  syncWishlistButtons(productId, isNowActive);
  return isNowActive;
}

function getProductIdFromElement(el) {
  if (!el) return null;
  if (el.dataset && el.dataset.id) return el.dataset.id;

  const card = el.closest(".product-card");
  if (card) {
    const link = card.querySelector("a[href*='id=']");
    if (link) {
      try {
        const url = new URL(link.href, window.location.href);
        const id = url.searchParams.get("id");
        if (id) return id;
      } catch (e) {
        const match = link.href.match(/[?&]id=([^&#]+)/);
        if (match) return match[1];
      }
    }
  }

  if (el.classList.contains("wishlist-btn-pdp") || document.body.classList.contains("page-product")) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  return null;
}

function syncWishlistButtons(targetProductId = null, state = null) {
  const list = getWishlist();
  const buttons = document.querySelectorAll(".wishlist-btn");

  buttons.forEach((btn) => {
    const id = btn.dataset.id || getProductIdFromElement(btn);
    if (!id) return;

    if (targetProductId && id !== targetProductId) return;

    const active = state !== null && id === targetProductId ? state : list.includes(id);
    btn.dataset.id = id;
    btn.classList.toggle("is-active", active);

    const img = btn.querySelector("img");
    if (img) {
      img.src = active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png";
      img.alt = active ? "Wishlisted" : "Add to wishlist";
    }
  });
}

function initWishlistButtons() {
  // Maintained for backward compatibility; syncs UI state across all buttons
  syncWishlistButtons();
}

// Delegated wishlist toggle handler (prevents duplicate event listener stacking)
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".wishlist-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const productId = btn.dataset.id || getProductIdFromElement(btn);
  if (productId) {
    toggleWishlist(productId);
  }
});

// ==========================================================================
// 3. CART SYSTEM (localStorage, Quantity Controls, Item Removal, WhatsApp)
// ==========================================================================

function getCart() {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn("Failed to read cart from localStorage:", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
  updateCartCount();
}

function addToCart(productId, size, quantity = 1) {
  if (!productId || !size) return;
  const cart = getCart();
  const existingItem = cart.find(
    (item) => item.productId === productId && String(item.size) === String(size)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, size, quantity });
  }

  saveCart(cart);
  showToast("Added to cart!", "success");
}

function updateCartQuantity(productId, size, delta) {
  let cart = getCart();
  const item = cart.find(
    (i) => i.productId === productId && String(i.size) === String(size)
  );
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    cart = cart.filter(
      (i) => !(i.productId === productId && String(i.size) === String(size))
    );
    showToast("Item removed from cart", "info");
  } else {
    item.quantity = newQty;
  }

  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(
    (item) => !(item.productId === productId && String(item.size) === String(size))
  );
  saveCart(cart);
  renderCartDrawer();
  showToast("Item removed from cart", "info");
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = totalItems;
  });
}

function renderCartDrawer() {
  const cart = getCart();
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!cartItemsEl || !cartTotalEl) return;

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartTotalEl.textContent = "$0";
    if (checkoutBtn) {
      checkoutBtn.setAttribute("href", "javascript:void(0)");
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.5";
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = "";
    checkoutBtn.style.opacity = "";
  }

  let total = 0;
  const orderLines = [];

  cart.forEach((item) => {
    const product = typeof products !== "undefined" ? products[item.productId] : null;
    if (!product) return;

    const lineTotal = product.priceNow * item.quantity;
    total += lineTotal;
    orderLines.push(`• ${product.name} (Size: ${item.size}) x${item.quantity} — $${lineTotal}`);

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${product.images[0]}" alt="${escapeHtml(product.name)}">
      <div class="cart-item-info">
        <h4>${escapeHtml(product.name)}</h4>
        <span class="cart-item-size">Size: ${escapeHtml(item.size)}</span>
        <div class="cart-item-qty-controls">
          <button type="button" class="qty-btn qty-decrease" data-id="${item.productId}" data-size="${escapeHtml(item.size)}" aria-label="Decrease quantity">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button type="button" class="qty-btn qty-increase" data-id="${item.productId}" data-size="${escapeHtml(item.size)}" aria-label="Increase quantity">+</button>
        </div>
        <span class="cart-item-price">$${lineTotal}</span>
      </div>
      <button type="button" class="cart-item-remove" data-id="${item.productId}" data-size="${escapeHtml(item.size)}" aria-label="Remove item">✕</button>
    `;

    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = `$${total}`;

  if (checkoutBtn) {
    const fullMessage = `Hi FindStyle, I'd like to order:\n\n${orderLines.join("\n")}\n\nTotal: $${total}\n\nPlease confirm availability and delivery details.`;
    checkoutBtn.href = `https://wa.me/213559959122?text=${encodeURIComponent(fullMessage)}`;
  }
}

// Delegated click handler for cart drawer quantity and remove controls
document.addEventListener("click", function (e) {
  const incBtn = e.target.closest(".qty-increase");
  if (incBtn) {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(incBtn.dataset.id, incBtn.dataset.size, 1);
    return;
  }

  const decBtn = e.target.closest(".qty-decrease");
  if (decBtn) {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(decBtn.dataset.id, decBtn.dataset.size, -1);
    return;
  }

  const removeBtn = e.target.closest(".cart-item-remove");
  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(removeBtn.dataset.id, removeBtn.dataset.size);
    return;
  }
});

// ==========================================================================
// 4. LIVE PRODUCT SEARCH ACROSS THE WEBSITE
// ==========================================================================

function initLiveSearch() {
  if (typeof products === "undefined") return;

  const searchBars = document.querySelectorAll(".search-bar");

  searchBars.forEach((bar) => {
    const input = bar.querySelector("input[type='search'], input");
    if (!input) return;

    let dropdown = bar.querySelector(".search-results-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-results-dropdown";
      bar.appendChild(dropdown);
    }

    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();

      // Keep sibling search inputs on the page synchronized
      document.querySelectorAll(".search-bar input").forEach((otherInput) => {
        if (otherInput !== input && otherInput.value !== input.value) {
          otherInput.value = input.value;
        }
      });

      if (query === "") {
        dropdown.classList.remove("is-open");
        dropdown.innerHTML = "";
        if (document.body.classList.contains("page-shop") && typeof window.__renderShopCategory === "function") {
          const urlParams = new URLSearchParams(window.location.search);
          const cat = urlParams.get("category") || "all";
          window.__renderShopCategory(cat);
        }
        return;
      }

      const matches = Object.values(products).filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(query);
        const catMatch = p.category && p.category.toLowerCase().includes(query);
        const descMatch = p.shortDescription && p.shortDescription.toLowerCase().includes(query);
        return nameMatch || catMatch || descMatch;
      });

      dropdown.innerHTML = "";

      if (matches.length === 0) {
        dropdown.innerHTML = `<p class="search-empty">No products found matching "<strong>${escapeHtml(query)}</strong>"</p>`;
      } else {
        matches.slice(0, 8).forEach((p) => {
          const item = document.createElement("a");
          item.className = "search-result-item";
          item.href = `product.html?id=${p.id}`;
          item.innerHTML = `
            <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" class="search-result-thumb">
            <div class="search-result-info">
              <span class="search-result-title">${escapeHtml(p.name)}</span>
              <div class="search-result-meta">
                <span class="search-result-category">${escapeHtml(p.category || "")}</span>
                <span>★ ${p.rating} (${p.reviewCount})</span>
              </div>
            </div>
            <span class="search-result-price">$${p.priceNow}</span>
          `;
          dropdown.appendChild(item);
        });
      }

      dropdown.classList.add("is-open");

      // Live-filter shop page grid when on shop.html
      if (document.body.classList.contains("page-shop")) {
        const shopGrid = document.getElementById("shopGrid");
        const shopTitle = document.getElementById("shopTitle");
        if (shopGrid) {
          shopGrid.innerHTML = "";
          if (matches.length === 0) {
            shopGrid.innerHTML = `<div class="search-empty" style="grid-column: 1 / -1; padding: 48px 16px;">No products found matching "${escapeHtml(query)}".</div>`;
          } else {
            matches.forEach((product) => {
              const card = document.createElement("article");
              card.className = "product-card";
              const active = isWishlisted(product.id);
              card.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                  <div class="product-img">
                    <img src="${product.images[0]}" alt="${escapeHtml(product.name)}">
                  </div>
                  <h3>${escapeHtml(product.name)}</h3>
                  <div class="product-meta">
                    <span class="price">$${product.priceNow}</span>
                    <span class="rating"><span class="star">★</span> ${product.rating} (${product.reviewCount})</span>
                  </div>
                </a>
                <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-label="Add to wishlist">
                  <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="">
                </button>
              `;
              shopGrid.appendChild(card);
            });
          }
          if (shopTitle) {
            shopTitle.textContent = `Search: "${query}" (${matches.length})`;
          }
        }
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        if (document.body.classList.contains("page-shop")) {
          dropdown.classList.remove("is-open");
          return;
        }

        const firstItem = dropdown.querySelector(".search-result-item");
        if (firstItem) {
          window.location.href = firstItem.href;
        } else {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });

  // Close search dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-bar")) {
      document.querySelectorAll(".search-results-dropdown.is-open").forEach((d) => {
        d.classList.remove("is-open");
      });
    }
  });
}

// ==========================================================================
// 5. GLOBAL INITIALIZATION & COMMON UI HANDLERS
// ==========================================================================

updateCartCount();
initLiveSearch();
initWishlistButtons();
// Global Mobile Navigation Drawer Initialization (accessible on all pages)
function initMobileNav() {
  const menuToggle = document.getElementById("menuToggle");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");
  const mobileNav = document.getElementById("mobileNav");

  if (!menuToggle || !mobileNav) return;

  function openNav() {
    mobileNav.classList.add("is-open");
    if (navOverlay) navOverlay.classList.add("is-visible");
  }

  function closeNav() {
    mobileNav.classList.remove("is-open");
    if (navOverlay) navOverlay.classList.remove("is-visible");
  }

  menuToggle.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navOverlay) navOverlay.addEventListener("click", closeNav);
}
initMobileNav();

const filterBtn = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("filterDropdown");

if (filterBtn && filterDropdown) {
  filterBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    filterDropdown.classList.toggle("is-open");
  });

  document.addEventListener("click", function (e) {
    if (!filterDropdown.contains(e.target)) {
      filterDropdown.classList.remove("is-open");
    }
  });
}

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawerClose = document.getElementById("cartDrawerClose");

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove("is-open");
  if (cartOverlay) cartOverlay.classList.remove("is-visible");
}

if (cartBtn && cartDrawer && cartOverlay) {
  cartBtn.addEventListener("click", function () {
    renderCartDrawer();
    cartDrawer.classList.add("is-open");
    cartOverlay.classList.add("is-visible");
  });
}

if (cartDrawerClose) {
  cartDrawerClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

// Global escape key handler to dismiss all drawers, panels, search and dropdowns
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeCart();

    const mobileNav = document.getElementById("mobileNav");
    const navOverlay = document.getElementById("navOverlay");
    if (mobileNav && mobileNav.classList.contains("is-open")) {
      mobileNav.classList.remove("is-open");
      if (navOverlay) navOverlay.classList.remove("is-visible");
    }

    const outfitPanal = document.getElementById("outfitPanal");
    const outfitPanalOverlay = document.getElementById("outfitPanalOverlay");
    if (outfitPanal && outfitPanal.classList.contains("is-open")) {
      outfitPanal.classList.remove("is-open");
      if (outfitPanalOverlay) outfitPanalOverlay.classList.remove("is-visible");
    }

    if (filterDropdown && filterDropdown.classList.contains("is-open")) {
      filterDropdown.classList.remove("is-open");
    }

    document.querySelectorAll(".options-dropdown.is-open").forEach((d) => {
      d.classList.remove("is-open");
    });

    document.querySelectorAll(".search-results-dropdown.is-open").forEach((d) => {
      d.classList.remove("is-open");
    });
  }
});

// Active link highlighting across desktop and mobile navigation
function updateActiveNavLinks() {
  const currentPath = window.location.pathname.replace(/\/$/, "").split("/").pop() || "index.html";
  const links = document.querySelectorAll(".desktop-nav a, .mobile-nav a");

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkFile = href.split("?")[0].split("/").pop();
    if (!linkFile || href.startsWith("http") || href.startsWith("https://wa.me")) return;

    let isCurrent = false;
    if (currentPath === "product.html") {
      isCurrent = linkFile === "shop.html";
    } else {
      isCurrent = linkFile === currentPath || (currentPath === "" && linkFile === "index.html");
    }

    link.classList.toggle("active", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
updateActiveNavLinks();

// ==========================================================================
// 6. PAGE: HOME (index.html)
// ==========================================================================

function renderProductRow(row) {
  if (typeof products === "undefined") return;

  const category = row.dataset.category;
  const scrollContainer = row.querySelector(".product-scroll");
  if (!scrollContainer) return;

  let matchingProducts;
  if (category === "bestsellers") {
    matchingProducts = Object.values(products).filter((p) => p.bestSeller);
  } else {
    matchingProducts = Object.values(products).filter(
      (p) => p.category === category
    );
  }

  scrollContainer.innerHTML = "";

  matchingProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const active = isWishlisted(product.id);

    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-link">
        <div class="product-img">
          <img src="${product.images[0]}" alt="${escapeHtml(product.name)}">
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-meta">
          <span class="price">$${product.priceNow}</span>
          <span class="rating">★ ${product.rating} (${product.reviewCount})</span>
        </div>
      </a>
      <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-label="Add to wishlist">
        <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="">
      </button>
    `;

    scrollContainer.appendChild(card);
  });
}

if (document.body.classList.contains("page-home")) {
  document.querySelectorAll(".category-row").forEach((row) => {
    renderProductRow(row);
  });

  const menuToggle = document.getElementById("menuToggle");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");
  const mobileNav = document.getElementById("mobileNav");

  if (menuToggle && navClose && navOverlay && mobileNav) {
    menuToggle.addEventListener("click", openNav);
    navClose.addEventListener("click", closeNav);
    navOverlay.addEventListener("click", closeNav);

    function openNav() {
      mobileNav.classList.add("is-open");
      navOverlay.classList.add("is-visible");
    }

    function closeNav() {
      mobileNav.classList.remove("is-open");
      navOverlay.classList.remove("is-visible");
    }
  }

    // Hero Mobile Slider with Touch Swipe (only enabled when multiple slides exist)
  const heroTrack = document.getElementById("heroTrackMobile");
  const heroDotsContainer = document.getElementById("heroDots");
  const dots = document.querySelectorAll(".hero-dots .dot");
  const slides = heroTrack ? heroTrack.querySelectorAll(".hero-slide") : [];

  if (heroTrack && slides.length > 1 && dots.length > 1) {
    let currentSlide = 0;
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => goToSlide(i));
    });

    function goToSlide(index) {
      currentSlide = index;
      heroTrack.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    heroTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      heroTrack.style.transition = "none";
    });

    heroTrack.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (Math.abs(diff) < 20) return;
      const percentDiff = (diff / heroTrack.offsetWidth) * 100;
      heroTrack.style.transform = `translateX(calc(-${currentSlide * 100}% + ${percentDiff}%))`;
    });

    heroTrack.addEventListener("touchend", function () {
      isDragging = false;
      heroTrack.style.transition = "transform 0.4s ease";
      const diff = currentX - startX;
      const threshold = 50;

      if (diff > threshold && currentSlide > 0) {
        goToSlide(currentSlide - 1);
      } else if (diff < -threshold && currentSlide < dots.length - 1) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide);
      }
    });
  } else if (heroDotsContainer && slides.length <= 1) {
    // Single slide: hide dots indicator completely
    heroDotsContainer.style.display = "none";
  }

  // Community interactive bubbles
  const desktopCommunity = document.getElementById("desktopCommunity");
  const screenContent = document.querySelector(".screen-content");

  if (screenContent) {
    screenContent.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  if (desktopCommunity) {
    desktopCommunity.addEventListener("click", function (e) {
      if (e.target.closest(".screen-content")) return;

      const bubble = document.createElement("div");
      bubble.classList.add("bubble");

      const rect = desktopCommunity.getBoundingClientRect();
      bubble.style.left = `${e.clientX - rect.left}px`;
      bubble.style.top = `${e.clientY - rect.top}px`;

      const randomHue = Math.floor(Math.random() * 360);
      bubble.style.backgroundColor = `hsl(${randomHue}, 85%, 65%)`;
      bubble.style.boxShadow = `0 0 15px hsl(${randomHue}, 85%, 65%)`;

      desktopCommunity.append(bubble);
      bubble.addEventListener("animationend", function () {
        bubble.remove();
      });
    });
  }
}

// ==========================================================================
// 7. PAGE: COLLECTIONS (collections.html)
// ==========================================================================

if (document.body.classList.contains("page-collections")) {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  const optionsButtons = document.querySelectorAll(".options-btn");
  optionsButtons.forEach((btn) => {
    const dropdown = btn.nextElementSibling;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("is-open");
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".options-dropdown.is-open").forEach((d) => {
      d.classList.remove("is-open");
    });
  });

  const shareButtons = document.querySelectorAll(".option-share");
  shareButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".outfit-card");
      const outfitName = card ? card.querySelector("h3").textContent : "Outfit";
      const message = `Check out this outfit: ${outfitName} — ${window.location.href}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    });
  });

  const copyButtons = document.querySelectorAll(".option-copy");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        btn.textContent = "Copied!";
        showToast("Outfit link copied to clipboard!", "success");
        setTimeout(() => {
          btn.textContent = "Copy Link";
        }, 1500);
      }).catch(() => {
        showToast("Failed to copy link", "error");
      });
    });
  });

  const outfitCards = document.querySelectorAll(".outfit-card");
  const filterOptions = document.querySelectorAll(".filter-option");

  function filterByCategory(category) {
    outfitCards.forEach((card) => {
      if (category === "all" || card.dataset.category === category) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  filterOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const category = btn.dataset.category;
      if (category) {
        filterByCategory(category);
        if (filterDropdown) filterDropdown.classList.remove("is-open");
      }
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "all";
  filterByCategory(initialCategory);

  const outfitPanal = document.getElementById("outfitPanal");
  const outfitPanalOverlay = document.getElementById("outfitPanalOverlay");
  const outfitPanalItems = document.getElementById("outfitPanalItems");
  const outfitPanalClose = document.getElementById("outfitPanalClose");

  const orderButtons = document.querySelectorAll(".order-btn");
  orderButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const outfitKey = btn.dataset.outfit;
      const outfit = typeof outfits !== "undefined" ? outfits[outfitKey] : null;

      if (!outfit) {
        console.error("Outfit not found:", outfitKey);
        return;
      }

      if (outfitPanalItems) {
        outfitPanalItems.innerHTML = "";

        outfit.pieces.forEach((pieceId) => {
          const product = typeof products !== "undefined" ? products[pieceId] : null;
          if (!product) return;

          const item = document.createElement("a");
          item.href = `product.html?id=${product.id}`;
          item.className = "outfit-panal-item";
          item.innerHTML = `
            <img src="${product.images[0]}" alt="${escapeHtml(product.name)}">
            <div class="piece-info">
              <h4>${escapeHtml(product.name)}</h4>
              <span class="piece-price">$${product.priceNow}</span>
            </div>
          `;

          outfitPanalItems.appendChild(item);
        });
      }

      if (outfitPanal) outfitPanal.classList.add("is-open");
      if (outfitPanalOverlay) outfitPanalOverlay.classList.add("is-visible");
    });
  });

  if (outfitPanalClose) {
    outfitPanalClose.addEventListener("click", function () {
      if (outfitPanal) outfitPanal.classList.remove("is-open");
      if (outfitPanalOverlay) outfitPanalOverlay.classList.remove("is-visible");
    });
  }

  if (outfitPanalOverlay) {
    outfitPanalOverlay.addEventListener("click", function () {
      if (outfitPanal) outfitPanal.classList.remove("is-open");
      if (outfitPanalOverlay) outfitPanalOverlay.classList.remove("is-visible");
    });
  }
}

// ==========================================================================
// 8. PAGE: PRODUCT DETAIL (product.html)
// ==========================================================================

if (document.body.classList.contains("page-product")) {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "shop.html";
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const product = typeof products !== "undefined" ? products[productId] : null;

  if (!product) {
    console.warn("Product not found:", productId);
    const deskProduct = document.querySelector(".desk-product");
    if (deskProduct) {
      deskProduct.innerHTML = `
        <div class="product-not-found" style="text-align: center; padding: 60px 20px; width: 100%;">
          <h2 style="font-size: 24px; margin-bottom: 12px; color: var(--color-text-main);">Product Not Found</h2>
          <p style="font-size: 15px; color: var(--color-text-muted); margin-bottom: 24px;">The product you are looking for does not exist or has been removed.</p>
          <a href="shop.html" style="display: inline-block; padding: 12px 28px; background: var(--color-primary); color: #fff; border-radius: var(--radius-sm); font-weight: 600; text-decoration: none;">Back to Shop</a>
        </div>
      `;
    }
    const relatedSection = document.querySelector(".related-products");
    if (relatedSection) relatedSection.style.display = "none";
  } else {
    // Populate PDP content
    const titleEl = document.querySelector(".product-info h1");
    if (titleEl) titleEl.textContent = product.name;

    const priceNowEl = document.querySelector(".price-now");
    if (priceNowEl) priceNowEl.textContent = `NOW $${product.priceNow}`;

    const priceWasEl = document.querySelector(".price-was");
    if (priceWasEl) {
      if (product.priceWas) {
        priceWasEl.textContent = `Was $${product.priceWas}`;
        priceWasEl.style.display = "";
      } else {
        priceWasEl.style.display = "none";
      }
    }

    const ratingEl = document.querySelector(".rating-count");
    if (ratingEl) ratingEl.textContent = `${product.rating} (${product.reviewCount})`;

    // Render actual rating stars dynamically instead of hardcoded 5 stars
    const starsContainer = document.querySelector(".rating .stars");
    if (starsContainer) {
      const ratingVal = Number(product.rating) || 5;
      const fullStars = Math.round(ratingVal);
      starsContainer.textContent = "★".repeat(fullStars) + "☆".repeat(Math.max(0, 5 - fullStars));
      starsContainer.setAttribute("aria-label", `${product.rating} out of 5 stars`);
    }

    // Sync PDP Wishlist button
    const pdpWishlistBtn = document.querySelector(".wishlist-btn-pdp");
    if (pdpWishlistBtn) {
      pdpWishlistBtn.dataset.id = product.id;
      const active = isWishlisted(product.id);
      pdpWishlistBtn.classList.toggle("is-active", active);
      const img = pdpWishlistBtn.querySelector("img");
      if (img) {
        img.src = active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png";
      }
    }

    // Gallery track & dots
    const galleryTrack = document.getElementById("galleryTrack");
    const galleryDots = document.getElementById("galleryDots");

    if (galleryTrack && galleryDots) {
      galleryTrack.innerHTML = "";
      galleryDots.innerHTML = "";

      product.images.forEach((imgSrc, index) => {
        const slide = document.createElement("div");
        slide.className = "gallery-slide";
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = product.name;
        slide.appendChild(img);
        galleryTrack.appendChild(slide);

        const dot = document.createElement("button");
        dot.className = index === 0 ? "dot is-active" : "dot";
        dot.dataset.index = index;
        galleryDots.appendChild(dot);
      });

      initGallerySlider();
    }

    const shortDescElement = document.querySelector(".product-details .short-desc");
    if (shortDescElement) shortDescElement.textContent = product.shortDescription;

    const featuresList = document.querySelector(".features-list");
    if (featuresList && product.features) {
      featuresList.innerHTML = "";
      product.features.forEach((feature) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = feature.title + ": ";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(feature.text));
        featuresList.appendChild(li);
      });
    }

    // Populate sizes
    const sizeSelect = document.getElementById("sizeSelect");
    if (sizeSelect && product.sizes) {
      sizeSelect.innerHTML = "";
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "Please select";
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      sizeSelect.appendChild(placeholderOption);

      product.sizes.forEach((size) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
      });
    }

    // Related products grid
    const relatedGrid = document.querySelector(".related-grid");
    if (relatedGrid) {
      relatedGrid.innerHTML = "";
      const relatedProducts = Object.values(products)
        .filter((p) => p.category === product.category && p.id !== productId)
        .slice(0, 8);

      relatedProducts.forEach((p) => {
        const card = document.createElement("article");
        card.className = "product-card";
        const active = isWishlisted(p.id);

        card.innerHTML = `
          <a href="product.html?id=${p.id}" class="product-link">
            <div class="product-img">
              <img src="${p.images[0]}" alt="${escapeHtml(p.name)}">
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <div class="product-meta">
              <span class="price">$${p.priceNow}</span>
              <span class="rating"><span class="star">★</span> ${p.rating} (${p.reviewCount})</span>
            </div>
          </a>
          <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${p.id}" aria-label="Add to wishlist">
            <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="">
          </button>
        `;

        relatedGrid.appendChild(card);
      });
    }
  }

  function initGallerySlider() {
    const galleryTrack = document.getElementById("galleryTrack");
    const galleryDots = document.querySelectorAll(".gallery-dots .dot");
    let currentImage = 0;

    function goToImage(index) {
      currentImage = index;
      galleryTrack.style.transform = `translateX(-${index * 100}%)`;
      galleryDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    galleryDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToImage(Number(dot.dataset.index));
      });
    });

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    galleryTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      galleryTrack.style.transition = "none";
    });

    galleryTrack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (Math.abs(diff) < 10) return;
      const percentDiff = (diff / galleryTrack.offsetWidth) * 100;
      galleryTrack.style.transform = `translateX(calc(-${currentImage * 100}% + ${percentDiff}%))`;
    });

    galleryTrack.addEventListener("touchend", () => {
      isDragging = false;
      galleryTrack.style.transition = "transform 0.4s ease";
      const diff = currentX - startX;
      const threshold = 50;

      if (diff > threshold && currentImage > 0) {
        goToImage(currentImage - 1);
      } else if (diff < -threshold && currentImage < galleryDots.length - 1) {
        goToImage(currentImage + 1);
      } else {
        goToImage(currentImage);
      }
    });
  }

  // Add to cart with toast replacement
  const addToCartBtn = document.getElementById("addToCartBtn");
  const sizeSelect = document.getElementById("sizeSelect");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      if (!product) return;
      const selectedSize = sizeSelect ? sizeSelect.value : "";

      if (!selectedSize) {
        showToast("Please select a size first", "warning");
        return;
      }

      addToCart(product.id, selectedSize);
    });
  }

  const cartToggle = document.getElementById("cartToggle");
  if (cartToggle && cartDrawer && cartOverlay) {
    cartToggle.addEventListener("click", function () {
      renderCartDrawer();
      cartDrawer.classList.add("is-open");
      cartOverlay.classList.add("is-visible");
    });
  }
}

// ==========================================================================
// 9. PAGE: SHOP (shop.html)
// ==========================================================================

if (document.body.classList.contains("page-shop")) {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "all";
  const searchParam = urlParams.get("search");

  const shopTitle = document.getElementById("shopTitle");
  const shopGrid = document.getElementById("shopGrid");

  const categoryLabels = {
    all: "Shop All",
    shoes: "Shoes",
    pants: "Pants",
    jackets: "Jackets",
    "T-shirts": "T-shirts",
    shirts: "Shirts",
    bestsellers: "Bestsellers"
  };

  function renderShopGrid(cat) {
    if (typeof products === "undefined" || !shopGrid) return;

    let matching;
    if (cat === "all") {
      matching = Object.values(products);
    } else if (cat === "bestsellers") {
      matching = Object.values(products).filter((p) => p.bestSeller);
    } else {
      matching = Object.values(products).filter((p) => p.category === cat);
    }

    shopGrid.innerHTML = "";

    matching.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const active = isWishlisted(product.id);

      card.innerHTML = `
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <img src="${product.images[0]}" alt="${escapeHtml(product.name)}">
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-meta">
            <span class="price">$${product.priceNow}</span>
            <span class="rating"><span class="star">★</span> ${product.rating} (${product.reviewCount})</span>
          </div>
        </a>
        <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-label="Add to wishlist">
          <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="">
        </button>
      `;

      shopGrid.appendChild(card);
    });

    if (shopTitle) {
      shopTitle.textContent = categoryLabels[cat] || "Shop";
    }
  }

  // Expose for live search reset
  window.__renderShopCategory = renderShopGrid;

  const filterOptions = document.querySelectorAll(".filter-option");
  filterOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = btn.dataset.category;
      if (cat) {
        renderShopGrid(cat);
        if (filterDropdown) filterDropdown.classList.remove("is-open");
      }
    });
  });

  if (searchParam) {
    // If arriving with ?search=..., trigger live search
    document.querySelectorAll(".search-bar input").forEach((inp) => {
      inp.value = searchParam;
    });
    setTimeout(() => {
      const primaryInput = document.querySelector(".search-bar input");
      if (primaryInput) {
        primaryInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 50);
  } else {
    renderShopGrid(category);
  }
}
