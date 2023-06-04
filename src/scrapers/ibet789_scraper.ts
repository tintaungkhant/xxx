import { delay, rootDir, env, isNegative, isPositive } from "../helper"

import * as puppeteer from 'puppeteer';

import _ from "lodash";

import * as dotenv from "dotenv";
dotenv.config({ path: rootDir() + '/.env' });

import { SiteName, OddType } from "../enums";
import { RawOddTypes } from "../types"
import Browser from "../browser";
import Scrapper from "../scrapper";

import fs from "fs"


class IBet789Scrapper extends Scrapper {
    site_name: SiteName;
    page!: puppeteer.Page;
    sidebar_body_frame!: puppeteer.Frame | puppeteer.ElementHandle;
    sidebar_frame!: puppeteer.Frame;
    body_frame!: puppeteer.Frame;

    constructor(public browser: Browser) {
        super();

        this.site_name = SiteName.ibet789;

        this.logger.info("Browser ready");
    }

    async start() {
        try {
            let start_time = Date.now();

            this.logger.info("Starting scrapper");

            await this.adjustPages();

            this.page = await this.getFirstPage();

            this.page.setDefaultTimeout(3000); +
                this.page.setDefaultNavigationTimeout(20000);

            let new_page = true;

            if (this.page.url().includes(env("IBET789_HOMEPAGE_URL"))) {
                new_page = false;
            } else {
                await this.login();

                await this.acceptAgreement();
            }

            this.logger.info("Home page ready");

            await this.setFrames();

            if (new_page) {
                this.logger.info("Scrapping on new page");
                this.logger.info("Doing required steps");

                await this.goToHdpOUOnlyPage();

                await this.changeToSingleLineTableMode();

                await this.doLeagueFilter();
            } else {
                this.logger.info("Scrapping on existing page");
                this.logger.info("Skipped some steps");
            }

            let raw_data = await this.extractRawData();

            let transformed_data = await this.transformRawData(raw_data);

            this.logger.info("Saving to database");

            fs.writeFileSync("test.json", JSON.stringify(transformed_data));

            // await this.storeData(transformed_data, this.site_name);

            this.logger.info("Saved to database");

            this.browser?.disconnect();

            this.logger.info("Browser disconnected");

            let end_time = Date.now();

            this.logger.info("DURATION " + (end_time - start_time) / 1000);
        } catch (err: any) {
            this.logger.error("Error at scrapping");

            await this.closeAllPages();

            this.browser?.disconnect();

            this.logger.info("Browser disconnected");

            throw new Error("");
        }
    }

    async getPages() {
        return await this.browser.getPages();
    }

    async getFirstPage() {
        let pages = await this.getPages();

        return pages[0];
    }

    async setFrames() {
        try {
            this.logger.info("Loading required frames to scrap");

            await this.setSidebarBodyFrame();
            await this.setSidebarFrame();
            await this.setBodyFrame();

            this.logger.info("All frames are loaded");
        } catch (err: any) {
            this.logger.error("There's an error while loading required frames");

            throw new Error("");
        }

    }

    async setSidebarBodyFrame() {
        this.logger.info("Loading Sidebar+Body frame");

        let frame = await this.page.$("#fraSet > frameset");

        if (frame) {
            this.sidebar_body_frame = frame;

            this.logger.info("Sidebar+Body frame loaded");
        } else {
            this.logger.error("There's an error while loading Sidebar+Body frame");

            throw new Error("");
        }

    }

    async setSidebarFrame() {
        this.logger.info("Loading sidebar frame");

        let frame_handel = await this.sidebar_body_frame.$("frameset:nth-child(3) > frame:nth-child(1)");
        let frame = await frame_handel?.contentFrame();

        if (frame) {
            this.sidebar_frame = frame;

            this.logger.info("Sidebar frame loaded");
        } else {
            this.logger.error("There's an error while loading sidebar frame");

            throw new Error("");
        }
    }

    async setBodyFrame() {
        this.logger.info("Loading body frame");

        let frame_handel = await this.sidebar_body_frame.$("frameset:nth-child(3) > frame:nth-child(2)");
        let frame = await frame_handel?.contentFrame();

        if (frame) {
            this.body_frame = frame;

            this.logger.info("Body frame loaded");
        } else {
            this.logger.error("There's an error while loading body frame");

            throw new Error("");
        }
    }

