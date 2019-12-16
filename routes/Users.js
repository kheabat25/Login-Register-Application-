const express = require('express');
const users = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const User = require('../models/Users');
users.use(cors());

process.env.SECRET_KEY = 'secret';

users.post('/register', (req, res) => {
  const today = new Date();
  const userData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    created: today
  };

  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        bcryptjs.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          User.create(userData)
            .then(user => {
              console.log({ status: user.email + ' registered' });
              res.json({ status: user.email + ' registered' });
            })
            .catch(err => {
              console.error(`error: ${err}`);
              res.send(`error: ${err}`);
            });
        });
      } else {
        console.error({ error: 'User already exists' });
        res.json({ error: 'User already exists' });
      }
    })
    .catch(err => {
      res.send('error: ' + err);
    });
});

users.post('/login', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (user) {
        if (bcryptjs.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
            expiresIn: 1440
          });
          console.log(token);
          res.send(token);
        }
      } else {
        console.log({error: 'User does not exist'})
        res.status(400).json({ error: 'User does not exist' });
      }
    })
    .catch(err => {
      console.error({error: err})
      res.status(400).json({ error: err });
    });
});
module.exports = users;
