import z, { strictObject, string } from "zod";

const signUpSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["User", "Admin"]),
})

const signInSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
})
