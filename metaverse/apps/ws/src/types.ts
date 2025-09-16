export type IncomingMessage =
  | { type: "join"; payload: { token: string } }
  | { type: "move"; payload: { x: number; y: number } }
  | { type: "offer"; payload: { sdp: string; userId: string } }
  | { type: "answer"; payload: { sdp: string; userId:string } }
  | { type: "ice-candidate"; payload: { candidate: any; userId: string } };

export type OutgoingMessage =
  | {
      type: "space-joined";
      payload: {
        spawn: { x: number; y: number };
        users: { userId: string; x: number; y: number }[];
      };
    }
  | {
      type: "user-joined";
      payload: { userId: string; x: number; y: number };
    }
  | {
      type: "user-left";
      payload: { userId: string };
    }
  | {
      type: "movement";
      payload: { userId: string; x: number; y: number };
    }
  | { type: "offer"; payload: { sdp: string; userId: string } }
  | { type: "answer"; payload: { sdp: string; userId: string } }
  | { type: "ice-candidate"; payload: { candidate: any; userId: string } }
  | { type: "movement-rejected"; payload: { x: number; y: number } };