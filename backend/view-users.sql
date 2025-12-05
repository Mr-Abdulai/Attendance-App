-- View all users in the database
SELECT 
    id,
    email,
    name,
    role,
    "createdAt",
    "updatedAt"
FROM users
ORDER BY "createdAt" DESC;

-- View users count by role
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role;

-- View specific user details
-- SELECT * FROM users WHERE email = 'student@test.com';


