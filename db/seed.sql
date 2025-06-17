-- Table catégories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nom TEXT UNIQUE NOT NULL,
  date_ajout TIMESTAMPTZ DEFAULT now()
);

-- Table produits
CREATE TABLE produits (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  categorie_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  prix NUMERIC NOT NULL CHECK (prix >= 0),
  image_url TEXT
);


-- On suppose que la catégorie ID 1 existe déjà ajoutons les categories de produits 
INSERT INTO categories (id, nom) VALUES
  (2, 'Papaye'),
  (3, 'Tomate'),
  (4, 'Oignon / Échalote'),
  (5, 'Piment fort'),
  (6, 'Pastèque'),
  (7, 'Maïs'),
  (8, 'Citrouille'),
  (9, 'Gourde amère'),
  (10, 'Œillet d’Inde'),
  (11, 'Maïs doux'),
  (12, 'Concombre'),
  (13, 'Okra'),
  (14, 'Aubergine'),
  (15, 'Oignon de printemps'),
  (16, 'Baselle'),
  (17, 'Carotte'),
  (18, 'Coriandre'),
  (19, 'Kangkong'),
  (20, 'Laitue'),
  (21, 'Haricot asperge'),
  (22, 'Haricot commun'),
  (23, 'Gourde cireuse'),
  (24, 'Gourde serpent'),
  (25, 'Gourde éponge'),
  (26, 'Gourde ridge'),
  (27, 'Gourde bouteille'),
  (28, 'Poivron doux'),
  (29, 'Kohlrabi'),
  (30, 'Pakchoy'),
  (31, 'Caisim'),
  (32, 'Kailaan'),
  (33, 'Chou chinois'),
  (34, 'Chou-fleur'),
  (35, 'Chou'),
  (36, 'Citrouille Mos'),
  (37, 'Melon');

/* insertion des produits */

-- les papayes 
INSERT INTO produits (nom, prix, description, categorie_id, image_url) VALUES
  (
    'Red Royale F1',
    55000,
    'Papayer nain à port vigoureux, très productif. Fruits ovales-cylindriques de 1,7–2,5 kg à chair rouge sucrée (Brix 10–12 %), modérément résistant au virus PRSV, maturité 7–8 mois, adapté consommation fraîche ou jus.',
    2,
    'https://snkldzuytinzfeczhpno.supabase.co/storage/v1/object/public/produits-images//red-royale-f1.jpg'
  ),
  (
    'Vega F1',
    50000,
    'Variété vigoureuse à fruits plus petits (1,0–1,5 kg) de couleur rouge vif. Chair ferme et sucrée (Brix 12–14 %), maturité 7–8 mois, productivité élevée, bonne uniformité, résistance modérée au PRSV.',
    2,
    'https://snkldzuytinzfeczhpno.supabase.co/storage/v1/object/public/produits-images//Vega_F1-removebg-preview-compressed.jpg'
  ),
  (
    'Maradona F1',
    50000,
    'Papayer à port vigoureux, fruits larges de 1,5–2,0 kg à peau verte et chair rouge sucrée (Brix 11–13 %). Chair ferme, très sucrée, bien adaptée aux tropiques, résistance moyenne au PRSV.',
    2,
    'https://snkldzuytinzfeczhpno.supabase.co/storage/v1/object/public/produits-images//Maradona%20F1.jpg'
  );
