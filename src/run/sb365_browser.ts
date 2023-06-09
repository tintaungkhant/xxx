import Browser from "../browser";
import { SiteName } from "../enums"

(async () => {
    try {
        let browser = new Browser(SiteName.Sb365);

        await browser.start();
    } catch (err) {
        console.log(err);
    }
})();
