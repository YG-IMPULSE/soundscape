-- Run this SQL command to make yourself an admin
-- Replace 'your@email.com' with your actual email address

UPDATE users 
SET isAdmin = 1 
WHERE email = 'your@email.com';

-- To verify it worked:
SELECT id, email, name, isAdmin FROM users WHERE isAdmin = 1;
