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
const moment_1 = __importDefault(require("moment"));
class iBet789OddGroup {
    static createOdd(odds, ibet789_fixture_id, ibet789_ft_upper_team_id, ibet789_ft_lower_team_id, ibet789_fh_upper_team_id, ibet789_fh_lower_team_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (odds.length) {
                yield db_client_1.default.$connect();
                // odds = odds.map(single_odds => {
                //     single_odds.ft_hdp_home = single_odds.ft_hdp_home;
                //     single_odds.ft_hdp_away = single_odds.ft_hdp_away;
                //     single_odds.ft_ou_over = single_odds.ft_ou_over;
                //     single_odds.ft_ou_under = single_odds.ft_ou_under;
                //     single_odds.fh_hdp_home = single_odds.fh_hdp_home;
                //     single_odds.fh_hdp_away = single_odds.fh_hdp_away;
                //     single_odds.fh_ou_over = single_odds.fh_ou_over;
                //     single_odds.fh_ou_under = single_odds.fh_ou_under;
                //     return single_odds;
                // })
                let odd = yield db_client_1.default.iBet789OddGroup.create({
                    data: {
                        ibet789_fixture_id,
                        ibet789_ft_upper_team_id,
                        ibet789_ft_lower_team_id,
                        ibet789_fh_upper_team_id,
                        ibet789_fh_lower_team_id,
                        odds: {
                            createMany: {
                                data: odds
                            }
                        }
                    },
                });
                return odd;
            }
        });
    }
    static firstAcceptableLatestOdd() {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            return yield db_client_1.default.iBet789OddGroup.findFirst({
                where: {
                    created_at: {
                        gte: (0, moment_1.default)().subtract(1, "minute").utc().format(),
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            });
        });
    }
}
exports.default = iBet789OddGroup;
