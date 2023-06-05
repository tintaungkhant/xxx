import db_client from "./db_client";

class iBet789_League {
    static async getAllScrappingLeagues(){
        await db_client.$connect();

        let leagues = await db_client.iBet789_League.findMany({
            where: {
                get_odd: true,
            },
            select: {
                name: true,
            }
        });

        return leagues;
    }

    static async firstLeague(name: string) {
        await db_client.$connect();

        let league = await db_client.iBet789_League.findFirst({
            where: {
                name,
            }
        });

        return league;
    }

    static async getLeaguesByNames(names: Array<string>) {
        await db_client.$connect();

        let leagues = await db_client.iBet789_League.findMany({
            where: {
                name: {
                    in: names
                },
            }
        });

        return leagues;
    }
}

export default iBet789_League;