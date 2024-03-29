var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser((id,done)=>{
    User.findById(id,  (err,user)=>{
        done(err,user);
    })
})

passport.use('local.signup', new LocalStrategy({  
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.check('name')
     .isLength({min:3}).withMessage('Name must be of 3 characters long.');
    //  .matches(/^[A-Za-z\s]+$/).withMessage('Name must be alphabetic.');
    req.check('email','Email is invalid.').isEmail();
    req.check("password", "...")
     .isLength({min:8}).withMessage('Password must be of 8 characters long.')
    //  .matches(/^[<A-Za-z0-9></A-Za-z0-9>\s]+$/).withMessage('Password should be combination of one uppercase , one lower case, one digit and min 8 , max 20 char long')
     .equals(req.body.password2).withMessage('Password do not match.');
     var errors = req.validationErrors();
     if (errors) {
         var messages = [];
         errors.forEach(function(error){
             messages.push(error.msg);
         })
         return done (null,false,req.flash('error',messages));
     }

    User.findOne({'email': email}, function(err,    user){
        if (err) return done(err);
        if (user) return done(null, false, {message: 'Email already exists.'})
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err,result) => {
            if (err) done(err);
            return done(null, newUser);
        })
    })
}))

passport.use('local.login',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback:true 
},function(req,email,password,done) {
    req.check('email','Email is invalid.').isEmail().notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        })
        return done (null,false,req.flash('error',messages));
    }
    User.findOne({'email':email},function(err,user){
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null,false,{message: 'No User found.'})
        }
        if (!user.validPassword(password)){
            return done(null,false,{message: 'Wrong Password.'})
        }
        return done(null,user);
    })
}))