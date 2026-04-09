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

# SEED

INSERT INTO series (title, slug)
VALUES ('Paintings', 'paintings');

INSERT INTO artworks (title, slug, image_url, series_id)
VALUES
('Abyss', 'abyss', '/images/abyss.png', 1),
('ING', 'ing', '/images/ing.png', 1);