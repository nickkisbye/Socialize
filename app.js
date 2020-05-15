const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('req-flash');
const rateLimit = require('express-rate-limit');
const secret = require('./configs/mysqlCredentials').sessionSecret;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret, resave: true, saveUninitialized: false }));
app.use(express.static('public'));
app.use(flash());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.set('view engine', 'ejs');

// Used  to access a variable on all templates.
app.use((req, res, next) => {
    if(req.session.user) {
        res.locals.userId = req.session.user.id;
    }
    next();
});

/** Setup routes */

const pageRoute = require('./routes/pageRoutes');
const authRoute = require('./routes/authRoutes');
const postRoute = require('./routes/postRoutes');
const userRoute = require('./routes/userRoutes');

app.use(pageRoute);
app.use(authRoute);
app.use(postRoute);
app.use(userRoute);

/* Objection and knex setup */

const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./knexfile');

const knex = Knex(knexConfig.development);
Model.knex(knex);

app.listen(3001, () => {
    console.log("Listening on port", 3001);
})