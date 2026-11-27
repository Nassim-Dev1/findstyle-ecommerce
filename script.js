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
    document.dispatchEvent(new CustomEvent("findstyle:wishlist-updated"));
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
  renderCartDrawer();
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
    el.classList.toggle("is-empty", totalItems === 0);
  });
}

const FREE_SHIPPING_THRESHOLD = 60;

function updateCartShippingBar(total) {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartItemsEl = document.getElementById("cartItems");
  if (!cartDrawer || !cartItemsEl) return;

  let bar = document.getElementById("cartShippingBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "cartShippingBar";
    bar.className = "cart-shipping-bar";
    cartDrawer.insertBefore(bar, cartItemsEl);
  }

  const pct = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const unlocked = total >= FREE_SHIPPING_THRESHOLD;

  bar.classList.toggle("is-unlocked", unlocked);
  bar.innerHTML = `
    <p class="cart-shipping-text">
      ${unlocked
        ? '<span aria-hidden="true">✓</span> You\'ve unlocked <strong>Free Shipping</strong>!'
        : total === 0
          ? `Free shipping on orders over <strong>$${FREE_SHIPPING_THRESHOLD}</strong>`
          : `Add <strong>$${remaining}</strong> more for <strong>Free Shipping</strong>`}
    </p>
    <div class="cart-shipping-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Free shipping progress">
      <div class="cart-shipping-fill" style="width: ${pct}%"></div>
    </div>
  `;
}

