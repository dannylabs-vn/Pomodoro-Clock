import db from "./db.js";

class todoDB {
  async getTodo(user_id) {
    const response = await db.query(
      "SELECT * FROM todo WHERE user_id = $1 ORDER BY todo_id ASC",
      [user_id],
    );
    return response.rows;
  }

  async addTodo(user_id, todo_task, chu_ky) {
    console.log(
      "INSERT INTO todo (user_id, todo_task, chu_ky) VALUES ($1, $2, $3) RETURNING todo_id",
      [user_id, todo_task, chu_ky],
    );
    const response = await db.query(
      "INSERT INTO todo (user_id, todo_task, chu_ky) VALUES ($1, $2, $3) RETURNING todo_id",
      [user_id, todo_task, chu_ky],
    );
    return response.rows[0].todo_id;
  }

  async deleteTodo(todo_id) {
    const response = await db.query("DELETE FROM todo WHERE todo_id = $1", [
      todo_id,
    ]);
    return response.rowCount > 0;
  }
}

export default new todoDB();
