# Beastmode 💪

A local-first productivity app for tracking goals, focus sessions, and daily habits. Built with React Native, Expo, and SQLite — all your data stays on your device.

## Features

- **Goal Tracking** — Create goals with custom icons and target hours. Track progress with visual bars and percentage badges.
- **Focus Sessions** — Start a timer, take notes, and log hours toward your goals. Persistent notification keeps you aware while a session is active.
- **Habit Tracking** — Add daily habits, check them off, and watch your streaks grow. Weekly completion chart included.
- **Daily Reminders** — Set per-goal daily reminders at a custom time. Global habit and session reminders available in Settings.
- **Charts** — 7-day session hours line chart and habit completion bar chart on the home screen.
- **Dark Mode** — System, Light, or Dark theme with persistent preference.
- **Haptic Feedback** — Subtle vibrations on habit check-off, session start/stop, and goal creation.
- **Session Completion Sound** — Audio chime when you finish a focus session.
- **Fully Offline** — SQLite database with Drizzle ORM. No account, no server, no internet required.

## Tech Stack

| Layer         | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Framework     | [Expo](https://expo.dev/) (SDK 55) + [Expo Router](https://docs.expo.dev/router/introduction/)              |
| Language      | TypeScript                                                                                                  |
| Database      | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) |
| Migrations    | [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)                                                   |
| UI            | React Native, [@expo/vector-icons](https://icons.expo.fyi/), react-native-chart-kit                         |
| Notifications | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)                              |
| Audio         | [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/)                                              |
| Haptics       | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)                                          |
| Storage       | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (preferences)                   |

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/tacheraSasi/beastmode.git
   cd beastmode
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Generate migrations** (if schema changed)

   ```bash
   bunx drizzle-kit generate
   ```

4. **Start the dev server**

   ```bash
   bun start
   ```

5. **Build a dev client** (needed once for native modules)

   ```bash
   bunx eas build -p android --profile development
   ```

## Project Structure

```
app/              Screen files (Expo Router file-based routing)
  (tabs)/         Bottom tab screens: Home, Sessions, Habits, Settings
components/       Reusable UI components (Charts, DateSelector, ScreenLayout, etc.)
constants/        Color palette and theme tokens
context/          React contexts (habits, theme)
db/               Schema, migrations client, and query functions
drizzle/          SQL migration files
utils/            Notification helpers
assets/           Fonts, images, icons, audio
```

## Build & Deploy

```bash
# Preview APK (internal)
make build-apk

# Production build + auto-submit
make build-submit
```

See the [Makefile](Makefile) for all available commands.

## License

MIT

## Author

**tacheraSasi** — [GitHub](https://github.com/tacheraSasi)
