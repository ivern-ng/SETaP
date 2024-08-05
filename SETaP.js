let cart = [];
let menu = [];

function fetchMenu() {
    fetch('http://localhost:3000/menu')
        .then(response => response.json())
        .then(data => {
            menu = data;
            viewMenu();
        })
        .catch(error => console.error('Error:', error));
}

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
    const quantity = parseInt(document.getElementById(`quantity-${itemId}`).value);
    
    fetch('http://localhost:3000/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: itemId, quantity: quantity}),
    })
    .then(response => response.json())
    .then(data => {
        cart = data;
        alert(`${quantity} item(s) added to cart!`);
        updateCartCounter();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function viewCart() {
    fetch('http://localhost:3000/cart')
        .then(response => response.json())
        .then(data => {
            cart = data;
            updateCartDisplay();
        })
        .catch(error => console.error('Error:', error));
}

function updateCartDisplay() {
    document.getElementById('menuDisplay').innerHTML = '';
    
    if (cart.length === 0) {
        document.getElementById('cartDisplay').innerHTML = '<h2>Cart</h2>Your cart is empty.';
        return;
    }

    let cartHtml = '<h2>Cart</h2><ul>';
    let total = 0;
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        cartHtml += `
            <li>
                ${item.name} - $${item.price} x ${item.quantity} = $${itemTotal}
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </li>`;
        total += itemTotal;
    });
    cartHtml += `</ul><p>Total: $${total.toFixed(2)}</p>`;
    cartHtml += '<button onclick="fetchMenu()">Back to Menu</button>';
    cartHtml += '<button id="checkoutBtn" onclick="checkout()">Checkout</button>';

    document.getElementById('cartDisplay').innerHTML = cartHtml;
}

function removeFromCart(itemId) {
    fetch(`http://localhost:3000/cart/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        cart = data;
        updateCartCounter();
        updateCartDisplay();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function checkout() {
    fetch('http://localhost:3000/checkout', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        alert(`Checkout successful! Total: $${data.total.toFixed(2)}`);
        cart = [];
        updateCartCounter();
        fetchMenu();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
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
document.getElementById('viewMenuBtn').onclick = fetchMenu;
document.getElementById('viewCartBtn').onclick = viewCart;
document.getElementById('adminLoginBtn').onclick = adminLogin;

// Load menu on page load
fetchMenu();
updateCartCounter();