    async goToHdpOUOnlyPage() {
        try {
            this.logger.info("Navigating to HDP OU only page");

            await delay();

            await this.sidebar_frame.click("#SMenuSoccer > table > tbody > tr:nth-child(2) > td.SpMenuHeader_link > div > a");

            await delay();

            this.logger.info("Navigated to HDP OU only page");
        } catch (err: any) {
            this.logger.error("Error while navigating to HDP OU only page");

            throw new Error("");
        }
    }

    async doLeagueFilter() {
        try {
            this.logger.info("Filtering leagues");

            let leagues_select_form_open_button_selector = ".rollover8";
            let league_deselect_all_selector = "input.BtnNormal:nth-child(2)";
            let league_select_ok_selector = "#btnOK";
            let league_select_table_td_selector = "#lMod > tbody:nth-child(1) > tr td";

            this.logger.info("Selecting leagues");

            await this.body_frame.click(leagues_select_form_open_button_selector);

            await delay();

            let league_select_frame = this.body_frame;

            if (league_select_frame) {
                await league_select_frame.click(league_deselect_all_selector);

                let selectable_leagues = await league_select_frame.$$(league_select_table_td_selector);

                let selected_league_count = 0;

                for (let index = 0; index < selectable_leagues.length; index++) {
                    let selectable_league = selectable_leagues[index];

                    let selectable_league_name = await selectable_league.evaluate(el => {
                        let text = el.textContent;
                        return text ? text.trim() : "";
                    });
                    if (selectable_league_name) {
                        let selectable_formatted_league_name = this.formatLeagueName(selectable_league_name);
                        if (selectable_league_name === selectable_formatted_league_name) {
                            await selectable_league.$eval("label", el => el.click());
                            selected_league_count++;
                        }
                    }
                }

                this.logger.info(`${selected_league_count} of ${selectable_leagues.length} leagues are selected`);

                await league_select_frame.click(league_select_ok_selector);

                await delay();

                this.logger.info("Leagues are filtered");
            } else {
                this.logger.error("There's an error while selecting leagues");

                throw new Error("");
            }
        } catch (err: any) {
            this.logger.error("There's an error while filtering leagues");

            throw new Error("");
        }
    }

    async changeToSingleLineTableMode() {
        try {
            this.logger.info("Changing to simple table mode");

            let select_box = await this.body_frame.$("#hdpLst");

            if (select_box) {
                await delay(1000);

                await select_box.type("Single Line");

                await delay();

                this.logger.info("Changed to simple table mode");
            } else {
                throw new Error("");
            }
        } catch (err: any) {
            this.logger.error("There's an error while changing to simple table mode");

            throw new Error("");
        }

    }

