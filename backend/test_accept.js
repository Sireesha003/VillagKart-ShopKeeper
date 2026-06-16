const axios = require('axios');

async function test() {
  try {
    console.log("Fetching new orders...");
    const { data: newOrders } = await axios.get('http://localhost:3001/api/orders?status=new');
    console.log(`Found ${newOrders.length} new orders.`);

    if (newOrders.length === 0) {
      console.log("No new orders to test.");
      return;
    }

    const orderId = newOrders[0].id;
    console.log(`Accepting order ${orderId}...`);
    const { data: acceptData } = await axios.put(`http://localhost:3001/api/orders/${orderId}/accept`);
    console.log("Accept response:", acceptData);

    console.log("Fetching orders for picking queue...");
    const { data: allOrders } = await axios.get('http://localhost:3001/api/orders');
    const pickingOrders = allOrders.filter(o => o.status === 'accepted' || o.status === 'picking');
    console.log(`Found ${pickingOrders.length} orders in picking queue.`);
    
    const ourOrder = pickingOrders.find(o => o.id === orderId);
    if (ourOrder) {
      console.log(`Order ${orderId} is in the picking queue!`);
    } else {
      console.log(`ERROR: Order ${orderId} is NOT in the picking queue!`);
    }

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
