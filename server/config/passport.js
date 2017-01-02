const LocalStrategy = require('passport-local').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../user/userModel.js');
const bcrypt = require('bcrypt-node');
const configAuth = require('./auth.js');

let localSignup = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    emailField: 'email',
    passReqToCallback: true
  },
  (req, username, password, done) => {
    console.log('local-signup config session: ', req.session)
    User.getUserByName(username).then((user) => { 
      if(user) {
        return done(null, false, req.flash('signupMessage', 'That Username is already taken.'));
      } else {
        var newUser = {
          username: username,
          password: bcrypt.hashSync(password, null, null),
          email: req.body.email
        };
        User.storeUser(newUser.username, newUser.password, newUser.email).then((data) => {
          console.log('DATA: ',data);
          return done(null,data);
        });
      }
    })
  });

let localLogin = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, username, password, done) => {
    User.getUserByName(username).then((user) => {
      console.log('LOCAL LOGIN USER: ', user)
      if(!user){
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }     
      if(!bcrypt.compareSync(password, user.password)) {
        return done(null, false, req.flash('loginMessage', 'Wrong password!'));
      }
      console.log('passwordsMatch: ', bcrypt.compareSync(password, user.password))
      console.log('FOUND USER LOCAL-LOGIN')
      return done(null, user);
    })
  });

var spotifyLogin = new SpotifyStrategy({
  clientID: configAuth.spotifyAuth.clientId,
  clientSecret: configAuth.spotifyAuth.clientSecret,
  scope: configAuth.spotifyAuth.scope,
  callbackURL: configAuth.spotifyAuth.callbackURL
},
(token, refreshToken, profile, done) => {
  console.log('SPOTIFY_TOKEN: ', token);
  console.log('SPOTIFY_REFRESH_TOKEN: ', refreshToken);
  console.log('SPOTIFY_PROFILE: ', profile);
  let username = profile.id;
  let email = profile._json.email;
  let spotifyUser = {
    token: token,
  };
  console.log('SPOTIFY_username: ', spotifyUser.username)
  console.log('SPOTIFY_email: ', spotifyUser.email)
  console.log('SPOTIFY_profile: ', JSON.stringify(spotifyUser))
  User.getUserByName(username).then((user) => {
      console.log("SPOTIFY USER: ", user);
    if(!user){
      User.storeUser(username, null, email, null, JSON.stringify(spotifyUser)).then((data) => {
        console.log('SPOTIFY DATA: ', data)
        return done(null, data);
      });
    }
    return done(null, user);
  });
});

module.exports = function(passport) {
  let user;
  passport.serializeUser((user, done) => {
    console.log('serializeUser: ', user)
    if(Array.isArray(user)) {
      var id = user[0]
      user = {
        id:id
      }
    }
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.getUserById(id).then((data) => {
      passport.spotifyUser = data;
      done(null, data);
    });
  });

  passport.use('local-signup',localSignup);
  passport.use('local-login',localLogin);
  passport.use('spotify-login',spotifyLogin);
}