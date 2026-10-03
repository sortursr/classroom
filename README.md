# Classroom

A small app for a Sunday classroom coordinator to manage the student roster, post
weekly notes/reminders, and run reader-of-the-week sign-ups.

- **Public (no login):** student names (no contact info), notes & reminders, and the
  reader-of-the-week schedule. Anyone can volunteer to read an open Sunday by picking
  their name from the roster.
- **Registered account:** everything public gets, plus managing your own reader
  sign-up (claim or cancel it). Registered users can never see another student's
  contact info.
- **Admin:** full roster management including contact info, posts/edits notes &
  reminders and sends them by email, and can override the reader schedule.

It's a static site (React + Vite) deployable to GitHub Pages, backed by Firebase
(Auth + Firestore) for accounts/data and EmailJS for sending mail — both free-tier
services with no server of your own to run. Privacy is enforced by Firestore
**security rules**, not just hidden in the UI: student contact info lives in a
separate collection that only the admin's account can read or write.

## One-time setup

### 1. Firebase project

1. Create a project at https://console.firebase.google.com.
2. **Build → Authentication → Sign-in method** → enable **Email/Password**.
3. **Build → Firestore Database** → create a database (production mode is fine).
4. **Project settings → General → Your apps** → add a Web app → copy the config
   values into `.env` (see `.env.example`) and into the matching GitHub Actions
   secrets (below).
5. **Firestore → Rules** → paste in the contents of `firestore.rules` from this repo
   and publish. (Or deploy with the Firebase CLI: `firebase deploy --only firestore:rules`.)
6. **Firestore → Data** → create a document at `config/admins` with a field
   `emails` (array) containing the coordinator's login email(s), e.g.
   `["you@example.com"]`. Register that email in the app, and it becomes admin.
   This step is manual and deliberate — the app itself cannot grant admin rights.

### 2. EmailJS (for the admin's "Send Email" button)

1. Create a free account at https://www.emailjs.com.
2. Add an **Email Service** (e.g. Gmail) and note its Service ID.
3. Create an **Email Template** with a "To Email" field bound to `{{to_email}}`,
   and use `{{to_name}}`, `{{subject}}`, `{{message}}` in the body/subject. Note the
   Template ID.
4. **Account → General** → copy your Public Key.

### 3. GitHub repo

1. **Settings → Pages** → set Source to **GitHub Actions**.
2. **Settings → Secrets and variables → Actions** → add these repository secrets:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
   `VITE_FIREBASE_APP_ID`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`,
   `VITE_EMAILJS_PUBLIC_KEY`.
3. Push to `main` — the included workflow (`.github/workflows/deploy.yml`) builds
   and deploys to Pages automatically.
4. If your repo isn't named `classroom`, update the `base` path in `vite.config.ts`
   to match (e.g. `/your-repo-name/`).

## Local development

```bash
npm install
cp .env.example .env   # fill in your Firebase + EmailJS values
npm run dev
```

## Data model

| Collection         | Read           | Write           | Contents                                  |
| ------------------- | -------------- | --------------- | ------------------------------------------ |
| `students`          | public         | admin only      | `name`, `active`                           |
| `studentContacts`   | admin only     | admin only      | `email`, `phone` (keyed by student id)     |
| `notes`             | public         | admin only      | `title`, `body`, `weekId`, `sentAt`        |
| `readerSchedule`    | public         | open create / admin update+delete | one doc per Sunday (`weekId`) |
| `config/admins`     | signed-in users| manual only      | `emails: string[]`                         |
