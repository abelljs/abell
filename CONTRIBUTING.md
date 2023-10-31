# 🤗 Contributing to Abell

## 🤓 Prerequisites

- [`node >= 16.x`](https://nodejs.org)
- [`pnpm`](https://pnpm.io/)

## 🏡 Setup Repository

- ### Step 1: Fork the Repository

You can click "fork" button in top right corner to create a copy of this repo in your account where changes can be made.
     
- ### Step 2: Clone the Repository

  ```sh
  git clone git@github.com:<your-username>/abell.git
  cd abell
  ```

- ### Step 3: Install Dependencies

  ```sh
  pnpm install
  ```

## 🏃🏽 Running Projects Locally

> **Note**
>
> All commands are supposed to be executed from the root of the monorepo.

The monorepo includes 3 packages and a playground directory where every example is treated as a monorepo package.

`docs` and all the `playground/**` examples use the local version from `abell` directory.

- ### `docs`

  ```sh
  pnpm docs:dev # dev server
  pnpm docs:generate # build
  ```

- ### `abell`

  #### Dev Server

  This will run `nodemon` command, watch over the changes in abell and rebuild the abell package for any change.

  ```sh
  pnpm abell
  ```


  You can then run any of the playground examples with `pnpm --filter <example-name> dev|generate`
  ```sh
  pnpm --filter basic dev # Runs dev-server of `playground/basic` example
  pnpm --filter basic generate # Runs build of `playground/basic` example
  ```

  > **Note**
  >
  > You will have to restart the dev-server of example when you make any change in `abell` package.


  #### Build

  ```sh
  pnpm abell:build
  ```

  #### Tests

  ```sh
  pnpm abell:test # To run on watch mode
  pnpm abell:test:once # To run test once
  ```

- ### `create-abell`

  ```sh
  pnpm create-abell
  ```

  This command creates abell project in `packages/create-abell/scaffold-dir/` (It will remove any older changes in that directory before creating new project)


## 🧪 Running All Tests

```sh
pnpm test:once # Runs all tests
```

---

Stuck somewhere? you can reach out to me on [Twitter @saurabhdawaree](https://twitter.com/saurabhdawaree) or ask for help in [our discord chat](https://discord.gg/ndsVpRG)

<a href="https://discord.gg/ndsVpRG"><img alt="Discord Join Chat" src="https://img.shields.io/badge/discord-join%20chat-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB&labelColor=225"/></a>
