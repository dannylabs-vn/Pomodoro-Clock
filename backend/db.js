const { Pool } = require("pg");

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
        console.error("Unexpected error on idle client", err);
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
      console.error("Database query error:", error);
      throw error;
    }
  }
}

module.exports = new Database();

