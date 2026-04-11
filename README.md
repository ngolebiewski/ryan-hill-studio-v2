# RYAN HILL STUDIO v2 / Artist Portfolio
A high-performance, custom portfolio built with Nuxt 3 and Postgres, designed to replace a legacy WordPress setup with a modern, schema-driven architecture. No SquareSpace lockin. Hooray!

![Screenshot of website](/public/images/screenshot_v0.png)

# INSTALL for DEVELOPMENT
1. Clone Repo and npm install everything
2. Use Postgres 18 and create your database. i.e. `CREATE DATABASE ryan_hill_studio; `
3. Make .env file with:
    NUXT_DATABASE_URL=postgresql://<your_name>@localhost:5432/ryan_hill_studio
    JWT_SECRET=<some long secret>
4. Note: run with `netlify dev` to emulate BLOB storage locally. otherwise `npm run dev`


## Project Goals

    - Decoupled Content: Migrate away from WordPress for a more performant, tailored experience.

    - Dynamic CMS: Build a lightweight admin interface to manage CV, Bio, Statement, and Gallery content. Use Markdown, no WYSIWYG garbage.

    - Relational Assets: Organize work into "Series" and "Projects" with full descriptions and metadata.

    - Zero Cost: Utilize free-tier cloud hosting (Netlify) and serverless databases (Neon).

## Tech Stack

    - Framework: Nuxt 3 (Vue.js)

    - Database: PostgreSQL (Hosted on Neon.tech)

    - ORM/Query: Straight up SQL. Onlu add in Drizzle or Prisma if necessary in admin backend build.

    - Styling: Tailwind CSS

    - Auth: Simple session-based admin and argon or Nuxt Auth Utils

## Implementation Plan
### Phase 1: The Core (Prototype Today)

    [ ] Initialize Nuxt 3 project with Tailwind CSS.

    [ ] Connect local Postgres 18 instance (already running).

    [ ] Create the server/api folder for fetching artworks and series.

    [ ] Build a "Basic Gallery" page that pulls directly from the DB.

### Phase 2: The Studio Admin

    [ ] Implement a /admin route protected by a simple login.

    [ ] Build "Add Artwork" and "Add Series" forms using Nuxt Server Actions.

    [ ] Create the CV/Bio editor (storing content in a pages table). Use https://github.com/Ionaru/easy-markdown-editor

### Phase 3: Deployment

    [ ] Push DB to Neon.tech (Postgres Free Tier).

    [ ] Deploy Nuxt app to Vercel or Netlify.

### Data Model
1. Identity & Access (users)

Stores administrative credentials and global site configuration.

    Key Attributes: Unique email, hashed password, and an admin flag.

    Purpose: Restricts access to the /admin dashboard and defines the public-facing artist name.

2. Taxonomy (series)

A hierarchical structure for grouping artworks into collections, projects, or time periods.

    Key Attributes: Title, URL slug, and a parent-child relationship (parent_id).

    Purpose: Allows for nested galleries (e.g., "Paintings" > "2024 Landscapes"). Includes an order_index for custom manual sorting.

3. Inventory (artworks)

The core content of the application.

    Key Attributes: Title, unique slug, image reference (URL), physical dimensions, and description.

    Relationships: Each artwork is associated with a specific Series.

    Purpose: Tracks all visual pieces, their metadata, and their display order within a series.

4. Content Pages (pages)

A flexible model for non-gallery content like the CV, Bio, or Artist Statement.

    Key Attributes: Title, unique slug (e.g., bio), and Markdown-formatted content.

    Purpose: Decouples text-heavy pages from the site code, allowing the artist to update their statement or resume via the admin UI without code changes.

### System Architecture
Asset Management

Instead of storing binary images in the database or Git, assets are managed via Netlify Blobs.

    Workflow: The Admin UI uploads a file -> Netlify Blob stores the image -> The resulting URL is saved to the artworks table in PostgreSQL.

Content Delivery

    Dynamic Routes: Nuxt uses pages/series/[slug].vue to fetch and render artworks based on the database taxonomy.

    Server Utilities: A centralized server/utils/db.ts handles the connection pool to ensure efficient database handshakes in a serverless environment.


# DEV NOTES
start up Postgres:
`brew services start postgresql@18`

==> Caveats
==> postgresql@18
This formula has created a default database cluster with:
  initdb --locale=en_US.UTF-8 -E UTF-8 /opt/homebrew/var/postgresql@18

When uninstalling, some dead symlinks are left behind so you may want to run:
  brew cleanup --prune-prefix

postgresql@18 is keg-only, which means it was not symlinked into /opt/homebrew,
because this is an alternate version of another formula.

If you need to have postgresql@18 first in your PATH, run:
  echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc

For compilers to find postgresql@18 you may need to set:
  export LDFLAGS="-L/opt/homebrew/opt/postgresql@18/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/postgresql@18/include"

To start postgresql@18 now and restart at login:
  brew services start postgresql@18
Or, if you don't want/need a background service you can just run:
  LC_ALL="en_US.UTF-8" /opt/homebrew/opt/postgresql@18/bin/postgres -D /opt/homebrew/var/postgresql@18

brew services start postgresql@18

Connect to the default database using the full path:
bash

/opt/homebrew/opt/postgresql@18/bin/psql postgres



psql -d ryan_hill_studio -c "\dt"

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
