import { z } from "zod";

const creatAvatar = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

const createMap = z.object({
  thumbnail: z.string(),
  dimention: z.object({
    x: z.number(),
    y: z.number(),
  }),

  name: z.string(),

  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});
