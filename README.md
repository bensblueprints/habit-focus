# Habit Focus - ADHD Productivity Chrome Extension

An ADHD-focused habit tracking and productivity app with badges, notifications, and streaks, packaged as a Chrome extension.

## Features

- **Habit Tracking**: Track daily habits with streaks and completion tracking
- **Badge System**: Earn badges for consistency, habit streaks, and app usage
- **Focus Timer**: Pomodoro-style focus sessions
- **Notifications**: Get alerts for achievements and reminders
- **Dark Mode**: Full dark mode support
- **Calendar Integration**: Sync with Google Calendar (requires setup)
- **Free Trial**: 7-day free trial with registration option

## Setup GitHub Repository

1. Create a new GitHub repository
2. Push the code to your repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/habit-focus.git
git push -u origin main
```

3. Clone the repository to continue development:

```bash
git clone https://github.com/yourusername/habit-focus.git
cd habit-focus
```

## Development

1. Install dependencies:

```bash
npm install
```

2. Generate icons:

```bash
node create-icons.js
```

3. Convert SVG icons to PNG:
   - You can use online tools or Imagemagick
   - Make sure to create icons in these sizes: 16x16, 48x48, 128x128
   - Save them as `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`

4. Run development server:

```bash
npm run dev
```

## Building Chrome Extension

1. Build the extension:

```bash
npm run build
```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist` folder

## Publishing to Chrome Web Store

1. Compress the `dist` folder into a ZIP file
2. Create a developer account at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay the one-time $5 developer fee if you haven't already
4. Create a new item and upload your ZIP file
5. Fill in the required information:
   - Description
   - Screenshots
   - Store icon
   - Category (Productivity)
   - Set pricing (Free with in-app payments)
6. Submit for review

## Trial System

The extension includes a 7-day free trial system:

- When a user installs the extension, they get 7 days of full access
- A countdown banner shows days remaining
- When the trial ends, users must register to continue using the app
- All user data is preserved during and after the trial

## License

MIT

## Credits

This application was developed to help people with ADHD manage their tasks, habits, and productivity.