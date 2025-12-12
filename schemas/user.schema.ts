import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(2, "name minimo 2 caracteres"),
    email: z.string().email("email invalido")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;