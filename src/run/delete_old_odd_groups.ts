import moment from "moment";
import db_client from "../models/db_client";

(async () => {
  await deleteOdds();
})();

async function deleteOdds() {
  let last_30_min = moment().utc().subtract("30", "minutes").format();

  await db_client.$connect();

  await db_client.oddGroup.deleteMany({
    where: {
      created_at: {
        lte: last_30_min,
      },
    }
  });
}