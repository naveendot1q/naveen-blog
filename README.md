# Naveen Meel — Portfolio & Blog

A minimalist, dark-mode-first portfolio and blog site built with Next.js 14, Supabase, and Tailwind CSS.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS variables (dark/light theme)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Fonts**: Sora (headings/body) + IBM Plex Mono (terminal/code elements)
- **Markdown**: react-markdown + remark-gfm
- **Deployment**: Vercel (Mumbai region)

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase-migration.sql`
3. Go to **Settings > API** and copy your Project URL and anon key

### 3. Configure environment variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_ADMIN_EMAIL=naveenmeel10@gmail.com
```

### 4. Create admin user in Supabase

1. Go to **Authentication > Users** in the Supabase dashboard
2. Click **Invite user** or **Add user**
3. Enter your email (`naveenmeel10@gmail.com`) and set a password
4. Confirm the user

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Deployment on Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/naveendot1q/portfolio
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repo
3. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
4. Click **Deploy**

### 3. Add resume PDF

Add your resume as `public/Naveen_Resume.pdf` — the download button in the contact section links to this file.

---

## File Structure

```
├── app/
│   ├── page.tsx              # Homepage (all sections)
│   ├── layout.tsx            # Root layout + metadata
│   ├── globals.css           # Global styles + theme variables
│   ├── not-found.tsx         # 404 page
│   ├── blog/
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/page.tsx   # Blog post detail
│   ├── admin/
│   │   ├── page.tsx          # Admin dashboard (server, auth guard)
│   │   └── AdminClient.tsx   # Blog post editor (client)
│   └── auth/
│       ├── login/page.tsx    # Login form
│       └── callback/route.ts # Auth callback
├── components/
│   ├── ThemeProvider.tsx     # Dark/light mode context
│   ├── Navbar.tsx            # Navigation + theme toggle
│   ├── Hero.tsx              # Hero section with typewriter
│   ├── About.tsx             # About section
│   ├── Skills.tsx            # Technical skills grid
│   ├── Experience.tsx        # Work history timeline
│   ├── BlogPreview.tsx       # Latest posts on homepage
│   ├── Contact.tsx           # Contact info section
│   ├── MarkdownRenderer.tsx  # Client-side markdown renderer
│   └── Footer.tsx            # Footer
├── lib/supabase/
│   ├── client.ts             # Browser client
│   └── server.ts             # Server client
├── public/
│   ├── favicon.ico           # Circular favicon (your photo)
│   ├── avatar.png            # Circular avatar
│   └── Naveen_Resume.pdf     # Your resume (add this!)
└── supabase-migration.sql    # Database setup SQL
```

---

## Admin / Blog

- Visit `/auth/login` to log in
- Visit `/admin` to manage posts (create, edit, publish, delete)
- Posts are written in **Markdown**
- Only the admin email (`naveenmeel10@gmail.com`) can access the admin panel

---

## Customization

- **Colors**: Edit CSS variables in `app/globals.css` under `:root` (light) and `.dark`
- **Skills**: Edit `components/Skills.tsx`
- **Experience**: Edit `components/Experience.tsx`
- **Contact info**: Edit `components/Contact.tsx`

---

## Theme

- Default: **Dark mode** (obsidian background + sky blue accent)
- Toggle: Top-right sun/moon icon switches to light mode
- Preference is saved to localStorage
