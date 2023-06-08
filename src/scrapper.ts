import _ from "lodash";
import { OddType, SiteName } from "./enums";
import { RawOddTypes, TransformedOddTypes } from "./types";

import { parseFloatArr } from "./helper";
import Logger from "./logger";
import League from "./models/league";
import Team from "./models/team";
import Fixture from "./models/fixture";
import OddGroup from "./models/odd";

class Scrapper {
    logger: Logger;
    site_name!: SiteName;

    constructor() {
        this.logger = new Logger();
    }

    isEsportLeague(name: string){
        return name.includes("E-FOOTBALL");
    }

    isSideMarketLeague(name: string){
        return name.includes(" - ");
    }

    formatLeagueName(name: string) {
        name = name.toUpperCase().trim();
        name = name.replace("QUALIFIERS", "").trim();
        name = name.replace("PLAYOFF", "").trim();
        return name;
    }

    formatTeamName(name: string) {
        name = name.replace(" (n)", "");
        name = name.replace("(n)", "");
        name = name.trim();
        return name;
    }

    rawHandicapToArray(odd_type: OddType, data: string) {
        if (odd_type === OddType.Myanmar) {
            if (data) {
                let index_0 = data.split("(")[0];
                let index_1 = data.slice(data.indexOf("(") + 1, data.lastIndexOf(")"));
                return parseFloatArr([index_0, index_1]);
            } else {
                return [];
            }
        } else {
            return data ? parseFloatArr(data.split("-")) : [];
        }
    }

    async transformRawData(raw_data: RawOddTypes.LeagueType[]) {
        try {
            this.logger.info("Transforming raw data");
            let leagues: TransformedOddTypes.LeagueType[] = raw_data.map(raw_league_item => {
                let raw_fixtures_by_id = _.groupBy(raw_league_item.fixtures, "site_fixture_id");

                let fixtures = _.map(raw_fixtures_by_id, (fixture_with_odds) => {
                    let has_hdp_odd_rows = fixture_with_odds.filter(fixture_with_odd => {
                        return fixture_with_odd.ft_hdp.length;
                    });

                    let root_odd_row = has_hdp_odd_rows[0] ? has_hdp_odd_rows[0] : fixture_with_odds[0];

                    let fixture: TransformedOddTypes.FixtureType = {
                        home_team_name: root_odd_row.home_team_name,
                        away_team_name: root_odd_row.away_team_name,
                        site_fixture_id: root_odd_row.site_fixture_id,
                        ft_upper_team_name: "",
                        ft_lower_team_name: "",
                        fh_upper_team_name: "",
                        fh_lower_team_name: "",
                        odds: [],
                    }

                    if (root_odd_row.ft_is_home_team_upper) {
                        fixture.ft_upper_team_name = root_odd_row.home_team_name;
                        fixture.ft_lower_team_name = root_odd_row.away_team_name;
                    } else {
                        fixture.ft_upper_team_name = root_odd_row.away_team_name;
                        fixture.ft_lower_team_name = root_odd_row.home_team_name;
                    }

                    if (root_odd_row.fh_is_home_team_upper) {
                        fixture.fh_upper_team_name = root_odd_row.home_team_name;
                        fixture.fh_lower_team_name = root_odd_row.away_team_name;
                    } else {
                        fixture.fh_upper_team_name = root_odd_row.away_team_name;
                        fixture.fh_lower_team_name = root_odd_row.home_team_name;
                    }

                    let odds = fixture_with_odds.map((fixture_with_odd, index) => {
                        let odd_data: TransformedOddTypes.OddType = {
                            type: fixture_with_odd.odd_type,
                            ft_hdp: fixture_with_odd.ft_hdp,
                            ft_hdp_home: fixture_with_odd.ft_hdp_home,
                            ft_hdp_away: fixture_with_odd.ft_hdp_away,
                            ft_ou: fixture_with_odd.ft_ou,
                            ft_ou_over: fixture_with_odd.ft_ou_over,
                            ft_ou_under: fixture_with_odd.ft_ou_under,
                            fh_hdp: fixture_with_odd.fh_hdp,
                            fh_hdp_home: fixture_with_odd.fh_hdp_home,
                            fh_hdp_away: fixture_with_odd.fh_hdp_away,
                            fh_ou: fixture_with_odd.fh_ou,
                            fh_ou_over: fixture_with_odd.fh_ou_over,
                            fh_ou_under: fixture_with_odd.fh_ou_under,
                        }

                        return odd_data;
                    });

                    fixture.odds = odds;

                    return fixture;
                });

                let league: TransformedOddTypes.LeagueType = {
                    league_name: raw_league_item.league_name,
                    fixtures
                };

                return league;
            });

            this.logger.info("Transformed raw data");

            return leagues;
        } catch (err: any) {
            this.logger.error("There's an error while transforming raw data");

            throw new Error("");
        }
    }

