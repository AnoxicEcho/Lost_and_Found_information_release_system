const dotenv = require("dotenv");
const app = require("./app");
const initDatabase = require("./services/initDatabase");

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Backend is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

bootstrap();
