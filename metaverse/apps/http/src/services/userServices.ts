import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { compare, hash } from "./scrypt";
import { JWT_PASSWORD } from "../global";
import { promises } from "node:dns";
import { ErrorHandler } from "./ErrorHandler";
import { metadata } from "../controller/user";

export class UserServices {
  static async createUser(data: {
    username: string;
    password: string;
    type?: string;
  }) {
    const hashedPassword = await hash(data.password);
    return await client.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.type === "admin" ? "Admin" : "User",
      },
    });
  }

  static async getUserByUsername(username: string) {
    return await client.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  static async getUserById(id: string) {
    return await client.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  static async createUserAvatar(name: string, imageUrl: string) {
    const avatar = await client.avatar.create({
      data: {
        imageUrl: imageUrl,
        name: name,
      },
    });
    return avatar.id;
  }

  static async getUserToken(data: {
    username: string;
    password: string;
    type?: string;
  }) {
    const user = await UserServices.getUserByUsername(data.username);
    if (user == null) {
      throw new ErrorHandler(400, "User not found");
    }
    const match = await compare(data.password, user.password);
    if (match == false) {
      throw new ErrorHandler(400, "Wrong Password");
    }

    const userToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        password: user.password,
      },
      JWT_PASSWORD,
      {
        expiresIn: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }
    );
    return userToken;
  }

  static async updateMetadata(userId: string, avatarId: string) {
    const res = await client.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: avatarId,
      },
    });
    return res;
  }

  static async findAllUsers() {
    return await client.user.findMany();
  }

  static async getMatadataOfAllUsers(userIDs: string[]) {
    const metadata = await client.user.findMany({
      where: {
        id: {
          in: userIDs,
        },
      },
      select: {
        avatar: true,
        id: true,
      },
    });
    
    return metadata;
  }

  static async getAllAvatars(){
    return await client.avatar.findMany({
      select: {
        id: true
      }
    });
  }

}
