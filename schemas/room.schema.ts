import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string().min(2,"name minimo 2 caracteres"),
    capacity: z.number().int().positive("capacity debe ser > 0")
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
