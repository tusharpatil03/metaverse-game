const { default: axios } = require("axios");

const DATABASE_URL = "http://localhost:8080/";
const username = "Tushar" + Math.floor(Math.random() * 9) + 1;
const password = "Tushar1234";
const type = "admin"; 

describe("Authenticatio", function () {
    test("user is able to signup only once", async () => {
        const res = await axios.post(`${DATABASE_URL}/api/v1/login`, {
            username,
            password,
            type
        });

        expect(res.status).tobe(200);

        const newRes = await axios.post(`${DATABASE_URL}/api/v1/user/login`, {
            username,
            password,
            type
        });

        expect(newRes.status).tobe(400);
    });

    test("user is able to login", async () => {
        const res = await axios.post(`${DATABASE_URL}/api/v1/login`, {
            username,
            password,
            type
        });

        expect(res.status).tobe(200);
        expect(res.body.token).tobeDefined();
    });

    test("user is able to logout", async() => {
        const res = axios.get(`${DATABASE_URL}/api/v1/logout`);

        expect(res).tobe(200);
    });
});
