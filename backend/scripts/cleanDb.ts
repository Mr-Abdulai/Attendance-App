import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting database cleanup...');

    // Delete in order to avoid foreign key constraints

    // 1. Delete Attendance (references User and Session)
    const deletedAttendance = await prisma.attendance.deleteMany({});
    console.log(`Deleted ${deletedAttendance.count} attendance records.`);

    // 2. Delete Sessions (references User and Course)
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions.`);

    // 3. Delete Courses (references User)
    const deletedCourses = await prisma.course.deleteMany({});
    console.log(`Deleted ${deletedCourses.count} courses.`);

    // 4. Delete Users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users.`);

    console.log('✅ Database squeaky clean!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
