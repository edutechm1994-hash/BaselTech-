const PRODUCTS = [
  { id: 1, name: "سماعة لاسلكية Pro", desc: "عزل ضوضاء نشط وبطارية 30 ساعة", price: 349, category: "audio", emoji: "🎧" },
  { id: 2, name: "سماعات أذن Air Buds", desc: "اتصال سريع وصوت نقي", price: 149, category: "audio", emoji: "🎵" },
  { id: 3, name: "ساعة ذكية Ultra", desc: "شاشة AMOLED ومقاومة للماء", price: 599, category: "wearables", emoji: "⌚" },
  { id: 4, name: "ساعة رياضية Fit", desc: "تتبع النوم ونبضات القلب", price: 279, category: "wearables", emoji: "🏃" },
  { id: 5, name: "شاحن سريع 65W", desc: "منفذان USB-C وشاحن جداري", price: 99, category: "accessories", emoji: "🔌" },
  { id: 6, name: "بطارية متنقلة 20000mAh", desc: "شحن سريع لجهازين معًا", price: 129, category: "accessories", emoji: "🔋" },
  { id: 7, name: "سماعة رأس للألعاب", desc: "ميكروفون مدمج وإضاءة RGB", price: 229, category: "audio", emoji: "🎮" },
  { id: 8, name: "حامل هاتف للسيارة", desc: "تثبيت مغناطيسي قوي", price: 59, category: "accessories", emoji: "🚗" }
];

const CART_KEY = "alnokhba-cart";

let cart = loadCart();
let activeFilter = "all";

const productGrid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummary = document.getElementById("checkoutSummary");
const orderSuccess = document.getElementById("orderSuccess");
const orderId = document.getElementById("orderId");
const doneBtn = document.getElementById("doneBtn");
const toast = document.getElementById("toast");

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `${value} ر.س`;
}

function renderProducts() {
  const list = PRODUCTS.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );
  productGrid.innerHTML = list
    .map(
      (p) => `
      <article class="product-card">
        <div class="product-thumb">${p.emoji}</div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">أضف إلى السلة</button>
        </div>
      </article>`
    )
    .join("");
}

function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === Number(id)), qty }))
    .filter((entry) => entry.product);
}

function updateCartUI() {
  const entries = cartEntries();
  const totalQty = entries.reduce((sum, e) => sum + e.qty, 0);
  const totalPrice = entries.reduce((sum, e) => sum + e.product.price * e.qty, 0);

  cartCount.textContent = totalQty;
  cartTotal.textContent = formatPrice(totalPrice);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="cart-empty">سلتك فارغة — ابدأ التسوق! 🛍️</p>';
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.6";
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = "1";

  cartItems.innerHTML = entries
    .map(
      ({ product, qty }) => `
      <div class="cart-item">
        <span class="cart-item-emoji">${product.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatPrice(product.price)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${product.id}">−</button>
          <span>${qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${product.id}">+</button>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${product.id}" aria-label="حذف">🗑️</button>
      </div>`
    )
    .join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartUI();
  showToast("تمت الإضافة إلى السلة ✅");
});

cartBtn.addEventListener("click", () => {
  cartOverlay.hidden = false;
});

closeCart.addEventListener("click", () => {
  cartOverlay.hidden = true;
});

cartOverlay.addEventListener("click", (e) => {
  if (e.target === cartOverlay) cartOverlay.hidden = true;
});

cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === "increase") cart[id] += 1;
  if (action === "decrease") {
    cart[id] -= 1;
    if (cart[id] <= 0) delete cart[id];
  }
  if (action === "remove") delete cart[id];

  saveCart();
  updateCartUI();
});

checkoutBtn.addEventListener("click", () => {
  const entries = cartEntries();
  const total = entries.reduce((sum, e) => sum + e.product.price * e.qty, 0);
  const count = entries.reduce((sum, e) => sum + e.qty, 0);
  checkoutSummary.textContent = `${count} منتج — الإجمالي: ${formatPrice(total)}`;
  cartOverlay.hidden = true;
  checkoutOverlay.hidden = false;
  orderSuccess.hidden = true;
  checkoutForm.hidden = false;
});

closeCheckout.addEventListener("click", () => {
  checkoutOverlay.hidden = true;
});

checkoutOverlay.addEventListener("click", (e) => {
  if (e.target === checkoutOverlay) checkoutOverlay.hidden = true;
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = `AL-${Date.now().toString().slice(-6)}`;
  orderId.textContent = id;
  checkoutForm.hidden = true;
  orderSuccess.hidden = false;
  cart = {};
  saveCart();
  updateCartUI();
});

doneBtn.addEventListener("click", () => {
  checkoutOverlay.hidden = true;
  checkoutForm.reset();
});

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelector(".category-card.active").classList.remove("active");
    card.classList.add("active");
    activeFilter = card.dataset.filter;
    renderProducts();
  });
});

renderProducts();
updateCartUI();
