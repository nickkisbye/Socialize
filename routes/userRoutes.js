const router = require('express').Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const { authMiddleware } = require('../middleware/auth');
const { userSearchCredentials } = require('../configs/dbSelection');

/**
 * POST
 */

router.post('/update', authMiddleware, async (req, res) => {
    const { username, email, first_name, last_name, city, postal_code, age, profile_text } = req.body;
    await User.query().findById(req.session.user.id).patch({ username, email, first_name, last_name, city, postal_code, age, profile_text });
    return res.redirect('/dashboard');
});

router.post('/search', authMiddleware, async (req, res) => {
    const { search_result } = req.body;
    const result = await User.query().select(userSearchCredentials).where('first_name', 'like', `%${search_result}%`).orWhere('last_name', 'like', `%${search_result}%`);
    return res.send({ result });
});

/**
 * Friend requests
 */

router.post('/add/:id', authMiddleware, async (req, res) => {
    const friendship = await Friendship.query().insert({ 
        'user1_id': req.session.user.id,
        'user2_id': req.params.id,
        'is_accepted': 0
     });
     return res.send({ friendship });
});

router.post('/accept/:id', authMiddleware, async (req, res) => {
    const friendship = await Friendship.query().patch({
        'is_accepted': 1
     }).where(builder => builder.where('user1_id', req.params.id).andWhere('user2_id', req.session.user.id));
     
     return res.send({ friendship });
});

router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const friendship = await Friendship.query().delete()
        .where(builder => builder.where('user1_id', req.params.id).andWhere('user2_id', req.session.user.id))
        .orWhere(builder => builder.where('user2_id', req.params.id).andWhere('user1_id', req.session.user.id));
     return res.send({ friendship });
});

module.exports = router;