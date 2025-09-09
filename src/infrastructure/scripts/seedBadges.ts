

import { connectDB } from '../db/mongoConnection';
import { MongoBadgeRepository } from '../db/MongoBadgeRepository';

async function seedBadges() {
    try {
        await connectDB();
        
        const badgeRepository = new MongoBadgeRepository();
        await badgeRepository.seedBadges();
        
        console.log('✅ Badges seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding badges:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seedBadges();
}
