import db_client from "./db_client";

class iBet789Team {
    static async getTeamsByNames(names: Array<string>) {
        await db_client.$connect();

        let teams = await db_client.iBet789Team.findMany({
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
    }

    static async firstTeamByName(name: string, league_id: number) {
        await db_client.$connect();

        let team = await db_client.iBet789Team.findFirst({
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
    }

    static async firstOrCreateTeam(name: string, league_id: number) {
        let team;

        team = await iBet789Team.firstTeamByName(name, league_id);

        if (team) {
            if(!team.leagues.length){
                await iBet789Team.connectLeague(team.id, league_id);
            }
        } else {
            team = await iBet789Team.createTeam(name, league_id)
        }

        return team;
    }

    static async createTeam(name: string, league_id: number) {
        await db_client.$connect();

        let team = await db_client.iBet789Team.create({
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
    }

    static async connectLeague(team_id: number, league_id: number) {
        await db_client.$connect();

        await db_client.iBet789Team.update({
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

export default iBet789Team;