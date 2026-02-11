const bcrypt = require('bcrypt');
const prisma = require('./src/config/db.js');

async function seed() {
    try {
        const adminExists = await prisma.user.findUnique({
            where: { email: 'admin@transcendence.com' }
        });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);

            await prisma.user.create({
                data: {
                    username: 'admin',
                    email: 'admin@transcendence.com',
                    password: hashedPassword,
                    role: 'admin'
                }
            });

            console.log('Admin account created!');
            console.log('   Username: admin');
            console.log('   Email: admin@transcendence.com');
            console.log('   Password: Admin123!');
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();