require('dotenv').config();

const app = require('./app');
const { initOrm } = require('./models');

const PORT = Number(process.env.PORT) || 4001;

async function startServer() {
  try {
    await initOrm();
    app.listen(PORT, () => {
      console.log(`Cuenta Clara API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API:', error.message);
    process.exit(1);
  }
}

startServer();
