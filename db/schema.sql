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

ALTER TABLE artworks ADD COLUMN alt_text TEXT;
ALTER TABLE artworks ADD COLUMN medium TEXT;

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