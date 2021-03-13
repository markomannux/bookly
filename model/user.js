const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
      type: String
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  roles: [String]
})

const User = mongoose.model('User', userSchema);

module.exports = User;