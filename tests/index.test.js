const { default: axios } = require("axios");

const BACKEND_URL = "http://localhost:8080/";

describe("Authenticatio", function () {
  test("user is able to signup only once", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    expect(res.status).tobe(200);

    const newRes = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
      username,
      password,
      type,
    });

    expect(newRes.status).tobe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });

    expect(response.status).toBe(400);
  });

  test("singnin success with correct credentials", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
      username,
      password,
      type,
    });

    expect(res.status).tobe(200);
    expect(res.body.token).tobeDefined();
  });

  test("singnin failure with Incorrect credentials", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
      username,
      password: "Tush0987",
      type,
    });

    expect(res.status).tobe(403);
    expect(res.body.token).tobeDefined();
  });

  test("user is able to logout", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    await axios.post(`${BACKEND_URL}/api/v1/singin`, {
      username,
      password,
      type,
    });

    const res = axios.get(`${BACKEND_URL}/api/v1/logout`);

    expect(res).tobe(200);
  });
});

describe("user metadata enpoints", () => {
  let token = "";
  let avatarId;
  beforeAll(async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/singup`, {
      username,
      password,
      type,
    });

    const responce = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
      username,
      password,
      type,
    });

    token = responce.data.token;

    const avatarResponce = axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Tom",
      },
      {
        headers: {
          autherization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponce.data.avatarId;
  });

  test("user can't update there metadata with wrong avatarId", async () => {
    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "120293020",
      },
      {
        headers: {
          autherization: `Bearer ${token}`,
        },
      }
    );

    expect(responce.status).tobe(400);
  });

  test("User can update there metadata with valid id", async () => {
    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          autherization: `Bearer ${token}`,
        },
      }
    );

    expect(responce.status).tobe(200);
  });

  test("User can't update there metadata without authorization", async () => {
    const responce = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });

    expect(responce.status).tobe(403);
  });
});

describe("user avatar information", () => {
  let token = "";
  let avatarId;
  let userId;
  beforeAll(async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    const singupResponce = await axios.post(`${BACKEND_URL}/api/v1/singup`, {
      username,
      password,
      type,
    });

    userId = singupResponce.data.userId;

    const singinResponce = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
      username,
      password,
      type,
    });

    token = singinResponce.data.token;

    const avatarResponce = axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "ImageUrl",
        name: "jimmy",
      },
      {
        headers: {
          autherization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponce.data.avatarId;
  });

  test("get user avatar information", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("available avatar lists the recently created avatar", async () => {
    const responce = axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(responce.data.avatars.length).not.tobe(0);

    const currentAvatar = (await responce).data.avatars.find(
      (x) => x.id == avatarId
    );
    expect(currentAvatar).tobeDefined();
  });
});

describe("space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const adminResponce = await axios.post(`${BACKEND_URL}/api/v1/singup`, {
      username,
      password,
      type: "admin",
    });

    adminId = adminResponce.data.userId;

    const adminSinginResponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "admin",
      }
    );

    adminToken = adminSinginResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/singup`, {
      username,
      password,
      type: "user",
    });

    userId = adminResponce.data.id;

    const userSigninresponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "user",
      }
    );

    userToken = adminSinginResponce.data.token;

    const element1Res = axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1Res.data.id;

    const element2Res = axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element2Id = element2Res.data.id;

    const mapResponce = axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 16,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
        ],
      },
      {
        headers: {
          autherization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponce.data.id;
  });

  test("user is able to create space", async () => {
    const responce = axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).tobe(200);
    expect(responce.data.spaceId).tobeDefined();
  });

  test("user is able to create space without mapId(empty space)", async () => {
    const responce = axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).tobe(200);
    expect(responce.data.spaceId).tobeDefined();
  });

  test("user is not able to create space without mapId and dimentions", async () => {
    const responce = axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).tobe(400);
  });

  test("user is not able to create space without autherization", async () => {
    const responce = axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
    });
    expect(responce.status).tobe(403);
  });

  test("user is able to dalete space", async () => {
    const spaceResponce = axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const spaceId = (await spaceResponce).data.id;

    const responce = axios.delete(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).tobe(200);
  });

  test("user is not able to dalete doesn't exit space", async () => {
    const responce = axios.delete(
      `${BACKEND_URL}/api/v1/space/spaceid`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).tobe(400);
  });

  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteReponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deleteReponse.status).toBe(403);
  });
});
