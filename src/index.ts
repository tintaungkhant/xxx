import express from "express"
import db_client from "./models/db_client";

const app = express();
const port = 3000;

app.get("/api/odds", async (req: any, res: any) => {
    try {
        await db_client.$connect();

        let site_name = req.query.site_name;

        if(!site_name){
            throw new Error("site_name is required");
        }

        let leagues = await db_client.league.findMany({
            where: {
                site_name,
                fixtures: {
                    some: {},
                },
            },
            select: {
                id: true,
                site_name: true,
                name: true,
                fixtures: {
                    select: {
                        id: true,
                        league_id: true,
                        site_name: true,
                        home_team_id: true,
                        away_team_id: true,
                        home_team: {
                            select: {
                                id: true,
                                site_name: true,
                                name: true
                            }
                        },
                        away_team: {
                            select: {
                                id: true,
                                site_name: true,
                                name: true
                            }
                        },
                        odd_groups: {
                            // where: {
                            //   created_at: {
                            //     gte: moment().subtract(1, "minute").utc().format(),
                            //   },
                            // },
                            orderBy: {
                                created_at: "desc",
                            },
                            take: 1,
                            select: {
                                id: true,
                                fixture_id: true,
                                ft_upper_team_id: true,
                                ft_upper_team: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                ft_lower_team_id: true,
                                ft_lower_team: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                fh_upper_team_id: true,
                                fh_upper_team: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                fh_lower_team_id: true,
                                fh_lower_team: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                site_name: true,
                                odds: {
                                    select: {
                                        id: true,
                                        odd_group_id: true,
                                        site_name: true,
                                        type: true,
                                        ft_hdp: true,
                                        ft_hdp_home: true,
                                        ft_hdp_away: true,
                                        ft_ou: true,
                                        ft_ou_over: true,
                                        ft_ou_under: true,
                                        fh_hdp: true,
                                        fh_hdp_home: true,
                                        fh_hdp_away: true,
                                        fh_ou: true,
                                        fh_ou_over: true,
                                        fh_ou_under: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        leagues = leagues.map((league) => {
            league.fixtures = league.fixtures.filter((fixture) => {
                return fixture.home_team && fixture.away_team && fixture.odd_groups.length;
            });

            return league;
        });

        res.send({
            succes: true,
            message: "Success",
            data: {
                leagues,
            },
        });
    } catch (error: any) {
        res.send({
            succes: false,
            message: "Failed",
            data: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`App started listening on port ${port}`);
});
