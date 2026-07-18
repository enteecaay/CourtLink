import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const roles = ["Admin", "Manager", "Staff", "Host", "Player"];

async function main() {
  // Seed roles
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(` Role "${name}" created`);
  }

  // Seed admin account
  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@courtlink.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@courtlink.com",
      password: hashedPassword,
      phoneNumber: "0000000000",
      avatar: "",
      roleId: adminRole.id,
    },
  });
  console.log(` Admin account created (admin@courtlink.com / admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());