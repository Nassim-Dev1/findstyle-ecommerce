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
const MAX_TOASTS = 3;

function showToast(message, type = "success", duration = 3000) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }

  // Cap visible toasts to prevent excessive stacking
  while (container.children.length >= MAX_TOASTS) {
    const oldest = container.firstElementChild;
    if (oldest) oldest.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");

  const icons = {
    success: "✓",
    warning: "⚠",
    info: "ℹ",
    error: "✕"
  };

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[type] || "ℹ"}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button type="button" class="toast-close" aria-label="Close notification">✕</button>
  `;

  container.appendChild(toast);

  // Trigger reflow to animate
  void toast.offsetHeight;
  toast.classList.add("is-visible");

  let isDismissed = false;
  let timer = null;

  function dismiss() {
    if (isDismissed) return;
    isDismissed = true;
    clearTimeout(timer);
    toast.classList.remove("is-visible");
    toast.classList.add("is-hiding");
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }

  function startTimer() {
    clearTimeout(timer);
    timer = setTimeout(dismiss, duration);
  }

  function pauseTimer() {
    clearTimeout(timer);
  }

  startTimer();

  toast.addEventListener("mouseenter", pauseTimer);
  toast.addEventListener("mouseleave", startTimer);
  toast.addEventListener("focusin", pauseTimer);
  toast.addEventListener("focusout", startTimer);

  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismiss();
    });
  }
}

// ==========================================================================
// 2. PERSISTENT WISHLIST SYSTEM (localStorage)
// ==========================================================================

const WISHLIST_STORAGE_KEY = "findstyle_wishlist";

function safeStorageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`Failed to read "${key}" from localStorage:`, err);
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage:`, err);
    return false;
  }
}

function getWishlist() {
  const parsed = safeStorageGet(WISHLIST_STORAGE_KEY);
  if (!Array.isArray(parsed)) return [];
  const seen = new Set();
  const valid = [];
  parsed.forEach((entry) => {
    if (typeof entry === "string" || typeof entry === "number") {
      const normalized = String(entry).trim();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        valid.push(normalized);
      }
    }
  });
  return valid;
}

function saveWishlist(list) {
  return safeStorageSet(WISHLIST_STORAGE_KEY, Array.isArray(list) ? list : []);
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
  } else {
    list.push(productId);
    isNowActive = true;
  }

  if (!saveWishlist(list)) {
    showToast("Unable to save wishlist (storage unavailable)", "error");
    return !isNowActive;
  }

  showToast(
    isNowActive ? "Added to your wishlist!" : "Removed from wishlist",
    isNowActive ? "success" : "info"
  );
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

  const outfitCard = el.closest(".outfit-card");
  if (outfitCard) {
    const orderBtn = outfitCard.querySelector(".order-btn[data-outfit]");
    if (orderBtn && orderBtn.dataset.outfit) {
      return `outfit:${orderBtn.dataset.outfit}`;
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
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");

    const img = btn.querySelector("img");
    if (img) {
      img.src = active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
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

const MAX_CART_QTY = 20;
const CACHED_PRODUCTS = typeof products !== "undefined" ? Object.values(products) : [];

function getCart() {
  const parsed = safeStorageGet("cart");
  if (!Array.isArray(parsed)) return [];

  const valid = [];
  parsed.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const productId = typeof item.productId === "string" ? item.productId.trim() : "";
    if (!productId) return;
    if (typeof products !== "undefined" && !products[productId]) return;

    const size = item.size !== undefined && item.size !== null ? String(item.size).trim() : "";
    if (!size) return;

    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty < 1) return;

    valid.push({
      productId,
      size,
      quantity: Math.min(MAX_CART_QTY, qty)
    });
  });

  return valid;
}

function saveCart(cart) {
  const ok = safeStorageSet("cart", Array.isArray(cart) ? cart : []);
  updateCartCount();
  return ok;
}

