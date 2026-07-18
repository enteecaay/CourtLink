// 
//    THE MODEL LAYER                                          
//                                                               
//   In MVC (Model-View-Controller), the Model is responsible   
//   for ALL database operations. Controllers should NEVER      
//   talk to Prisma directly — they call model functions.        
//                                                               
//   WHY?                                                        
//   1. If you change your DB (e.g. Prisma → raw SQL), you      
//      only update this file, not every controller.             
//   2. Reusability: multiple controllers can call findByEmail. 
//   3. Testability: you can mock these functions in tests.     
// 

import prisma from "../utils/prisma.js";

//  Create User 
//  BUG FIX: The old version had 3 bugs:
//   1. Referenced an undefined `users` variable
//   2. Manually set `id` but schema uses autoincrement
//   3. Didn't include required fields (phoneNumber, roleId)

export const createUser = async ({ name, email, password, phoneNumber, roleId }) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      phoneNumber,
      roleId,
    },
    //  "select" lets you choose WHICH fields to return.
    // We NEVER return the password hash — even internally.
    // This is a security best practice.
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      roleId: true,
      createAt: true,
    },
  });
  return user;
};

//  Find User by Email 
// Used by: register (check duplicates), login (find account)
//  "include: { role: true }" tells Prisma to JOIN the Role table
//    so we get { ...user, role: { id: 1, name: "Player" } }

export const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }, // JOIN with roles table
  });
  return user;
};

//  Find User by ID 
// Used by: the "me" endpoint to get current user's profile

export const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      avatar: true,
      createAt: true,
      role: true, //  shorthand for include when inside select
    },
  });
  return user;
};

//  Find Default "Player" Role 
// New users get the "Player" role by default

export const findRoleByName = async (name) => {
  const role = await prisma.role.findUnique({ where: { name } });
  return role;
};

//  Refresh Token Operations 
//  These functions manage refresh tokens in the database.
//    Storing tokens in the DB (vs. just using JWT) lets us:
//    1. Revoke tokens on logout
//    2. Revoke all tokens if account is compromised
//    3. Limit the number of active sessions per user

export const createRefreshToken = async (userId, token, expiredAt) => {
  return prisma.refreshToken.create({
    data: { userId, token, expiredAt },
  });
};

export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({ where: { token } });
};

export const deleteRefreshToken = async (token) => {
  return prisma.refreshToken.delete({ where: { token } });
};

// Delete all refresh tokens for a user (useful for "logout everywhere")
export const deleteAllRefreshTokens = async (userId) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};
