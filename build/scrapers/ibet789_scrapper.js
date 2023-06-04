"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const lodash_1 = __importDefault(require("lodash"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: (0, helper_1.rootDir)() + '/.env' });
const logger_1 = __importDefault(require("../logger"));
const enums_1 = require("../enums");
const league_1 = __importDefault(require("../models/league"));
const scrapper_1 = __importDefault(require("./scrapper"));
class IBet789Scrapper extends scrapper_1.default {
    constructor(browser) {
        super(logger_1.default.make(enums_1.SiteName.ibet789));
        this.site_name = enums_1.SiteName.ibet789;
        this.browser = browser;
        this.logger.info("Browser ready");
    }
    start() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let start_time = Date.now();
                this.logger.info("Starting scrapper");
                yield this.adjustPages();
                this.page = yield this.getFirstPage();
                this.page.setDefaultTimeout(3000);
                +this.page.setDefaultNavigationTimeout(20000);
                let new_page = true;
                if (this.page.url().includes((0, helper_1.env)("IBET789_HOMEPAGE_URL"))) {
                    new_page = false;
                }
                else {
                    yield this.login();
                    yield this.acceptAgreement();
                }
                this.logger.info("Home page ready");
                yield this.setFrames();
                if (new_page) {
                    this.logger.info("Scrapping on new page");
                    this.logger.info("Doing required steps");
                    yield this.goToHdpOUOnlyPage();
                    yield this.changeToSimpleTableMode();
                    yield this.doLeagueFilter();
                }
                else {
                    this.logger.info("Scrapping on existing page");
                    this.logger.info("Skipped some steps");
                }
                let raw_data = yield this.extractRawData();
                let transformed_data = yield this.transformRawData(raw_data);
                this.logger.info("Saving to database");
                // fs.writeFileSync("test.json", JSON.stringify(transformed_data));
                yield this.storeData(transformed_data, this.site_name);
                this.logger.info("Saved to database");
                (_a = this.browser) === null || _a === void 0 ? void 0 : _a.disconnect();
                this.logger.info("Browser disconnected");
                let end_time = Date.now();
                this.logger.info("DURATION " + (end_time - start_time) / 1000);
            }
            catch (err) {
                this.logger.error("Error at scrapping");
                yield this.closeAllPages();
                (_b = this.browser) === null || _b === void 0 ? void 0 : _b.disconnect();
                this.logger.info("Browser disconnected");
                throw new Error("");
            }
        });
    }
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.browser.pages();
        });
    }
    getFirstPage() {
        return __awaiter(this, void 0, void 0, function* () {
            let pages = yield this.getPages();
            return pages[0];
        });
    }
    setFrames() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Loading required frames to scrap");
                yield this.setSidebarBodyFrame();
                yield this.setSidebarFrame();
                yield this.setBodyFrame();
                this.logger.info("All frames are loaded");
            }
            catch (err) {
                this.logger.error("There's an error while loading required frames");
                throw new Error("");
            }
        });
    }
    setSidebarBodyFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Loading Sidebar+Body frame");
            let frame = yield this.page.$("#fraSet > frameset");
            if (frame) {
                this.sidebar_body_frame = frame;
                this.logger.info("Sidebar+Body frame loaded");
            }
            else {
                this.logger.error("There's an error while loading Sidebar+Body frame");
                throw new Error("");
            }
        });
    }
    setSidebarFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Loading sidebar frame");
            let frame_handel = yield this.sidebar_body_frame.$("frameset:nth-child(3) > frame:nth-child(1)");
            let frame = yield (frame_handel === null || frame_handel === void 0 ? void 0 : frame_handel.contentFrame());
            if (frame) {
                this.sidebar_frame = frame;
                this.logger.info("Sidebar frame loaded");
            }
            else {
                this.logger.error("There's an error while loading sidebar frame");
                throw new Error("");
            }
        });
    }
    setBodyFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Loading body frame");
            let frame_handel = yield this.sidebar_body_frame.$("frameset:nth-child(3) > frame:nth-child(2)");
            let frame = yield (frame_handel === null || frame_handel === void 0 ? void 0 : frame_handel.contentFrame());
            if (frame) {
                this.body_frame = frame;
                this.logger.info("Body frame loaded");
            }
            else {
                this.logger.error("There's an error while loading body frame");
                throw new Error("");
            }
        });
    }
    goToHdpOUOnlyPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Navigating to HDP OU only page");
                yield (0, helper_1.delay)();
                yield this.sidebar_frame.click("#SMenuSoccer > table > tbody > tr:nth-child(2) > td.SpMenuHeader_link > div > a");
                yield (0, helper_1.delay)();
                this.logger.info("Navigated to HDP OU only page");
            }
            catch (err) {
                this.logger.error("Error while navigating to HDP OU only page");
                throw new Error("");
            }
        });
    }
    doLeagueFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Filtering leagues");
                let scrapping_leagues = yield league_1.default.getAllScrappingLeagues(this.site_name);
                let scrapping_league_arr = scrapping_leagues.map(scrapping_league => {
                    return this.formatLeagueName(scrapping_league.name);
                });
                if (scrapping_league_arr.length) {
                    let leagues_select_form_open_button_selector = ".rollover8";
                    let league_deselect_all_selector = "input.BtnNormal:nth-child(2)";
                    let league_select_ok_selector = "#btnOK";
                    let league_select_table_td_selector = "#lMod > tbody:nth-child(1) > tr td";
                    this.logger.info("Selecting leagues");
                    yield this.body_frame.click(leagues_select_form_open_button_selector);
                    yield (0, helper_1.delay)();
                    let league_select_frame = this.body_frame;
                    if (league_select_frame) {
                        yield league_select_frame.click(league_deselect_all_selector);
                        let selectable_leagues = yield league_select_frame.$$(league_select_table_td_selector);
                        let selected_league_count = 0;
                        for (let index = 0; index < selectable_leagues.length; index++) {
                            let selectable_league = selectable_leagues[index];
                            let selectable_league_name = yield selectable_league.evaluate(el => el.textContent);
                            if (selectable_league_name) {
                                selectable_league_name = this.formatLeagueName(selectable_league_name);
                                let dont_select_if_contains = " - ";
                                if (!selectable_league_name.includes(dont_select_if_contains.toLowerCase())) {
                                    if (scrapping_league_arr.includes(selectable_league_name)) {
                                        yield selectable_league.$eval("label", el => el.click());
                                        selected_league_count++;
                                    }
                                }
                            }
                        }
                        this.logger.info(`${selected_league_count} of ${scrapping_league_arr.length} leagues are selected`);
                        yield league_select_frame.click(league_select_ok_selector);
                        yield (0, helper_1.delay)();
                        this.logger.info("Leagues are filtered");
                    }
                    else {
                        this.logger.error("There's an error while selecting leagues");
                        throw new Error("");
                    }
                }
                else {
                    this.logger.warn("There's no league to be filtered in db");
                }
            }
            catch (err) {
                this.logger.error("There's an error while filtering leagues");
                throw new Error("");
            }
        });
    }
    changeToSimpleTableMode() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Changing to simple table mode");
                let select_box = yield this.body_frame.$("#hdpLst");
                if (select_box) {
                    yield (0, helper_1.delay)(1000);
                    yield select_box.type("Simple");
                    yield (0, helper_1.delay)();
                    this.logger.info("Changed to simple table mode");
                }
                else {
                    throw new Error("");
                }
            }
            catch (err) {
                this.logger.error("There's an error while changing to simple table mode");
                throw new Error("");
            }
        });
    }
    extractRawData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Extracting raw data");
                let data = [];
                let table = yield this.body_frame.$("#tableToday > table.GridBody > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table");
                if (table) {
                    let league_tbodies = yield table.$$("tbody[soclid]");
                    for (let index_1 = 0; index_1 < league_tbodies.length; index_1++) {
                        if (index_1 === 0) {
                            continue;
                        }
                        let item = {
                            league_name: "",
                            fixtures: []
                        };
                        let league_tbody = league_tbodies[index_1];
                        let league_tr = yield league_tbody.$("tr.Event");
                        if (league_tr) {
                            let league_name = yield (league_tr === null || league_tr === void 0 ? void 0 : league_tr.evaluate(el => {
                                let text = el.textContent;
                                return text ? text : "";
                            }));
                            let fixtures = [];
                            let fixture_trs = yield league_tbody.$$("tr[class*='M_Item']");
                            for (let index_2 = 0; index_2 < fixture_trs.length; index_2++) {
                                let fixture_tr = fixture_trs[index_2];
                                let odd_type = yield fixture_tr.evaluate((el, OddType) => {
                                    return el.classList.contains("MMGridItem") ? OddType.Myanmar : OddType.Malay;
                                }, enums_1.OddType);
                                let raw_hdp = yield this.extractRawHdp(fixture_tr);
                                let hdp = this.rawHandicapToArray(odd_type, raw_hdp);
                                let hdp_odds = yield this.extractHdpOdd(fixture_tr, hdp);
                                let raw_ou = yield this.extractRawOU(fixture_tr);
                                let ou = this.rawHandicapToArray(odd_type, raw_ou);
                                let ou_odds = yield this.extractOUOdd(fixture_tr, ou);
                                let team_spans = yield fixture_tr.$$("td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr span");
                                let home_team_span = null;
                                let away_team_span = null;
                                if (team_spans.length === 2) {
                                    home_team_span = team_spans[0];
                                    away_team_span = team_spans[1];
                                }
                                let home_team_name = "";
                                let away_team_name = "";
                                if (home_team_span) {
                                    home_team_name = yield home_team_span.evaluate(el => {
                                        let text = el.textContent;
                                        return text ? text : "";
                                    });
                                }
                                if (away_team_span) {
                                    away_team_name = yield away_team_span.evaluate(el => {
                                        let text = el.textContent;
                                        return text ? text : "";
                                    });
                                }
                                let is_home_team_upper = false;
                                if (hdp[0] == 0 && odd_type === enums_1.OddType.Myanmar) {
                                    if ((raw_hdp.includes("H") && (hdp[1] == 0 || (hdp[1] && (0, helper_1.isNegative)(hdp[1])))) ||
                                        (raw_hdp.includes("A") && hdp[1] && (0, helper_1.isPositive)(hdp[1]))) {
                                        is_home_team_upper = true;
                                    }
                                }
                                else if (hdp[0] == 0 && hdp.length === 1 && odd_type === enums_1.OddType.Malay) {
                                    if ((hdp_odds.hdp_home >= 0 && hdp_odds.hdp_away >= 0) ||
                                        (hdp_odds.hdp_home < 0 && hdp_odds.hdp_away < 0)) { // + + || - -
                                        if (hdp_odds.hdp_home < hdp_odds.hdp_away) {
                                            is_home_team_upper = true;
                                        }
                                    }
                                    else { // + -
                                        if (hdp_odds.hdp_home > hdp_odds.hdp_away) {
                                            is_home_team_upper = true;
                                        }
                                    }
                                }
                                else {
                                    if (home_team_span) {
                                        is_home_team_upper = yield home_team_span.evaluate(el => el.classList.contains("Give"));
                                    }
                                }
                                let is_away_team_upper = !is_home_team_upper;
                                let site_fixture_id = yield fixture_tr.evaluate((el, { site_name }) => {
                                    let text = el.getAttribute("favid");
                                    return text ? site_name + text : "";
                                }, { site_name: this.site_name });
                                fixtures.push(Object.assign(Object.assign(Object.assign(Object.assign({ odd_type, home_team_name: this.formatTeamName(home_team_name), away_team_name: this.formatTeamName(away_team_name), is_home_team_upper,
                                    is_away_team_upper,
                                    hdp }, hdp_odds), { ou }), ou_odds), { site_fixture_id }));
                            }
                            item.league_name = this.formatLeagueName(league_name);
                            item.fixtures = fixtures;
                            data.push(item);
                        }
                    }
                }
                this.logger.info("Extracted raw data");
                return data;
            }
            catch (err) {
                this.logger.error("There's an error while extracting raw data");
                throw new Error("");
            }
        });
    }
    extractRawHdp(fixture_tr) {
        return __awaiter(this, void 0, void 0, function* () {
            let raw_hdp = "";
            let hdp_td = yield fixture_tr.$("td:nth-child(3) > span");
            if (hdp_td) {
                raw_hdp = yield hdp_td.evaluate(el => {
                    var _a;
                    let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                    return text || text == "0" ? text : "";
                });
            }
            return raw_hdp;
        });
    }
    extractRawOU(fixture_tr) {
        return __awaiter(this, void 0, void 0, function* () {
            let raw_ou = "";
            let ou_td = yield fixture_tr.$("td:nth-child(6) > span");
            if (ou_td) {
                raw_ou = yield ou_td.evaluate(el => {
                    var _a;
                    let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                    return text || text === "0" ? text : "";
                });
            }
            return raw_ou;
        });
    }
    extractEarlyRawData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Extracting raw data");
                let data = [];
                let table = yield this.body_frame.$("#tableToday > table.GridBody > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table");
                if (table) {
                    let league_tbodies = yield table.$$("tbody[soclid]");
                    for (let index_1 = 0; index_1 < league_tbodies.length; index_1++) {
                        if (index_1 === 0) {
                            continue;
                        }
                        let league_tbody = league_tbodies[index_1];
                        let league_tr = yield league_tbody.$("tr.Event");
                        if (league_tr) {
                            let league_name = yield (league_tr === null || league_tr === void 0 ? void 0 : league_tr.evaluate(el => {
                                let text = el.textContent;
                                return text ? text : "";
                            }));
                            if (league_name) {
                                let item = {
                                    league_name,
                                    teams: []
                                };
                                let fixture_trs = yield league_tbody.$$("tr[class*='M_Item']");
                                for (let index_2 = 0; index_2 < fixture_trs.length; index_2++) {
                                    let fixture_tr = fixture_trs[index_2];
                                    let team_spans = yield fixture_tr.$$("td:nth-child(2) > table > tbody > tr > td span");
                                    if (team_spans.length === 2) {
                                        let home_team_span = team_spans[0];
                                        let home_team_name = yield home_team_span.evaluate(el => {
                                            let text = el.textContent;
                                            return text ? text : "";
                                        });
                                        item.teams.push(home_team_name);
                                        let away_team_span = team_spans[1];
                                        let away_team_name = yield away_team_span.evaluate(el => {
                                            let text = el.textContent;
                                            return text ? text : "";
                                        });
                                        item.teams.push(away_team_name);
                                    }
                                }
                                data.push(item);
                            }
                        }
                    }
                }
                this.logger.info("Extracted raw data");
                return data;
            }
            catch (err) {
                this.logger.error("There's an error while extracting raw data");
                throw new Error("");
            }
        });
    }
    transformEarlyRawData(raw_data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("Transforming raw data");
                let leagues = raw_data.map(raw_league_item => {
                    raw_league_item.teams = lodash_1.default.uniq(raw_league_item.teams);
                    return raw_league_item;
                });
                this.logger.info("Transformed raw data");
                return leagues;
            }
            catch (err) {
                this.logger.error("There's an error while transforming raw data");
                throw new Error("");
            }
        });
    }
    extractHdpOdd(fixture_tr, hdp) {
        return __awaiter(this, void 0, void 0, function* () {
            let hdp_home = 0;
            let hdp_away = 0;
            if (hdp.length) {
                let hdp_home_td = yield fixture_tr.$("td:nth-child(4) > span > label");
                let hdp_away_td = yield fixture_tr.$("td:nth-child(5) > span > label");
                if (hdp_home_td && hdp_away_td) {
                    hdp_home = yield hdp_home_td.evaluate(el => {
                        var _a;
                        let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                        return text ? parseFloat(text) : 0.00;
                    });
                    hdp_away = yield hdp_away_td.evaluate(el => {
                        var _a;
                        let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                        return text ? parseFloat(text) : 0.00;
                    });
                }
            }
            return {
                hdp_home,
                hdp_away
            };
        });
    }
    extractOUOdd(fixture_tr, ou) {
        return __awaiter(this, void 0, void 0, function* () {
            let ou_over = 0;
            let ou_under = 0;
            if (ou.length) {
                let ou_over_td = yield fixture_tr.$("td:nth-child(7) > span > label");
                let ou_under_td = yield fixture_tr.$("td:nth-child(8) > span > label");
                if (ou_over_td && ou_under_td) {
                    ou_over = yield ou_over_td.evaluate(el => {
                        var _a;
                        let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                        return text ? parseFloat(text) : 0.00;
                    });
                    ou_under = yield ou_under_td.evaluate(el => {
                        var _a;
                        let text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                        return text ? parseFloat(text) : 0.00;
                    });
                }
            }
            return {
                ou_over,
                ou_under
            };
        });
    }
    adjustPages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Adjusting tabs");
            let pages = yield this.getPages();
            if (pages.length === 1) {
                if (!pages[0].url().includes("ibet789")) {
                    yield this.browser.newPage();
                    yield (0, helper_1.delay)(1000);
                    yield pages[0].close();
                }
            }
            else {
                let temp_new_page = yield this.browser.newPage();
                let has_existing_sb365_page = false;
                for (let index = 0; index < pages.length; index++) {
                    if (pages[index].url() === (0, helper_1.env)("IBET789_HOMEPAGE_URL")) {
                        if (!has_existing_sb365_page) {
                            has_existing_sb365_page = true;
                        }
                    }
                    else {
                        yield pages[index].close();
                    }
                    yield (0, helper_1.delay)(1000);
                }
                if (has_existing_sb365_page) {
                    yield temp_new_page.close();
                }
            }
            this.logger.info("Adjusted tabs");
        });
    }
    closeAllPages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Closing all tabs");
            let pages = yield this.getPages();
            yield this.browser.newPage();
            for (let index = 0; index < pages.length; index++) {
                yield pages[index].close();
                yield (0, helper_1.delay)(1000);
            }
            this.logger.info("Closed all tabs");
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Login started");
            let login_url = (0, helper_1.env)("IBET789_LOGIN_URL");
            if (login_url) {
                this.logger.info("Loading login page");
                yield this.page.goto(login_url);
                this.logger.info("Loaded login page");
                let has_error = yield this.checkError();
                if (has_error) {
                    throw new Error("");
                }
                else {
                    let login_username_input_selector = "#txtUserName";
                    let login_password_input_selector = "#password";
                    let login_login_button_selector = "#btnSignIn";
                    this.logger.info("Typing credentials");
                    yield this.page.click(login_username_input_selector);
                    yield this.page.keyboard.type((0, helper_1.env)("IBET789_USERNAME"));
                    yield this.page.click(login_password_input_selector);
                    yield this.page.keyboard.type((0, helper_1.env)("IBET789_PASSWORD"));
                    this.logger.info("Typed credentials");
                    this.logger.info("Submitting login form");
                    yield this.page.click(login_login_button_selector);
                    this.logger.info("Submitted login form");
                    yield this.page.waitForNavigation();
                    this.logger.info("Logged in");
                }
            }
        });
    }
    acceptAgreement() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.page.url().includes("Agreement")) {
                this.logger.info("Accepting Agreement");
                yield this.page.click("#btnAgree");
                this.logger.info("Accepted Agreement");
                this.logger.info("Navigating to home page");
                yield this.page.waitForNavigation();
                // await delay(2000);
                this.logger.info("Navigated to home page");
            }
        });
    }
    checkError() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Checking ibet789 errors");
            let message = "";
            if (this.page.url().toLowerCase().includes("maintenance")) {
                message = "ibet789 is under maintenance state";
                this.logger.warn(message);
                yield (0, helper_1.sendErrorReport)(message);
            }
            else {
                let maintenance_error_ele = yield this.page.$x("//*[text()[contains(.,'maintenance')]]");
                if (maintenance_error_ele.length) {
                    message = "ibet789 is under maintenance state";
                    this.logger.warn(message);
                    yield (0, helper_1.sendErrorReport)(message);
                }
            }
            let internal_error_ele = yield this.page.$x("//*[text()[contains(.,'Server Error')]]");
            if (internal_error_ele.length) {
                message = "ibet789 has internal server error";
                this.logger.warn(message);
                yield (0, helper_1.sendErrorReport)(message);
            }
            let error = message ? true : false;
            if (!error) {
                this.logger.info("There's no ibet789 error");
            }
            return error;
        });
    }
}
exports.default = IBet789Scrapper;
