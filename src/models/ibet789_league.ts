import db_client from "./db_client";

class iBet789League {
    static async firstLeague(name: string) {
        await db_client.$connect();

        let league = await db_client.iBet789League.findFirst({
            where: {
                name,
            }
        });

        return league;
    }

    static async getLeaguesByNames(names: Array<string>) {
        await db_client.$connect();

        let leagues = await db_client.iBet789League.findMany({
            where: {
                name: {
                    in: names
                },
            }
        });

        return leagues;
    }

    static async createLeague(name: string) {
        await db_client.$connect();

        let league = await db_client.iBet789League.create({
            data: {
                name
            }
        });

        return league;
    }
}

export default iBet789League;