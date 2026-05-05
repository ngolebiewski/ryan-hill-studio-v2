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

-- pseudo migrations of schema below
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