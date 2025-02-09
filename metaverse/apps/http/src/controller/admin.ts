import { Request, Response, NextFunction } from "express";
import { CreateAvatarSchema } from "../types";
import { UserServices } from "../services/userServices";
import { Map, Space } from "../services/spaceServices";
import client from "@repo/db/client";
import { ErrorHandler } from "../services/ErrorHandler";

export interface Element {
  elementId?: string;
  height: number;
  width: number;
  static: boolean;
  imageUrl: string;
  spaces?: Space[];
  mapElements?: Map[];
}
export interface CreateMap extends Map {
  thumbnail: string;
  mapElements: {
    id: string;
    x: number;
    y: number;
    mapId: string;
    elementId: string;
  }[];
}
export const createElement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Element = req.body;
    const element = await client.element.create({
      data: {
        height: data.height,
        width: data.width,
        imageUrl: data.imageUrl,
        static: data.static,
      },
    });

    if (!element) {
      res.status(400).json("Unable to create Element");
      return;
    }
    res.status(200).json(element.id);
  } catch (e) {
    next(e);
  }
};

export const updateElement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const elementId = req.params.elementId;
    console.log(elementId);
    const element = await client.element.update({
      where: {
        id: elementId,
      },
      data: {
        imageUrl: req.body.imageUrl,
      },
    });
    if (!element) {
      res.status(400).json("Unable to update an element");
      return;
    }
    res.status(200).json(element.imageUrl);
  } catch (e) {
    next(e);
  }
};

export const createAvatar = async (req: Request, res: Response) => {
  try {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({
        message: "Input validation failed",
      });
      return;
    }
    const avatarId = await UserServices.createUserAvatar(parsedData.data?.name, parsedData.data?.imageUrl);
    if (!avatarId) {
      res.status(400).json({ message: "unable to create avatar" });
      return;
    }
    res.status(200).json(avatarId);
    return;
  } catch (e) {
    res.json(e);
  }
  return;
};
interface ElementInput {
  elementId: string;
  x: number;
  y: number;
}
export const createMap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const map = await client.map.create({
      data: {
        height: data.height,
        width: data.width,
        name: data.name,
        thumbnail: data.thumbnail,
        mapElements: {
          create: data.defaultElements.map((e: ElementInput) => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y,
          })),
        },
      },
      include: {
        mapElements: true, // Ensures that created elements are returned
      },
    });
    if (!map) {
      throw new ErrorHandler(400, "Not able to create map , try again!");
    }
    res.status(200).json(map);
    return;
  } catch (e) {
    next(e);
  }
};

export const deleteMap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mapId = req.params.mapId;
    const map = await client.map.delete({
      where: {
        id: mapId,
      },
    });
    if (!map) {
      res.status(400).json("No such Existing map");
      return;
    }
    res.status(200).json({ message: "Map deleted", mapid: map.id });
    return;
  } catch (e) {
    next(e);
  }
};

export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.avatarId;
    await client.avatar.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json("Avatar deleted");
    return;
  } catch (e) {
    next(e);
  }
};

export const deleteElement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.elementId;
    await client.element.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json("Element deleted");
    return;
  } catch (e) {
    next(e);
  }
};
