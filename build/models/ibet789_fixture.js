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
class iBet789Fixture {
    static firstFixtureBySiteFixtureId(site_fixture_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let fixture = yield db_client_1.default.iBet789Fixture.findFirst({
                where: {
                    site_fixture_id
                }
            });
            return fixture;
        });
    }
    static createFixture(ibet789_league_id, site_fixture_id, ibet789_home_team_id, ibet789_away_team_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_client_1.default.$connect();
            let fixture = yield db_client_1.default.iBet789Fixture.create({
                data: {
                    ibet789_league_id,
                    site_fixture_id,
                    ibet789_home_team_id,
                    ibet789_away_team_id
                }
            });
            return fixture;
        });
    }
    static firstOrCreateFixture(ibet789_league_id, site_fixture_id, ibet789_home_team_id, ibet789_away_team_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let fixture;
            fixture = yield iBet789Fixture.firstFixtureBySiteFixtureId(site_fixture_id);
            if (!fixture) {
                fixture = yield iBet789Fixture.createFixture(ibet789_league_id, site_fixture_id, ibet789_home_team_id, ibet789_away_team_id);
            }
            return fixture;
        });
    }
}
exports.default = iBet789Fixture;
