"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../helper");
const browser_1 = __importDefault(require("../browser"));
const logger_1 = __importDefault(require("../logger"));
const ibet789_scraper_1 = __importDefault(require("../scrapers/ibet789_scraper"));
const enums_1 = require("../enums");
var locked = false;
if ((0, helper_1.getCliOption)("once")) {
    (() => __awaiter(void 0, void 0, void 0, function* () { return yield run(); }))();
}
else {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        yield run();
    }), 15000);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!locked) {
                locked = true;
                let site_name = enums_1.SiteName.ibet789;
                let browser = new browser_1.default(site_name);
                yield browser.connectOldBrowser();
                new logger_1.default().info("Browser connected");
                let scrapper = new ibet789_scraper_1.default(browser);
                yield scrapper.start();
                locked = false;
            }
        }
        catch (err) {
            console.log(err);
            locked = false;
        }
    });
}
