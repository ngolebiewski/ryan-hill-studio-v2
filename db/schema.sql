CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT,
  password_hash TEXT,
  is_admin BOOLEAN DEFAULT true,
  artist_name TEXT
);

CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES series(id),
  order_index INTEGER DEFAULT 0
);

CREATE TABLE artworks (
  id SERIAL PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  image_url TEXT,
  description TEXT,
  size TEXT,
  series_id INTEGER REFERENCES series(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  content_markdown TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- server/utils/db.ts 
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS alt_text TEXT,
ADD COLUMN IF NOT EXISTS medium TEXT;

-- Ensure series_id is nullable (in case an artwork isn't in a series)
ALTER TABLE artworks ALTER COLUMN series_id DROP NOT NULL;

--Additions 4/23/26 Add in Year and Video options to schema

-- 1. Add the new functional columns
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- 2. Clean up: Ensure video_url is null by default for existing images
-- and ensure the year column is accessible for all rows.
COMMENT ON COLUMN artworks.video_url IS 'Stores YouTube/IG embed links or paths to local/blob MP4 files';
COMMENT ON COLUMN artworks.is_video IS 'Flag to trigger the video player UI instead of the img tag';


--SEED

INSERT INTO series (title, slug)
VALUES ('Paintings', 'paintings');

INSERT INTO artworks (title, slug, image_url, series_id)
VALUES
('Abyss', 'abyss', '/images/abyss.png', 1),
('ING', 'ing', '/images/ing.png', 1);


INSERT INTO pages (slug, title, content_markdown) 
VALUES (
  'about', 
  'About', 
  '**Bio** Born and raised in Los Angeles, Ryan received a B.A. in art and history from UC Santa Cruz, a M.A. in film and television from UCLA, and a M.F.A from California Institute of the Arts. As a solo artist he focuses primarily on drawing series, site-specific installation and performances. His past drawing installations and video projections have been show nationally with some work traveling internationally as part of group shows.

  ![Ryan Hill Studio Portrait](/images/studio-portrait.jpg)

  **Artist Statement** Making art has always been a part of my life. When I first drew it was like a treasure chest of valued secrets. Once drawing from objects, I started discovering line, shape, form, rendering the presence of things in the world. Now, in my studio work, I use drawing to make my own world, to investigate and understand, and break my own rules to hopefully surprise myself. 
  
  I am attracted to rendering where our perceptions of the real intersect with our intuition; where fact is in tension with fiction, and science and magic melt together.
  
  My classes are group processes where we focus on one thing together, letting go of the days busyness, and settling aside time and intention, to better invest in each other’s growth and bond through the shared experience of making things.'
);

INSERT INTO pages (slug, title, content_markdown) 
VALUES (
  'contact', 
  'Contact', 
  'Ryan Hill

  For inquiries and updates, please follow on Instagram:
  
  [@ryanhillstudios](https://instagram.com/ryanhillstudios)'
);

-- Make up a child series here and drop an art work in
INSERT INTO series (title, slug, parent_id, order_index)
VALUES (
  'Portraits', 
  'portraits', 
  (SELECT id FROM series WHERE title = 'Paintings' LIMIT 1),
  10
);

INSERT INTO artworks (title, slug, image_url, series_id, order_index)
VALUES (
  'Selfie', 
  'selfie', 
  '/images/studio-portrait.jpg', 
  (SELECT id FROM series WHERE slug = 'portraits' LIMIT 1),
  1
);

-- seed a video into artworks
INSERT INTO artworks (
  title, 
  slug, 
  image_url, 
  video_url, 
  is_video, 
  year, 
  series_id, 
  order_index
)
VALUES (
  'Doodle with Me - 3 (Special Guest Kev Nemelka)', 
  'doodle-with-me-3', 
  'https://i.ytimg.com/vi/Fm5F1-V5YMY/maxresdefault.jpg', 
  'https://www.youtube.com/watch?v=Fm5F1-V5YMY', 
  true, 
  2020, 
  (SELECT id FROM series WHERE title = 'Paintings' LIMIT 1),
  11
);

UPDATE artworks 
SET image_url = 'https://i.ytimg.com/vi/Fm5F1-V5YMY/hqdefault.jpg' 
WHERE slug = 'doodle-with-me-3';