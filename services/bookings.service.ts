
import pool from "../db";
import { timeToMinutes } from "../utils/time.utils";

export class BookingsService {
  async listAll() {
    const [rows] = await pool.query("SELECT * FROM bookings");
    return rows;
  }

  async getById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows[0];
  }

  async listByRoom(roomId: number) {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE roomId = ?", [roomId]);
    return rows;
  }

  async create(booking: {
    userId: number;
    roomId: number;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const conn = pool;

    const startMin = timeToMinutes(booking.startTime);
    const endMin = timeToMinutes(booking.endTime);
    if (endMin <= startMin) {
      const err: any = new Error("endTime debe ser mayor que startTime");
      err.status = 400;
      throw err;
    }

   
    const today = new Date();
    const bookingDate = new Date(booking.date + "T00:00:00"); 
  
    const todayYMD = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (bookingDate < todayYMD) {
      const err: any = new Error("No se pueden crear reservas en fechas pasadas");
      err.status = 400;
      throw err;
    }

    // Regla 3: debe existir user y room
    const [userRows]: any = await conn.query("SELECT id FROM users WHERE id = ?", [booking.userId]);
    if (userRows.length === 0) {
      const err: any = new Error("El usuario no existe");
      err.status = 400;
      throw err;
    }
    const [roomRows]: any = await conn.query("SELECT id FROM rooms WHERE id = ?", [booking.roomId]);
    if (roomRows.length === 0) {
      const err: any = new Error("La sala no existe");
      err.status = 400;
      throw err;
    }


    const [existing]: any = await conn.query(
      `SELECT * FROM bookings WHERE roomId = ? AND date = ?`,
      [booking.roomId, booking.date]
    );

    for (const ex of existing) {
      const exStart = timeToMinutes(ex.startTime.slice(0,5));
      const exEnd = timeToMinutes(ex.endTime.slice(0,5));
      if (startMin < exEnd && exStart < endMin) {
        const err: any = new Error("La sala ya tiene una reserva que se solapa en ese horario");
        err.status = 400;
        throw err;
      }
    }

    const [userBookings]: any = await conn.query(
      `SELECT COUNT(*) as cnt FROM bookings WHERE userId = ? AND date = ?`,
      [booking.userId, booking.date]
    );
    const cnt = (userBookings[0] && userBookings[0].cnt) || 0;
    if (cnt >= 2) {
      const err: any = new Error("Un usuario solo puede tener máximo 2 reservas por día");
      err.status = 400;
      throw err;
    }


    const [result]: any = await conn.query(
      `INSERT INTO bookings (userId, roomId, date, startTime, endTime) VALUES (?, ?, ?, ?, ?)`,
      [booking.userId, booking.roomId, booking.date, booking.startTime + ":00", booking.endTime + ":00"]
    );

    const insertId = result.insertId;
    const [newBookingRows]: any = await conn.query("SELECT * FROM bookings WHERE id = ?", [insertId]);
    return newBookingRows[0];
  }

  async delete(id: number) {
    await pool.query("DELETE FROM bookings WHERE id = ?", [id]);
    return { deleted: true };
  }
}
