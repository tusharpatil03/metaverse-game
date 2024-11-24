import z from "zod";

const createSpaceSchema = z.object({
    name: z.string(),
    dimention: z.string(),
    mapId: z.string()
})

const addElementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number()
})

const upadeElement = z.object({
    image: z.string()
})