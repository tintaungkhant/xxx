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
class iBet789Team {
    static getTeamsByNames(names) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let teams = yield db_client_1.default.iBet789Team.findMany({
                where: {
                    name: {
                        in: names
                    },
                },
                select: {
                    id: true,
                    name: true,
                    leagues: {
                        select: {
                            ibet789_league_id: true
                        }
                    }
                }
            });
            return teams;
        });
    }
    static firstTeamByName(name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let team = yield db_client_1.default.iBet789Team.findFirst({
                where: {
                    name: name,
                    leagues: {
                        some: {
                            ibet789_league_id: league_id ? league_id : undefined
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
    static firstOrCreateTeam(name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let team;
            team = yield iBet789Team.firstTeamByName(name, league_id);
            if (team) {
                if (!team.leagues.length) {
                    yield iBet789Team.connectLeague(team.id, league_id);
                }
            }
            else {
                team = yield iBet789Team.createTeam(name, league_id);
            }
            return team;
        });
    }
    static createTeam(name, league_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let team = yield db_client_1.default.iBet789Team.create({
                data: {
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
            yield db_client_1.default.iBet789Team.update({
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
exports.default = iBet789Team;
