// ===== PRODUCTS =====
const products = [
  { id: 1,  name: "Samosa",      category: "snacks", price: 50,  image: "images/samosa.jpg" },
  { id: 2,  name: "Mandazi",     category: "bakery", price: 30,  image: "images/mandazi.jpg" },
  { id: 3,  name: "Chapati",     category: "food",   price: 40,  image: "images/chapati.jpg" },
  { id: 4,  name: "Fresh Juice", category: "drinks", price: 100, image: "images/juice.jpg" },
  { id: 5,  name: "Soda",        category: "drinks", price: 80,  image: "images/soda.jpg" },
  { id: 6,  name: "Biscuits",    category: "snacks", price: 100, image: "images/biscuits.jpg" },
  { id: 7,  name: "French Fries",category: "food",   price: 150, image: "images/fries.jpg" },
  { id: 8,  name: "Cake Slice",  category: "bakery", price: 120, image: "images/cake.jpg" },
  { id: 9,  name: "Popcorn",     category: "snacks", price: 70,  image: "images/popcorn.jpg" },
  { id: 10, name: "Tea",         category: "drinks", price: 50,  image: "images/tea.jpg" },
  { id: 11, name: "Rice & Beef", category: "food",   price: 250, image: "images/rice-beef.jpg" },
  { id: 12, name: "Bread",       category: "bakery", price: 80,  image: "images/bread.jpg" }
];

const categoryIcons = { snacks: "🍪", drinks: "🥤", food: "🍚", bakery: "🍞" };
const WHATSAPP_NUMBER = "254745844809";
const STORAGE_KEY = "hidaad-cart";

// ===== STATE =====
let cart = loadCart();
let activeCategory = "all";
let searchTerm = "";
const selectedQuantities = {};

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* storage unavailable: cart still works for this visit */
  }
}

// ===== PRODUCTS DISPLAY =====
function renderProducts() {
  const grid = document.getElementById("products-grid");

  const list = products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (list.length === 0) {
    grid.innerHTML = `<p class="empty-msg">No products found.</p>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const qty = selectedQuantities[p.id] || 1;
    return `
      <div class="product-card">
        <div class="product-image">
          <span class="image-fallback">${categoryIcons[p.category]}</span>
          <img src="${p.image}" alt="${p.name}" onerror="this.remove()">
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="category">${p.category}</p>
          <p class="price">KSh ${p.price}</p>

          <div class="quantity-select">
            <button type="button" onclick="changeProductQuantity(${p.id}, -1)">−</button>
            <span id="quantity-${p.id}">${qty}</span>
            <button type="button" onclick="changeProductQuantity(${p.id}, 1)">+</button>
          </div>

          <button type="button" class="add-btn" onclick="addSelectedProduct(${p.id})">
            🛒 Add to Cart
          </button>
        </div>
      </div>`;
  }).join("");
}

function filterProducts(category) {
  activeCategory = category;
  document.querySelectorAll(".category-buttons button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  renderProducts();
}

function searchProducts() {
  searchTerm = document.getElementById("search").value.trim().toLowerCase();
  renderProducts();
}

// ===== QUANTITY PICKER =====
function changeProductQuantity(productId, amount) {
  const next = Math.max(1, (selectedQuantities[productId] || 1) + amount);
  selectedQuantities[productId] = next;

  const display = document.getElementById(`quantity-${productId}`);
  if (display) display.textContent = next;
}

// ===== CART =====
function addSelectedProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const quantity = selectedQuantities[productId] || 1;
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  // reset picker back to 1
  selectedQuantities[productId] = 1;
  const display = document.getElementById(`quantity-${productId}`);
  if (display) display.textContent = 1;

  updateCart();
  showToast(`${quantity} × ${product.name} added to cart`);
}

function changeQuantity(productId, amount) {
  const item = cart.find(p => p.id === productId);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== productId);
  }
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = getTotal();

  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-msg">Your cart is empty.</p>`;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>KSh ${item.price * item.quantity}</p>
        </div>
        <div class="quantity">
          <button type="button" onclick="changeQuantity(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
        <button type="button" class="remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>`).join("");
  }

  saveCart();
}

function openCart() {
  document.getElementById("cart-modal").style.display = "flex";
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

// ===== TOAST =====
let toastTimer;
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// ===== WHATSAPP CHECKOUT =====
function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }

  const lines = [
    "Hello Hidaad Center!",
    "",
    "I would like to order:",
    ...cart.map(i => `• ${i.name} x${i.quantity} - KSh ${i.price * i.quantity}`),
    "",
    `Total: KSh ${getTotal()}`,
    "",
    "Please confirm my order."
  ];

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");
}

// ===== EVENTS =====
window.addEventListener("click", event => {
  if (event.target === document.getElementById("cart-modal")) closeCart();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

// ===== START =====
renderProducts();
updateCart();