const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');

const { sessionCredentials } = require('../configs/dbSelection');
const { authMiddleware } = require('../middleware/auth');


/**
 * Authentication
 */

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.query().select(sessionCredentials).where('username', username);


    if (user.length === 0) return res.redirect('/');

    const foundUser = user[0];

    bcrypt.compare(password, foundUser.password, (err, result) => {
        if (result == true) {
            req.session.user = {
                id: foundUser.id,
                username: foundUser.username,
                email: foundUser.email
            }

            return res.redirect('/dashboard');
        } else {
            console.log("Wrong password");
            return res.redirect('/');
        }
    })

})

router.post('/signup', async (req, res) => {
    const { username, email, password, password_repeat, first_name, last_name, city, postal_code, age } = req.body;

    if (password !== password_repeat) {
        req.flash('message', 'Passwords are not the same!');
        return res.redirect('/register');
    }

    const user = await User.query().select('username').where('username', username).orWhere('email', email);
    if (user.length > 0) {
        req.flash('message', 'User already exists!');
        return res.redirect('/register');
    }

    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
        const newUser = await User.query().insert({
            username,
            email,
            password: hash,
            first_name,
            last_name,
            city,
            postal_code,
            age,
            role_id: 2,
            profile_image: 'noavatar.png'
        });

        req.session.user = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }

        return res.redirect('/dashboard');
    });
})

router.post('/reset', async (req, res) => {
    const { email } = req.body;
    const saltRounds = 10;
    let token = crypto.randomBytes(16).toString('hex');

    bcrypt.hash(token, saltRounds, async (err, hash) => {
        const user = await User.query().patch({
            'password': hash
        }).where('email', email);

        if (user === 1) {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass 
                }
            });

            let info = await transporter.sendMail({
                from: '"Socialize" <noreply@socialize.com>', 
                to: email, 
                subject: "Password reset",
                html: `<b>Your new password is: ${token}</b>`
              });

            console.log(nodemailer.getTestMessageUrl(info));
            return res.redirect('/');
        }
    });

});

router.get('/logout', authMiddleware, (req, res) => {
    req.session.destroy();
    return res.redirect('/');
});


module.exports = router;