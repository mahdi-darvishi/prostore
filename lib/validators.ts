import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";
const currency = z
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
  price: currency,
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

// Cart Schema

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is Required"),
  name: z.string().min(1, "Name is Required"),
  slug: z.string().min(1, "Slug is Required"),
  qty: z.number().int().nonnegative("Quantity must be a positive number"),
  image: z.string().min(1, "Image is Required"),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

//  Schema for shiiping address

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  streetAddress: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal Code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Schema for payment method

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Paymney methid is reqired"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Schema for inserting order

export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),

  shippingAddress: shippingAddressSchema,
});

// Schema for inserting order item

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});