    async extractRawData() {
        try {
            this.logger.info("Extracting raw data");

            let data: RawOddTypes.LeagueType[] = [];

            let table = await this.body_frame.$("#tableToday > table.GridBody > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table");

            if (table) {
                let league_tbodies = await table.$$("tbody[soclid]");

                for (let index_1 = 0; index_1 < league_tbodies.length; index_1++) {

                    if (index_1 === 0) {
                        continue;
                    }

                    let item: RawOddTypes.LeagueType = {
                        league_name: "",
                        fixtures: []
                    };

                    let league_tbody = league_tbodies[index_1];

                    let league_tr = await league_tbody.$("tr.Event");

                    if (league_tr) {
                        let league_name = await league_tr?.evaluate(el => {
                            let text = el.textContent

                            return text ? text : "";
                        });

                        let fixtures = [];

                        let fixture_trs = await league_tbody.$$("tr[class*='M_Item']");

                        for (let index_2 = 0; index_2 < fixture_trs.length; index_2++) {
                            let fixture_tr = fixture_trs[index_2];

                            let odd_type = await fixture_tr.evaluate((el, OddType) => {
                                return el.classList.contains("MMGridItem") ? OddType.Myanmar : OddType.Malay
                            }, OddType);


                            let ft_raw_hdp = await this.extractFTRawHdp(fixture_tr);
                            let ft_hdp = this.rawHandicapToArray(odd_type, ft_raw_hdp);
                            let ft_hdp_odds = await this.extractFTHdpOdd(fixture_tr, ft_hdp);

                            let ft_raw_ou = await this.extractFTRawOU(fixture_tr);
                            let ft_ou = this.rawHandicapToArray(odd_type, ft_raw_ou);
                            let ou_odds = await this.extractFTOUOdd(fixture_tr, ft_ou);

                            let team_spans = await fixture_tr.$$("td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr span");

                            let home_team_span: null | puppeteer.ElementHandle = null;
                            let away_team_span: null | puppeteer.ElementHandle = null;

                            if (team_spans.length === 2) {
                                home_team_span = team_spans[0];
                                away_team_span = team_spans[1];
                            }

                            let home_team_name = "";
                            let away_team_name = "";

                            if (home_team_span) {
                                home_team_name = await home_team_span.evaluate(el => {
                                    let text = el.textContent;
                                    return text ? text : ""
                                });
                            }

                            if (away_team_span) {
                                away_team_name = await away_team_span.evaluate(el => {
                                    let text = el.textContent;
                                    return text ? text : ""
                                });
                            }

                            let is_home_team_upper = false;

                            if (ft_hdp[0] == 0 && odd_type === OddType.Myanmar) {
                                if (
                                    (ft_raw_hdp.includes("H") && (ft_hdp[1] == 0 || (ft_hdp[1] && isNegative(ft_hdp[1])))) ||
                                    (ft_raw_hdp.includes("A") && ft_hdp[1] && isPositive(ft_hdp[1]))
                                ) {
                                    is_home_team_upper = true;
                                }
                            } else if (ft_hdp[0] == 0 && ft_hdp.length === 1 && odd_type === OddType.Malay) {
                                if (
                                    (ft_hdp_odds.ft_hdp_home >= 0 && ft_hdp_odds.ft_hdp_away >= 0) ||
                                    (ft_hdp_odds.ft_hdp_home < 0 && ft_hdp_odds.ft_hdp_away < 0)
                                ) { // + + || - -
                                    if (ft_hdp_odds.ft_hdp_home < ft_hdp_odds.ft_hdp_away) {
                                        is_home_team_upper = true;
                                    }
                                } else { // + -
                                    if (ft_hdp_odds.ft_hdp_home > ft_hdp_odds.ft_hdp_away) {
                                        is_home_team_upper = true;
                                    }
                                }
                            } else {
                                if (home_team_span) {
                                    is_home_team_upper = await home_team_span.evaluate(el => el.classList.contains("Give"));
                                }
                            }

                            let is_away_team_upper = !is_home_team_upper;

                            let site_fixture_id = await fixture_tr.evaluate((el, { site_name }) => {
                                let text = el.getAttribute("favid");
                                return text ? site_name + text : "";
                            }, { site_name: this.site_name });

                            fixtures.push({
                                odd_type,
                                home_team_name: this.formatTeamName(home_team_name),
                                away_team_name: this.formatTeamName(away_team_name),
                                is_home_team_upper,
                                is_away_team_upper,
                                ft_hdp,
                                ...ft_hdp_odds,
                                ft_ou,
                                ...ou_odds,
                                site_fixture_id
                            });
                        }

                        item.league_name = this.formatLeagueName(league_name);
                        item.fixtures = fixtures;

                        data.push(item);
                    }
                }
            }

            this.logger.info("Extracted raw data");

            return data;
        } catch (err: any) {
            this.logger.error("There's an error while extracting raw data");

            throw new Error("");
        }
    }

    async extractFTRawHdp(fixture_tr: puppeteer.ElementHandle) {
        let raw_hdp = "";
        let hdp_td = await fixture_tr.$("td:nth-child(3) > span");
        if (hdp_td) {
            raw_hdp = await hdp_td.evaluate(el => {
                let text = el.textContent?.trim();

                return text || text == "0" ? text : "";
            });
        }

        return raw_hdp;
    }

    async extractFTRawOU(fixture_tr: puppeteer.ElementHandle) {
        let raw_ou = "";
        let ou_td = await fixture_tr.$("td:nth-child(6) > span");
        if (ou_td) {
            raw_ou = await ou_td.evaluate(el => {
                let text = el.textContent?.trim();

                return text || text === "0" ? text : "";
            });
        }

        return raw_ou;
    }

    async extractFTHdpOdd(fixture_tr: puppeteer.ElementHandle, hdp: number[]) {
        let ft_hdp_home: number = 0;
        let ft_hdp_away: number = 0;

        if (hdp.length) {
            let ft_hdp_home_td = await fixture_tr.$("td:nth-child(4) > span > label");
            let ft_hdp_away_td = await fixture_tr.$("td:nth-child(5) > span > label");
            if (ft_hdp_home_td && ft_hdp_away_td) {
                ft_hdp_home = await ft_hdp_home_td.evaluate(el => {
                    let text = el.textContent?.trim();
                    return text ? parseFloat(text) : 0.00;
                });
                ft_hdp_away = await ft_hdp_away_td.evaluate(el => {
                    let text = el.textContent?.trim();
                    return text ? parseFloat(text) : 0.00;
                });
            }
        }

        return {
            ft_hdp_home,
            ft_hdp_away
        };
    }

