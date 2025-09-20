const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

const axios = {
  post: async (...args) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  get: async (...args) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  put: async (...args) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  delete: async (...args) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
};

describe("Authentication", function () {
  test("user is able to signup only once", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    expect(res.status).toBe(200);

    const newRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    expect(newRes.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });

    expect(response.status).toBe(400);
  });

  test("signin success with correct credentials", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
      type,
    });

    expect(res.status).toBe(200);

    expect(res.data.token).toBeDefined();
  });

  test("signnin failure with Incorrect credentials", async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password: "Tush0987",
      type,
    });

    expect(res.status).toBe(400);
    expect(res.data.token).toBe(undefined);
  });

  // test("user is able to logout", async () => {
  //   const username = "Tushar" + Math.random();
  //   const password = "Tushar1234";
  //   const type = "admin";

  //   await axios.post(`${BACKEND_URL}/api/v1/signup`, {
  //     username,
  //     password,
  //     type,
  //   });

  //   await axios.post(`${BACKEND_URL}/api/v1/signin`, {
  //     username,
  //     password,
  //     type,
  //   });

  //   const res = axios.get(`${BACKEND_URL}/api/v1/logout`);

  //   expect(res).toBe(200);
  // });
});

describe("user metadata enpoints", () => {
  let token = "";
  let avatarId;
  beforeAll(async () => {
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";
    const type = "admin";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const responce = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
      type,
    });

    token = responce.data.token;

    const avatarResponce = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Tom",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponce.data.avatarId;
  });

  test("user can't update there metadata with wrong avatarId", async () => {
    const responce = await axios.put(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "120293020",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(responce.status).toBe(400);
  });

  test("User can update there metadata with valid id", async () => {
    const responce = await axios.put(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(responce.status).toBe(200);
  });

  test("User can't update there metadata without authorization", async () => {
    const responce = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });

    expect(responce.status).toBe(403);
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

    const signupResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type,
    });

    userId = signupResponce.data.userId;

    const signinResponce = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
      type,
    });

    token = signinResponce.data.token;

    const avatarResponce = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "ImageUrl",
        name: "jimmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponce.data.avatarId;
  });

  test("get user avatar information", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.data[0].id).toBeDefined();
    expect(response.data[0].id).toBe(userId);
  });

  test("available avatar lists the recently created avatar", async () => {
    const responce = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    const currentAvatar = responce.data.map((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
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
    const admin = "Tushar" + Math.random();
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const adminResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: admin,
      password,
      type: "admin",
    });

    adminId = adminResponce.data.userId;
    // keep a copy for websocket tests (ws user id)
    adminUserId = adminId;
    // keep a copy for websocket tests (ws user id)
    adminUserId = adminId;

    const adminsigninResponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: admin,
        password,
        type: "admin",
      }
    );

    adminToken = adminsigninResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });

    userId = userResponce.data.userId;

    const userSigninresponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "user",
      }
    );

    userToken = userSigninresponce.data.token;

    const element1Res = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        height: 1,
        width: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Res.data;

    const element2Res = await axios.post(
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

    element2Id = element2Res.data;

    const mapResponce = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        height: 100,
        width: 200,
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
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponce.data.id;
  });

  test("user is able to create space", async () => {
    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        height: 100,
        width: 100,
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).toBe(200);
    expect(responce.data.id).toBeDefined();
  });

  test("user is able to create space without mapId(empty space)", async () => {
    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test2",
        height: 100,
        width: 100,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).toBe(200);
    expect(responce.data.id).toBeDefined();
  });

  test("user is not able to create space without mapId and dimentions", async () => {
    const responce = await axios.post(
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
    expect(responce.status).toBe(400);
  });

  test("user is not able to create space without authorization", async () => {
    const responce = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
    });
    expect(responce.status).toBe(403);
  });

  test("user is able to dalete space", async () => {
    const spaceResponce = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        height: 100,
        width: 90,
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const spaceId = spaceResponce.data.id;

    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/space/delete/${spaceId}`,
      {
        spaceId: spaceId.id,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).toBe(200);
  });

  test("user is not able to dalete doesn't exit space", async () => {
    const responce = await axios.post(
      `${BACKEND_URL}/api/v1/space/delete/seufhs89ef9`,
      {},
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(responce.status).toBe(400);
  });

  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        height: 100,
        width: 100,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteReponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/delete/${response.data.id}`,
      {},
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deleteReponse.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(response.data.spaces.length).toBe(0);
  });

  // test("Admin has gets once space after", async () => {
  //   const spaceCreateReponse = await axios.post(
  //     `${BACKEND_URL}/api/v1/space`,
  //     {
  //       name: "Test",
  //       height: 100,
  //       widht: 100,
  //     },
  //     {
  //       headers: {
  //         authorization: `Bearer ${adminToken}`,
  //       },
  //     }
  //   );
  //   console.log("jhflksdjflksdfjlksdfj");
  //   console.log(spaceCreateReponse.data);
  //   const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
  //     headers: {
  //       authorization: `Bearer ${adminToken}`,
  //     },
  //   });
  //   const filteredSpace = response.data.spaces.find((x) => x.id == spaceCreateReponse.data.id);
  //   //expect(response.data.spaces.length).toBe(1);
  //   expect(filteredSpace).toBeDefined();
  // });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
    const admin = "Tushar" + Math.random();
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const adminResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: admin,
      password,
      type: "admin",
    });

    adminId = adminResponce.data.userId;

    const adminsigninResponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: admin,
        password,
        type: "admin",
      }
    );

    adminToken = adminsigninResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });

    userId = userResponce.data.userId;

    const userSigninresponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "user",
      }
    );

    userToken = userSigninresponce.data.token;

    const element1Res = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        height: 1,
        width: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Res.data;

    const element2Res = await axios.post(
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

    element2Id = element2Res.data;

    const mapResponce = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        height: 100,
        width: 200,
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
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponce.data.id;

    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        height: 100,
        width: 100,
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    //console.log(spaceResponse.data);
    spaceId = spaceResponse.data.id;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.status).toBe(400);
  });

  test("Correct spaceId returns all the elements", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.data.dimensions).toBe("200x100");
    expect(response.data.elements.length).toBe(3);
  });

  test("Delete endpoint is able to remove an element from sapce", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    let res = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
      data: { spaceId: spaceId, elementId: response.data.elements[0].id },
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(newResponse.data.elements.length).toBe(2);
  });

  test("Adding an element fails if the element lies outside the dimensions", async () => {
    const newResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 10000,
        y: 210000,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(newResponse.status).toBe(400);
  });

  test("Adding an element works as expected", async () => {
    await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(newResponse.data.elements.length).toBe(3);
  });
});

