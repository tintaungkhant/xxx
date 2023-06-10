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
const moment_1 = __importDefault(require("moment"));
const db_client_1 = __importDefault(require("../models/db_client"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield deleteOdds();
}))();
function deleteOdds() {
    return __awaiter(this, void 0, void 0, function* () {
        let last_30_min = (0, moment_1.default)().utc().subtract("30", "minutes").format();
        yield db_client_1.default.$connect();
        yield db_client_1.default.oddGroup.deleteMany({
            where: {
                created_at: {
                    lte: last_30_min,
                },
            }
        });
    });
}
