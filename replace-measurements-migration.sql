-- Replace measurement_master source data
-- Run this in Supabase SQL Editor

DELETE FROM measurement_master;

INSERT INTO measurement_master (key, label, unit) VALUES
('height', 'Height', 'inches'),
('shoulder_to_shoulder', 'Shoulder to Shoulder', 'inches'),
('across_front_shoulder', 'Across Point (Front Shoulder)', 'inches'),
('across_back_shoulder', 'Across Point (Back Shoulder)', 'inches'),
('ready_shoulder', 'Ready Shoulder (Shoulder Strap)', 'inches'),
('upper_chest', 'Upper Chest', 'inches'),
('lower_chest', 'Lower Chest', 'inches'),
('waist', 'Waist', 'inches'),
('hip', 'Hip', 'inches'),
('seat', 'Seat', 'inches'),
('shoulder_to_apex', 'Shoulder to Apex', 'inches'),
('apex_to_under_bust', 'Apex to Under Bust (Front Length)', 'inches'),
('neck_front', 'Neck (Front)', 'inches'),
('neck_back', 'Neck (Back)', 'inches'),
('neck_collar_round', 'Neck (Collar Round)', 'inches'),
('sleeve_length', 'Sleeve Length', 'inches'),
('sleeve_circumference', 'Sleeve Circumference', 'inches'),
('bicep', 'Bicep', 'inches'),
('armhole', 'Armhole', 'inches'),
('bottom_length', 'Bottom Length (Skirt/Pant)', 'inches'),
('thigh_circumference', 'Thigh Circumference', 'inches'),
('ankle_circumference', 'Ankle Circumference', 'inches');