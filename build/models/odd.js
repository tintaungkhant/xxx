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
class OddGroup {
    static createOdd(site_name, odds, fixture_id, ft_upper_team_id, ft_lower_team_id, fh_upper_team_id, fh_lower_team_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (odds.length) {
                yield db_client_1.default.$connect();
                odds = odds.map(function (odd) {
                    odd.site_name = site_name;
                    return odd;
                });
                let odd = yield db_client_1.default.oddGroup.create({
                    data: {
                        site_name,
                        fixture_id,
                        ft_upper_team_id,
                        ft_lower_team_id,
                        fh_upper_team_id,
                        fh_lower_team_id,
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
            return yield db_client_1.default.oddGroup.findFirst({
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
exports.default = OddGroup;