describe("admin endpoint", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const admin = "Tushar" + Math.random();
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const adminResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: admin,
      password,
      type: "admin",
    });

    adminId = adminResponce.data.userId;

    const adminsigninResponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: admin,
        password,
        type: "admin",
      }
    );

    adminToken = adminsigninResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });

    userId = userResponce.data.userId;

    const userSigninresponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "user",
      }
    );

    userToken = userSigninresponce.data.token;

    const elementRes = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        height: 1,
        width: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    elementId = elementRes.data;
  });

  test("User is not able to hit admin Endpoints", async () => {
    const elementReponse = await axios.post(
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
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "test space",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(elementReponse.status).toBe(401);
    expect(mapResponse.status).toBe(401);
    expect(avatarResponse.status).toBe(401);
    expect(updateElementResponse.status).toBe(401);
  });

  test("Admin is able to hit admin Endpoints", async () => {
    const elementReponse = await axios.post(
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
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        name: "Space",
        height: 200,
        width: 100,
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(elementReponse.status).toBe(200);
    expect(mapResponse.status).toBe(200);
    expect(avatarResponse.status).toBe(200);
  });

  test("Admin is able to update the imageUrl for an element", async () => {
    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/${elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(updateElementResponse.status).toBe(200);
  });
});

describe("Websocket tests", () => {
  let adminToken;
  let adminUserId;
  let userToken;
  let adminId;
  let userId;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise((resolve) => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setInterval(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setupHTTP() {
    const admin = "Tushar" + Math.random();
    const username = "Tushar" + Math.random();
    const password = "Tushar1234";

    const adminResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: admin,
      password,
      type: "admin",
    });

    adminId = adminResponce.data.userId;

    const adminsigninResponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: admin,
        password,
        type: "admin",
      }
    );

    adminToken = adminsigninResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });

    userId = userResponce.data.userId;

    const userSigninresponce = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
        type: "user",
      }
    );
    
    userToken = userSigninresponce.data.token;

    const element1Res = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        height: 1,
        width: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Res.data;

    const element2Res = await axios.post(
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

    element2Id = element2Res.data;

    const mapResponce = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        height: 100,
        width: 200,
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
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponce.data.id;

    const spaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        height: 100,
        width: 100,
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    //console.log(spaceResponse.data);
    spaceId = spaceResponse.data.id;
  }
  async function createWebSocket(url, label, messageArray) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log(`${label} WebSocket connected.`);
        resolve(ws);
      };

      ws.onmessage = (event) => {
        console.log(`Message received on ${label}:`, event.data);
        try {
          messageArray.push(JSON.parse(event.data));
        } catch (error) {
          console.error(`Error parsing message on ${label}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`${label} WebSocket error:`, error);
        reject(error);
      };

      ws.onclose = () => {
        console.log(`${label} WebSocket closed.`);
      };
    });
  }

  async function setupWs() {
    try {
      ws1Messages = [];
      ws2Messages = [];

      ws1 = await createWebSocket(
        `${WS_URL}?spaceId=${spaceId}`,
        "ws1",
        ws1Messages
      );
      ws2 = await createWebSocket(
        `${WS_URL}?spaceId=${spaceId}`,
        "ws2",
        ws2Messages
      );

      console.log("Both WebSockets connected successfully.");
    } catch (error) {
      console.error("Failed to set up WebSockets:", error);
    }
  }

  beforeAll(async () => {
    await setupHTTP();
    await setupWs();
  });

  test("Get back ack for joining the space", async () => {
    console.log("Starting test: Get back ack for joining the space");

    // Ensure WebSockets are open before sending messages
    if (ws1.readyState !== WebSocket.OPEN) {
      await new Promise((resolve) => (ws1.onopen = resolve));
    }
    if (ws2.readyState !== WebSocket.OPEN) {
      await new Promise((resolve) => (ws2.onopen = resolve));
    }

    console.log("ws1 and ws2 are connected.");

    // ws1 joins the space
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          token: adminToken,
        },
      })
    );

    console.log("ws1 sent join request.");

    // Wait for the acknowledgment message for ws1
    const message1 = await waitForAndPopLatestMessage(ws1Messages);
    console.log("ws1 received ack:", message1);

    // ws2 joins the space
    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          token: userToken,
        },
      })
    );

    console.log("ws2 sent join request.");

    // Wait for the acknowledgment message for ws2
    const message2 = await waitForAndPopLatestMessage(ws2Messages);
    console.log("ws2 received ack:", message2);

    // ws1 should receive another message (e.g., ws2 joined notification)
    const message3 = await waitForAndPopLatestMessage(ws1Messages);
    console.log("ws1 received another message:", message3);

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-joined");
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);
    expect(message3.payload.userId).toBe(userId);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;

    userX = message2.payload.spawn.x;
    userY = message2.payload.spawn.y;
  });

  test("User should not be able to move across the boundary of the wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: 1000000,
          y: 10000,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("User should not be able to move two blocks at the same time", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: adminX + 2,
          y: adminY,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("Correct movement should be broadcasted to the other sockets in the room", async () => {
    ws1.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: adminX + 1,
          y: adminY,
          userId: adminId,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe("movement");
    expect(message.payload.x).toBe(adminX + 1);
    expect(message.payload.y).toBe(adminY);
  });

  test("If a user leaves, the other user receives a leave event", async () => {
    ws1.close();
    const message = await waitForAndPopLatestMessage(ws2Messages);
    console.log(message);
    expect(message.type).toBe("user-left");
    console.log("adminId: ", adminId);
    expect(message.payload.userId).toBe(adminId);
  });
});
