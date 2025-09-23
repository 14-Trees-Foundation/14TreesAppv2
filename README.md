This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

---

## Visitor Data Flow Overview (Project-specific)

This project includes a Visitor Data flow triggered from Visits. It captures:
- Sapling ID (required)
- User (optional; prefilled to current user when available, selectable)
- User Tree Image (optional)
- User Card Image (optional)

### Persistence
- Data is stored in `tree_images` using the existing DAO (`TreeImagesDao.upsertTreeImage`).
  - Types used: `user_tree_image` and `user_card_image`.
  - `user_id` is saved alongside each image record.
- Schema (as created on device in `src/services/db/tree_images.ts`) has:
  - `sapling_id TEXT NOT NULL`, `type`, `user_id INTEGER NULL`, flags, timestamps.
  - No foreign key from `tree_images.sapling_id` to `trees.sapling_id` (no hard referential integrity).
- Tree–user assignment for full tree records remains in `trees` via `assigned_to` (and related fields). Visitor-only flow does not create or modify rows in `trees`.

### Range-based Workflow
- Optional flow like Plots → Add Trees: preselect a sapling ID range, then tap chips to open the Visitor Data form prefilled with the sapling ID.

### Backend/Sync Note
- Since `tree_images` has no FK to `trees`, visitor-only images can exist without a corresponding tree record. Confirm backend accepts these and associates by `sapling_id` and/or `user_id`. If not, delay upload or create a lightweight tree when required.

### Full Plan
- See `docs/visitor_flow_changes.md` for detailed UX, DB, components, and implementation steps.
