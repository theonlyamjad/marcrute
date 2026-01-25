-- Update existing "Admin" roles to "Administrateur"
UPDATE utilisateurs SET role = 'Administrateur' WHERE role = 'Admin';