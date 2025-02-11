# Cart Schema and Model

We are going to prepare our data for the shopping cart. We will create a Zod schema as well as our Prisma schema to prepare the database.

## Item Schema

Let's add the Zod schema for the items in the cart. Open the `lib/validator.ts` file and add the following schema:

```typescript
// Cart
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a non-negative number'),
  image: z.string().min(1, 'Image is required'),
  price: z
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(Number(value).toFixed(2)),
      'Price must have exactly two decimal places (e.g., 49.99)'
    ),
});
```

This schema will be used to validate the cart items when we get the cart.

## Cart Schema

Let's add the schema for the cart itself. Open the `lib/validator.ts` file and add the following schema:

```typescript
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),
});
```

## Add The Types

Let's add a new type. Open the `types/index.ts` file and add the following types:

```typescript
import {
  cartItemSchema,
  insertCartSchema,
  insertProductSchema,
} from '@/lib/validator';
```

```typescript
export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
```

Now we can use the `CartItem` type in our application.

## Prisma Schema/Model

Let's add the Prisma schema. Open the `prisma/schema.prisma` file and add the following:

```prisma
model Cart {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String?  @db.Uuid
  sessionCartId String
  items         Json[]   @default([]) @db.Json
  itemsPrice    Decimal  @db.Decimal(12, 2)
  shippingPrice Decimal  @db.Decimal(12, 2)
  taxPrice      Decimal  @db.Decimal(12, 2)
  totalPrice    Decimal  @db.Decimal(12, 2)
  createdAt     DateTime @default(now()) @db.Timestamp(6)
  user          User?    @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "cart_userId_user_id_fk")
}
```

Since there is a relationship between the `Cart` and `User` models, also add the following to the `User` model:

```prisma
model User {
  // ... other fields
  Cart          Cart[]
}
```

Let's generate the Prisma client. Open the terminal and run the following command:

```bash
npx prisma generate
```

This will generate the Prisma client.

Now, let's run the migration:

```bash
npx prisma migrate dev --name add-cart
```

This will create a new migration file and apply the changes to the database.

If you open up Prisma Studio, you will see the new `Cart` model.
