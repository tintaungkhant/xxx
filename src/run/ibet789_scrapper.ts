import { getCliOption } from "../helper"
import Browser from "../browser";
import Logger from "../logger";
import IBet789Scrapper from "../scrapers/ibet789_scraper";
import { SiteName } from "../enums";

var locked = false;

var interval = 120;

if (getCliOption("once")) {
    (async () => await run())();
} else {
    setInterval(async () => {
        await run();
    }, interval * 1000);
}


async function run() {
    try {
        if (!locked) {
            locked = true;

            let site_name = SiteName.ibet789;

            let browser = new Browser(site_name);

            await browser.connectOldBrowser();

            new Logger().info("Browser connected");

            let scrapper = new IBet789Scrapper(browser);

            await scrapper.start();

            locked = false;
        }
    } catch (err) {
        console.log(err);

        locked = false;
    }
}