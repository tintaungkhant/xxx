import * as puppeteer from 'puppeteer';
import winston from "winston"

import Logger from './logger';

import { SiteName } from './enums';

import { getCacheObj, setCacheObj } from "./helper"

class Browser {
    browser!: puppeteer.Browser;
    logger: Logger;

    constructor(public site_name: SiteName) {
        this.site_name = site_name;

        this.logger = new Logger();
    }

    async start() {
        let max_attempt = 2;
        let attempts = 0;

        do {
            try {
                this.logger.info("Starting browser");

                attempts++;

                let ws_url = await this.getWSUrl();

                if (ws_url) {
                    await this.connect(ws_url);
                } else {
                    await this.create();

                    ws_url = this.browser.wsEndpoint();

                    await this.setWSUrl(ws_url);
                }

                this.logger.info("Browser ready");

                break;
            } catch (err: any) {
                if (attempts === max_attempt) {
                    this.logger.error("Error at starting browser");
                } else {
                    await this.setWSUrl("");

                    this.logger.warn("Retrying");
                }
            }
        } while (attempts < max_attempt);
    }

    async stop() {
        this.logger.info("Closing browser");

        await this.browser.close();

        this.logger.info("Browser closed");
    }

    async create() {
        this.logger.info("Launching new browser");

        let args = [
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
        ];

        this.browser = await puppeteer.launch({
            headless: false,
            args
        });

        this.logger.info("Launched new browser");
    }

    async connectOldBrowser() {
        let ws_url = await this.getWSUrl();

        await this.connect(ws_url);
    }

    async connect(ws_url: string) {
        this.logger.info("Connecting to old browser");

        try {
            const browser = await puppeteer.connect({
                browserWSEndpoint: ws_url
            });

            this.browser = browser;

            this.logger.info("Connected to old browser");
        } catch (err: any) {
            this.logger.error(err.message);

            this.logger.error("Error at connecting to old browser");

            throw new Error();
        }
    }

    async disconnect() {
        this.logger.info("Disconnecting browser");

        try {
            this.browser.disconnect();

            this.logger.info("Browser disconnected");
        } catch (err: any) {
            this.logger.error(err.message);

            this.logger.error("Error at disconnecting browser");

            throw new Error();
        }
    }

    async getWSUrl() {
        this.logger.info("Getting browser WSUrl from cache");

        let cache = await getCacheObj(this.site_name);

        let ws_url = cache.ws_url;

        this.logger.info("Browser WSUrl is " + (ws_url ? ws_url : "<EMPTY>"));

        return ws_url;

    }

    async setWSUrl(ws_url: string) {
        this.logger.info("Setting browser WSUrl to " + (ws_url ? ws_url : "<EMPTY>"));

        await setCacheObj(this.site_name, { ws_url });

        this.logger.info("Set browser WSUrl to " + (ws_url ? ws_url : "<EMPTY>"));
    }

    async newPage(){
        this.logger.info("Creating new page");

        let page = await this.browser.newPage();

        this.logger.info("Created new page");

        return page;
    }

    async getPages(){
        return await this.browser.pages();
    }
}

export default Browser;