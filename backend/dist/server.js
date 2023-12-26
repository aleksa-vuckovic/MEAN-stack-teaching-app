"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const prijavaRuter_1 = __importDefault(require("./ruteri/prijavaRuter"));
/*
Svi odgovori su u json formatu
    {
        message: "ok" / "Greska...",
        data?: {...}
    }
*/
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
mongoose_1.default.connect("mongodb://127.0.0.1:27017/piaprojekat");
mongoose_1.default.connection.once('open', () => {
    console.log('db ok');
});
app.use("/", prijavaRuter_1.default);
app.listen(4000, () => console.log(`Express server running on port 4000`));
