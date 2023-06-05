"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const enums_1 = require("./enums");
const helper_1 = require("./helper");
const logger_1 = __importDefault(require("./logger"));
class Scrapper {
    constructor() {
        this.logger = new logger_1.default();
    }
    formatLeagueName(name) {
        name = name.split(" - ")[0];
        name = name.toUpperCase().trim();
        name = name.replace("QUALIFIERS", "").trim();
        name = name.replace("PLAYOFF", "").trim();
        return name;
    }
    formatTeamName(name) {
        name = name.replace(" (n)", "");
        name = name.replace("(n)", "");
        name = name.trim();
        return name;
    }
    rawHandicapToArray(odd_type, data) {
        if (odd_type === enums_1.OddType.Myanmar) {
            if (data) {
                let index_0 = data.split("(")[0];
                let index_1 = data.slice(data.indexOf("(") + 1, data.lastIndexOf(")"));
                return (0, helper_1.parseFloatArr)([index_0, index_1]);
            }
            else {
                return [];
            }
        }
        else {
            return (0, helper_1.parseFloatArr)(data.split("-"));
        }
    }
    transformRawData(raw_data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Transforming raw data");
                let leagues = raw_data.map(raw_league_item => {
                    let raw_fixtures_by_id = lodash_1.default.groupBy(raw_league_item.fixtures, "site_fixture_id");
                    let fixtures = lodash_1.default.map(raw_fixtures_by_id, (fixture_with_odds) => {
                        let has_hdp_odd_rows = fixture_with_odds.filter(fixture_with_odd => {
                            return fixture_with_odd.ft_hdp.length;
                        });
                        let root_odd_row = has_hdp_odd_rows[0] ? has_hdp_odd_rows[0] : fixture_with_odds[0];
                        let fixture = {
                            home_team_name: root_odd_row.home_team_name,
                            away_team_name: root_odd_row.away_team_name,
                            site_fixture_id: root_odd_row.site_fixture_id,
                            ft_upper_team_name: "",
                            ft_lower_team_name: "",
                            fh_upper_team_name: "",
                            fh_lower_team_name: "",
                            odds: [],
                        };
                        if (root_odd_row.ft_is_home_team_upper) {
                            fixture.ft_upper_team_name = root_odd_row.home_team_name;
                            fixture.ft_lower_team_name = root_odd_row.away_team_name;
                        }
                        else {
                            fixture.ft_upper_team_name = root_odd_row.away_team_name;
                            fixture.ft_lower_team_name = root_odd_row.home_team_name;
                        }
                        if (root_odd_row.fh_is_home_team_upper) {
                            fixture.fh_upper_team_name = root_odd_row.home_team_name;
                            fixture.fh_lower_team_name = root_odd_row.away_team_name;
                        }
                        else {
                            fixture.fh_upper_team_name = root_odd_row.away_team_name;
                            fixture.fh_lower_team_name = root_odd_row.home_team_name;
                        }
                        let odds = fixture_with_odds.map((fixture_with_odd, index) => {
                            let odd_data = {
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
                            };
                            return odd_data;
                        });
                        fixture.odds = odds;
                        return fixture;
                    });
                    let league = {
                        league_name: raw_league_item.league_name,
                        fixtures
                    };
                    return league;
                });
                this.logger.info("Transformed raw data");
                return leagues;
            }
            catch (err) {
                this.logger.error("There's an error while transforming raw data");
                throw new Error("");
            }
        });
    }
}
exports.default = Scrapper;
