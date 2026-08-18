const db = require("./db.js");

class Auth {
  async register(username, password) {
    await db.query(
      "INSERT INTO users (user_name, user_password) VALUES ($1, $2)",
      [username, password],
    );
    return true;
  }

  async login(username, password) {
    const response = await db.query(
      "SELECT * FROM users WHERE user_name = $1 AND user_password = $2",
      [username, password],
    );
    return response.rows[0] || null;
  }

  logout() {
    return true;
  }
}

module.exports = new Auth();

