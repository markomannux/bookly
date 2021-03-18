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
  roles: [String],
  basecamp: {
    access_token: {
      iv: String,
      content: String
    },
    refresh_token: {
      iv: String,
      content: String
    },
    expires_at: Date
  },
  employee: {
      type: Schema.Types.String, ref: 'Employee' ,
      required: false
  },
})

const User = mongoose.model('User', userSchema);

module.exports = User;