import _ from "lodash";
import { OddType } from "./enums";
import { RawOddTypes, TransformedOddTypes } from "./types";

import { parseFloatArr } from "./helper";
import Logger from "./logger";

class Scrapper {
    logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    formatLeagueName(name: string) {
        name = name.split(" - ")[0];
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
            return parseFloatArr(data.split("-"));
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
                        odds: []
                    }

                    if (root_odd_row.ft_is_home_team_upper) {
                        fixture.ft_upper_team_name = root_odd_row.home_team_name;
                        fixture.ft_lower_team_name = root_odd_row.away_team_name;
                    } else {
                        fixture.ft_upper_team_name = root_odd_row.away_team_name;
                        fixture.ft_lower_team_name = root_odd_row.home_team_name;
                    }

                    let odds = fixture_with_odds.map((fixture_with_odd, index) => {
                        let odd_data: TransformedOddTypes.OddType = {
                            type: fixture_with_odd.odd_type,
                            ft_hdp: fixture_with_odd.ft_hdp,
                            ft_hdp_home: fixture_with_odd.ft_hdp_home,
                            ft_hdp_away: fixture_with_odd.ft_hdp_away,
                            ft_ou: fixture_with_odd.ft_ou,
                            ft_ou_over: fixture_with_odd.ft_ou_over,
                            ft_ou_under: fixture_with_odd.ft_ou_under
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
}

export default Scrapper;