import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currenzy = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// Schema for inserting products

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 chracters"),
  slug: z.string().min(3, "Slug must be at least 3 chracters"),
  category: z.string().min(3, "Category must be at least 3 chracters"),
  brand: z.string().min(3, "Brand must be at least 3 chracters"),
  description: z.string().min(3, "Description must be at least 3 chracters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currenzy,
});

// Schema for sighin users in

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be least 6 chracters"),
});

// Schema for sighin UP users in
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 chracters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be least 6 chracters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be least 6 chracters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
