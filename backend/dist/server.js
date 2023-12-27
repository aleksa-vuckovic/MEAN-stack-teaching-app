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
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const ucenikRuter_1 = __importDefault(require("./ruteri/ucenikRuter"));
/*
Svi odgovori su u json formatu
    {
        poruka: "ok" / "Greska...",
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
app.use((0, express_session_1.default)({
    secret: 'some-key',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({ client: mongoose_1.default.connection.getClient() }),
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // Sesija istice za 2 sata
}));
app.use("/", prijavaRuter_1.default);
app.use("/ucenik", ucenikRuter_1.default);
app.listen(4000, () => console.log(`Express server running on port 4000`));
