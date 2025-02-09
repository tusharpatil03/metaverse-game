import client from "@repo/db/client";

export interface Space {
  name: string;
  height: number;
  width: number;
  mapId?: any;
}

export interface Map {
  width: number;
  height: number;
  name: string;
  thumbnail?: string;
  mapElements?: {
    id: string;
    x: number;
    y: number;
    mapId: string;
    elementId: string;
  }[];
}

export interface SpaceElement {
  spaceId: string;
  elementId: string;
  x: number;
  y: number;
}

export class SpaceServices {
  static async createSpace(space: Space, userId: string) {
    const result = await client.space.create({
      data: {
        name: space.name,
        height: space.height,
        width: space.width,
        creatorId: userId,
      },
    });
    if (!result) {
      throw new Error("unable to create space");
    }
    return result.id;
  }

  static async getMap(mapId: string) {
    return await client.map.findUnique({
      where: {
        id: mapId,
      },
      select: {
        mapElements: true,
        width: true,
        height: true,
      },
    });
  }

  static async getSpaceById(id: string) {
    const space = await client.space.findUnique({
      where: {
        id: id,
      },
    });
    return space;
  }

  static async getSpaceElements(id: string) {
    const spaceElement = await client.spaceElements.findFirst({
      where: {
        id: id,
      },
      include: {
        element: true,
        space: true
      },
    });
    return spaceElement;
  }

  static async createSpaceElement(data: SpaceElement) {
    const element = await client.spaceElements.create({
      data: {
        spaceId: data.spaceId,
        elementId: data.elementId,
        x: data.x,
        y: data.y,
      },
    });
    return element.id;
  }

  static async deleteSpaceElement(id: string) {
    console.log("Hello");
    const result = await client.spaceElements.delete({
      where: {
        id: id,
      },
    });
    console.log(result);
    if (!result) {
      throw new Error("Failde to delete element");
    }
    return;
  }

  static async getAllSpaces(userId: string) {
    return await client.space.findMany({
      where: {
        creatorId: userId!,
      },
    });
  }

  static async findAllMaps() {
    return await client.map.findMany({
      select: {
        id: true,
      },
    });
  }
}
