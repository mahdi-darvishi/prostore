# Payment Method Action & Schema

Now that we have the shipping page, we will start to add the payment method page. This page will allow the user to select a payment method and enter their payment details.

Before we create the actual page, we will need to create the schema for the payment method page as well as the action.

## Payment Methods

The payment methods that we will accept will be PayPal, Stripe and Cash on Delivery.

Open your `.env` file and add the following line:

```bash
PAYMENT_METHODS="PayPal, Stripe, CashOnDelivery"
DEFAULT_PAYMENT_METHOD="PayPal"
```

Then open the `lib/constants/index.ts` file and add the following code:

```typescript
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(', ')
  : ['PayPal', 'Stripe', 'CashOnDelivery'];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || 'PayPal';
```

We are just exporting the `PAYMENT_METHODS` and `DEFAULT_PAYMENT_METHOD` constants from the `lib/constants/index.ts` file. We are using `split()` to convert the comma-separated string into an array. If the `PAYMENT_METHODS` environment variable is not set, we will use the default values.

## Payment Method Schema

We need to create our Zod schema for the payment method. Opent the `lib/validators.ts` file and import the constant:

```typescript
import { PAYMENT_METHODS } from './constants';
```

Then add the following schema:

```typescript
//Payment Schema
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Pyament method is required'),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method',
  });
```

We are making sure that the payment method is one of the payment methods that we support.

## `updateUserPaymentMethod` Action

Open the `lib/actions/user.actions.ts` file and import the new schema and Zod:

```typescript
import {
  signInFormSchema,
  signUpFormSchema,
  shippingAddressSchema,
  paymentMethodSchema,
} from '../validator';
import { z } from 'zod';
```

Now add the following function:

```typescript
// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user.id! },
    });
    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
```

We are just updating the user's payment method by finding the user by their id and updating the `paymentMethod` field. We are also validating the data using the `paymentMethodSchema` schema.
