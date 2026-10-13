import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    console.log('[Database] No DATABASE_URL provided. Running without database connection.');
    return;
  }
  try {
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn('[Database] MongoDB Connection Warning (continuing without DB):', error);
  }
};