function addToCart(productId, size, quantity = 1) {
  const normalizedSize = size !== undefined && size !== null ? String(size).trim() : "";
  if (!productId || !normalizedSize) return;
  if (typeof products !== "undefined" && !products[productId]) {
    showToast("Product is no longer available", "error");
    return;
  }

  const qtyToAdd = Math.floor(Number(quantity));
  if (!Number.isFinite(qtyToAdd) || qtyToAdd < 1) return;

  const cart = getCart();
  const existingItem = cart.find(
    (item) => item.productId === productId && String(item.size) === normalizedSize
  );

  if (existingItem) {
    if (existingItem.quantity >= MAX_CART_QTY) {
      showToast(`Maximum quantity (${MAX_CART_QTY}) reached for this item`, "warning");
      return;
    }
    existingItem.quantity = Math.min(MAX_CART_QTY, existingItem.quantity + qtyToAdd);
  } else {
    cart.push({
      productId,
      size: normalizedSize,
      quantity: Math.min(MAX_CART_QTY, qtyToAdd)
    });
  }

  if (!saveCart(cart)) {
    showToast("Unable to save cart (storage unavailable)", "error");
    return;
  }
  showToast("Added to cart!", "success");
}

function updateCartQuantity(productId, size, delta) {
  const numDelta = Number(delta);
  if (!Number.isFinite(numDelta)) return;

  let cart = getCart();
  const item = cart.find(
    (i) => i.productId === productId && String(i.size) === String(size)
  );
  if (!item) return;

  if (numDelta > 0 && item.quantity >= MAX_CART_QTY) {
    showToast(`Maximum quantity (${MAX_CART_QTY}) reached for this item`, "warning");
    return;
  }

  const newQty = Math.min(MAX_CART_QTY, item.quantity + numDelta);
  if (newQty <= 0) {
    cart = cart.filter(
      (i) => !(i.productId === productId && String(i.size) === String(size))
    );
    if (!saveCart(cart)) {
      showToast("Unable to update cart (storage unavailable)", "error");
      return;
    }
    showToast("Item removed from cart", "info");
  } else {
    item.quantity = newQty;
    if (!saveCart(cart)) {
      showToast("Unable to update cart (storage unavailable)", "error");
      return;
    }
  }

  renderCartDrawer();
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(
    (item) => !(item.productId === productId && String(item.size) === String(size))
  );
  if (!saveCart(cart)) {
    showToast("Unable to update cart (storage unavailable)", "error");
    return;
  }
  renderCartDrawer();
  showToast("Item removed from cart", "info");
}

