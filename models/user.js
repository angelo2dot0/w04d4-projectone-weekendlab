var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var Schema = mongoose.Schema;
var userSchema = new Schema({
	email:{
		type: String,
		unique: true,
    index: true,
    match: /.+\@.+\..+/
	},
  		passwordDigest: String,

});

// create a new user with secure (hashed) password
userSchema.statics.createSecure = function (email, password, callback) {
// `this` references our User model
// store it in variable `UserModel` because `this` changes context in nested callbacks

var UserModel = this;

// hash password user enters at sign up
  bcrypt.genSalt(function (err, salt) {
    console.log('salt: ', salt);  // changes every time
    bcrypt.hash(password, salt, function (err, hash) {

      // create the new user (save to db) with hashed password
      UserModel.create({
        email: email,
        passwordDigest: hash
      }, callback);
    });
  });
};

//SECTION FOR LOGIN AUTHENTICATION PART 1	
// compare password user enters with hashed password (`passwordDigest`)
userSchema.methods.checkPassword = function (password) {
  // run hashing algorithm (with salt) on password user enters in order to compare with `passwordDigest`
  return bcrypt.compareSync(password, this.passwordDigest);
};

//SECTION FOR LOGIN AUTHENTICATION PART 2
// authenticate user (when user logs in)
userSchema.statics.authenticate = function (email, password, callback) {
 // find user by email entered at log in
 this.findOne({email: email}, function (err, foundUser) {
   console.log(foundUser);

   // throw error if can't find user
   if (!foundUser) {
     console.log('No user with email ' + email);
     callback("Error: no user found", null);  // better error structures are available, but a string is good enough for now
   // if we found a user, check if password is correct
   } else if (foundUser.checkPassword(password)) {
     callback(null, foundUser);
   } else {
     callback("Error: incorrect password", null);
   }
 });
};

//Setting and exporting the User model should be the last pieces of logic in user.js
var User = mongoose.model('User', userSchema);

module.exports = User;
