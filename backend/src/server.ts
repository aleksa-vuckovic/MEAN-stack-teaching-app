import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import prijavaRuter from './ruteri/prijavaRuter';
import session from 'express-session'
import MongoStore from 'connect-mongo'
import ucenikRuter from './ruteri/ucenikRuter';

/*
Svi odgovori su u json formatu 
    {
        poruka: "ok" / "Greska...",
        data?: {...}
    }
*/
mongoose.connect("mongodb://127.0.0.1:27017/piaprojekat")
mongoose.connection.once('open', () => {
    console.log('db ok')
})

const app = express();
app.use(session({
    secret: "1234567890QWERTY",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: false,
        secure: false,
        //sameSite: 'none'
    }, // Sesija istice za 2 sata
  }));
app.use(cors({
    origin: 'http://localhost:4200',  // Specify your frontend's origin
    credentials: true,
  }))
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, "..", "uploads")));
app.use("/", prijavaRuter);
app.use("/ucenik", ucenikRuter);
app.listen(4000, () => console.log(`Express server running on port 4000`));