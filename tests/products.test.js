jest.mock("stripe");

const request = require("supertest");
const app = require("../app");
const Product = require("../models/productModel");

describe("Product API", () => {
  test("should create product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .send({
        name: "test product",
        price: 100,
        category: "testing",
        description: "this is a test product",
        stock: 4,
      })
      .expect(201);
    expect(res.body.data.doc.name).toBe("test product");
  });

  test("should get All Products", async () => {
    await Product.create({
      name: "A",
      price: 23,
      category: "A test",
      description: "Testing description",
    });
    await Product.create({
      name: "B",
      price: 23,
      category: "B test",
      description: "Testing description",
    });
    const res = await request(app).get("/api/v1/products").expect(200);
    expect(res.body.length).toBe(2);
  });

  test("should get one product", async () => {
    const product = await Product.create({
      name: "A",
      price: 23,
      description: "testing description",
      category: "A test",
    });
    const res = await request(app)
      .get(`/api/v1/products/${product._id}`)
      .expect(200);
    expect(res.body.data.doc.name).toBe("A");
  });

  test("should update product", async () => {
    const product = await Product.create({
      name: "A",
      price: 23,
      description: "testing description",
      category: "A test",
      stock: 4,
    });
    const res = await request(app)
      .patch(`/api/v1/products/${product._id}`)
      .send({ stock: 2 })
      .expect(200);
    expect(res.body.data.doc.stock).toBe(2);
    expect(res.body.data.doc.name).toBe("A");
    expect(res.body.data.doc.category).toBe("A test");
  });

  test("should delete product", async () => {
    const product = await Product.create({
      name: "A",
      price: 23,
      description: "testing description",
      category: "A test",
      stock: 4,
    });
    const res = await request(app)
      .delete(`/api/v1/products/${product._id}`)
      .expect(204);
  });
});
