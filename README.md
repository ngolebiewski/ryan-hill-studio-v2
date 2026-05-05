# RYAN HILL STUDIO v2 / Artist Portfolio
A custom portfolio built with Nuxt 3 and Postgres, designed to replace a legacy WordPress setup with a modern, schema-driven architecture and a minimal admin interface. No SquareSpace lockin. Hooray!

![Screenshot of website](/public/images/screenshot_v0.png)
![Screenshot of admin tools](/public/images/admin-screenshot.jpg)

# INSTALL for DEVELOPMENT
1. Clone Repo and npm install everything
2. Use Postgres 18 and create your database.
    - `CREATE DATABASE ryan_hill_studio; `
    - Copy and paste or run `db/schema.sql` to create the tables and partly seed the db.
3. Make .env file with:
    NUXT_DATABASE_URL=postgresql://<your_name>@localhost:5432/ryan_hill_studio
    JWT_SECRET=<some long secret>
4. Note: run with `netlify dev` to emulate BLOB storage locally. otherwise `npm run dev`


## Project Goals

    - Decoupled Content: Migrate away from WordPress for a succinct, non-bloated json experience.

    - Dynamic CMS: Build a lightweight admin interface to manage CV, Bio, Statement, and Gallery content. Use Markdown, no WYSIWYG HTML garbage.

    - Relational Assets: Organize work into "Series" (can be nested once) with full descriptions and metadata.

    - Zero Cost: Utilize free-tier cloud hosting (Netlify) and serverless databases (Neon). Except for developer time of course.

## Tech Stack

    - Framework: Nuxt 3 (Vue.js)

    - Database: PostgreSQL on Neon

    - ORM/Query: Straight up SQL. Only add in Prisma, or Drizzle, if necessary in admin backend build. Update: not needed.

    - Styling: Tailwind CSS and BFA skills

    - Auth: Streamlined session-based admin and argon for hashing. Argon since high memory cost not an issue for one user. No need for OAuth complexity for same reason,

## Implementation Plan
### Phase 1: The Core (Prototype Today)

    [ ] Initialize Nuxt 3 project with Tailwind CSS.

    [ ] Connect local Postgres 18 instance (already running).

    [ ] Create the server/api folder for fetching artworks and series.

    [ ] Build a "Basic Gallery" page that pulls directly from the DB.

### Phase 2: The Studio Admin

    [ ] Implement a /admin route protected by a single login.

    [ ] Build "Add Artwork" and "Add Series" forms.

    [ ] Create the CV/Bio editor (storing content in a pages table). Use https://github.com/Ionaru/easy-markdown-editor for Markdown editor component.

### Phase 3: Deployment

    [ ] Push DB to Neon.tech (Postgres Free Tier).

    [ ] Deploy Nuxt app to Netlify.

    [ ] When completed, point DNS from exisiting Wordpress site hosted on a legacy host to current site that lives on Netlify.

