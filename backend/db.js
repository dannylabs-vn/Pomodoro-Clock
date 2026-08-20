import pg from "pg";
const { Pool } = pg;

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = new Pool({
        user: "postgres",
        host: "localhost",
        database: "pomodoro",
        password: "kietthongminh",
        port: 5400,
      });

      this.pool.on("error", (err, client) => {
        console.error("Lỗi client tren pool:", err);
        process.exit(-1);
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

// module.exports = new Database();
export default new Database();
