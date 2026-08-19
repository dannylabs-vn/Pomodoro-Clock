import db from "./db.js";

class HistoryDB {
  async getHistory(user_id) {
    const response = await db.query(
      "SELECT * FROM history WHERE user_id = $1 ORDER BY history_id ASC",
      [user_id],
    );
    return response.rows;
  }

  async addHistory(user_id, his_date, so_vong) {
  
    const response = await db.query(
      "INSERT INTO history (user_id, his_date, so_vong) VALUES ($1, $2, $3) RETURNING history_id",
      [user_id, his_date, so_vong],
    );
    return response.rows[0].history_id;
  }
}

export default new HistoryDB();