### Data Model
[![](https://mermaid.ink/img/pako:eNp9kGFLwzAQhv9KOBgobLNdu3bpB2HUMURFaRXBVSS2WVvWJiVJ2ebYfzdtmTon3qdc7n3ee7kdxDyh4MGy4Os4I0Kh2yBiEUO6ZP2eClJlaFqr7M3nTNGN6kZNPYWzIFzUkgr52v1Slpywc1IUVGxPcU1fz8KFxnN6MGhqGjw-3wc34UKHWXOx-s_cvwtPjR-mc-1bkZT-gfZ6yOeCooSXJGdI0IKonDOZ5VUn6GKhweDyK8lPVnApB3G38oiW6IxXTUMKdIG0IqaVqklx3rHtsX65Hv-3saEPqcgT8JSoaR9KKnRM3cKukUegMlrSCDz9TIhYRRCxvWYqwl44Lw-Y4HWagbckhdRdXSVE0auc6Jt9S_RNqPB5zRR4E6e1AG8HG_BGtjPEIzwybdt1xxY29HSrRebQshxjbGLbwKaL3X0fPtqlxtBxLNOw9MB18cTCk_0nBmK4ew?type=png)](https://mermaid.ai/live/edit#pako:eNp9kGFLwzAQhv9KOBgobLNdu3bpB2HUMURFaRXBVSS2WVvWJiVJ2ebYfzdtmTon3qdc7n3ee7kdxDyh4MGy4Os4I0Kh2yBiEUO6ZP2eClJlaFqr7M3nTNGN6kZNPYWzIFzUkgr52v1Slpywc1IUVGxPcU1fz8KFxnN6MGhqGjw-3wc34UKHWXOx-s_cvwtPjR-mc-1bkZT-gfZ6yOeCooSXJGdI0IKonDOZ5VUn6GKhweDyK8lPVnApB3G38oiW6IxXTUMKdIG0IqaVqklx3rHtsX65Hv-3saEPqcgT8JSoaR9KKnRM3cKukUegMlrSCDz9TIhYRRCxvWYqwl44Lw-Y4HWagbckhdRdXSVE0auc6Jt9S_RNqPB5zRR4E6e1AG8HG_BGtjPEIzwybdt1xxY29HSrRebQshxjbGLbwKaL3X0fPtqlxtBxLNOw9MB18cTCk_0nBmK4ew)

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

    Video flag and video URL for embedding YouTube content.

4. Content Pages (pages)

A flexible model for non-gallery content like the CV, Bio, or Artist Statement.

    Key Attributes: Title, unique slug (e.g., bio), and Markdown-formatted content.

    Purpose: Decouples text-heavy pages from the site code, allowing the artist to update their statement or resume via the admin UI without code changes.

### Schema ERD

[![](https://mermaid.ink/img/pako:eNqtU01r3DAQ_StGkNtm8ed641tIQyk9tGxaCsFgptbEHmpJRpKbTTb73yt7u5uuMCSH6qR50sy8Nx87ViuOrGCoPxA0GkQpSxm48_3udnMX7A7GeEjagPirbXFrAxRAnYf1YMyj0rxqwbSvbz-V6hBkQKYCLkh6XqAtGVtJEHh42R-ZOCKfbt-mYsl26GGmGxoP4mhqTb0lJc8D9qBR2urfuCPshKCuSHLceryuN99-fNl8_m_MSECD1aC79zA-BKFnPM9tUBOat0VMIUigsSD6oNYIFnkF1m9KZ6vx4sECOQ1itrW_iaPyvk_YubCR1BOC9kr69frjOzo9U7u5EtdK2rGjAvQvrh7lnPKh52fKT0wuLoINdjAW3bTUG28YX14uL9XuaBXH4alb6vjcx9OsFBMtIGnYgjWaOCusHnDBBGq3S85kk_yS2RbdKrDCXblTULJS7p1PD_JeKXF002poWlY8QGecdZDzd5NPqKPm2n-jBmlZkeTxFIQVO7ZlRRxGy3R1laVJmuVhEsXZgj2xIorjZZ6G2SpOk_XVKl2n-wV7nvKGyzzPsiheJesoXefhKt7_Adl8R-I?type=png)](https://mermaid.ai/live/edit#pako:eNqtU01r3DAQ_StGkNtm8ed641tIQyk9tGxaCsFgptbEHmpJRpKbTTb73yt7u5uuMCSH6qR50sy8Nx87ViuOrGCoPxA0GkQpSxm48_3udnMX7A7GeEjagPirbXFrAxRAnYf1YMyj0rxqwbSvbz-V6hBkQKYCLkh6XqAtGVtJEHh42R-ZOCKfbt-mYsl26GGmGxoP4mhqTb0lJc8D9qBR2urfuCPshKCuSHLceryuN99-fNl8_m_MSECD1aC79zA-BKFnPM9tUBOat0VMIUigsSD6oNYIFnkF1m9KZ6vx4sECOQ1itrW_iaPyvk_YubCR1BOC9kr69frjOzo9U7u5EtdK2rGjAvQvrh7lnPKh52fKT0wuLoINdjAW3bTUG28YX14uL9XuaBXH4alb6vjcx9OsFBMtIGnYgjWaOCusHnDBBGq3S85kk_yS2RbdKrDCXblTULJS7p1PD_JeKXF002poWlY8QGecdZDzd5NPqKPm2n-jBmlZkeTxFIQVO7ZlRRxGy3R1laVJmuVhEsXZgj2xIorjZZ6G2SpOk_XVKl2n-wV7nvKGyzzPsiheJesoXefhKt7_Adl8R-I)

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
