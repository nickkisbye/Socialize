const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('req-flash');
const moment = require('moment');
const rateLimit = require('express-rate-limit');

const Post = require('./models/Post');
const Friendship = require('./models/Friendship');
const User = require('./models/User');

const secret = require('./configs/mysqlCredentials').sessionSecret;
const { frontpageRedirect, authMiddleware } = require('./middleware/auth');
const { fullUserCredentials } = require('./configs/dbSelection');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret, resave: true, saveUninitialized: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(flash());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Used  to access a variable on all templates.
app.use((req, res, next) => {
    if(req.session.user) {
        res.locals.userId = req.session.user.id;
    }
    next();
});

/** Frontpage */

app.get('/', frontpageRedirect, async (req, res) => {
    return res.render('frontpage/index')
});

/** Get routes */

app.get('/dashboard', authMiddleware, async (req, res) => {
    const id = req.session.user.id;
    const friendResult = await Friendship.query().select()
                    .where(builder => builder.where('user1_id', id).orWhere('user2_id', id))
                    .where('is_accepted', 1).withGraphFetched('user1').withGraphFetched('user2');

    const friendRequests = await Friendship.query().select()
    .where('user2_id', id)
    .andWhere('is_accepted', 0).withGraphFetched('user1').withGraphFetched('user2');

    let requests = friendRequests.map((result) => {
        let friendRequest = req.session.user.id === result.user1[0].id ? result.user2[0] : result.user1[0];
        return friendRequest;       
    });

    let friends = friendResult.map((result) => {
        let friend = req.session.user.id === result.user1[0].id ? result.user2[0] : result.user1[0];
        return friend;       
    });

    let posts;

    if(friends.length > 0) {
        allPosts = await Promise.all(friends.map(async (friend) => {
            let post = await Post.query().select()
                            .where(builder => builder.where('author_id', friend.id).orWhere('author_id', req.session.user.id))
                            .withGraphFetched('users').orderBy('created_at', 'DESC');
            return post;
        }));
        posts = allPosts[0];
    } else {
        posts = await Post.query().select()
        .where('author_id', req.session.user.id)
        .withGraphFetched('users').orderBy('created_at', 'DESC');
    }

  return res.render('private/dashboard', { friends, requests, posts, moment, user: req.session.user });
});

app.get('/profile/:id', authMiddleware, async (req, res) => {
const user = await User.query().select(fullUserCredentials).findById(req.params.id).withGraphFetched('role');

const isFriends = await Friendship.query().select('id')
                        .where(builder => builder.where('user1_id', req.params.id).andWhere('user2_id', req.session.user.id))
                        .orWhere(builder => builder.where('user2_id', req.params.id).andWhere('user1_id', req.session.user.id));
console.log(isFriends.length);

if (user) return res.render('private/profile', { user, isAddable: req.session.user.id !== user.id && isFriends.length === 0 });
return res.redirect('/dashboard/');
});

app.get('/settings/', authMiddleware, async (req, res) => {
const user = await User.query().select(fullUserCredentials).findById(req.session.user.id).withGraphFetched('role');
return res.render('private/settings', { user })
});

app.get('/find/', authMiddleware, async (req, res) => {
    return res.render('private/find');
});

app.get('/register', frontpageRedirect, async (req, res) => {
    return res.render('frontpage/register', { message: req.flash('message') });
});

const authRoute = require('./routes/authRoutes');
const postRoute = require('./routes/postRoutes');
const userRoute = require('./routes/userRoutes');

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