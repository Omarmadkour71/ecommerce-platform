# Complete E-Commerce Backend API 🛒

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

A production-ready RESTful API for an e-commerce platform. This project demonstrates advanced backend architecture, secure payment processing, and high-performance data delivery.

## 🚀 The Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Payments:** Stripe API (with Webhooks)
- **Image Processing:** Multer, Sharp
- **Testing:** Jest
- **Security:** JSON Web Tokens (JWT), bcryptjs, Helmet, Express Rate Limit, Data Sanitization

## 🧠 Advanced Backend Features

This API was built to handle real-world e-commerce complexities. It showcases deep proficiency in NoSQL database design and aggregation.

- **Secure Payment Integration:** Implements Stripe Checkout and robust webhook handlers (with raw body signature verification) to securely process payments and automatically update order statuses.
- **Transactional Reliability:** Includes inventory management logic to lock stock during checkout and decrement quantities upon successful order creation.
- **Complex Data Aggregation:** Leverages MongoDB aggregation pipelines to generate real-time administrative dashboards.
- **Image Processing:** Integrates Multer and Sharp to accept, resize, and format product image uploads (thumbnails and covers) before storage.
- **Faceted Search & Filtering:** Advanced API features including full-text search, pagination, field limiting, and faceted filtering.
- **Enterprise Security:** Hardened against common web vulnerabilities using Helmet, Express Rate Limit, HPP (HTTP Parameter Pollution prevention), and NoSQL injection sanitization.

## 📡 Core API Reference

The API utilizes comprehensive Role-Based Access Control (RBAC) and middleware chaining to secure endpoints and process data (such as image resizing) before it reaches the database.

_(Note: Assumes base URL of `/api/v1`)_

### 🔐 Authentication & Users

| Method   | Endpoint                      | Access    | Description                                                               |
| :------- | :---------------------------- | :-------- | :------------------------------------------------------------------------ |
| `POST`   | `/users/signup`               | Public    | Register a new user                                                       |
| `POST`   | `/users/login`                | Public    | Authenticate user and issue JWT                                           |
| `POST`   | `/users/forgotpassword`       | Public    | Generate a password reset token                                           |
| `POST`   | `/users/resetpassword/:token` | Public    | Reset password using token                                                |
| `POST`   | `/users/updateprofile`        | Protected | Update logged-in user profile (includes photo upload & resize middleware) |
| `GET`    | `/users`                      | Admin     | Get all users                                                             |
| `POST`   | `/users`                      | Public    | Create a new user (direct)                                                |
| `GET`    | `/users/:id`                  | Public    | Get a specific user by ID                                                 |
| `PATCH`  | `/users/:id`                  | Public    | Update a specific user                                                    |
| `DELETE` | `/users/:id`                  | Public    | Delete a specific user                                                    |

### 📦 Products

| Method   | Endpoint        | Access | Description                                                      |
| :------- | :-------------- | :----- | :--------------------------------------------------------------- |
| `GET`    | `/products`     | Public | Get all products                                                 |
| `POST`   | `/products`     | Public | Create a new product (includes photo upload & resize middleware) |
| `GET`    | `/products/:id` | Public | Get a specific product by ID                                     |
| `PATCH`  | `/products/:id` | Public | Update product details                                           |
| `DELETE` | `/products/:id` | Public | Delete a product                                                 |

### ⭐ Reviews

| Method   | Endpoint                           | Access    | Description                                                  |
| :------- | :--------------------------------- | :-------- | :----------------------------------------------------------- |
| `POST`   | `/reviews/write-review`            | Protected | Current logged-in user adds a review for a purchased product |
| `PATCH`  | `/reviews/edit-review/:reviewId`   | Protected | Current logged-in user edits their review                    |
| `DELETE` | `/reviews/remove-review/:reviewId` | Protected | Current logged-in user removes their review                  |
| `GET`    | `/reviews`                         | Admin     | Get all reviews across the platform                          |
| `POST`   | `/reviews`                         | Admin     | Create a review directly                                     |
| `GET`    | `/reviews/:id`                     | Admin     | Get a specific review                                        |
| `PATCH`  | `/reviews/:id`                     | Admin     | Update any review                                            |
| `DELETE` | `/reviews/:id`                     | Admin     | Delete any review                                            |

### 🛒 Cart

| Method   | Endpoint                 | Access    | Description                                 |
| :------- | :----------------------- | :-------- | :------------------------------------------ |
| `GET`    | `/cart/my-cart`          | Protected | Get current logged-in user's active cart    |
| `POST`   | `/cart/item`             | Protected | Add a new item to the cart                  |
| `DELETE` | `/cart/my-cart`          | Protected | Delete current logged-in user's cart        |
| `POST`   | `/cart/checkout/:cartId` | Protected | Process cart checkout                       |
| `DELETE` | `/cart/:id/item/:itemId` | Protected | Delete a specific item from a specific cart |
| `DELETE` | `/cart/:id`              | Protected | Delete a specific cart                      |
| `GET`    | `/cart`                  | Public    | Get all carts                               |
| `GET`    | `/cart/:id`              | Public    | Get a specific cart by ID                   |

### 📦 Orders

| Method   | Endpoint            | Access    | Description                                     |
| :------- | :------------------ | :-------- | :---------------------------------------------- |
| `GET`    | `/orders/my-orders` | Protected | Get all orders for the currently logged-in user |
| `GET`    | `/orders`           | Admin     | Get all orders across the platform              |
| `POST`   | `/orders`           | Admin     | Create a new order manually                     |
| `GET`    | `/orders/:id`       | Admin     | Get specific order details                      |
| `PATCH`  | `/orders/:id`       | Admin     | Update order details/status                     |
| `DELETE` | `/orders/:id`       | Admin     | Delete an order                                 |

## 💻 Local Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Omarmadkour71/ecommerce-platform.git](https://github.com/Omarmadkour71/ecommerce-platform.git)
   cd ecommerce-platform
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory based on the provided `.env.example`:

   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster...
   JWT_SECRET=<your_jwt_secret>
   JWT_EXPIRES_IN=30d
   STRIPE_SECRET_KEY=<your_stripe_secret>
   STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
   REDIS_URL=redis://localhost:6379
   ```

4. **Infrastructure Setup:**
   Ensure you have MongoDB, or provide cloud URIs in your `.env` file.

5. **Seed the Database (Optional):**
   Populate the database with sample products and users for development.

   ```bash
   node data/import-dev-data.js
   ```

6. **Run the Application:**

   ```bash
   npm start
   ```

   The server will start on the port specified in your `.env` file (default `5000`), printing `API running` to the console.

7. **Run Tests:**
   ```bash
   npm test
   ```
