function fetchOrders() {
    fetch('http://192.168.1.140:3000/api/orders')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(orders => {
            console.log('Orders received:', orders);
            const ordersList = document.getElementById('ordersList');
            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No orders at the moment.</p>';
            } else {
                ordersList.innerHTML = orders.map(order => `
                    <div class="order">
                        <h2>Order #${order.id} - Table ${order.table_number}</h2>
                        <p><strong>Items:</strong> ${order.items}</p>
                        <p><strong>Total:</strong> $${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            document.getElementById('ordersList').innerHTML = `<p>Error loading orders: ${error.message}</p>`;
        });
}

fetchOrders();
setInterval(fetchOrders, 30000);