function clearCart() {
  const cart = getCart();
  if (cart.length === 0) return;
  if (!saveCart([])) {
    showToast("Unable to clear cart (storage unavailable)", "error");
    return;
  }
  renderCartDrawer();
  showToast("Cart cleared", "info");
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
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (!cartItemsEl || !cartTotalEl) return;

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartTotalEl.textContent = "$0";
    if (checkoutBtn) {
      checkoutBtn.removeAttribute("href");
      checkoutBtn.setAttribute("tabindex", "0");
      checkoutBtn.setAttribute("aria-disabled", "true");
      checkoutBtn.classList.add("is-disabled");
    }
    if (clearCartBtn) {
      clearCartBtn.hidden = true;
    }
    return;
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
      <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" width="72" height="72" loading="lazy" decoding="async">
      <div class="cart-item-info">
        <h4>${escapeHtml(product.name)}</h4>
        <span class="cart-item-size">Size: ${escapeHtml(item.size)}</span>
        <div class="cart-item-qty-controls">
          <button type="button" class="qty-btn qty-decrease" data-id="${escapeHtml(item.productId)}" data-size="${escapeHtml(item.size)}" aria-label="Decrease quantity">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button type="button" class="qty-btn qty-increase" data-id="${escapeHtml(item.productId)}" data-size="${escapeHtml(item.size)}" aria-label="Increase quantity">+</button>
        </div>
        <span class="cart-item-price">$${lineTotal}</span>
      </div>
      <button type="button" class="cart-item-remove" data-id="${escapeHtml(item.productId)}" data-size="${escapeHtml(item.size)}" aria-label="Remove item">✕</button>
    `;

    cartItemsEl.appendChild(row);
  });

  if (cartItemsEl.children.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartTotalEl.textContent = "$0";
    if (checkoutBtn) {
      checkoutBtn.removeAttribute("href");
      checkoutBtn.setAttribute("tabindex", "0");
      checkoutBtn.setAttribute("aria-disabled", "true");
      checkoutBtn.classList.add("is-disabled");
    }
    if (clearCartBtn) {
      clearCartBtn.hidden = true;
    }
    return;
  }

  cartTotalEl.textContent = `$${total}`;

  if (clearCartBtn) {
    clearCartBtn.hidden = false;
  }

  if (checkoutBtn) {
    const fullMessage = `Hi FindStyle, I'd like to order:\n\n${orderLines.join("\n")}\n\nTotal: $${total}\n\nPlease confirm availability and delivery details.`;
    checkoutBtn.href = `https://wa.me/213559959122?text=${encodeURIComponent(fullMessage)}`;
    checkoutBtn.removeAttribute("tabindex");
    checkoutBtn.removeAttribute("aria-disabled");
    checkoutBtn.classList.remove("is-disabled");
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

function matchesProductSearch(product, query) {
  if (!product || !query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const nameMatch = product.name && product.name.toLowerCase().includes(q);
  const catMatch = product.category && product.category.toLowerCase().includes(q);
  const descMatch = product.shortDescription && product.shortDescription.toLowerCase().includes(q);
  return Boolean(nameMatch || catMatch || descMatch);
}

function initLiveSearch() {
  if (typeof products === "undefined") return;

  const searchBars = document.querySelectorAll(".search-bar");
  const allSearchInputs = Array.from(document.querySelectorAll(".search-bar input"));

  searchBars.forEach((bar, barIndex) => {
    const input = bar.querySelector("input[type='search'], input");
    if (!input) return;

    let dropdown = bar.querySelector(".search-results-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-results-dropdown";
      bar.appendChild(dropdown);
    }

    const dropdownId = dropdown.id || `searchDropdown-${barIndex}`;
    dropdown.id = dropdownId;
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", "Search results");

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", dropdownId);

    let highlightedIndex = -1;
    let lastHandledQuery = input.value;
    let debounceTimer = null;

    function closeDropdown() {
      dropdown.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      highlightedIndex = -1;
    }

    function updateHighlight(items) {
      items.forEach((item, idx) => {
        const isCurrent = idx === highlightedIndex;
        item.classList.toggle("is-highlighted", isCurrent);
        item.setAttribute("aria-selected", isCurrent ? "true" : "false");
        if (isCurrent) {
          input.setAttribute("aria-activedescendant", item.id);
          item.scrollIntoView({ block: "nearest" });
        }
      });
      if (highlightedIndex < 0) {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function syncSiblingInputs(rawQuery) {
      allSearchInputs.forEach((otherInput) => {
        if (otherInput !== input && otherInput.value !== rawQuery) {
          otherInput.value = rawQuery;
        }
      });
    }

    function handleQueryChange() {
      clearTimeout(debounceTimer);
      const rawQuery = input.value;
      lastHandledQuery = rawQuery;
      const query = rawQuery.trim().toLowerCase();
      highlightedIndex = -1;

      syncSiblingInputs(rawQuery);

      if (query === "") {
        dropdown.innerHTML = "";
        dropdown.setAttribute("role", "listbox");
        dropdown.removeAttribute("aria-live");
        closeDropdown();
        if (document.body.classList.contains("page-shop") && typeof window.__setShopSearch === "function") {
          window.__setShopSearch("");
        }
        return;
      }

      const matches = CACHED_PRODUCTS.filter((p) => matchesProductSearch(p, query));

      dropdown.innerHTML = "";

      if (matches.length === 0) {
        dropdown.setAttribute("role", "status");
        dropdown.setAttribute("aria-live", "polite");
        dropdown.innerHTML = `<p class="search-empty">No products found matching "<strong>${escapeHtml(query)}</strong>"</p>`;
      } else {
        dropdown.setAttribute("role", "listbox");
        dropdown.removeAttribute("aria-live");
        const fragment = document.createDocumentFragment();
        matches.slice(0, 8).forEach((p, idx) => {
          const item = document.createElement("a");
          item.className = "search-result-item";
          item.id = `${dropdownId}-option-${idx}`;
          item.setAttribute("role", "option");
          item.setAttribute("aria-selected", "false");
          item.href = `product.html?id=${p.id}`;
          item.innerHTML = `
            <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" class="search-result-thumb" width="48" height="48" loading="lazy" decoding="async">
            <div class="search-result-info">
              <span class="search-result-title">${escapeHtml(p.name)}</span>
              <div class="search-result-meta">
                <span class="search-result-category">${escapeHtml(p.category || "")}</span>
                <span>★ ${p.rating} (${p.reviewCount})</span>
              </div>
            </div>
            <span class="search-result-price">$${p.priceNow}</span>
          `;
          fragment.appendChild(item);
        });
        dropdown.appendChild(fragment);
      }

      dropdown.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");

      // Live-filter shop page grid via unified shop state
      if (document.body.classList.contains("page-shop") && typeof window.__setShopSearch === "function") {
        window.__setShopSearch(rawQuery.trim());
      }
    }

    input.addEventListener("input", function () {
      const rawQuery = input.value;
      syncSiblingInputs(rawQuery);
      clearTimeout(debounceTimer);
      if (rawQuery.trim() === "") {
        handleQueryChange();
        return;
      }
      debounceTimer = setTimeout(handleQueryChange, 150);
    });

    input.addEventListener("search", function () {
      clearTimeout(debounceTimer);
      if (input.value !== lastHandledQuery) {
        handleQueryChange();
      }
    });

    input.addEventListener("keydown", function (e) {
      const items = Array.from(dropdown.querySelectorAll(".search-result-item"));

      if (e.key === "ArrowDown" && dropdown.classList.contains("is-open") && items.length > 0) {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % items.length;
        updateHighlight(items);
        return;
      }

      if (e.key === "ArrowUp" && dropdown.classList.contains("is-open") && items.length > 0) {
        e.preventDefault();
        highlightedIndex = highlightedIndex <= 0 ? items.length - 1 : highlightedIndex - 1;
        updateHighlight(items);
        return;
      }

      if (e.key === "Escape" && dropdown.classList.contains("is-open")) {
        e.preventDefault();
        closeDropdown();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(debounceTimer);
        if (input.value !== lastHandledQuery) {
          handleQueryChange();
        }
        const latestItems = Array.from(dropdown.querySelectorAll(".search-result-item"));
        if (highlightedIndex >= 0 && latestItems[highlightedIndex]) {
          window.location.href = latestItems[highlightedIndex].href;
          return;
        }

        const query = input.value.trim();
        if (!query) return;

        if (document.body.classList.contains("page-shop")) {
          closeDropdown();
          return;
        }

        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
      }
    });
  });

  // Close search dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-bar")) {
      document.querySelectorAll(".search-results-dropdown.is-open").forEach((d) => {
        d.classList.remove("is-open");
      });
      document.querySelectorAll(".search-bar input[aria-expanded='true']").forEach((inp) => {
        inp.setAttribute("aria-expanded", "false");
        inp.removeAttribute("aria-activedescendant");
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
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

if (cartDrawer) {
  cartDrawer.setAttribute("role", "dialog");
  cartDrawer.setAttribute("aria-modal", "true");
  cartDrawer.setAttribute("aria-label", "Shopping cart");
}

let lastFocusedBeforeCart = null;

function getCartFocusableElements() {
  if (!cartDrawer) return [];
  const candidates = cartDrawer.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(candidates).filter((el) => !el.hidden && !(el.closest && el.closest("[hidden]")));
}

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  lastFocusedBeforeCart = document.activeElement || cartBtn || null;
  renderCartDrawer();
  cartDrawer.classList.add("is-open");
  cartOverlay.classList.add("is-visible");
  if (cartDrawerClose) {
    cartDrawerClose.focus();
  } else {
    const focusables = getCartFocusableElements();
    if (focusables.length > 0) focusables[0].focus();
  }
}

function closeCart() {
  const wasOpen = cartDrawer && cartDrawer.classList.contains("is-open");
  if (cartDrawer) cartDrawer.classList.remove("is-open");
  if (cartOverlay) cartOverlay.classList.remove("is-visible");
  if (wasOpen) {
    const target = lastFocusedBeforeCart && typeof lastFocusedBeforeCart.focus === "function"
      ? lastFocusedBeforeCart
      : cartBtn;
    lastFocusedBeforeCart = null;
    if (target && typeof target.focus === "function") {
      target.focus();
    }
  }
}

if (cartBtn && cartDrawer && cartOverlay) {
  cartBtn.addEventListener("click", openCart);
}

if (cartDrawerClose) {
  cartDrawerClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", clearCart);
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function (e) {
    if (checkoutBtn.getAttribute("aria-disabled") === "true") {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  checkoutBtn.addEventListener("keydown", function (e) {
    if (
      checkoutBtn.getAttribute("aria-disabled") === "true" &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

// Global keydown handler: Tab focus trap for cart drawer + Escape to dismiss overlays
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab" && cartDrawer && cartDrawer.classList.contains("is-open")) {
    const focusables = getCartFocusableElements();
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !cartDrawer.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !cartDrawer.contains(document.activeElement))) {
      e.preventDefault();
      first.focus();
    }
    return;
  }

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
    document.querySelectorAll(".search-bar input[aria-expanded='true']").forEach((inp) => {
      inp.setAttribute("aria-expanded", "false");
      inp.removeAttribute("aria-activedescendant");
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

function renderProductRow(row, rowIndex = 0) {
  if (typeof products === "undefined") return;

  const category = row.dataset.category;
  const scrollContainer = row.querySelector(".product-scroll");
  if (!scrollContainer) return;

  let matchingProducts;
  if (category === "bestsellers") {
    matchingProducts = CACHED_PRODUCTS.filter((p) => p.bestSeller);
  } else {
    matchingProducts = CACHED_PRODUCTS.filter(
      (p) => p.category === category
    );
  }

  scrollContainer.innerHTML = "";
  const wishlistSet = new Set(getWishlist());
  const fragment = document.createDocumentFragment();

  matchingProducts.forEach((product, idx) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const active = wishlistSet.has(String(product.id));
    const loadingAttr = rowIndex === 0 && idx < 2 ? "" : ' loading="lazy"';

    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-link">
        <div class="product-img">
          <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" width="400" height="460"${loadingAttr} decoding="async">
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-meta">
          <span class="price">$${product.priceNow}</span>
          <span class="rating">★ ${product.rating} (${product.reviewCount})</span>
        </div>
      </a>
      <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-pressed="${active ? "true" : "false"}" aria-label="${active ? "Remove from wishlist" : "Add to wishlist"}">
        <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="" aria-hidden="true" width="24" height="24" loading="lazy" decoding="async">
      </button>
    `;

    fragment.appendChild(card);
  });

  scrollContainer.appendChild(fragment);
}

if (document.body.classList.contains("page-home")) {
  document.querySelectorAll(".category-row").forEach((row, rowIndex) => {
    renderProductRow(row, rowIndex);
  });

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
    let trackWidth = 0;
    let isDragging = false;

    heroTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      trackWidth = heroTrack.offsetWidth || 1;
      isDragging = true;
      heroTrack.style.transition = "none";
    }, { passive: true });

    heroTrack.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (Math.abs(diff) < 20) return;
      const percentDiff = (diff / trackWidth) * 100;
      heroTrack.style.transform = `translateX(calc(-${currentSlide * 100}% + ${percentDiff}%))`;
    }, { passive: true });

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
    }, { passive: true });
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

    filterOptions.forEach((opt) => {
      const isActive = opt.dataset.category === category;
      opt.classList.toggle("is-active", isActive);
      opt.setAttribute("aria-pressed", isActive ? "true" : "false");
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
            <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" width="64" height="64" loading="lazy" decoding="async">
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
    document.title = "Product Not Found — FindStyle";
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
    // Populate PDP content and SEO metadata safely via text/attribute APIs
    document.title = `${product.name} — FindStyle`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && product.shortDescription) {
      metaDesc.setAttribute("content", product.shortDescription);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${product.name} — FindStyle`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && product.shortDescription) {
      ogDesc.setAttribute("content", product.shortDescription);
    }
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

      const galleryFrag = document.createDocumentFragment();
      const dotsFrag = document.createDocumentFragment();

      product.images.forEach((imgSrc, index) => {
        const slide = document.createElement("div");
        slide.className = "gallery-slide";
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = product.name;
        img.width = 800;
        img.height = 920;
        img.decoding = "async";
        if (index === 0) {
          img.fetchPriority = "high";
        } else {
          img.loading = "lazy";
        }
        slide.appendChild(img);
        galleryFrag.appendChild(slide);

        const dot = document.createElement("button");
        dot.className = index === 0 ? "dot is-active" : "dot";
        dot.dataset.index = index;
        dotsFrag.appendChild(dot);
      });

      galleryTrack.appendChild(galleryFrag);
      galleryDots.appendChild(dotsFrag);

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
      const relatedProducts = CACHED_PRODUCTS
        .filter((p) => p.category === product.category && p.id !== productId)
        .slice(0, 8);
      const wishlistSet = new Set(getWishlist());
      const relatedFrag = document.createDocumentFragment();

      relatedProducts.forEach((p) => {
        const card = document.createElement("article");
        card.className = "product-card";
        const active = wishlistSet.has(String(p.id));

        card.innerHTML = `
          <a href="product.html?id=${p.id}" class="product-link">
            <div class="product-img">
              <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" width="400" height="460" loading="lazy" decoding="async">
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <div class="product-meta">
              <span class="price">$${p.priceNow}</span>
              <span class="rating"><span class="star">★</span> ${p.rating} (${p.reviewCount})</span>
            </div>
          </a>
          <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${p.id}" aria-pressed="${active ? "true" : "false"}" aria-label="${active ? "Remove from wishlist" : "Add to wishlist"}">
            <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="" aria-hidden="true" width="24" height="24" loading="lazy" decoding="async">
          </button>
        `;

        relatedFrag.appendChild(card);
      });

      relatedGrid.appendChild(relatedFrag);
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
    let trackWidth = 0;
    let isDragging = false;

    galleryTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      trackWidth = galleryTrack.offsetWidth || 1;
      isDragging = true;
      galleryTrack.style.transition = "none";
    }, { passive: true });

    galleryTrack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (Math.abs(diff) < 10) return;
      const percentDiff = (diff / trackWidth) * 100;
      galleryTrack.style.transform = `translateX(calc(-${currentImage * 100}% + ${percentDiff}%))`;
    }, { passive: true });

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
    }, { passive: true });
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

  const SHOP_CATEGORIES = new Set(["all", "bestsellers", "shoes", "pants", "jackets", "T-shirts", "shirts"]);
  const SHOP_SORTS = new Set(["featured", "price-asc", "price-desc", "rating-desc"]);

  const shopTitle = document.getElementById("shopTitle");
  const shopGrid = document.getElementById("shopGrid");
  const shopResultCount = document.getElementById("shopResultCount");
  const shopSortSelect = document.getElementById("shopSort");
  const filterOptions = document.querySelectorAll(".filter-option");

  const categoryLabels = {
    all: "Shop All",
    shoes: "Shoes",
    pants: "Pants",
    jackets: "Jackets",
    "T-shirts": "T-shirts",
    shirts: "Shirts",
    bestsellers: "Bestsellers"
  };

  const shopState = {
    category: "all",
    search: "",
    sort: "featured"
  };

  function readShopStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawCat = params.get("category") || "all";
    const rawSort = params.get("sort") || "featured";
    const rawSearch = params.get("search") || "";

    shopState.category = SHOP_CATEGORIES.has(rawCat) ? rawCat : "all";
    shopState.sort = SHOP_SORTS.has(rawSort) ? rawSort : "featured";
    shopState.search = rawSearch.trim();
  }

  function syncShopUrl(pushHistory = false) {
    const params = new URLSearchParams();
    if (shopState.category && shopState.category !== "all") {
      params.set("category", shopState.category);
    }
    if (shopState.search) {
      params.set("search", shopState.search);
    }
    if (shopState.sort && shopState.sort !== "featured") {
      params.set("sort", shopState.sort);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (targetUrl !== currentUrl) {
      if (pushHistory) {
        history.pushState(null, "", targetUrl);
      } else {
        history.replaceState(null, "", targetUrl);
      }
    }
  }

  function syncShopControls() {
    filterOptions.forEach((btn) => {
      const isActive = btn.dataset.category === shopState.category;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (shopSortSelect) {
      shopSortSelect.value = shopState.sort;
    }

    document.querySelectorAll(".search-bar input").forEach((inp) => {
      if (inp.value !== shopState.search) {
        inp.value = shopState.search;
      }
    });
  }

  function getFilteredAndSortedProducts() {
    if (typeof products === "undefined") return [];

    let list = CACHED_PRODUCTS.filter((p) => {
      if (shopState.category === "bestsellers") {
        if (!p.bestSeller) return false;
      } else if (shopState.category !== "all") {
        if (p.category !== shopState.category) return false;
      }

      if (shopState.search && !matchesProductSearch(p, shopState.search)) {
        return false;
      }

      return true;
    });

    if (shopState.sort === "price-asc") {
      list = [...list].sort((a, b) => a.priceNow - b.priceNow);
    } else if (shopState.sort === "price-desc") {
      list = [...list].sort((a, b) => b.priceNow - a.priceNow);
    } else if (shopState.sort === "rating-desc") {
      list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else {
      // Featured: bestsellers first while preserving original dataset order
      list = [...list].sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return list;
  }

  function renderShopGrid() {
    if (typeof products === "undefined" || !shopGrid) return;

    const matching = getFilteredAndSortedProducts();
    shopGrid.innerHTML = "";

    if (matching.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "shop-empty-state";
      emptyEl.innerHTML = `
        <p>No products match your current search or filters.</p>
        <button type="button" class="btn-reset-filters" id="resetShopFiltersBtn">Reset Filters</button>
      `;
      shopGrid.appendChild(emptyEl);

      const resetBtn = document.getElementById("resetShopFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          shopState.category = "all";
          shopState.search = "";
          shopState.sort = "featured";
          syncShopUrl(true);
          applyShopState();
        });
      }
    } else {
      const wishlistSet = new Set(getWishlist());
      const shopFrag = document.createDocumentFragment();
      matching.forEach((product, idx) => {
        const card = document.createElement("article");
        card.className = "product-card";
        const active = wishlistSet.has(String(product.id));
        const loadingAttr = idx < 4 ? "" : ' loading="lazy"';

        card.innerHTML = `
          <a href="product.html?id=${product.id}" class="product-link">
            <div class="product-img">
              <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" width="400" height="460"${loadingAttr} decoding="async">
            </div>
            <h3>${escapeHtml(product.name)}</h3>
            <div class="product-meta">
              <span class="price">$${product.priceNow}</span>
              <span class="rating"><span class="star">★</span> ${product.rating} (${product.reviewCount})</span>
            </div>
          </a>
          <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-pressed="${active ? "true" : "false"}" aria-label="${active ? "Remove from wishlist" : "Add to wishlist"}">
            <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="" aria-hidden="true" width="24" height="24" loading="lazy" decoding="async">
          </button>
        `;

        shopFrag.appendChild(card);
      });
      shopGrid.appendChild(shopFrag);
    }

    if (shopTitle) {
      const catLabel = categoryLabels[shopState.category] || "Shop";
      shopTitle.textContent = shopState.search
        ? `Search: "${shopState.search}"`
        : catLabel;
    }

    if (shopResultCount) {
      const noun = matching.length === 1 ? "product" : "products";
      shopResultCount.textContent = `${matching.length} ${noun}`;
    }
  }

  function applyShopState() {
    syncShopControls();
    renderShopGrid();
  }

  window.__setShopSearch = function (query) {
    const nextSearch = (query || "").trim();
    if (shopState.search === nextSearch) return;
    shopState.search = nextSearch;
    syncShopUrl(false);
    applyShopState();
  };

  filterOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = btn.dataset.category;
      if (cat && SHOP_CATEGORIES.has(cat)) {
        shopState.category = cat;
        syncShopUrl(true);
        applyShopState();
        if (filterDropdown) filterDropdown.classList.remove("is-open");
      }
    });
  });

  if (shopSortSelect) {
    shopSortSelect.addEventListener("change", function () {
      const val = shopSortSelect.value;
      shopState.sort = SHOP_SORTS.has(val) ? val : "featured";
      syncShopUrl(true);
      applyShopState();
    });
  }

  window.addEventListener("popstate", function () {
    readShopStateFromUrl();
    applyShopState();
  });

  readShopStateFromUrl();
  applyShopState();
}
