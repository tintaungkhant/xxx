import db_client from "./db_client";

class iBet789Fixture {
    static async firstFixtureBySiteFixtureId(site_fixture_id: string) {
        await db_client.$connect();

        let fixture = await db_client.iBet789Fixture.findFirst({
            where: {
                site_fixture_id
            }
        });

        return fixture;
    }

    static async createFixture(ibet789_league_id: number, site_fixture_id: string, ibet789_home_team_id: number, ibet789_away_team_id: number) {
        await db_client.$connect();

        let fixture = await db_client.iBet789Fixture.create({
            data: {
                ibet789_league_id,
                site_fixture_id,
                ibet789_home_team_id,
                ibet789_away_team_id
            }
        });

        return fixture;
    }

    static async firstOrCreateFixture(ibet789_league_id: number, site_fixture_id: string, ibet789_home_team_id: number, ibet789_away_team_id: number) {
        let fixture;

        fixture = await iBet789Fixture.firstFixtureBySiteFixtureId(site_fixture_id);

        if (!fixture) {
            fixture = await iBet789Fixture.createFixture(ibet789_league_id, site_fixture_id, ibet789_home_team_id, ibet789_away_team_id)
        }

        return fixture;
    }
}

export default iBet789Fixture;