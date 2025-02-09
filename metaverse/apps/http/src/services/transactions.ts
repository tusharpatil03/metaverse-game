import { ErrorHandler } from "./ErrorHandler";
import { Space, SpaceServices } from "./spaceServices";
import client from "@repo/db/client";

export class Transaction {
  static async spaceAndSpaceElements(data: Space, userId: string) {
    const spaceId = await client.$transaction(async () => {
      const map = await SpaceServices.getMap(data.mapId);
      if (!map) {
        throw new Error("map does bot exist");
      }

      data.height = map.height;
      data.width = map.width;
      const id = await SpaceServices.createSpace(data, userId);

      await client.spaceElements.createMany({
        data: map.mapElements.map((e) => ({
          spaceId: id,
          elementId: e.elementId,
          x: e.x!,
          y: e.y!,
        })),
      });

      return id;
    });
    if(!spaceId){
        throw new ErrorHandler(400, "transaction failed");
    }
    return spaceId;
  }
}
