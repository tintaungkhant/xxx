import { createClient } from "redis";

const client = createClient();

class Cache {
    async set(key: string, value: object) {
        await client.connect();

        let data = await client.set(key, JSON.stringify(value));

        await client.disconnect();

        return data;
    }

    async get(key: string) {
        await client.connect();

        let value = await client.get(key);

        let data = JSON.parse(value ? value : "{}");

        await client.disconnect();

        return data;
    }
}

export default Cache;