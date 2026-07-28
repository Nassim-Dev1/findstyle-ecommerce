const menuToggle = document.getElementById("menuToggle");
const navClose   = document.getElementById("navClose");
const navOverlay = document.getElementById("navOverlay");
const mobileNav  = document.getElementById("mobileNav");

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


const heroTrack  = document.getElementById('heroTrack');
const dots       = document.querySelectorAll('.dot');
let currentSlide = 0;

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goToSlide(i));
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

heroTrack.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
  heroTrack.style.transition = 'none';
});

heroTrack.addEventListener('touchmove', function(e) {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
  const diff = currentX - startX;

  if (Math.abs(diff) < 20) return;

  const percentDiff = (diff / heroTrack.offsetWidth) * 100;
  heroTrack.style.transform = `translateX(calc(-${currentSlide * 33.3333}% + ${percentDiff}%))`;
});

heroTrack.addEventListener('touchend', function(e) {
  isDragging = false;
  heroTrack.style.transition = 'transform 0.4s ease';

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


const filterBtn      = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("filterDropdown");


filterBtn.addEventListener("click", function(e) {
  e.stopPropagation();
  filterDropdown.classList.toggle("is-open");
});

document.addEventListener("click", function(e) {
  if (!filterDropdown.contains(e.target)) {
    filterDropdown.classList.remove("is-open");
  }
});


const wishlistButtons = document.querySelectorAll(".wishlist-btn");

wishlistButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("is-active");
    const img = btn.querySelector("img");
    img.src = btn.classList.contains("is-active")
    ? "img/icons/heart-filled.png"
    : "img/icons/heart-outline.png";
  });
});