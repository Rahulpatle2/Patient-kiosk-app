// server.js
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // connection test
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release(); // pool mein wapas de do

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // server start hi mat karo agar DB nahi jud raha
  }
};

startServer();