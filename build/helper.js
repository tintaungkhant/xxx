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
exports.parseFloatArr = exports.isPositive = exports.isNegative = exports.delay = exports.setCacheObj = exports.getCacheObj = exports.getCliOption = exports.rootDir = exports.env = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).parseSync();
const cache_1 = __importDefault(require("./cache"));
const path_1 = __importDefault(require("path"));
function env(key, default_value = "") {
    let value = process.env[key];
    return value ? value : default_value;
}
exports.env = env;
function getCliOption(option) {
    return argv[option] ? argv[option] : "";
}
exports.getCliOption = getCliOption;
function rootDir() {
    return path_1.default.join(__dirname, '..');
}
exports.rootDir = rootDir;
function getCacheObj(site_name) {
    return __awaiter(this, void 0, void 0, function* () {
        let cache = new cache_1.default;
        return yield cache.get(site_name);
    });
}
exports.getCacheObj = getCacheObj;
function setCacheObj(site_name, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let cache = new cache_1.default;
        return yield cache.set(site_name, data);
    });
}
exports.setCacheObj = setCacheObj;
function delay(timeout = 3000) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    });
}
exports.delay = delay;
function isNegative(value) {
    value = value ? value : "";
    if (typeof (value) === "number") {
        value = value.toString();
    }
    return value.includes("-");
}
exports.isNegative = isNegative;
function isPositive(value) {
    return !isNegative(value);
}
exports.isPositive = isPositive;
function parseFloatArr(arr) {
    return arr.map(item => {
        return parseFloat(item);
    });
}
exports.parseFloatArr = parseFloatArr;
