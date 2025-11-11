-- ADD SAN AGUSTIN MUNICIPALITY (19 barangays)

INSERT INTO public.barangays (name, municipality, island_group, is_active) VALUES
('Bautista', 'San Agustin', 'Luzon', true),
('Calaocan', 'San Agustin', 'Luzon', true),
('Dabubu Grande', 'San Agustin', 'Luzon', true),
('Dabubu Pequeño', 'San Agustin', 'Luzon', true),
('Dappig', 'San Agustin', 'Luzon', true),
('Laoag', 'San Agustin', 'Luzon', true),
('Mapalad', 'San Agustin', 'Luzon', true),
('Palacian', 'San Agustin', 'Luzon', true),
('Panang', 'San Agustin', 'Luzon', true),
('Quimalabasa Norte', 'San Agustin', 'Luzon', true),
('Quimalabasa Sur', 'San Agustin', 'Luzon', true),
('Rang-ay', 'San Agustin', 'Luzon', true),
('Salay', 'San Agustin', 'Luzon', true),
('San Antonio', 'San Agustin', 'Luzon', true),
('Santo Niño', 'San Agustin', 'Luzon', true),
('Santos', 'San Agustin', 'Luzon', true),
('Sinaoangan Norte', 'San Agustin', 'Luzon', true),
('Sinaoangan Sur', 'San Agustin', 'Luzon', true),
('Virgoneza', 'San Agustin', 'Luzon', true);

-- Verify
SELECT COUNT(*) as total_barangays FROM public.barangays;
-- Should now show 151 (132 + 19)
