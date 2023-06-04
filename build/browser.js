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
const puppeteer = __importStar(require("puppeteer"));
const logger_1 = __importDefault(require("./logger"));
const helper_1 = require("./helper");
class Browser {
    constructor(site_name) {
        this.site_name = site_name;
        this.site_name = site_name;
        this.logger = new logger_1.default();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            let max_attempt = 2;
            let attempts = 0;
            do {
                try {
                    this.logger.info("Starting browser");
                    attempts++;
                    let ws_url = yield this.getWSUrl();
                    if (ws_url) {
                        yield this.connect(ws_url);
                    }
                    else {
                        yield this.create();
                        ws_url = this.browser.wsEndpoint();
                        yield this.setWSUrl(ws_url);
                    }
                    this.logger.info("Browser ready");
                    break;
                }
                catch (err) {
                    if (attempts === max_attempt) {
                        this.logger.error("Error at starting browser");
                    }
                    else {
                        yield this.setWSUrl("");
                        this.logger.warn("Retrying");
                    }
                }
            } while (attempts < max_attempt);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Closing browser");
            yield this.browser.close();
            this.logger.info("Browser closed");
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.browser = yield puppeteer.launch({
                headless: false,
                args
            });
            this.logger.info("Launched new browser");
        });
    }
    connectOldBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            let ws_url = yield this.getWSUrl();
            yield this.connect(ws_url);
        });
    }
    connect(ws_url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Connecting to old browser");
            try {
                const browser = yield puppeteer.connect({
                    browserWSEndpoint: ws_url
                });
                this.browser = browser;
                this.logger.info("Connected to old browser");
            }
            catch (err) {
                this.logger.error(err.message);
                this.logger.error("Error at connecting to old browser");
                throw new Error();
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Disconnecting browser");
            try {
                this.browser.disconnect();
                this.logger.info("Browser disconnected");
            }
            catch (err) {
                this.logger.error(err.message);
                this.logger.error("Error at disconnecting browser");
                throw new Error();
            }
        });
    }
    getWSUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Getting browser WSUrl from cache");
            let cache = yield (0, helper_1.getCacheObj)(this.site_name);
            let ws_url = cache.ws_url;
            this.logger.info("Browser WSUrl is " + (ws_url ? ws_url : "<EMPTY>"));
            return ws_url;
        });
    }
    setWSUrl(ws_url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Setting browser WSUrl to " + (ws_url ? ws_url : "<EMPTY>"));
            yield (0, helper_1.setCacheObj)(this.site_name, { ws_url });
            this.logger.info("Set browser WSUrl to " + (ws_url ? ws_url : "<EMPTY>"));
        });
    }
    newPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Creating new page");
            let page = yield this.browser.newPage();
            this.logger.info("Created new page");
            return page;
        });
    }
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.browser.pages();
        });
    }
}
exports.default = Browser;
