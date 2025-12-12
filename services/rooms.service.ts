import pool from "../db";

export class RoomsService {
  async listAll() {
    const [rows] = await pool.query("SELECT * FROM rooms");
    return rows;
  }

  async getById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
    return rows[0];
  }

  async create(room: { name: string; capacity: number }) {

    try {
      const [result]: any = await pool.query(
        "INSERT INTO rooms (name, capacity) VALUES (?, ?)",
        [room.name, room.capacity]
      );
      const [rows]: any = await pool.query("SELECT * FROM rooms WHERE id = ?", [result.insertId]);
      return rows[0];
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        const e: any = new Error("Ya existe una sala con ese nombre");
        e.status = 400;
        throw e;
      }
      throw err;
    }
  }

  async update(id: number, data: { name?: string; capacity?: number }) {
    
    const fields = [];
    const values: any[] = [];
    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.capacity !== undefined) {
      fields.push("capacity = ?");
      values.push(data.capacity);
    }
    if (fields.length === 0) throw new Error("No hay campos a actualizar");
    values.push(id);
    const sql = `UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);
    const [rows]: any = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
    return rows[0];
  }

  async delete(id: number) {
    await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
    return { deleted: true };
  }
}
