# ConnectED

An all-in-one school social platform built for students — connecting classmates through a shared feed, direct messages, study tools, and school resources.

---

## Features

| Feature | Description |
|---|---|
| **Feed** | School-wide post feed with likes, comments, and optimistic updates |
| **Chats** | Real-time direct messaging powered by Supabase Realtime |
| **Study Buddy** | Match with classmates by study style and subject overlap |
| **Notes Hub** | Upload and download PDF/DOCX study notes by subject |
| **Peer Tutors** | Browse student tutors, view ratings, and book sessions |
| **Events** | School event calendar with registration and reminders |
| **Lost & Found** | Report and search for lost items with optional photo upload |
| **Suggestions** | Anonymous feedback box — no identity stored |
| **Academic Updates** | Official school notices (timetable, results, facilities) |
| **Groups** | Create study/project groups with a private discussion feed |
| **Interest Groups** | Join pre-seeded groups by subject or hobby |
| **Profile** | Personal profile with posts, notes, avatar upload, and stats |

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) — App Router, Server Components, Route Handlers
- **Database / Auth / Storage**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Server state**: [TanStack Query v5](https://tanstack.com/query)
- **Client state**: [Zustand v5](https://zustand-demo.pmnd.rs/)
- **Forms**: [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript (strict)

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-org/connected.git
cd connected
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from **Supabase → Project Settings → API**.

### 4. Push the database schema

```bash
npx supabase db push
```

Or paste the contents of `supabase/migrations/` into the Supabase **SQL Editor**.

### 5. Run additional migrations

```sql
-- Add group type field
ALTER TABLE groups ADD COLUMN type text
  CHECK (type IN ('Study group', 'Project group', 'General'));

-- Add group_id to posts for group discussion feeds
ALTER TABLE posts ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE CASCADE;

-- Seed interest groups
INSERT INTO groups (name, description, is_interest_group, member_count) VALUES
  ('Science',     'Explore science topics together',       true, 0),
  ('Literature',  'Books, poetry, and writing',            true, 0),
  ('Mathematics', 'Problem solving and maths discussion',  true, 0),
  ('Music',       'Share your passion for music',          true, 0),
  ('Sports',      'Stay active and talk sport',            true, 0),
  ('Technology',  'Tech news, coding, and more',           true, 0),
  ('Arts',        'Creative arts and design',              true, 0);
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

### Storage buckets

Create the following **public** buckets in **Supabase → Storage**:

| Bucket | Used for |
|---|---|
| `avatars` | User profile photos |
| `notes` | Uploaded PDF/DOCX study files |
| `lost-items` | Lost & found item images |

### Enable Realtime

In **Supabase → Database → Replication**, enable Realtime for the `messages` table to power live chat.

### Row Level Security

RLS policies should be enabled on all tables. Key rules:
- `profiles` — users can read all, update only their own
- `posts` — users can read all, insert/delete only their own
- `messages` — users can only read messages where they are sender or receiver
- `suggestions` — insert permitted for `anon` role (no auth required); no reads
- `group_members` — members can read their own rows; admin can manage

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel login
vercel          # first deploy — follow prompts
vercel --prod   # subsequent deploys
```

Add these environment variables in **Vercel → Project → Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

### CI/CD via GitHub Actions

The `.github/workflows/deploy.yml` workflow runs on every push to `main`:

1. Type-checks with `tsc --noEmit`
2. Builds with `next build`
3. Deploys to Vercel via `vercel deploy --prod`

Add these secrets to **GitHub → Repository → Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after first deploy |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after first deploy |

---

## Folder Structure

```
connected/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── layout.tsx            # Topbar + Sidebar + BottomNav + Toast
│   │   ├── error.tsx             # App-level error boundary
│   │   ├── feed/
│   │   ├── chats/
│   │   ├── notes/
│   │   ├── tutors/
│   │   ├── events/
│   │   ├── lost-found/
│   │   ├── suggestions/
│   │   ├── academic/
│   │   ├── study-buddy/
│   │   ├── profile/
│   │   ├── student-info/
│   │   ├── groups/
│   │   │   └── [id]/             # Group detail
│   │   └── interest-groups/
│   ├── api/                      # Route handlers
│   │   ├── posts/
│   │   ├── messages/
│   │   ├── notes/
│   │   ├── tutors/
│   │   ├── groups/
│   │   │   └── [id]/
│   │   │       ├── members/
│   │   │       └── posts/
│   │   ├── lost-items/
│   │   └── suggestions/
│   ├── auth/                     # Supabase auth callback
│   ├── login/
│   ├── error.tsx                 # Root error boundary
│   └── layout.tsx                # Root layout + QueryProvider
├── components/
│   ├── features/                 # Feature-scoped components
│   │   ├── chat/
│   │   ├── feed/
│   │   ├── groups/
│   │   ├── notes/
│   │   ├── tutors/
│   │   ├── events/
│   │   └── studybuddy/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Desktop nav (hidden on mobile)
│   │   ├── Topbar.tsx            # Top header bar
│   │   └── BottomNav.tsx         # Mobile bottom tabs + More drawer
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── ui/                       # Shared primitives
│       ├── Avatar.tsx
│       ├── Button.tsx
│       ├── EmptyState.tsx        # Reusable empty state
│       ├── Skeletons.tsx         # Loading skeleton variants
│       └── ToastProvider.tsx     # Global toast notifications
├── lib/
│   ├── hooks/                    # Custom React hooks
│   ├── stores/
│   │   └── toastStore.ts         # Zustand toast store
│   ├── supabase/                 # Supabase clients
│   └── utils/
├── types/
│   ├── database.types.ts         # Supabase-generated + extended types
│   ├── feed.ts
│   ├── chat.ts
│   └── notes.ts
├── styles/
│   └── globals.css
├── .github/workflows/
│   └── deploy.yml                # CI/CD pipeline
├── vercel.json
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow existing patterns — Server Components for data fetching, Client Components only where interactivity is needed
4. Type-check before pushing: `npx tsc --noEmit`
5. Open a pull request against `main` with a clear description of what changed and why

One feature or fix per PR keeps reviews fast and history clean.
