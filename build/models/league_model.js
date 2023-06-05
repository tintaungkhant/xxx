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
const db_client_1 = __importDefault(require("./db_client"));
class iBet789_League {
    static getAllScrappingLeagues() {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let leagues = yield db_client_1.default.iBet789_League.findMany({
                where: {
                    get_odd: true,
                },
                select: {
                    name: true,
                }
            });
            return leagues;
        });
    }
    static firstLeague(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let league = yield db_client_1.default.iBet789_League.findFirst({
                where: {
                    name,
                }
            });
            return league;
        });
    }
    static getLeaguesByNames(names) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let leagues = yield db_client_1.default.iBet789_League.findMany({
                where: {
                    name: {
                        in: names
                    },
                }
            });
            return leagues;
        });
    }
}
exports.default = iBet789_League;
