"use server";

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { error } from "console";
import { formatError } from "../utils";
// Sigh in the user with credentials

export async function signInWithCredintials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);
    return {
      success: true,
      message: "Signed is successfuly",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
  }

  return { success: false, message: "Invalid email or password" };
}

// Sign user out

export async function signOutUser() {
  await signOut();
}

// sign up user

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registred successfuly" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
  }

  return { succrss: false, message: formatError(error) };
}

// Get user  by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found.");

  return user;
}
