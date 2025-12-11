jest.mock("stripe");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

// Allow slower operations (mongoose connections, hashing) in tests
jest.setTimeout(15000);

// Set test environment variables before requiring app
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.JWT_EXPIRE_IN = "90d";

let mongo;
let token;

beforeAll(async () => {
  // start in-memory MongoDB
  mongo = await MongoMemoryServer.create(); // Creats Temporary Mongodb server instance
  const uri = mongo.getUri(); // retrives the connection sring for the server instance
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // create a fresh user and token for every test so cleanup won't break auth
  const uniqueEmail = `testprofile-${Date.now()}@gmail.com`;
  const res = await request(app).post("/api/v1/users/signup").send({
    name: "Testing Name",
    email: uniqueEmail,
    password: "test1234",
    confirmPassword: "test1234",
  });
  token = res.body.token;
});

afterEach(async () => {
  //wipes data and collections after each test function finishes executing.
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close(); // disconnects the Mongoose client from the database server.
  await mongo.stop(); // shuts down the server instance and free up the port
});

module.exports = {
  getToken: () => token,
};
