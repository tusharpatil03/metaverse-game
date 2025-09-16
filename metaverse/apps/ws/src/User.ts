import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { IncomingMessage, OutgoingMessage } from "./types";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class User {
    public id: string;
    public userId?: string;
    private spaceId: string;
    private x: number;
    private y: number;
    private ws: WebSocket;

    constructor(ws: WebSocket, spaceId: string) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.spaceId = spaceId;
        this.initHandlers();
    }

    public send(message: OutgoingMessage) {
        this.ws.send(JSON.stringify(message));
    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            const parsedData: IncomingMessage = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join": {
                    const token = parsedData.payload.token;
                    let payload: JwtPayload;
                    try {
                        payload = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
                    } catch (error) {
                        console.log("Token verification failed, closing connection");
                        this.ws.close();
                        return;
                    }
                    const userId = payload.id;
                    if (!userId) {
                        console.log("Invalid token, closing connection");
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    const joinSpace = await client.space.findFirst({
                        where: {
                            id: this.spaceId,
                        },
                    });

                    if (!joinSpace) {
                        console.log("Space not found, closing connection");
                        this.ws.close();
                        return;
                    }
                    RoomManager.getInstance().addUser(this.spaceId, this);
                    this.x = Math.floor(Math.random() * joinSpace.width);
                    this.y = Math.floor(Math.random() * joinSpace.height);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y,
                            },
                            users:
                                RoomManager.getInstance()
                                    .rooms.get(this.spaceId)
                                    ?.filter((x) => x.id !== this.id)
                                    ?.map((u) => ({ userId: u.userId!, x: u.x, y: u.y })) ??
                                [],
                        },
                    });
                    RoomManager.getInstance().broadcast(
                        {
                            type: "user-joined",
                            payload: {
                                userId: this.userId!,
                                x: this.x,
                                y: this.y,
                            },
                        },
                        this,
                        this.spaceId!
                    );
                    break;
                }

                case "move": {
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    console.log(`[User ${this.id}] received move -> (${moveX}, ${moveY}) from userId=${this.userId}`);
                    const map = await client.space.findFirst({
                        where: {
                            id: this.spaceId,
                        },
                    });
                    if (!map) {
                        console.log(`[User ${this.id}] map not found for space ${this.spaceId}`);
                        return;
                    }
                    if (moveX < 0 || moveX >= map.width || moveY < 0 || moveY >= map.height) {
                        console.log(`[User ${this.id}] move out of bounds: (${moveX},${moveY}) not in [0..${map.width - 1}]x[0..${map.height - 1}]`);
                        // Movement outside the map bounds
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y,
                            },
                        });
                        return;
                    }

                    const xDisplacement = Math.abs(this.x - moveX);
                    const yDisplacement = Math.abs(this.y - moveY);

                    // Reject movement that is more than one cell away
                    if (xDisplacement > 1 || yDisplacement > 1 || (xDisplacement === 1 && yDisplacement === 1)) {
                        console.log(`[User ${this.id}] move too large: dx=${xDisplacement} dy=${yDisplacement}`);
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y,
                            },
                        });
                        return;
                    }

                    // Accept only single-step orthogonal moves
                    if ((xDisplacement === 1 && yDisplacement === 0) || (xDisplacement === 0 && yDisplacement === 1)) {
                        this.x = moveX;
                        this.y = moveY;
                        console.log(`[User ${this.id}] move accepted -> new pos (${this.x},${this.y}), broadcasting to room ${this.spaceId}`);
                        RoomManager.getInstance().broadcast(
                            {
                                type: "movement",
                                payload: {
                                    userId: this.userId!,
                                    x: this.x,
                                    y: this.y,
                                },
                            },
                            this,
                            this.spaceId!
                        );
                    } else {
                        // Any other movement (e.g., same position) -> reject
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y,
                            },
                        });
                    }
                    break;
                }
                case "offer":
                case "answer":
                case "ice-candidate": {
                    const targetUser = RoomManager.getInstance().getUser(
                        this.spaceId!,
                        parsedData.payload.userId
                    );
                    if (targetUser) {
                        if (parsedData.type === "ice-candidate") {
                            targetUser.send({
                                type: "ice-candidate",
                                payload: {
                                    userId: this.userId!,
                                    candidate: parsedData.payload.candidate,
                                },
                            });
                        } else {
                            targetUser.send({
                                type: parsedData.type,
                                payload: {
                                    userId: this.userId!,
                                    sdp: parsedData.payload.sdp,
                                },
                            });
                        }
                    }
                    break;
                }
            }
            // This is triggered when the client disconnects.
            this.ws.on("close", () => {
                console.log(`[User ${this.id}] Connection closed. Cleaning up.`);
                // The destroy method will handle removing the user from the room
                // and broadcasting the 'user-left' event.
                this.destroy();
            });

            // It's also good practice to handle errors.
            this.ws.on("error", (error) => {
                console.error(`[User ${this.id}] WebSocket error:`, error);
                // An error often leads to a 'close' event, which will handle cleanup.
                // You can also explicitly call destroy() here if needed.
                this.destroy();
            });
        });
    }

    public destroy() {
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }
}