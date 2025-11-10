

async function seedBadges() {
    console.log('Badge seeding is now handled manually via MongoDB Compass.');
    console.log('Insert the badge documents directly into the badges collection.');
    process.exit(0);
}

if (require.main === module) {
    seedBadges();
}
