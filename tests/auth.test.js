jest.mock("stripe");

const request = require("supertest");
const app = require("../app");
const User = require("../models/userModel");

describe("Auth API", () => {
  test("should sign up a new user", async () => {
    const res = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Omar Madkour",
        email: "testaccount@gmail.com",
        password: "test1234",
        confirmPassword: "test1234",
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.status).toBe("success");
  }, 10000);

  test("should log in user", async () => {
    const user = await User.create({
      name: "omar madkour",
      email: "testmail@gmail.com",
      password: "test1234",
      confirmPassword: "test1234",
    });

    const res = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: "testmail@gmail.com",
        password: "test1234",
      })
      .expect(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.status).toBe("success");
  });
});
