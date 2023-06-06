import db_client from "./db_client";
import moment from "moment";

class iBet789OddGroup {
    static async createOdd(
        odds: Array<any>,
        ibet789_fixture_id: number,
        ibet789_ft_upper_team_id?: number | null,
        ibet789_ft_lower_team_id?: number | null,
        ibet789_fh_upper_team_id?: number | null,
        ibet789_fh_lower_team_id?: number | null,
    ) {
        if (odds.length) {
            await db_client.$connect();

            // odds = odds.map(single_odds => {
            //     single_odds.ft_hdp_home = single_odds.ft_hdp_home;
            //     single_odds.ft_hdp_away = single_odds.ft_hdp_away;
            //     single_odds.ft_ou_over = single_odds.ft_ou_over;
            //     single_odds.ft_ou_under = single_odds.ft_ou_under;

            //     single_odds.fh_hdp_home = single_odds.fh_hdp_home;
            //     single_odds.fh_hdp_away = single_odds.fh_hdp_away;
            //     single_odds.fh_ou_over = single_odds.fh_ou_over;
            //     single_odds.fh_ou_under = single_odds.fh_ou_under;

            //     return single_odds;
            // })

            let odd = await db_client.iBet789OddGroup.create({
                data: {
                    ibet789_fixture_id,
                    ibet789_ft_upper_team_id,
                    ibet789_ft_lower_team_id,
                    ibet789_fh_upper_team_id,
                    ibet789_fh_lower_team_id,
                    odds: {
                        createMany: {
                            data: odds
                        }
                    }
                },
            });

            return odd;
        }

    }

    static async firstAcceptableLatestOdd() {
        await db_client.$connect();

        return await db_client.iBet789OddGroup.findFirst({
            where: {
                created_at: {
                    gte: moment().subtract(1, "minute").utc().format(),
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }
}

export default iBet789OddGroup;