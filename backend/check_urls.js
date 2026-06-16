const https = require('https');

const urls = [
  'https://m.media-amazon.com/images/I/51rPq4T9T4L._SX679_.jpg',
  'https://m.media-amazon.com/images/I/61H4Dq+K8sL._SX679_.jpg',
  'https://www.bigbasket.com/media/uploads/p/l/104707_8-amul-homogenised-toned-milk.jpg',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&h=150&fit=crop'
];

async function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => resolve({ url, error: e.message }));
  });
}

async function main() {
  for (const u of urls) {
    console.log(await check(u));
  }
}
main();
