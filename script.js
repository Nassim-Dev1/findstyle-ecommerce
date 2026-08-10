function initWishlistButtons() {
  const wishlistButtons = document.querySelectorAll(".wishlist-btn");
  wishlistButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("is-active");
      const img = btn.querySelector("img");img.src = btn.classList.contains("is-active")
        ? "img/icons/heart-filled.png"
        : "img/icons/heart-outline.png";
    });
  });
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, size, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(
    (item) => item.productId === productId && item.size === size,
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, size, quantity });
  }
  saveCart(cart);
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(
    (item) => !(item.productId === productId && item.size === size),
  );
  saveCart(cart);
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

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartTotalEl.textContent = "$0";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const product = products[item.productId];
    if (!product) return;

    const lineTotal = product.priceNow * item.quantity;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
    <img src="${product.images[0]}" alt="${product.name}">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <span class="cart-item-size">Size: ${item.size}</span>
        <span class="cart-item-qty">Qty: ${item.quantity}</span>
        <span class="cart-item-price">$${lineTotal}</span>
      </div>
      <button class="cart-item-remove" data-id="${item.productId}" data-size="${item.size}" aria-label="Remove">✕</button>
    `;

    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = `$${total}`;

  document.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      removeFromCart(btn.dataset.id, btn.dataset.size);
      renderCartDrawer();
    });
  });

  const message = cart
    .map((item) => {
      const p = products[item.productId];
      return `${p.name} (Size ${item.size}) x${item.quantity} - $${p.priceNow * item.quantity}`;
    })
    .join("\n");

  const fullMessage = `Hi, I'd like to order:\n\n${message}\n\nTotal: $${total}`;
  checkoutBtn.href = `https://wa.me/213559959122?text=${encodeURIComponent(fullMessage)}`;
}

function renderProductRow(row) {
  const category = row.dataset.category;
  const scrollContainer = row.querySelector(".product-scroll");

  let matchingProducts;

  if (category === "bestsellers") {
    matchingProducts = Object.values(products).filter((p) => p.bestSeller);
  } else {
    matchingProducts = Object.values(products).filter(
      (p) => p.category === category,
    );
  }

  scrollContainer.innerHTML = "";

  matchingProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
    <a href="product.html?id=${product.id}" class="product-link">
      <div class="product-img">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
      <h3>${product.name}</h3>
      <div class="product-meta">
        <span class="price">$${product.priceNow}</span>
        <span class="rating">★ ${product.rating} (${product.reviewCount})</span>
      </div>
    </a>

    <button class="wishlist-btn" aria-label="Add to wishlist">
      <img src="img/icons/heart-outline.png" alt="">
    </button>
    `;

    scrollContainer.appendChild(card);
  });
}

updateCartCount();

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

initWishlistButtons();

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawerClose = document.getElementById("cartDrawerClose");

if (cartBtn) {
  cartBtn.addEventListener("click", function () {
    renderCartDrawer();
    cartDrawer.classList.add("is-open");
    cartOverlay.classList.add("is-visible");
  });
}

if (cartDrawerClose) {
  cartDrawerClose.addEventListener("click", function () {
    cartDrawer.classList.remove("is-open");
    cartOverlay.classList.remove("is-visible");
  });
}


const desktopLinks = document.querySelectorAll(".desktop-nav a");
const currentPath  = window.location.pathname.replace(/\/$/, "") || "/";

desktopLinks.forEach(link => {
  
  const linkpath = link.pathname.replace(/\/$/, "") || "/";

  const isActive = linkpath === currentPath;

  link.classList.toggle("active", isActive);
});





const searchInput = document.querySelector(".search-input input[type='search']");
const searchResults = document.getElementById("searchResults");

if (searchInput && searchResults) {
  searchInput.addEventListener("input", function() {
    const query = searchInput.value.trim().toLowerCase();

    if ( query === '') {
      searchResults.classList.remove('is-visible');
      searchResults.innerHTML = '';
      return;
    } 

    const matches = Object.values(products).filter(p => 
      p.name.toLowerCase().includes(query)
    );

    searchResults.innerHTML = '';
    
    if (matches.length === 0) {
      searchResults.innerHTML = '<p class="search-no-results">No products found.</p>';
    } else {
      matches.slice(0, 8).forEach(product => {
        const item = document.createElement("a");
        item.href = `product.html?id=${product.id}`;
        item.className = 'search-result-item';
        item.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}">
        <span class="price">$${product.priceNow}</span>
        `;
        searchResults.appendChild(item);
      });
    }

    searchResults.classList.add('is-visible');
  });


  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('is-visible');
    }
  });
}


// const deskCategoButtons = document.querySelectorAll(".desk-catego button");

// deskCategoButtons.forEach(b => {
//   b.addEventListener("click", function() {
//     const category = b.dataset.category;

