import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (findUserByEmail(email)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Email already exists" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const user = createUser({ name, email, password: hashPassword });
  res.status(201).json({ status: "success", data: user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ status: "success", token });
};

export { registerUser, login };
