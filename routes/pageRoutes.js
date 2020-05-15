const router = require('express').Router();
const moment = require('moment');

const { frontpageRedirect, authMiddleware } = require('../middleware/auth');
const { fullUserCredentials } = require('../configs/dbSelection');

const Post = require('../models/Post');
const Friendship = require('../models/Friendship');
const User = require('../models/User');

/** Frontpage */

router.get('/', frontpageRedirect, async (req, res) => {
    return res.render('frontpage/index')
});

/** Get routes */

router.get('/dashboard', authMiddleware, async (req, res) => {
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

    let posts = [] 
        
    await Promise.all(friends.map(async (friend) => {
        let postResult = await Post.query().select()
                        .where('author_id', friend.id)
                        .orderBy('created_at', 'DESC')
                        .limit(1)
                        .withGraphFetched('users');
        postResult.forEach(post => {  
            posts.push(post);
        })
    }));
    
  return res.render('private/dashboard', { friends, requests, posts, moment, user: req.session.user });
});

router.get('/profile/:id', authMiddleware, async (req, res) => {
const user = await User.query().select(fullUserCredentials).findById(req.params.id).withGraphFetched('role');

const isFriends = await Friendship.query().select('id')
                        .where(builder => builder.where('user1_id', req.params.id).andWhere('user2_id', req.session.user.id))
                        .orWhere(builder => builder.where('user2_id', req.params.id).andWhere('user1_id', req.session.user.id));

const posts = await Post.query().select()
                    .where('author_id', req.params.id)
                    .withGraphFetched('users').orderBy('created_at', 'DESC');

if (user) return res.render('private/profile', { user, isAddable: req.session.user.id !== user.id && isFriends.length === 0, posts, moment });
return res.redirect('/dashboard/');
});

router.get('/settings/', authMiddleware, async (req, res) => {
const user = await User.query().select(fullUserCredentials).findById(req.session.user.id).withGraphFetched('role');
return res.render('private/settings', { user })
});

router.get('/find/', authMiddleware, async (req, res) => {
    return res.render('private/find');
});

router.get('/register', frontpageRedirect, async (req, res) => {
    return res.render('frontpage/register', { message: req.flash('message') });
});

router.get('/reset', frontpageRedirect, async (req, res) => {
    return res.render('frontpage/reset', { message: req.flash('message') });
});

module.exports = router;