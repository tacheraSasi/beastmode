# expo-sqlite-drizzle

## Overview

This project is a simple local-first habit tracking example app built with Expo, Expo SQLite, Drizzle, and Drizzle Kit. The app allows users to track their habits efficiently and effectively, ensuring that they can monitor their progress over time without relying on a constant internet connection.

For a detailed guide on building this local-first app, check out the accompanying [Building local-first apps with Expo SQLite and Drizzle](https://israataha.com/blog/build-local-first-app-with-expo-sqlite-and-drizzle) blog post.

## The Tech Stack

#### Expo and Expo Router

[Expo](https://expo.dev/) is a powerful framework for building cross-platform React Native applications. It simplifies the development process and provides a rich set of tools and libraries.

#### Expo SQLite

[Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) is a library that allows you to access a SQLite database, enabling you to store data locally on the device. This is crucial for local-first applications, as it ensures that users can access their data anytime.

#### Drizzle

[Drizzle](https://orm.drizzle.team/docs/overview) is a TypeScript ORM for SQL databases that simplifies database interactions. It provides a clean and intuitive API for querying and manipulating data.

#### Drizzle Kit

[Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) is a CLI tool for managing database migrations, making it easier to evolve your database schema over time.

## Features

- **Local-First**: The app stores data locally on the device using SQLite, ensuring that users can access their habit data anytime, anywhere.
- **Habit Tracking**: Users can easily add, edit, and delete habits, as well as mark them as completed.
- **Data Management**: Utilizes Drizzle and Drizzle Kit for data access.

## Installation

To get started:

1. Clone the repository:

   ```bash
   git clone https://github.com/israataha/expo-sqlite-drizzle.git
   ```

2. Navigate to the project directory:

   ```bash
   cd expo-sqlite-drizzle
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npx expo start
   ```

5. Run on emulator or physical device

## Usage

Once the app is running, you can:

- Create or Delete habits from the **Settings** tab.
- Mark habits as completed from the **Habits** tab.
# beastmode
