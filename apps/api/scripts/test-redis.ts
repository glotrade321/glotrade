import dotenv from "dotenv";
import Redis from "ioredis";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testRedis() {
    console.log("🔍 Starting Redis Connection Test...");

    const isEnabled = process.env.REDIS_ENABLED === "true";
    const redisUrl = process.env.REDIS_URL;

    console.log(`📡 REDIS_ENABLED: ${isEnabled}`);
    console.log(`🔗 REDIS_URL: ${redisUrl ? (redisUrl.includes("@") ? "REDACTED" : redisUrl) : "MISSING"}`);

    if (!isEnabled) {
        console.error("❌ Redis is disabled in .env (REDIS_ENABLED=false). Please set it to true to test.");
        process.exit(1);
    }

    if (!redisUrl) {
        console.error("❌ REDIS_URL is missing in .env.");
        process.exit(1);
    }

    let client: Redis | null = null;

    try {
        console.log("⏳ Connecting to Redis...");
        client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            connectTimeout: 10000, // 10 seconds
        });

        // 1. PING Test
        console.log("📡 Sending PING...");
        const pingResponse = await client.ping();
        console.log(`✅ Redis PING response: ${pingResponse}`);

        // 2. SET/GET Test
        const testKey = `test_key_${Date.now()}`;
        const testValue = "Glotrade Redis Test successful!";

        console.log(`📝 Testing SET: ${testKey} = "${testValue}"`);
        await client.set(testKey, testValue, "EX", 60); // Expire in 60s

        console.log(`📖 Testing GET: ${testKey}`);
        const retrievedValue = await client.get(testKey);

        if (retrievedValue === testValue) {
            console.log(`✅ Redis SET/GET successful! Value matched.`);
        } else {
            console.error(`❌ Redis GET failed. Expected "${testValue}", got "${retrievedValue}"`);
        }

        // 3. DEL Test
        console.log(`🗑️ Testing DEL: ${testKey}`);
        await client.del(testKey);
        const deletedValue = await client.get(testKey);

        if (!deletedValue) {
            console.log("✅ Redis DEL successful!");
        } else {
            console.error("❌ Redis DEL failed. Key still exists.");
        }

        console.log("\n✨ ===========================================");
        console.log("🚀 Redis connection test completed successfully!");
        console.log("✨ ===========================================\n");

    } catch (error: any) {
        console.error("\n❌ ===========================================");
        console.error("❌ Redis connection test FAILED!");
        console.error(`❌ Error Name: ${error.name}`);
        console.error(`❌ Error Message: ${error.message}`);

        if (error.message.includes("ECONNREFUSED")) {
            console.error("💡 Tip: Check if your local Redis server is running or if the Upstash URL is correct.");
        } else if (error.message.includes("ENOTFOUND")) {
            console.error("💡 Tip: Could not resolve the host. Check your internet connection or the REDIS_URL hostname.");
        }

        console.error("❌ ===========================================\n");
    } finally {
        if (client) {
            console.log("🔌 Closing Redis connection...");
            await client.quit();
        }
    }
}

testRedis();
