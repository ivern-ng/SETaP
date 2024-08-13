const serverUrl = 'http://192.168.1.140:3000';  

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    if (tableNumber) {
        localStorage.setItem('tableNumber', tableNumber);
        document.querySelector('h1').textContent = `Welcome to Our Restaurant - Table ${tableNumber}`;
    }
    fetchMenu();
    updateCartCounter();

    // Add event listeners
    document.getElementById('viewMenuBtn').addEventListener('click', fetchMenu);
    document.getElementById('viewCartBtn').addEventListener('click', viewCart);
});

let cart = [];
let menu = [];

function fetchMenu() {
    fetch(`${serverUrl}/menu`)
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
    const tableNumber = getCurrentTableNumber();
    console.log('Adding to cart for table:', tableNumber);

    fetch(`${serverUrl}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: itemId, quantity: quantity, tableNumber: tableNumber}),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Cart updated:', data);
        cart = data;
        alert(`${quantity} item(s) added to cart for table ${tableNumber}!`);
        updateCartCounter();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function getCurrentTableNumber() {
    let tableNumber = localStorage.getItem('tableNumber');
    if (!tableNumber) {
        tableNumber = prompt("Please enter your table number:");
        localStorage.setItem('tableNumber', tableNumber);
    }
    return tableNumber || 'default';
}

function viewCart() {
    const tableNumber = getCurrentTableNumber();
    fetch(`${serverUrl}/cart?table=${tableNumber}`)
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
            <li data-item-id="${item.id}">
                ${item.name} - $${item.price} x ${item.quantity} = $${itemTotal}
                <button class="remove-item">Remove</button>
            </li>`;
        total += itemTotal;
    });
    cartHtml += `</ul><p>Total: $${total.toFixed(2)}</p>`;
    cartHtml += '<button onclick="fetchMenu()">Back to Menu</button>';
    cartHtml += '<button id="checkoutBtn" onclick="checkout()">Checkout</button>';

    document.getElementById('cartDisplay').innerHTML = cartHtml;

    // Add event listener using event delegation
    document.getElementById('cartDisplay').addEventListener('click', function(e) {
        if (e.target && e.target.className == 'remove-item') {
            const itemId = e.target.parentNode.dataset.itemId;
            removeFromCart(itemId);
        }
    });
}

function removeFromCart(itemId) {
    const tableNumber = getCurrentTableNumber();
    console.log(`Removing item ${itemId} from table ${tableNumber}`);
    fetch(`${serverUrl}/cart/${itemId}?table=${tableNumber}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Item removed:', data);
        cart = data.updatedCart;
        updateCartCounter();
        updateCartDisplay();
    })
    .catch((error) => {
        console.error('Error removing item from cart:', error);
        alert('Failed to remove item from cart. Please try again.');
    });
}

function checkout() {
    const tableNumber = getCurrentTableNumber();
    console.log('Initiating checkout for table:', tableNumber);
    
    fetch(`${serverUrl}/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableNumber }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Checkout response:', data);
        if (data.error) {
            alert(`Checkout error: ${data.error}`);
        } else {
            alert(`Checkout successful! Total: $${data.total.toFixed(2)} for Table ${tableNumber}. Order ID: ${data.orderId}`);
            cart = [];
            updateCartCounter();
            fetchMenu();
        }
    })
    .catch((error) => {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout. Please try again.');
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
