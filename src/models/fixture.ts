import { SiteName } from "../enums";
import db_client from "./db_client";

class Fixture {
    static async firstFixtureBySiteFixtureId(site_name: SiteName, site_fixture_id: string) {
        await db_client.$connect();

        let fixture = await db_client.fixture.findFirst({
            where: {
                site_name,
                site_fixture_id
            }
        });

        return fixture;
    }

    static async createFixture(site_name: SiteName, league_id: number, site_fixture_id: string, home_team_id: number, away_team_id: number) {
        await db_client.$connect();

        let fixture = await db_client.fixture.create({
            data: {
                site_name,
                league_id,
                site_fixture_id,
                home_team_id,
                away_team_id
            }
        });

        return fixture;
    }

    static async firstOrCreateFixture(site_name: SiteName, league_id: number, site_fixture_id: string, home_team_id: number, away_team_id: number) {
        let fixture;

        fixture = await Fixture.firstFixtureBySiteFixtureId(site_name, site_fixture_id);

        if (!fixture) {
            fixture = await Fixture.createFixture(site_name, league_id, site_fixture_id, home_team_id, away_team_id)
        }

        return fixture;
    }
}

export default Fixture;