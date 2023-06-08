import { SiteName } from "../enums";
import db_client from "./db_client";

class Team {
    static async getTeamsByNames(site_name: SiteName, names: Array<string>) {
        await db_client.$connect();

        let teams = await db_client.team.findMany({
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
    }

    static async firstTeamByName(site_name: SiteName, name: string, league_id?: number) {
        await db_client.$connect();

        let team = await db_client.team.findFirst({
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
    }

    static async firstOrCreateTeam(site_name: SiteName, name: string, league_id: number) {
        let team;
        
        team = await Team.firstTeamByName(site_name, name);

        if (team) {
            if(!team.leagues.length){
                await Team.connectLeague(team.id, league_id);
            }
        } else {
            team = await Team.createTeam(site_name, name, league_id)
        }

        return team;
    }

    static async createTeam(site_name: SiteName, name: string, league_id: number) {
        await db_client.$connect();

        let team = await db_client.team.create({
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
    }

    static async connectLeague(team_id: number, league_id: number) {
        await db_client.$connect();

        await db_client.team.update({
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
        })
    }
}

export default Team;