"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let obavestenjeSchema = new mongoose_1.default.Schema({
    kime: String,
    datumvreme: Date,
    sadrzaj: String
});
exports.default = mongoose_1.default.model("obavestenjeModel", obavestenjeSchema, "obavestenja");