//     renderShopGrid(category);
//   });
// })



















if (document.body.classList.contains("page-home")) {
  document.querySelectorAll(".category-row").forEach((row) => {
    console.log("rendering:", row.dataset.category); // ← this is the ONE new line
    renderProductRow(row);
  });

  initWishlistButtons();

  const menuToggle = document.getElementById("menuToggle");
  const navClose = document.getElementById("navClose");
  const navOverlay = document.getElementById("navOverlay");
  const mobileNav = document.getElementById("mobileNav");

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

  const heroTrack = document.getElementById("heroTrackMobile");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goToSlide(i));
  });

  function goToSlide(index) {
    currentSlide = index;
    heroTrack.style.transform = `translateX(-${index * 33.3333}%)`;

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
    heroTrack.style.transform = `translateX(calc(-${currentSlide * 33.3333}% + ${percentDiff}%))`;
  });

  heroTrack.addEventListener("touchend", function (e) {
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






  const desktopCommunity = document.getElementById("desktopCommunity");
  const mobileCommunity = document.getElementById("mobileCommunity");
  const iphoneScreen     = document.querySelector(".iphone-screen");
  const screenContent    = document.querySelector(".screen-content");


  if (screenContent) {
    screenContent.addEventListener("click", function(e) {
      e.stopPropagation();
    });
  }

  if (desktopCommunity) {
  desktopCommunity.addEventListener("click", function (e) {

    if (e.target.closest(".screen-content")) {
      return;
    }

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    const rect = desktopCommunity.getBoundingClientRect();
    bubble.style.left = `${e.clientX - rect.left}px`;
    bubble.style.top = `${e.clientY - rect.top}px`;

    const randomHue = Math.floor(Math.random() * 360);
    bubble.style.backgroundColor = `Hsl(${randomHue}, 85%, 65%)`;
    bubble.style.boxShadow = `0 0 15px Hsl(${randomHue}, 85%, 65%)`;

    desktopCommunity.append(bubble);

    bubble.addEventListener("animationend", function() {
      bubble.remove();
    });

  });

}


}




















// <==== collection page ====>

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
  } else {
    console.error("backBtn not found on this page");
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

  initWishlistButtons();

  const shareButtons = document.querySelectorAll(".option-share");

  shareButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".outfit-card");
      const outfitName = card.querySelector("h3").textContent;
      const message = `Check out this outfit: ${outfitName} — ${window.location.href}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    });
  });

  const copyButtons = document.querySelectorAll(".option-copy");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log("copy button clicked");

      navigator.clipboard.writeText(window.location.href);
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = "Copy Link";
      }, 1500);
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
      filterByCategory(category);
      filterDropdown.classList.remove("is-open");
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "all";
  filterByCategory(initialCategory);

  initWishlistButtons();

  const outfitPanal = document.getElementById("outfitPanal");
  const outfitPanalOverlay = document.getElementById("outfitPanalOverlay");
  const outfitPanalItems = document.getElementById("outfitPanalItems");
  const outfitPanalClose = document.getElementById("outfitPanalClose");

  const orderButtons = document.querySelectorAll(".order-btn");

  orderButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const outfitKey = btn.dataset.outfit;
      const outfit = outfits[outfitKey];

      if (!outfit) {
        console.error("Outfit not found: ", outfitKey);
        return;
      }

      outfitPanalItems.innerHTML = "";

      outfit.pieces.forEach((pieceId) => {
        const product = products[pieceId];
        if (!product) return;

        const item = document.createElement("a");
        item.href = `product.html?id=${product.id}`;
        item.className = "outfit-panal-item";

        item.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}">
        <div class="piece-info">
          <h4>${product.name}</h4>
          <span class="piece-price">$${product.priceNow}</span>
        <div>
        `;

        outfitPanalItems.appendChild(item);
      });

      outfitPanal.classList.add("is-open");
      outfitPanalOverlay.classList.add("is-visible");
    });
  });

  outfitPanalClose.addEventListener("click", function () {
    outfitPanal.classList.remove("is-open");
    outfitPanalOverlay.classList.remove("is-visible");
  });

  outfitPanalOverlay.addEventListener("click", function () {
    outfitPanal.classList.remove("is-open");
    outfitPanalOverlay.classList.remove("is-visible");
  });
}























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
  } else {
    console.error("backBtn does not found on product page");
  }

  initWishlistButtons();

  const utlParams = new URLSearchParams(window.location.search);
  const productId = utlParams.get("id");
  const product = products[productId];

  if (!product) {
    console.error("Product not found: ", productId);
  } else {
    document.querySelector(".product-info h1").textContent = product.name;
    document.querySelector(".price-now").textContent =
      `NOW $${product.priceNow}`;

    if (product.priceWas) {
      document.querySelector(".price-was").textContent =
        `Was $${product.priceWas}`;
    } else {
      document.querySelector(".price-was").style.display = `none`;
    }

    document.querySelector(".rating-count").textContent =
      `${product.rating} (${product.reviewCount})`;

    const galleryTrack = document.getElementById("galleryTrack");
    galleryTrack.innerHTML = "";

    product.images.forEach((imgSrc) => {
      const slide = document.createElement("div");
      slide.classList = "gallery-slide";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = product.name;

      slide.appendChild(img);
      galleryTrack.appendChild(slide);
    });

    const galleryDots = document.getElementById("galleryDots");
    galleryDots.innerHTML = "";

    product.images.forEach((imgSrc, index) => {
      const dot = document.createElement("button");
      dot.classList = index === 0 ? "dot is-active" : "dot";
      dot.dataset.index = index;
      galleryDots.appendChild(dot);
    });

    initGallerySlider();

    const shortDescElement = document.querySelector(".product-details .short-desc");

    if (shortDescElement) {
      shortDescElement.textContent = product.shortDescription;
    } else {
      console.error("short description not found");
    }

    const featuresList = document.querySelector(".features-list");

    if (featuresList) {
      featuresList.innerHTML = "";

      product.features.forEach((feature) => {
        const li = document.createElement("li");

        const strong = document.createElement("strong");
        strong.textContent = feature.title + ": ";

        li.appendChild(strong);
        li.appendChild(document.createTextNode(feature.text));

        featuresList.appendChild(li);
      });
    } else {
      console.error("the features list not found");
    }

    const sizeSelect = document.getElementById("sizeSelect");
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

    const relatedGrid = document.querySelector(".related-grid");
    relatedGrid.innerHTML = "";

    const relatedProducts = Object.values(products)
      .filter((p) => p.category === product.category && p.id !== productId)
      .slice(0, 9);

    relatedProducts.forEach((p) => {
      const card = document.createElement("article");
      card.classList = "product-card";

      card.innerHTML = `
        <a href="product.html?id=${p.id}" class="product-link">
          <div class="product-img">
            <img src="${p.images[0]}" alt="${p.name}">
          </div>
          <h3>${p.name}</h3>
          <div class="product-meta">
            <span class="price">$${p.priceNow}</span>
            <span class="rating"><span class="star">★</span> ${p.rating} (${p.reviewCount})</span>
          </div>
        </a>

        <button class="wishlist-btn" aria-label="Add to wishlist">
          <img src="img/icons/heart-outline.png" alt="">
        </button>
      `;

      relatedGrid.appendChild(card);
    });

    initWishlistButtons();
  }

  initWishlistButtons();
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

    // Swipe support — same pattern as hero slider
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

  initWishlistButtons();

  const addToCartBtn = document.getElementById("addToCartBtn");
  const sizeSelect = document.getElementById("sizeSelect");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      const selectedSize = sizeSelect.value;

      if (!selectedSize) {
        alert("Please select a size first");
        return;
      }

      addToCart(product.id, selectedSize);
      alert("Added to cart!");
    });
  }

  const cartToggle = document.getElementById("cartToggle");
  if (cartToggle) {
    cartToggle.addEventListener("click", function () {
      renderCartDrawer();
      cartDrawer.classList.add("is-open");
      cartOverlay.classList.add("is-visible");
    });
  }
}


















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
  } else {
    console.error("backBtn not found on the shop page");
  }

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "all";

  const shopTitle = document.getElementById("shopTitle");
  const shopGrid = document.getElementById("shopGrid");

  const categoryLabels = {
    all: "Shop All",
    shoes: "Shoes",
    pants: "Pants",
    jackets: "Jackets",
    "T-shirts": "T-shirts",
    shirts: "Shirts"
  };
  shopTitle.textContent = categoryLabels[category] || "Shop All";

  function renderShopGrid(cat) {
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

      card.innerHTML = `
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <img src="${product.images[0]}" alt="${product.name}">
          </div>
          <h3>${product.name}</h3>
          <div class="product-meta">
            <span class="price">$${product.priceNow}</span>
            <span class="rating"><span class="star">★</span> ${product.rating} (${product.reviewCount})</span>
          </div>
        </a>
        <button class="wishlist-btn" aria-label="Add to wishlist">
          <img src="img/icons/heart-outline.png" alt="">
        </button>
      `;

      shopGrid.appendChild(card);
    });

    initWishlistButtons();
  }

  renderShopGrid(category);

  const filterOptions = document.querySelectorAll(".filter-option");
  filterOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      renderShopGrid(btn.dataset.category);
      shopTitle.textContent = categoryLabels[btn.dataset.category] || "Shop";
      filterDropdown.classList.remove("is-open");
    });
  });



}
