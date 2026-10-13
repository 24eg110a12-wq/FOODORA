import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/foodora_db';
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[Database] MongoDB Connection Failed:', error);
    process.exit(1);
  }
};
