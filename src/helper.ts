import * as dotenv from 'dotenv'
dotenv.config();

import Cache from './cache';

import { SiteName } from "./enums"

import path from 'path';

function env(key: string, default_value: any = "") {
    let value = process.env[key];
    return value ? value : default_value;
}

function rootDir() {
    return path.join(__dirname, '..')
}

async function getCacheObj(site_name: SiteName) {
    let cache = new Cache;

    return await cache.get(site_name);
}

async function setCacheObj(site_name: SiteName, data: object) {
    let cache = new Cache;

    return await cache.set(site_name, data);
}

async function delay(timeout = 3000) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

function isNegative(value: any): boolean {
    value = value ? value : "";
    if (typeof (value) === "number") {
        value = value.toString();
    }

    return value.includes("-");
}

function isPositive(value: any): boolean {
    return !isNegative(value);
}

function parseFloatArr(arr: any[]) {
    return arr.map(item => {
        return parseFloat(item);
    })
}

export {
    env, rootDir, getCacheObj, setCacheObj, delay, isNegative, isPositive, parseFloatArr
}