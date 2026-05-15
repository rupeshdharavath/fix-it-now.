import mongoose from "mongoose";

export const connectDb = async () => {
    const uri = process.env.MONGO_URI;
    const maxRetries = 5;
    let attempt = 0;

    const connectWithRetry = async () => {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
            });
        } catch (err) {
            attempt += 1;
            if (attempt > maxRetries) {
                console.error("Exceeded max connection attempts. Exiting.");
                process.exit(1);
            }
            const wait = Math.pow(2, attempt) * 1000;
            await new Promise((res) => setTimeout(res, wait));
            await connectWithRetry();
        }
    };

    await connectWithRetry();
};