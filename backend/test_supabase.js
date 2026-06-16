const fetch = require('node-fetch') || require('fetch');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kfosvbmzijezatgezbxa.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function check() {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ prefix: '', limit: 100 })
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
check();
