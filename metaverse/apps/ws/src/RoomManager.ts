import type { User } from "./User";
import { OutgoingMessage } from "./types";

export class RoomManager {
    rooms: Map<string, User[]> = new Map();
    static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    public getUser(spaceId: string, userId: string) {
        return this.rooms.get(spaceId)?.find((u) => u.userId === userId);
    }

    public removeUser(user: User, spaceId: string) {
        const users = this.rooms.get(spaceId);
        // If the user never authenticated, they won't have a userId.
        // In that case, there's no need to broadcast their departure.
        if (!user.userId) {
            return;
        }
        
        if (users) {
            const updatedUsers = users.filter((u) => u.id !== user.id);
            this.rooms.set(spaceId, updatedUsers);
            this.broadcast(
                {
                    type: "user-left",
                    payload: {
                        userId: user.userId!,
                    },
                },
                user,
                spaceId
            );
        }
    }

    public addUser(spaceId: string, user: User) {
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user]);
    }

    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((u) => {
            if (u.id !== user.id) {
                u.send(message);
            }
        });
    }
}