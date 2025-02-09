# Customizing the Token With The JWT Callback

So we have a working authentication system that sends a JWT token to the client. However, right now, that token contains just the name and email. I want to customize it to also have the `role`. We also want to check if the user has no name and use their email as their name if so. We also want to handle session updates such as a name change. To do this, we need to add a `jwt` callback.

## `jwt` callback

Open the `auth.ts` file and add a `jwt` callback function.

```typescript
 async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;

        // If user has no name, use email as their default name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // Update the user in the database with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }

      // Handle session updates (e.g., name change)
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
```

We are checking for the user and assigning the role to the token. We are also checking for the user's name and if it is `NO_NAME`, we are setting the name to the user's email address. We are also updating the user's name in the database. This is mainly for the magic link login we will implement later. Finally, we are checking if the session has a user name and if the trigger is `update`, we are setting the token's name to the session's user name.

### The `session` callback

The `jwt` callback runs before the `session` callback. Since we added a custom `jwt` callback, we need to manually assign the user's ID, name, and role to the session. So now, in the `session` callback, we need to add the following:

```typescript
async session ({ session, token, trigger }: any) {
  // Map the token data to the session object
  session.user.id = token.id;
  session.user.name = token.name; // 👈 Add this line
  session.user.role = token.role; // 👈 Add this line

  // Optionally handle session updates (like name change)
  if (trigger === 'update' && token.name) {
    session.user.name = token.name;
  }

  // Return the updated session object
  return session;
},

```

We are mapping the token data to the session object. We are also checking if the trigger is `update` and if the token has a name, we are setting the session's user name to the token's name.

If you log in and go to `/api/auth/session`, you should see something like this:

```json
{
  "user": {
    "name": "John",
    "email": "admin@example.com",
    "id": "9dfc5834-095d-4a34-a072-c030bd55d9e0",
    "role": "admin"
  },
  "expires": "2024-11-20T19:23:49.078Z"
}
```

Also, the JWT now includes the user's ID, name, and role so that we can access them on the client-side. If you try and paste the token in [jwt.io](https://jwt.io/), it will not show you the payload because it's encrypted. However, it is decrypted on the client-side in our app.
