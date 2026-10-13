import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async () => {
  let mongoUri = process.env.DATABASE_URL;

  if (!mongoUri) {
    console.log('[Database] No external DATABASE_URL provided. Starting embedded in-memory MongoDB...');
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully to ${mongoose.connection.host}`);

    // If using in-memory database, seed demo restaurants, food items & accounts
    if (mongod) {
      console.log('[Database] Seeding embedded database with demo data...');
      const { seedDatabase } = await import('../scripts/seed.js');
      await seedDatabase();
      console.log('[Database] Embedded database seeded and ready!');
    }
  } catch (error) {
    console.error('[Database] MongoDB Connection Error:', error);
  }
};
