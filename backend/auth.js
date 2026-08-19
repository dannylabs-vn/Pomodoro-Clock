const db = require("./db.js");

class Auth {
  async register(user_name, user_password) {
    const result = await db.query(
      "INSERT INTO users (user_name, user_password) VALUES ($1, $2) RETURNING user_id",
      [user_name, user_password]
    );
    return result.rows[0].user_id;
  }

  async login(user_name, user_password) {
    const response = await db.query(
      "SELECT * FROM users WHERE user_name = $1 AND user_password = $2",
      [user_name, user_password]
    );
    return response.rows[0] || null;
  }

  async upgradeToVIP(user_name) {
    await db.query("UPDATE users SET is_vip = TRUE WHERE user_name = $1", [
      user_name,
    ]);
    return true;
  }

  logout() {
    return true;
  }
}

module.exports = new Auth();
