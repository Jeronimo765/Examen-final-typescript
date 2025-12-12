import { z } from "zod";

export const createBookingSchema = z.object({
    userId: z.number().int().positive("userId debe ser numero > 0"),
    roomId: z.number().int().positive("roomId debe ser numero > 0"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date debe ser YYYY-MM-DD"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime debe ser HH:mm"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "endTime debe ser HH:mm")
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;