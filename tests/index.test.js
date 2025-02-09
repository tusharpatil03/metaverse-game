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
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
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
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
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

    const adminsigninResponce = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: admin,
      password,
      type: "admin",
    });

    adminToken = adminsigninResponce.data.token;

    const userResponce = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });

    userId = userResponce.data.userId;

    const userSigninresponce = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
      type: "user",
    });

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
    console.log(spaceId);

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
    console.log(response.data);

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

// describe("Arena endpoints", () => {
//   let mapId;
//   let element1Id;
//   let element2Id;
//   let adminToken;
//   let adminId;
//   let userToken;
//   let userId;
//   let spaceId;

//   beforeAll(async () => {
//     const username = `Tushar${math.random()}`;
//     const password = "123456";

//     const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//       username,
//       password,
//       type: "admin",
//     });

//     adminId = signupResponse.data.userId;

//     const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//       username: username,
//       password,
//     });

//     adminToken = response.data.token;

//     const userSignupResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signup`,
//       {
//         username: username + "-user",
//         password,
//         type: "user",
//       }
//     );

//     userId = userSignupResponse.data.userId;

//     const userSigninResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signin`,
//       {
//         username: username + "-user",
//         password,
//       }
//     );

//     userToken = userSigninResponse.data.token;

//     const element1Response = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     const element2Response = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );
//     element1Id = element1Response.data.id;
//     element2Id = element2Response.data.id;

//     const mapResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/map`,
//       {
//         thumbnail: "https://thumbnail.com/a.png",
//         dimensions: "100x200",
//         name: "Default space",
//         defaultElements: [
//           {
//             elementId: element1Id,
//             x: 20,
//             y: 20,
//           },
//           {
//             elementId: element1Id,
//             x: 18,
//             y: 20,
//           },
//           {
//             elementId: element2Id,
//             x: 19,
//             y: 20,
//           },
//         ],
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );
//     mapId = mapResponse.data.id;

//     const spaceResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/space`,
//       {
//         name: "Test",
//         dimensions: "100x200",
//         mapId: mapId,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );
//     console.log(spaceResponse.data);
//     spaceId = spaceResponse.data.spaceId;
//   });

//   test("Incorrect spaceId returns a 400", async () => {
//     const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
//       headers: {
//         authorization: `Bearer ${userToken}`,
//       },
//     });
//     expect(response.status).toBe(400);
//   });

//   test("Correct spaceId returns all the elements", async () => {
//     const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//       headers: {
//         authorization: `Bearer ${userToken}`,
//       },
//     });
//     console.log(response.data);
//     expect(response.data.dimensions).toBe("100x200");
//     expect(response.data.elements.length).toBe(3);
//   });

//   test("Delete endpoint is able to delete an element", async () => {
//     const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//       headers: {
//         authorization: `Bearer ${userToken}`,
//       },
//     });

//     console.log(response.data.elements[0].id);
//     let res = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
//       data: { id: response.data.elements[0].id },
//       headers: {
//         authorization: `Bearer ${userToken}`,
//       },
//     });

//     const newResponse = await axios.get(
//       `${BACKEND_URL}/api/v1/space/${spaceId}`,
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     expect(newResponse.data.elements.length).toBe(2);
//   });

//   test("Adding an element fails if the element lies outside the dimensions", async () => {
//     const newResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/space/element`,
//       {
//         elementId: element1Id,
//         spaceId: spaceId,
//         x: 10000,
//         y: 210000,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     expect(newResponse.status).toBe(400);
//   });

//   test("Adding an element works as expected", async () => {
//     await axios.post(
//       `${BACKEND_URL}/api/v1/space/element`,
//       {
//         elementId: element1Id,
//         spaceId: spaceId,
//         x: 50,
//         y: 20,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     const newResponse = await axios.get(
//       `${BACKEND_URL}/api/v1/space/${spaceId}`,
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     expect(newResponse.data.elements.length).toBe(3);
//   });
// });

// describe("admin endpoint", () => {
//   let adminToken;
//   let adminId;
//   let userToken;
//   let userId;

//   beforeAll(async () => {
//     const username = `Tushar${math.random()}`;
//     const password = "Tushar1234";

//     const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//       username,
//       password,
//       type: "admin",
//     });

//     adminId = signupResponse.data.userId;

//     const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//       username: username,
//       password,
//     });

//     adminToken = response.data.token;

//     const userSignupResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signup`,
//       {
//         username: username + "-user",
//         password,
//         type: "user",
//       }
//     );

//     userId = userSignupResponse.data.userId;

//     const userSigninResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signin`,
//       {
//         username: username + "-user",
//         password,
//       }
//     );

//     userToken = userSigninResponse.data.token;
//   });

//   test("User is not able to hit admin Endpoints", async () => {
//     const elementReponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     const mapResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/map`,
//       {
//         thumbnail: "https://thumbnail.com/a.png",
//         dimensions: "100x200",
//         name: "test space",
//         defaultElements: [],
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     const avatarResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/avatar`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//         name: "Timmy",
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     const updateElementResponse = await axios.put(
//       `${BACKEND_URL}/api/v1/admin/element/123`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     expect(elementReponse.status).toBe(403);
//     expect(mapResponse.status).toBe(403);
//     expect(avatarResponse.status).toBe(403);
//     expect(updateElementResponse.status).toBe(403);
//   });

//   test("Admin is able to hit admin Endpoints", async () => {
//     const elementReponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     const mapResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/map`,
//       {
//         thumbnail: "https://thumbnail.com/a.png",
//         name: "Space",
//         dimensions: "100x200",
//         defaultElements: [],
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     const avatarResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/avatar`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//         name: "Timmy",
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );
//     expect(elementReponse.status).toBe(200);
//     expect(mapResponse.status).toBe(200);
//     expect(avatarResponse.status).toBe(200);
//   });

//   test("Admin is able to update the imageUrl for an element", async () => {
//     const elementResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     const updateElementResponse = await axios.put(
//       `${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     expect(updateElementResponse.status).toBe(200);
//   });
// });
