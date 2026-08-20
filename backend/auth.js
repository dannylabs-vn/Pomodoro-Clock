import db from "./db.js";

class Auth {
  async register(user_name, user_password) {
    const result = await db.query(
      "INSERT INTO users (user_name, user_password) VALUES ($1, $2) RETURNING user_id",
      [user_name, user_password],
    );
    const user_id = result.rows[0].user_id;
    console.log("Đăng ký thành công:", {
      user_id,
      user_name,
      user_password,
      thoi_gian: new Date().toLocaleString("vi-VN"),
    });
    return user_id;
  }

  async login(user_name, user_password) {
    const response = await db.query(
      "SELECT * FROM users WHERE user_name = $1 AND user_password = $2",
      [user_name, user_password],
    );
    const user = response.rows[0];
    if (user) {
      console.log("Đăng nhập thành công:", {
        user_name: user.user_name,
        user_id: user.user_id,
        is_vip: user.is_vip,
        thoi_gian: new Date().toLocaleString("vi-VN"),
      });
    }
    return user || null;
  }

  async upgradeToVIP(user_name) {
    await db.query("UPDATE users SET is_vip = TRUE WHERE user_name = $1", [
      user_name,
    ]);
    console.log(`${user_name} Đã nâng cấp VIP thành công`);
    return true;
  }

  logout(user_name) {
    console.log(`${user_name} đã đăng xuất thành công`);
    return true;
  }
}

export default new Auth();
