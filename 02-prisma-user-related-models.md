# Prisma User-Related Models

We need to create 4 new models that have to do with users and authentication. There is a documentation page with the suggested models to use here: [https://authjs.dev/getting-started/adapters/prisma](https://authjs.dev/getting-started/adapters/prisma). Click on the "Prisma" tab.

This shows some of the basic fields, but we will customize it a bit.

Open the `schema.prisma` file and add the User model:

```prisma
model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name          String    @default("NO_NAME")
  email         String    @unique(map: "user_email_idx")
  password      String?
  role          String    @default("user")
  emailVerified DateTime? @db.Timestamp(6)
  image         String?
  address       Json?     @db.Json
  paymentMethod String?
  createdAt     DateTime  @default(now()) @db.Timestamp(6)
  updatedAt     DateTime  @updatedAt
  account       Account[]
  session       Session[]
}
```

#### Field Descriptions

- `id`: This is the primary key for the user. It is a UUID. It will be generated automatically by Prisma.
- `name`: This is the name of the user. It is a string and has a default value of "NO_NAME".
- `email`: This is the email of the user. It is a string and is unique. It is also indexed.
- `password`: This is the password of the user. It is a string and is optional. The reason it is optional is because there may be a login with Oauth and something like Google or Github and there will be no password.
- `role`: This is the role of the user. It is a string and has a default value of "user".
- `emailVerified`: This is the date and time that the user's email was verified. It is a DateTime and is optional.
- `image`: This is the image of the user. It is a string and is optional.
- `address`: This is the address of the user. It is a JSON object and is optional.
- `paymentMethod`: This is the payment method of the user. It is a string and is optional.
- `createdAt`: This is the date and time that the user was created. It is a DateTime and has a default value of the current date and time.
- `updatedAt`: This is the date and time that the user was last updated. It is a DateTime and is updated automatically by Prisma.
- `account`: This is the account of the user. It is an array of Account objects.
- `session`: This is the session of the user. It is an array of Session objects.

## Prisma Account Model

Here is the model for the Account:

```prisma
model Account {
  userId            String  @db.Uuid
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "account_userId_user_id_fk")
  @@id([provider, providerAccountId], map: "account_provider_providerAccountId_pk")
}
```

#### Field Descriptions

- `userId`: This is the user id of the user. It is a string and is a foreign key to the User model.
- `type`: This is the type of the account. It is a string.
- `provider`: This is the provider of the account. It is a string.
- `providerAccountId`: This is the provider account id of the account. It is a string.
- `refresh_token`: This is the refresh token of the account. It is a string and is optional. This is used to get a new access token when the current one expires.
- `access_token`: This is the access token of the account. It is a string and is optional. This is used to make requests to the provider's API.
- `expires_at`: This is the expiration time of the access token. It is an integer and is optional. This is used to determine when the access token expires.
- `token_type`: This is the type of the token. It is a string and is optional. This is used to determine the type of the token.
- `scope`: This is the scope of the token. It is a string and is optional. This is used to determine the scope of the token.
- `id_token`: This is the id token of the account. It is a string and is optional. This is used to verify the identity of the user.
- `session_state`: This is the session state of the account. It is a string and is optional. This is used to determine the state of the session.
- `createdAt`: This is the date and time that the account was created. It is a DateTime and has a default value of the current date and time.
- `updatedAt`: This is the date and time that the account was last updated. It is a DateTime and is updated automatically by Prisma.
- `user`: This is the user of the account. It is a User object. It is a foreign key to the User model. The `map` attribute is used to specify the name of the foreign key constraint.
- `@@id`: This is the primary key for the account. It is a composite primary key. It is made up of the `provider` and `providerAccountId` fields. In many OAuth systems, the combination of the provider (e.g., Google, GitHub) and the providerAccountId (the user's ID from the provider) is guaranteed to be unique, so it makes sense to use this as a primary key. Having a separate id field would be redundant.

## Prisma Session Model

Here is the model for the Session:

```prisma
model Session {
  sessionToken String   @id
  userId       String   @db.Uuid
  expires      DateTime @db.Timestamp(6)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "session_userId_user_id_fk")
}
```

#### Field Descriptions

- `sessionToken`: This is the session token of the session. It is a string and is the primary key.
- `userId`: This is the user id of the user. It is a string and is a foreign key to the User model.
- `expires`: This is the expiration time of the session. It is a DateTime and is a timestamp with 6 decimal places. This is used to determine when the session expires.
- `user`: This is the user of the session. It is a User object. It is a foreign key to the User model. The `map` attribute is used to specify the name of the foreign key constraint.

#### Prisma Verification Token Model

Here is the model for the Verification Token:

```prisma
model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

#### Field Descriptions

- `identifier`: This is the identifier of the verification token. It is a string and is part of the primary key.
- `token`: This is the token of the verification token. It is a string and is part of the primary key.
- `expires`: This is the expiration time of the verification token. It is a DateTime and is used to determine when the verification token expires.
- `@@id`: This is the primary key for the verification token. It is a composite primary key. It is made up of the `identifier` and `token` fields.

## Generate the Prisma Client

Since we made these changes, we need to regenerate the Prisma Client. To do this, stop the Next.js server and run the following command:

```bash
npx prisma generate
```

This will generate the Prisma Client with the new models. If you do not stop the server, you will probably get an error.

## Prisma Migration

We also need to create a migration for the new models. To do this, run the following command:

```bash
npx prisma migrate dev --name add_user_based_tables
```

This will create a new migration with the name `add_user_based_tables`. You can change the name if you want.

Your database should now be in sync with the new models.

You can check Prisma Studio to see the new tables and fields. You will need to restart it if you have it running. You can do this by running the following command:

```bash
npx prisma studio
```

Then visitt `http://localhost:5555` in your browser.