function updateCartUpsells(cart) {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartFooter = cartDrawer ? cartDrawer.querySelector(".cart-footer") : null;
  if (!cartDrawer || !cartFooter) return;

  let upsellsEl = document.getElementById("cartUpsells");
  if (!cart || cart.length === 0 || typeof CACHED_PRODUCTS === "undefined") {
    if (upsellsEl) upsellsEl.remove();
    return;
  }

  const inCartIds = new Set(cart.map((item) => String(item.productId)));
  const suggestions = CACHED_PRODUCTS
    .filter((p) => !inCartIds.has(String(p.id)))
    .sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || b.rating - a.rating)
    .slice(0, 3);

  if (suggestions.length === 0) {
    if (upsellsEl) upsellsEl.remove();
    return;
  }

  const wasOpen = upsellsEl ? upsellsEl.classList.contains("is-open") : false;

  if (!upsellsEl) {
    upsellsEl = document.createElement("div");
    upsellsEl.id = "cartUpsells";
    upsellsEl.className = "cart-upsells";
    cartDrawer.insertBefore(upsellsEl, cartFooter);
  }

  upsellsEl.classList.toggle("is-open", wasOpen);
  upsellsEl.innerHTML = `
    <button type="button" class="cart-upsells-toggle" aria-expanded="${wasOpen ? "true" : "false"}" aria-controls="cartUpsellsList">
      <span class="cart-upsells-title">Complete Your Look <span class="cart-upsells-count">(${suggestions.length})</span></span>
      <span class="cart-upsells-chevron" aria-hidden="true">${wasOpen ? "▴" : "▾"}</span>
    </button>
    <div class="cart-upsells-list" id="cartUpsellsList"${wasOpen ? "" : " hidden"}>
      ${suggestions.map((p) => {
        const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["M"];
        const sizeOpts = sizes.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
        return `
          <div class="cart-upsell-item">
            <a href="product.html?id=${p.id}" class="cart-upsell-thumb">
              <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" width="48" height="48" loading="lazy" decoding="async">
            </a>
            <div class="cart-upsell-info">
              <a href="product.html?id=${p.id}" class="cart-upsell-name">${escapeHtml(p.name)}</a>
              <span class="cart-upsell-price">$${p.priceNow}</span>
            </div>
            <div class="cart-upsell-actions">
              <select class="cart-upsell-size" aria-label="Select size for ${escapeHtml(p.name)}">${sizeOpts}</select>
              <button type="button" class="cart-upsell-add" data-id="${escapeHtml(p.id)}">+ Add</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
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
    updateCartShippingBar(0);
    updateCartUpsells([]);
    cartItemsEl.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="shop.html" class="btn-browse-shop" onclick="closeCartDrawer()">Browse Collection</a></div>';
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
    updateCartShippingBar(0);
    updateCartUpsells([]);
    cartItemsEl.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="shop.html" class="btn-browse-shop" onclick="closeCartDrawer()">Browse Collection</a></div>';
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

  updateCartShippingBar(total);
  updateCartUpsells(cart);
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

  const upsellToggle = e.target.closest(".cart-upsells-toggle");
  if (upsellToggle) {
    e.preventDefault();
    e.stopPropagation();
    const wrap = upsellToggle.closest(".cart-upsells");
    const list = wrap ? wrap.querySelector(".cart-upsells-list") : null;
    const chevron = upsellToggle.querySelector(".cart-upsells-chevron");
    if (wrap && list) {
      const nextOpen = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", nextOpen);
      list.hidden = !nextOpen;
      upsellToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      if (chevron) chevron.textContent = nextOpen ? "▴" : "▾";
    }
    return;
  }

  const upsellBtn = e.target.closest(".cart-upsell-add");
  if (upsellBtn) {
    e.preventDefault();
    e.stopPropagation();
    const row = upsellBtn.closest(".cart-upsell-item");
    const sizeSelect = row ? row.querySelector(".cart-upsell-size") : null;
    const chosenSize = sizeSelect ? sizeSelect.value : "M";
    addToCart(upsellBtn.dataset.id, chosenSize);
    return;
  }

  const quickSizeBtn = e.target.closest(".quick-size-btn");
  if (quickSizeBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = quickSizeBtn.dataset.id;
    const size = quickSizeBtn.dataset.size;
    if (!id || !size) return;
    addToCart(id, size);
    triggerCartFlyAnimation(quickSizeBtn);
    if (!quickSizeBtn.dataset.busy) {
      quickSizeBtn.dataset.busy = "1";
      const orig = quickSizeBtn.textContent;
      quickSizeBtn.textContent = "✓";
      quickSizeBtn.classList.add("is-added");
      setTimeout(function () {
        quickSizeBtn.textContent = orig;
        quickSizeBtn.classList.remove("is-added");
        delete quickSizeBtn.dataset.busy;
      }, 1000);
    }
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
let closeMobileNavDrawer = null;
function initMobileNav() {
  const menuToggle = document.getElementById("menuToggle");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");
  const mobileNav = document.getElementById("mobileNav");

  if (!menuToggle || !mobileNav) return;

  menuToggle.setAttribute("aria-controls", "mobileNav");
  menuToggle.setAttribute("aria-expanded", "false");

  function openNav() {
    mobileNav.classList.add("is-open");
    if (navOverlay) navOverlay.classList.add("is-visible");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (navClose) {
      requestAnimationFrame(() => navClose.focus());
    }
  }

  function closeNav() {
    if (!mobileNav.classList.contains("is-open")) return;
    mobileNav.classList.remove("is-open");
    if (navOverlay) navOverlay.classList.remove("is-visible");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (mobileNav.contains(document.activeElement)) {
      menuToggle.focus();
    }
  }

  closeMobileNavDrawer = closeNav;
  menuToggle.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navOverlay) navOverlay.addEventListener("click", closeNav);
  if (window.matchMedia) {
    const desktopMq = window.matchMedia("(min-width: 900px)");
    const handleDesktopMq = (ev) => {
      if (ev.matches) closeNav();
    };
    if (desktopMq.addEventListener) {
      desktopMq.addEventListener("change", handleDesktopMq);
    }
  }
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

    if (closeMobileNavDrawer) {
      closeMobileNavDrawer();
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

/**
 * Shared product card builder with Quick-Add size pills and wishlist toggle.
 * @param {Object} product
 * @param {Set<string>} wishlistSet
 * @param {boolean} eager - Load image eagerly when above the fold
 * @returns {HTMLElement}
 */
function createProductCard(product, wishlistSet, eager = false) {
  const card = document.createElement("article");
  card.className = "product-card";
  const active = wishlistSet.has(String(product.id));
  const loadingAttr = eager ? "" : ' loading="lazy"';
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const quickSizesHtml = sizes.length
    ? `<div class="quick-add-bar" role="group" aria-label="Quick add size for ${escapeHtml(product.name)}">
        <span class="quick-add-label">Quick Add:</span>
        <div class="quick-add-sizes">
          ${sizes.map((s) => `<button type="button" class="quick-size-btn" data-id="${escapeHtml(product.id)}" data-size="${escapeHtml(s)}" aria-label="Add ${escapeHtml(product.name)} size ${escapeHtml(s)} to cart">${escapeHtml(s)}</button>`).join("")}
        </div>
      </div>`
    : "";

  const bestSellerBadge = product.bestSeller
    ? '<span class="badge-bestseller">Best Seller</span>'
    : "";
  const priceHtml = product.priceWas && product.priceWas > product.priceNow
    ? `<span class="price-group"><span class="price">$${product.priceNow}</span><s class="card-price-was">$${product.priceWas}</s></span>`
    : `<span class="price">$${product.priceNow}</span>`;

  card.innerHTML = `
    <a href="product.html?id=${product.id}" class="product-link">
      <div class="product-img">
        <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" width="400" height="460"${loadingAttr} decoding="async">
        ${bestSellerBadge}
        ${quickSizesHtml}
      </div>
      <h3>${escapeHtml(product.name)}</h3>
      <div class="product-meta">
        ${priceHtml}
        <span class="rating"><span class="star">★</span> ${product.rating} (${product.reviewCount})</span>
      </div>
    </a>
    <button type="button" class="wishlist-btn ${active ? "is-active" : ""}" data-id="${product.id}" aria-pressed="${active ? "true" : "false"}" aria-label="${active ? "Remove from wishlist" : "Add to wishlist"}">
      <img src="${active ? "img/icons/heart-filled.png" : "img/icons/heart-outline.png"}" alt="" aria-hidden="true" width="24" height="24" loading="lazy" decoding="async">
    </button>
  `;

  return card;
}

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
    fragment.appendChild(createProductCard(product, wishlistSet, rowIndex === 0 && idx < 2));
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

  // Community layered ripple & tactile iPhone response
  const desktopCommunity = document.getElementById("desktopCommunity");
  const iphoneContainer = desktopCommunity ? desktopCommunity.querySelector(".iphone-container") : null;
  const screenContent = document.querySelector(".screen-content");

  if (screenContent) {
    screenContent.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  if (desktopCommunity) {
    const brandRippleColors = ["#1F2E46", "#354A69", "#C99A2E", "#4F5D50"];
    const prefersReducedMotionQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false };
    let colorIndex = 0;
    let clickStreak = 0;
    let lastClickTime = 0;
    let pulseTimeout = null;
    const MAX_ACTIVE_RIPPLES = 10;

    desktopCommunity.addEventListener("click", function (e) {
      if (e.target.closest(".screen-content")) return;

      const now = Date.now();
      clickStreak = now - lastClickTime < 1200 ? Math.min(clickStreak + 1, 8) : 1;
      lastClickTime = now;

      if (iphoneContainer) {
        iphoneContainer.classList.add("is-pulsing");
        clearTimeout(pulseTimeout);
        pulseTimeout = setTimeout(() => {
          iphoneContainer.classList.remove("is-pulsing");
        }, 320);
      }

      if (prefersReducedMotionQuery.matches) return;

      const activeRipples = desktopCommunity.querySelectorAll(".community-ripple");
      if (activeRipples.length >= MAX_ACTIVE_RIPPLES) {
        activeRipples[0].remove();
      }

      const rect = desktopCommunity.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("div");
      ripple.className = clickStreak % 5 === 0
        ? "community-ripple community-ripple--accent"
        : "community-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.setProperty("--ripple-color", brandRippleColors[colorIndex % brandRippleColors.length]);
      ripple.style.setProperty("--ripple-scale", String(1 + (clickStreak - 1) * 0.065));
      colorIndex += 1;

      const core = document.createElement("span");
      core.className = "community-ripple-core";
      const ring = document.createElement("span");
      ring.className = "community-ripple-ring";
      const echo = document.createElement("span");
      echo.className = "community-ripple-echo";

      ripple.append(core, ring, echo);
      desktopCommunity.appendChild(ripple);

      const cleanup = () => {
        if (ripple.isConnected) ripple.remove();
      };
      echo.addEventListener("animationend", cleanup, { once: true });
      setTimeout(cleanup, 1250);
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
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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
    const baseUrl = "https://nassim-dev1.github.io/findstyle-ecommerce/";
    const defaultImageUrl = `${baseUrl}img/hero/desktopHero.webp`;
    document.title = "Product Not Found — FindStyle";
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute("content", "noindex, follow");
    const staleJsonLd = document.getElementById("productJsonLd");
    if (staleJsonLd) staleJsonLd.remove();
    const notFoundTitle = "Product Not Found — FindStyle";
    const notFoundDesc = "The product you are looking for does not exist or has been removed.";
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute("href", `${baseUrl}product.html`);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", notFoundDesc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", notFoundTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", notFoundDesc);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", `${baseUrl}product.html`);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", defaultImageUrl);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", notFoundTitle);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", notFoundDesc);
    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage) twImage.setAttribute("content", defaultImageUrl);
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
    const baseUrl = "https://nassim-dev1.github.io/findstyle-ecommerce/";
    const canonicalUrl = `${baseUrl}product.html?id=${encodeURIComponent(product.id)}`;
    const productImageUrl = product.images && product.images[0] ? `${baseUrl}${product.images[0]}` : null;

    document.title = `${product.name} — FindStyle`;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute("href", canonicalUrl);

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
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && productImageUrl) {
      ogImage.setAttribute("content", productImageUrl);
    }
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", `${product.name} — FindStyle`);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && product.shortDescription) {
      twDesc.setAttribute("content", product.shortDescription);
    }
    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage && productImageUrl) {
      twImage.setAttribute("content", productImageUrl);
    }

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: "FindStyle"
      },
      url: canonicalUrl
    };
    if (product.shortDescription) {
      productSchema.description = product.shortDescription;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      productSchema.image = product.images.map((imgPath) => `${baseUrl}${imgPath}`);
    }
    if (typeof product.priceNow === "number") {
      productSchema.offers = {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "USD",
        price: product.priceNow
      };
    }
    if (typeof product.rating === "number" && typeof product.reviewCount === "number" && product.reviewCount > 0) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      };
    }
    let jsonLdScript = document.getElementById("productJsonLd");
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.id = "productJsonLd";
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(productSchema);
    const titleEl = document.querySelector(".product-info h1");
    if (titleEl) titleEl.textContent = product.name;

    const hasDiscount = Boolean(product.priceWas && product.priceWas > product.priceNow);
    const priceNowEl = document.querySelector(".price-now");
    if (priceNowEl) {
      priceNowEl.textContent = hasDiscount ? `NOW $${product.priceNow}` : `$${product.priceNow}`;
    }

    const priceWasEl = document.querySelector(".price-was");
    if (priceWasEl) {
      if (hasDiscount) {
        priceWasEl.textContent = `Was $${product.priceWas}`;
        priceWasEl.style.display = "";
      } else {
        priceWasEl.style.display = "none";
      }
    }

    const priceBlock = document.querySelector(".price-block");
    if (priceBlock) {
      let discountBadge = priceBlock.querySelector(".price-discount-badge");
      if (hasDiscount) {
        const pct = Math.round(((product.priceWas - product.priceNow) / product.priceWas) * 100);
        if (!discountBadge) {
          discountBadge = document.createElement("span");
          discountBadge.className = "price-discount-badge";
          priceBlock.appendChild(discountBadge);
        }
        discountBadge.textContent = `-${pct}%`;
        discountBadge.style.display = "";
      } else if (discountBadge) {
        discountBadge.style.display = "none";
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

      // Lightbox zoom on product image click
      galleryTrack.addEventListener("click", function (e) {
        const clickedImg = e.target.closest("img");
        if (!clickedImg) return;
        let lightbox = document.getElementById("pdpLightbox");
        if (!lightbox) {
          lightbox = document.createElement("div");
          lightbox.id = "pdpLightbox";
          lightbox.className = "pdp-lightbox";
          lightbox.setAttribute("role", "dialog");
          lightbox.setAttribute("aria-modal", "true");
          lightbox.setAttribute("aria-label", "Product image zoom");
          lightbox.innerHTML = `
            <button type="button" class="pdp-lightbox-close" aria-label="Close image zoom">&times;</button>
            <img class="pdp-lightbox-img" src="" alt="" />
          `;
          document.body.appendChild(lightbox);

          const closeLightbox = () => {
            lightbox.classList.remove("is-open");
            document.body.classList.remove("modal-open");
          };
          lightbox.querySelector(".pdp-lightbox-close").addEventListener("click", closeLightbox);
          lightbox.addEventListener("click", function (ev) {
            if (ev.target === lightbox) closeLightbox();
          });
          document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape" && lightbox.classList.contains("is-open")) {
              closeLightbox();
            }
          });
        }
        const lbImg = lightbox.querySelector(".pdp-lightbox-img");
        lbImg.src = clickedImg.src;
        lbImg.alt = clickedImg.alt || product.name;
        lightbox.classList.add("is-open");
        document.body.classList.add("modal-open");
      });
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

      // Enhance native select with tactile size pills
      const sizeSelectorWrap = sizeSelect.closest(".size-selector");
      if (sizeSelectorWrap) {
        sizeSelect.classList.add("is-enhanced-select");
        let pillsEl = sizeSelectorWrap.querySelector(".size-pills");
        if (!pillsEl) {
          pillsEl = document.createElement("div");
          pillsEl.className = "size-pills";
          pillsEl.setAttribute("role", "radiogroup");
          pillsEl.setAttribute("aria-label", "Select size");
          sizeSelectorWrap.appendChild(pillsEl);
        }
        pillsEl.innerHTML = "";
        product.sizes.forEach((size) => {
          const pill = document.createElement("button");
          pill.type = "button";
          pill.className = "size-pill";
          pill.textContent = size;
          pill.dataset.size = size;
          pill.setAttribute("role", "radio");
          pill.setAttribute("aria-checked", "false");
          pill.addEventListener("click", function () {
            sizeSelect.value = size;
            sizeSelectorWrap.classList.remove("is-error-shake");
            pillsEl.querySelectorAll(".size-pill").forEach((b) => {
              const selected = b === pill;
              b.classList.toggle("is-selected", selected);
              b.setAttribute("aria-checked", selected ? "true" : "false");
            });
          });
          pillsEl.appendChild(pill);
        });
      }
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
        relatedFrag.appendChild(createProductCard(p, wishlistSet, false));
      });

      relatedGrid.appendChild(relatedFrag);
    }

    // Recently viewed products persistence & strip
    const RECENT_KEY = "findstyle_recently_viewed";
    let recentIds = [];
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(raw)) recentIds = raw.map(String);
    } catch {}

    const otherRecent = recentIds
      .filter((id) => id !== String(productId))
      .map((id) => (typeof products !== "undefined" ? products[id] : null))
      .filter(Boolean)
      .slice(0, 4);

    // Save current product at the front
    const updatedRecent = [String(productId), ...recentIds.filter((id) => id !== String(productId))].slice(0, 6);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updatedRecent));
    } catch {}

    const relatedSection = document.querySelector(".related-products");
    if (relatedSection && otherRecent.length > 0) {
      let recentSection = document.querySelector(".recently-viewed-products");
      if (!recentSection) {
        recentSection = document.createElement("section");
        recentSection.className = "related-products recently-viewed-products";
        recentSection.innerHTML = `<h2>RECENTLY VIEWED</h2><div class="related-grid"></div>`;
        relatedSection.insertAdjacentElement("afterend", recentSection);
      }
      const recentGrid = recentSection.querySelector(".related-grid");
      if (recentGrid) {
        recentGrid.innerHTML = "";
        const wishlistSet = new Set(getWishlist());
        const frag = document.createDocumentFragment();
        otherRecent.forEach((p) => frag.appendChild(createProductCard(p, wishlistSet, false)));
        recentGrid.appendChild(frag);
      }
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
        const sizeSelectorWrap = sizeSelect ? sizeSelect.closest(".size-selector") : null;
        if (sizeSelectorWrap) {
          sizeSelectorWrap.classList.remove("is-error-shake");
          void sizeSelectorWrap.offsetWidth;
          sizeSelectorWrap.classList.add("is-error-shake");
          sizeSelectorWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        showToast("Please select a size first", "warning");
        return;
      }

      addToCart(product.id, selectedSize);

      // Satisfaction feedback: button text + pulse animation
      if (!addToCartBtn.dataset.busy) {
        addToCartBtn.dataset.busy = "1";
        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = "Added ✓";
        addToCartBtn.classList.add("is-added");
        setTimeout(function () {
          addToCartBtn.textContent = originalText;
          addToCartBtn.classList.remove("is-added");
          delete addToCartBtn.dataset.busy;
        }, 1200);
      }

      // Fly-to-cart particle
      triggerCartFlyAnimation(addToCartBtn);
    });

    // Sticky mobile buy bar when #addToCartBtn scrolls out of view
    if (product && "IntersectionObserver" in window) {
      const stickyBar = document.createElement("div");
      stickyBar.className = "sticky-buy-bar";
      stickyBar.setAttribute("aria-hidden", "true");
      stickyBar.innerHTML = `
        <div class="sticky-buy-info">
          <span class="sticky-buy-title">${escapeHtml(product.name)}</span>
          <span class="sticky-buy-price">$${product.priceNow}</span>
        </div>
        <button type="button" class="sticky-buy-btn">ADD TO CART</button>
      `;
      document.body.appendChild(stickyBar);

      const stickyBtn = stickyBar.querySelector(".sticky-buy-btn");
      if (stickyBtn) {
        stickyBtn.addEventListener("click", function () {
          addToCartBtn.click();
        });
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0].isIntersecting;
          const show = !isVisible && window.innerWidth < 900;
          stickyBar.classList.toggle("is-visible", show);
          stickyBar.setAttribute("aria-hidden", show ? "false" : "true");
        },
        { threshold: 0.1 }
      );
      observer.observe(addToCartBtn);
    }
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

  const SHOP_CATEGORIES = new Set(["all", "bestsellers", "saved", "shoes", "pants", "jackets", "T-shirts", "shirts"]);
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
    bestsellers: "Bestsellers",
    saved: "Saved Items"
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

    const wishlistSet = shopState.category === "saved" ? new Set(getWishlist()) : null;

    let list = CACHED_PRODUCTS.filter((p) => {
      if (shopState.category === "bestsellers") {
        if (!p.bestSeller) return false;
      } else if (shopState.category === "saved") {
        if (!wishlistSet.has(String(p.id))) return false;
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
      const emptyMsg = shopState.category === "saved"
        ? "You haven't saved any items yet. Tap the heart icon on any product to save it here."
        : "No products match your current search or filters.";
      emptyEl.innerHTML = `
        <p>${emptyMsg}</p>
        <button type="button" class="btn-reset-filters" id="resetShopFiltersBtn">${shopState.category === "saved" ? "Browse All Products" : "Reset Filters"}</button>
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
        shopFrag.appendChild(createProductCard(product, wishlistSet, idx < 4));
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

  document.addEventListener("findstyle:wishlist-updated", function () {
    if (shopState.category === "saved") {
      applyShopState();
    }
  });

  readShopStateFromUrl();
  applyShopState();
}

// ==========================================================================
// 10. STAGE 9b: UX ENHANCEMENTS
// - Footer "not available" toast handler
// - Social "coming soon" handler
// - Add-to-cart fly animation
// - Product-scroll arrow buttons
// ==========================================================================

// ── A. Footer "not available" + social "coming soon" ───────────────────────
document.addEventListener("click", function (e) {
  // Footer dead-links → "coming soon" toast
  const soonBtn = e.target.closest(".footer-link-soon");
  if (soonBtn) {
    e.preventDefault();
    const label = soonBtn.dataset.label || soonBtn.textContent.trim();
    showToast(
      label + " — not available yet. This is a portfolio project.",
      "info",
      4000
    );
    return;
  }

  // Social links with data-soon → "coming soon" toast
  const socialLink = e.target.closest("[data-soon]");
  if (socialLink) {
    e.preventDefault();
    const platform =
      socialLink.dataset.soon.charAt(0).toUpperCase() +
      socialLink.dataset.soon.slice(1);
    showToast(
      "Our " + platform + " page isn't live yet — stay tuned!",
      "info",
      4000
    );
  }
});

// ── B. Close-cart helper used by browse-collection link ───────────────────
function closeCartDrawer() {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartDrawer) cartDrawer.classList.remove("is-open");
  if (cartOverlay) cartOverlay.classList.remove("is-open");
  document.body.classList.remove("cart-open");
}

// ── C. Fly-to-cart particle animation ─────────────────────────────────────
function triggerCartFlyAnimation(originEl) {
  const cartIcon = document.querySelector(".cart-icon-btn") ||
                   document.querySelector(".cart-btn");
  if (!originEl || !cartIcon) return;

  const dot = document.createElement("div");
  dot.className = "cart-fly-dot";
  document.body.appendChild(dot);

  const originRect = originEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const startX = originRect.left + originRect.width / 2;
  const startY = originRect.top + originRect.height / 2;
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  dot.style.cssText = [
    "position:fixed",
    "z-index:9999",
    "width:12px",
    "height:12px",
    "border-radius:50%",
    "background:var(--color-accent)",
    "pointer-events:none",
    "left:" + startX + "px",
    "top:" + startY + "px",
    "transform:translate(-50%,-50%) scale(1)",
    "transition:left 0.55s cubic-bezier(.4,0,.2,1),top 0.55s cubic-bezier(.4,0,.2,1),opacity 0.55s,transform 0.55s"
  ].join(";");

  // Force reflow
  void dot.offsetWidth;

  dot.style.left = endX + "px";
  dot.style.top = endY + "px";
  dot.style.transform = "translate(-50%,-50%) scale(0.3)";
  dot.style.opacity = "0";

  setTimeout(function () {
    dot.remove();
    // Bounce the cart icon
    cartIcon.classList.add("cart-bounce");
    setTimeout(function () { cartIcon.classList.remove("cart-bounce"); }, 500);
  }, 600);
}

// ── D. Product-scroll arrow buttons ────────────────────────────────────────
(function initScrollArrows() {
  if (window.innerWidth < 900) return;

  document.querySelectorAll(".product-scroll-wrapper").forEach(function (wrapper) {
    const scroll = wrapper.querySelector(".product-scroll");
    const prevBtn = wrapper.querySelector(".scroll-arrow-prev");
    const nextBtn = wrapper.querySelector(".scroll-arrow-next");
    if (!scroll || !prevBtn || !nextBtn) return;

    function updateArrows() {
      prevBtn.disabled = scroll.scrollLeft <= 4;
      nextBtn.disabled = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
    }

    prevBtn.addEventListener("click", function () {
      scroll.scrollBy({ left: -300, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      scroll.scrollBy({ left: 300, behavior: "smooth" });
    });

    scroll.addEventListener("scroll", updateArrows, { passive: true });

    // Initial state after products render (slight delay for JS-rendered cards)
    setTimeout(updateArrows, 300);
  });
})();

// ==========================================================================
// 11. STAGE 11: BACK TO TOP & '/' SEARCH SHORTCUT
// ==========================================================================

(function initBackToTop() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "back-to-top-btn";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.appendChild(btn);

  function toggleVisibility() {
    btn.classList.toggle("is-visible", window.scrollY > 400);
  }

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

document.addEventListener("keydown", function (e) {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
  const active = document.activeElement;
  if (
    active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.tagName === "SELECT" ||
      active.isContentEditable)
  ) {
    return;
  }

  const searchInputs = Array.from(document.querySelectorAll(".search-bar input"));
  const visibleInput = searchInputs.find((inp) => inp.offsetParent !== null);
  if (visibleInput) {
    e.preventDefault();
    visibleInput.focus();
  }
});
