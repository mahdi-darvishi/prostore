# Create Order Action

Next, we will create the action to add a new order to the database. This action will be triggered when the user clicks the "Place Order" button on the checkout page.

We need to create a new file at `lib/actions/order.actions.ts` and add the following imports and add `use server`:

```typescript
'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem } from '@/types';

```

Now add the following function:

```typescript
// Create Order
export const createOrder = async () => {
  try {
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
};
```

Let's go step by step and add to the try block:

```ts
const session = await auth();
if (!session) throw new Error('User is not authenticated');

const cart = await getMyCart();
const userId = session?.user?.id;
if (!userId) throw new Error('User not found');

const user = await getUserById(userId);
```

We get the session, the cart and the user. 


We need to check if the cart is empty or if the user has not set an address or payment method. If any of these conditions are met, we are going to send a fail response with a `redirectTo` link:

```tsx
if (!cart || cart.items.length === 0) {
  return {
    success: false,
    message: 'Your cart is empty',
    redirectTo: '/cart',
  };
}

if (!user.address) {
  return {
    success: false,
    message: 'No shipping address',
    redirectTo: '/shipping-address',
  };
}

if (!user.paymentMethod) {
  return {
    success: false,
    message: 'No payment method',
    redirectTo: '/payment-method',
  };
}
```

Next, let's create an order object:

```ts
// Prepare the order object
const order = insertOrderSchema.parse({
  userId: user.id,
  shippingAddress: user.address,
  paymentMethod: user.paymentMethod,
  itemsPrice: cart.itemsPrice,
  shippingPrice: cart.shippingPrice,
  taxPrice: cart.taxPrice,
  totalPrice: cart.totalPrice,
});
```

We create an order object using the `insertOrderSchema` schema. We use the `parse` method to validate the data and throw an error if the data is invalid.

Next, we need to create the order. We are going to use a Prisma transaction to create the order and update the stock of the products in the order. A transaction is a way to ensure that all the operations in a transaction are completed successfully or none of them are completed. If any of the operations fail, the transaction is rolled back and the database is left in the same state as before the transaction started.

Taking money from an ATM is a good example of a transaction. If you try to withdraw money from an ATM and the transaction fails at any point, the money is not deducted from your account.

Add the following code under the order object:

```ts
// Create a transaction to create order and order items in database
const insertedOrderId = await prisma.$transaction(async (tx) => {
  // Create order
  const insertedOrder = await tx.order.create({ data: order });
  // Create order items from the cart items
  for (const item of cart.items as CartItem[]) {
    await tx.orderItem.create({
      data: {
        ...item,
        price: item.price,
        orderId: insertedOrder.id,
      },
    });
  }
  // Clear cart
  await tx.cart.update({
    where: { id: cart.id },
    data: {
      items: [],
      totalPrice: 0,
      taxPrice: 0,
      shippingPrice: 0,
      itemsPrice: 0,
    },
  });

  return insertedOrder.id;
});
```

We create a variable called `insertedOrderId` that will hold the id of the order. We then call the `prisma.$transaction` method. This takes a callback function that takes in a parameter of `tx`. This is what's called a **Prisma transactional client** and it is scoped to the current transaction meaning every database operation using `tx` is wrapped in the same transaction.

Since `tx` binds these operations together, any query using `tx` will be rolled back if an error occurs in any part of the transaction block. This rollback wouldn't be possible if if we executed these queries independently.

So since we're adding multiple items to the order, if any of the operations fail, the entire transaction will be rolled back. So you won't end up with an order with some items and some items not in the order. We're also clearing the cart after the order is created.

Finally, we need to check for errors and send a success response:

```ts
 if (!insertedOrderId) throw new Error('Order not created');

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
```

Here is the entire code:

```typescript
'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { redirect } from 'next/navigation';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem } from '@/types';

// Create an order
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }
    if (!user.address) {
      return { success: false, message: 'Please add a shipping address', redirectTo: '/shipping-address' };
    }
    if (!user.paymentMethod) {
      return { success: false, message: 'Please select a payment method', redirectTo: '/payment-method' };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    return { success: true, message: 'Order successfully created', redirectTo: `/order/${insertedOrderId}` };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

```
