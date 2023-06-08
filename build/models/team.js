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
const db_client_1 = __importDefault(require("./db_client"));
class Team {
    static getTeamsByNames(site_name, names) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let teams = yield db_client_1.default.team.findMany({
                where: {
                    site_name,
                    name: {
                        in: names
                    },
                },
                select: {
                    id: true,
                    name: true,
                    leagues: {
                        select: {
                            league_id: true
                        }
                    }
                }
            });
            return teams;
        });
    }
    static firstTeamByName(site_name, name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let team = yield db_client_1.default.team.findFirst({
                where: {
                    site_name,
                    name: name,
                    leagues: {
                        some: {
                            league_id: league_id ? league_id : undefined
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    leagues: true
                }
            });
            return team;
        });
    }
    static firstOrCreateTeam(site_name, name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let team;
            team = yield Team.firstTeamByName(site_name, name);
            if (team) {
                if (!team.leagues.length) {
                    yield Team.connectLeague(team.id, league_id);
                }
            }
            else {
                team = yield Team.createTeam(site_name, name, league_id);
            }
            return team;
        });
    }
    static createTeam(site_name, name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let team = yield db_client_1.default.team.create({
                data: {
                    site_name,
                    name,
                    leagues: {
                        create: [
                            {
                                league: {
                                    connect: {
                                        id: league_id
                                    }
                                }
                            }
                        ]
                    },
                },
                include: {
                    leagues: true
                }
            });
            return team;
        });
    }
    static connectLeague(team_id, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            yield db_client_1.default.team.update({
                where: {
                    id: team_id,
                },
                data: {
                    leagues: {
                        create: [
                            {
                                league: {
                                    connect: {
                                        id: league_id
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });
    }
}
exports.default = Team;
