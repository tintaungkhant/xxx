import { getCliOption } from "../helper"
import Browser from "../browser";
import Logger from "../logger";
import Sb365Scraper from "../scrapers/sb365_scraper";
import { SiteName } from "../enums";

var locked = false;

if (getCliOption("once")) {
    (async () => await run())();
} else {
    setInterval(async () => {
        await run();
    }, 15000);
}


async function run() {
    try {
        if (!locked) {
            locked = true;

            let site_name = SiteName.Sb365;

            let browser = new Browser(site_name);

            await browser.connectOldBrowser();

            new Logger().info("Browser connected");

            let scrapper = new Sb365Scraper(browser);

            await scrapper.start();

            locked = false;
        }
    } catch (err) {
        console.log(err);

        locked = false;
    }
}