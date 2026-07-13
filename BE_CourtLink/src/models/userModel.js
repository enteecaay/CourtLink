import prisma from "../utils/prisma.js";

const createUser = async ({ name, email, password }) => {
  const id = `${users.length + 1}`;
  const user = await prisma.user.create({
    data: { id, name, email, password },
  });
  return user;
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
};

export { createUser, findUserByEmail };
