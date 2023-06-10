import db_client from "../models/db_client";

(async () => {
  await deleteOdds();
})();

async function deleteOdds() {
  await db_client.$connect();

  await db_client.fixture.deleteMany({});
}