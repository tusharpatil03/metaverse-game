const { default: axios } = require("axios");

const BACKEND_URL = "http://localhost:8080/";
const username = "Tushar" + Math.floor(Math.random() * 9) + 1;
const password = "Tushar1234";
const type = "admin";

describe("Authenticatio", function () {
  test("user is able to signup only once", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
      username,
      password,
      type,
    });

    expect(res.status).tobe(200);

    const newRes = await axios.post(`${BACKEND_URL}/api/v1/user/login`, {
      username,
      password,
      type,
    });

    expect(newRes.status).tobe(400);
  });

  test("user is able to login", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
      username,
      password,
      type,
    });

    expect(res.status).tobe(200);
    expect(res.body.token).tobeDefined();
  });

  test("user is able to logout", async () => {
    const res = axios.get(`${BACKEND_URL}/api/v1/logout`);

    expect(res).tobe(200);
  });
});

describe("user metadata enpoints", () => {
  let token = "";
  let avatarId;
  beforeAll(async () => {
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
      `${BACKEND_URL / api / v1 / admin / avatar}`,
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

  test("user can't update there metadata with wrong avatarId", async () => {
    const responce = await axios.post(
      `${BACKEND_URL / api / v1 / user / metadata}`,
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
      `${BACKEND_URL / api / v1 / user / metadata}`,
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
    const responce = await axios.post(
      `${BACKEND_URL / api / v1 / user / metadata}`,
      {
        avatarId,
      }
    );

    expect(responce.status).tobe(403);
  });
});

describe("user avatar information", () => {
  let token = "";
  let avatarId;
  let userId;
  beforeAll(async () => {
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
      `${BACKEND_URL / api / v1 / admin / avatar}`,
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

  test("available avatar lists the recently created avatar", async()=> {
    const responce = axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(responce.data.avatars.length).not.tobe(0);

    const currentAvatar = (await responce).data.avatars.find(x => x.id == avatarId);
    expect(currentAvatar).tobeDefined();
  })

});
