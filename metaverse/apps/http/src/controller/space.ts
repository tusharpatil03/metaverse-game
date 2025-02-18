import { Request, Response, NextFunction } from "express";
import client from "@repo/db/client";

import { Space } from "../services/spaceServices";

import { SpaceServices } from "../services/spaceServices";
import { Transaction } from "../services/transactions";

export const createSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      res.status(400).json("Unauthorized");
      return;
    }

    if (!req.body.mapId) {
      const id = await SpaceServices.createSpace(req.body, req.userId);
      res.status(200).json({ id });
      return;
    }

    const spaceId = await Transaction.spaceAndSpaceElements(
      req.body,
      req.userId,
    );
    res.status(200).json({ id: spaceId });
    return;
  } catch (e) {
    next(e);
  }
};

export const deleteSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId = req.params.spaceId;
    if (!spaceId) {
      res.status(400).json("Provide space Id");
      return;
    }
    const space = await client.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        elements: true,
        creatorId: true,
      },
    });

    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    }

    if (space.creatorId !== req.userId) {
      console.log("code should reach here");
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const response = await client.$transaction(async () => {
      await client.spaceElements.deleteMany({
        where: {
          id: {
            in: space.elements.map((e) => e.id),
          },
        },
      });
      await client.space.delete({
        where: {
          id: spaceId,
        },
      });
    });

    res.status(200).json({ response });
  } catch (e) {
    next(e);
  }
};

export const getSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  res.json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.elements.map((e) => ({
      id: e.id,
      element: {
        id: e.element.id,
        imageUrl: e.element.imageUrl,
        width: e.element.width,
        height: e.element.height,
        static: e.element.static,
      },
      x: e.x,
      y: e.y,
    })),
  });
};

export const getAllSpaces = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      return;
    }
    const spaces = await SpaceServices.getAllSpaces(req.userId);
    if (!spaces) {
      res.json({ Error: "unable to find spaces" });
      return;
    }
    res.json({
      spaces: spaces.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail,
        dimensions: `${s.width}x${s.height}`,
      })),
    });
  } catch (e) {
    next(e);
  }
};

export const addElementToSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const space = await SpaceServices.getSpaceById(req.body.spaceId);
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (
    req.body.x < 0 ||
    req.body.y < 0 ||
    req.body.x > space?.width! ||
    req.body.y > space?.height!
  ) {
    res.status(400).json({ message: "Point is outside of the boundary" });
    return;
  }

  await SpaceServices.createSpaceElement(req.body);

  res.status(200).json({ message: "Element added" });
};

export const deleteElementFromSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await SpaceServices.deleteSpaceElement(req.body.elementId);
    res.status(200).json("Success");
    return;
  } catch (e) {
    next(e);
  }
};

export const getAllMaps = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const mapsIds = await SpaceServices.findAllMaps();
  if (!mapsIds) {
    res.status(400).json("not found");
    return;
  }
  res.status(200).json(mapsIds);
  return;
};

export const getAllElements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const elements = await client.element.findMany({});
  if (!elements) {
    res.status(400).json("not found");
    return;
  }
  res.status(200).json(elements);
  return;
};

export const getSpaceElements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId = req.params.spaceId;
    const elements = await client.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        elements: true,
      },
    });
    if (!elements) {
      res.status(400).json("Elements not found");
      return;
    }
    res.status(200).json(elements);
    return;
  } catch (e) {
    next(e);
  }
};
