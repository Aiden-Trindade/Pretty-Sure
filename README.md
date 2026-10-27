# Pretty Sure

"Pretty sure" isn't a number. This app turns it into one and then holds you to it.

## Run it

```bash
npm install
npm run dev
```

## Connect Supabase

1. Create a free project at https://supabase.com
2. Copy `.env.example` to `.env`
3. Paste in the Project URL and anon key from **Project Settings > API**
4. Restart `npm run dev`

Use it anywhere with `import { supabase } from './lib/supabase'`.

## Structure

```
src/
  main.jsx         app entry, router setup
  App.jsx          routes
  lib/supabase.js  Supabase client
  components/      shared UI (Navbar, ...)
  pages/           one file per route
```

## Deploy

Push to GitHub, import the repo on https://vercel.com, and add the two `VITE_SUPABASE_*` env vars in the Vercel project settings.
