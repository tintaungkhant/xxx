import { SiteName } from "../enums";
import db_client from "./db_client";
import moment from "moment";

class OddGroup {
    static async createOdd(
        site_name: SiteName,
        odds: Array<any>,
        fixture_id: number,
        ft_upper_team_id?: number | null,
        ft_lower_team_id?: number | null,
        fh_upper_team_id?: number | null,
        fh_lower_team_id?: number | null,
    ) {
        if (odds.length) {
            await db_client.$connect();

            odds = odds.map(function (odd) {
                odd.site_name = site_name;
                return odd;
            })

            let odd = await db_client.oddGroup.create({
                data: {
                    site_name,
                    fixture_id,
                    ft_upper_team_id,
                    ft_lower_team_id,
                    fh_upper_team_id,
                    fh_lower_team_id,
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

        return await db_client.oddGroup.findFirst({
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

export default OddGroup;