let cart = [];

const menu = [
    { id: 1, name: 'Burger', price: 10 },
    { id: 2, name: 'Steak', price: 12 },
    { id: 3, name: 'Salad', price: 8 },
    { id: 4, name: 'Fries', price: 5 },
    { id: 5, name: 'Soda', price: 2 }
];

function viewMenu() {
    let menuHtml = '<h2>Menu</h2><ul>';
    menu.forEach(item => {
        menuHtml += `
            <li>
                <div class="item-info">${item.name} - $${item.price}</div>
                <div class="item-actions">
                    <input type="number" id="quantity-${item.id}" min="1" value="1">
                    <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </li>`;
    });
    menuHtml += '</ul>';

    document.getElementById('menuDisplay').innerHTML = menuHtml;
    document.getElementById('cartDisplay').innerHTML = '';
}

function addToCart(itemId) {
    const item = menu.find(i => i.id === itemId);
    const quantity = parseInt(document.getElementById(`quantity-${itemId}`).value);
    
    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({...item, quantity: quantity});
    }
    
    alert(`${quantity} ${item.name}(s) added to cart!`);
    updateCartCounter();
}

function viewCart() {
    document.getElementById('menuDisplay').innerHTML = '';
    
    if (cart.length === 0) {
        document.getElementById('cartDisplay').innerHTML = '<h2>Cart</h2>Your cart is empty.';
        return;
    }

    let cartHtml = '<h2>Cart</h2><ul>';
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        cartHtml += `
            <li>
                ${item.name} - $${item.price} x ${item.quantity} = $${itemTotal}
                <button onclick="removeFromCart(${index})">Remove</button>
            </li>`;
        total += itemTotal;
    });
    cartHtml += `</ul><p>Total: $${total.toFixed(2)}</p>`;
    cartHtml += '<button onclick="viewMenu()">Back to Menu</button>';
    cartHtml += '<button id="checkoutBtn" onclick="checkout()">Checkout</button>';

    document.getElementById('cartDisplay').innerHTML = cartHtml;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCounter();
    viewCart();
}

function restartOrder() {
    if (confirm("Are you sure you want to clear your cart and start over?")) {
        cart = [];
        updateCartCounter();
        viewMenu();
    }
}

function adminLogin() {
    const password = prompt("Enter admin password:");
    if (password === "admin123") {
        alert("Admin login successful!");
    } else {
        alert("Incorrect password!");
    }
}

function updateCartCounter() {
    const counter = document.getElementById('cartCounter');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        counter.style.display = 'inline';
        counter.textContent = totalItems;
    } else {
        counter.style.display = 'none';
    }
}

// Initialize
document.getElementById('viewMenuBtn').onclick = viewMenu;
document.getElementById('viewCartBtn').onclick = viewCart;
document.getElementById('adminLoginBtn').onclick = adminLogin;

// Load menu on page load
viewMenu();
updateCartCounter();

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    let orderSummary = "Order Summary:\n\n";
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        orderSummary += `${item.name} x${item.quantity}: $${itemTotal.toFixed(2)}\n`;
        total += itemTotal;
    });
    
    orderSummary += `\nTotal: $${total.toFixed(2)}`;
    
    alert(orderSummary + "\n\nThank you for your order!");
    
    // Clear the cart after checkout
    cart = [];
    updateCartCounter();
    viewMenu();
}