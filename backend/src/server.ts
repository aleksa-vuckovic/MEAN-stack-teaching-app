import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import prijavaRuter from './ruteri/prijavaRuter';
import session from 'express-session'
import MongoStore from 'connect-mongo'

/*
Svi odgovori su u json formatu 
    {
        poruka: "ok" / "Greska...",
        data?: {...}
    }
*/

const app = express();
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, "..", "uploads")));

mongoose.connect("mongodb://127.0.0.1:27017/piaprojekat")
mongoose.connection.once('open', () => {
    console.log('db ok')
})

app.use(session({
    secret: 'some-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // Sesija istice za 2 sata
  }));





app.use("/", prijavaRuter);
app.listen(4000, () => console.log(`Express server running on port 4000`));