    async storeData(transformed_raw_data: TransformedOddTypes.LeagueType[]) {
        let league_names: string[] = [];
        let team_names = [];

        for (let index_1 = 0; index_1 < transformed_raw_data.length; index_1++) {
            let league = transformed_raw_data[index_1];

            league_names.push(league.league_name);

            for (let index_2 = 0; index_2 < league.fixtures.length; index_2++) {
                let fixture = league.fixtures[index_2];

                team_names.push(fixture.home_team_name);
                team_names.push(fixture.away_team_name);
            }
        }

        let db_leagues = await League.getLeaguesByNames(this.site_name, league_names);

        if (db_leagues.length !== league_names.length) {
            for (let index = 0; index < league_names.length; index++) {
                let league_name = league_names[index];

                let db_league = db_leagues.find((db_league) => db_league.name === league_names[index]);
                if (!db_league) {
                    db_league = await League.createLeague(this.site_name, league_name);
                    db_leagues.push(db_league);
                }
            }
        }

        for (let index_1 = 0; index_1 < transformed_raw_data.length; index_1++) {
            let league = transformed_raw_data[index_1];

            let db_league = db_leagues.find((db_league) => db_league.name === league.league_name);

            if (db_league) {
                let league_id = db_league.id;

                for (let index_2 = 0; index_2 < league.fixtures.length; index_2++) {
                    let fixture = league.fixtures[index_2];

                    let db_home_team = await Team.firstOrCreateTeam(this.site_name, fixture.home_team_name, league_id);

                    let db_away_team = await Team.firstOrCreateTeam(this.site_name, fixture.away_team_name, league_id);

                    let db_fixture = await Fixture.firstOrCreateFixture(this.site_name, league_id, fixture.site_fixture_id, db_home_team.id, db_away_team.id);

                    let ft_upper_team_id: number | null;
                    let ft_lower_team_id: number | null;

                    ft_upper_team_id = fixture.home_team_name === fixture.ft_upper_team_name ? db_home_team.id : db_away_team.id;
                    ft_lower_team_id = fixture.home_team_name === fixture.ft_lower_team_name ? db_home_team.id : db_away_team.id;

                    if (ft_upper_team_id == ft_lower_team_id) {
                        ft_upper_team_id = ft_lower_team_id = null;
                    }

                    let fh_upper_team_id: number | null;
                    let fh_lower_team_id: number | null;

                    fh_upper_team_id = fixture.home_team_name === fixture.fh_upper_team_name ? db_home_team.id : db_away_team.id;
                    fh_lower_team_id = fixture.home_team_name === fixture.fh_lower_team_name ? db_home_team.id : db_away_team.id;

                    if (fh_upper_team_id == fh_lower_team_id) {
                        fh_upper_team_id = fh_lower_team_id = null;
                    }

                    if (ft_upper_team_id || fh_upper_team_id) {
                        await OddGroup.createOdd(this.site_name, fixture.odds, db_fixture.id, ft_upper_team_id, ft_lower_team_id, fh_upper_team_id, fh_lower_team_id);
                    }
                }
            }
        }
    }
}

export default Scrapper;