const { io } = require('socket.io-client');

const BUYER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXFxeDNxa2kwMDAxNnN1bTdzMG44bXg4IiwiZW1haWwiOiJidXllckB0ZXN0LmNvbSIsInJvbGUiOiJGQVJNRVIiLCJpYXQiOjE3ODQxODQyNDIsImV4cCI6MTc4NDE4NTE0Mn0.xpEl9tjWUCIKZoBN0mqizGOhatQeE1cWqvv9gJJ1xa8';
const SELLER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXE5NnM2aWowMDAwZG91bTJwOWZraWlqIiwiZW1haWwiOiJyYWJpdWxAdGVzdC5jb20iLCJyb2xlIjoiRkFSTUVSIiwiaWF0IjoxNzg0MTg0Mjc4LCJleHAiOjE3ODQxODUxNzh9.E_kmYsXB_Aw8uZbfcjvmw3Cb-dUwHgL67hBf7FxWXcQ';
const PRODUCT_ID = 'cmqo2qetz0002c0umjy19joon'; // আগের test product id

// --- Buyer socket connect ---
const buyerSocket = io('http://localhost:4000/chat', {
  auth: { token: BUYER_TOKEN },
});

buyerSocket.on('connect', async () => {
  console.log('✅ Buyer connected:', buyerSocket.id);

  // প্রথমে REST দিয়ে room তৈরি/fetch করতে হবে (fetch লাগবে, Node 18+ এ built-in আছে)
  const res = await fetch('http://localhost:4000/chat/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BUYER_TOKEN}`,
    },
    body: JSON.stringify({ productId: PRODUCT_ID }),
  });
  const room = await res.json();
  console.log('📦 Room:', room);

  buyerSocket.emit('joinRoom', { roomId: room.id });

  setTimeout(() => {
    buyerSocket.emit('sendMessage', {
      roomId: room.id,
      content: 'আসসালামু আলাইকুম, ধান কি এখনো আছে?',
    });
  }, 1000);
});

buyerSocket.on('newMessage', (msg) => {
  console.log('📩 Buyer received message:', msg);
});

buyerSocket.on('error', (err) => console.log('❌ Buyer error:', err));

// --- Seller socket connect ---
const sellerSocket = io('http://localhost:4000/chat', {
  auth: { token: SELLER_TOKEN },
});

sellerSocket.on('connect', () => {
  console.log('✅ Seller connected:', sellerSocket.id);
});

sellerSocket.on('newMessage', (msg) => {
  console.log('📩 Seller received message:', msg);
});

// Notification namespace test (seller-এর কাছে notification আসা উচিত)
const sellerNotifSocket = io('http://localhost:4000/notifications', {
  auth: { token: SELLER_TOKEN },
});

sellerNotifSocket.on('notification', (n) => {
  console.log('🔔 Seller got notification:', n);
});
