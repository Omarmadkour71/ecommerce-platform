const request = require("supertest");
const app = require("../app");
const { getToken } = require("./setup");
const User = require("../models/userModel");

describe("Updating User Profile", () => {
  test("should update only name, email & photo", async () => {
    const token = getToken();
    const res = await request(app)
      .post("/api/v1/users/updateprofile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Omar Madkour",
        email: "omartest@gmail.com",
      })
      .expect(201);
    expect(res.body.user.updatedUser.name).toBe("Omar Madkour");
    expect(res.body.user.updatedUser.email).toBe("omartest@gmail.com");
  });
});
