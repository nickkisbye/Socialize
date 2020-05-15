const router = require('express').Router();
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST
 */

router.post('/post', authMiddleware, async (req, res) => {
    const { text } = req.body;
    if(text.length < 2) return;
    const post = await Post.query().insert({ text: text, author_id: req.session.user.id }).withGraphFetched('users');
    return res.send({ post });
});

/**
 * DELETE
 */

router.get('/post/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    await Post.query().delete().where('id', id).andWhere('author_id', req.session.user.id);
    return res.redirect('/profile/' + req.session.user.id);
})



module.exports = router;