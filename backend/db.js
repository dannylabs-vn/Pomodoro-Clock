import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = new Pool(
        process.env.DATABASE_URL
          ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
            }
          : {
              user: "postgres",
              host: "localhost",
              database: "pomodoro",
              password: "kietthongminh",
              port: 5400,
            },
      );

      this.pool.on("error", (err) => {
        console.error("Lỗi client tren pool:", err);
      });

      Database.instance = this;
    }
    return Database.instance;
  }

  async query(text, params) {
    try {
      const response = await this.pool.query(text, params);
      return response;
    } catch (error) {
      console.error("Lỗi query database:", error);
      throw error;
    }
  }
}

export default new Database();
