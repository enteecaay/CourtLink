import express from "express";
import { registerUser, login } from "../controllers/userController.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo một tài khoản người dùng mới với tên, email và mật khẩu.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Đăng ký thành công.
 *       400:
 *         description: Email đã tồn tại.
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Đăng nhập
 *     description: Đăng nhập bằng email và mật khẩu, trả về JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token.
 *       401:
 *         description: Email hoặc mật khẩu không đúng.
 */
router.post("/login", login);

router.post("auth/refresh-token", (req, res) => {
  // Logic to refresh the token
  res.json({ message: "Token refreshed" });
});

router.get("auth/me", (req, res) => {
  // Logic to get the current user
  res.json({ message: "Current user info" });
});

export { router as userRoutes };