    async extractFTOUOdd(fixture_tr: puppeteer.ElementHandle, ou: number[]) {
        let ft_ou_over: number = 0;
        let ft_ou_under: number = 0;

        if (ou.length) {
            let ft_ou_over_td = await fixture_tr.$("td:nth-child(7) > span > label");
            let ft_ou_under_td = await fixture_tr.$("td:nth-child(8) > span > label");
            if (ft_ou_over_td && ft_ou_under_td) {
                ft_ou_over = await ft_ou_over_td.evaluate(el => {
                    let text = el.textContent?.trim();
                    return text ? parseFloat(text) : 0.00;
                });
                ft_ou_under = await ft_ou_under_td.evaluate(el => {
                    let text = el.textContent?.trim();
                    return text ? parseFloat(text) : 0.00;
                });
            }
        }

        return {
            ft_ou_over,
            ft_ou_under
        };
    }

    async adjustPages() {
        this.logger.info("Adjusting tabs");

        let pages = await this.getPages();

        if (pages.length === 1) {
            if (!pages[0].url().includes("ibet789")) {
                await this.browser.newPage();

                await delay(1000);

                await pages[0].close();
            }
        } else {
            let temp_new_page = await this.browser.newPage();

            let has_existing_sb365_page = false;

            for (let index = 0; index < pages.length; index++) {
                if (pages[index].url() === env("IBET789_HOMEPAGE_URL")) {
                    if (!has_existing_sb365_page) {
                        has_existing_sb365_page = true;
                    }
                } else {
                    await pages[index].close();
                }

                await delay(1000);
            }

            if (has_existing_sb365_page) {
                await temp_new_page.close();
            }
        }

        this.logger.info("Adjusted tabs");
    }

    async closeAllPages() {
        this.logger.info("Closing all tabs");

        let pages = await this.getPages();

        await this.browser.newPage();

        for (let index = 0; index < pages.length; index++) {
            await pages[index].close();
            await delay(1000);
        }

        this.logger.info("Closed all tabs");
    }

    async login() {
        this.logger.info("Login started")

        let login_url = env("IBET789_LOGIN_URL");

        if (login_url) {
            this.logger.info("Loading login page")

            await this.page.goto(login_url);

            this.logger.info("Loaded login page")

            let has_error = await this.checkError();

            if (has_error) {
                throw new Error("");
            } else {

                let login_username_input_selector = "#txtUserName";
                let login_password_input_selector = "#password";
                let login_login_button_selector = "#btnSignIn";

                this.logger.info("Typing credentials");

                await this.page.click(login_username_input_selector);
                await this.page.keyboard.type(env("IBET789_USERNAME"));

                await this.page.click(login_password_input_selector);
                await this.page.keyboard.type(env("IBET789_PASSWORD"));

                this.logger.info("Typed credentials");

                this.logger.info("Submitting login form");

                await this.page.click(login_login_button_selector);

                this.logger.info("Submitted login form");

                await this.page.waitForNavigation();

                this.logger.info("Logged in");
            }
        }
    }

    async acceptAgreement() {
        if (this.page.url().includes("Agreement")) {
            this.logger.info("Accepting Agreement");

            await this.page.click("#btnAgree");

            this.logger.info("Accepted Agreement");

            this.logger.info("Navigating to home page");

            await this.page.waitForNavigation();

            // await delay(2000);

            this.logger.info("Navigated to home page");
        }
    }

    async checkError() {
        this.logger.info("Checking ibet789 errors");

        let message = "";

        if (this.page.url().toLowerCase().includes("maintenance")) {
            message = "ibet789 is under maintenance state";

            this.logger.warn(message);
        } else {
            let maintenance_error_ele = await this.page.$x(
                "//*[text()[contains(.,'maintenance')]]"
            );

            if (maintenance_error_ele.length) {
                message = "ibet789 is under maintenance state";

                this.logger.warn(message);

            }
        }

        let internal_error_ele = await this.page.$x(
            "//*[text()[contains(.,'Server Error')]]"
        );
        if (internal_error_ele.length) {
            message = "ibet789 has internal server error";

            this.logger.warn(message);
        }

        let error = message ? true : false;

        if (!error) {
            this.logger.info("There's no ibet789 error");
        }

        return error;
    }
}

export default IBet789Scrapper;