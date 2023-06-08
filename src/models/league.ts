import { SiteName } from "../enums";
import db_client from "./db_client";

class League {
    static async firstLeague(site_name: SiteName, name: string) {
        await db_client.$connect();

        let league = await db_client.league.findFirst({
            where: {
                site_name,
                name,
            }
        });

        return league;
    }

    static async getLeaguesByNames(site_name: SiteName, names: Array<string>) {
        await db_client.$connect();

        let leagues = await db_client.league.findMany({
            where: {
                site_name,
                name: {
                    in: names
                },
            }
        });

        return leagues;
    }

    static async createLeague(site_name: SiteName, name: string) {
        await db_client.$connect();

        let league = await db_client.league.create({
            data: {
                site_name,
                name
            }
        });

        return league;
    }
}

export default League;