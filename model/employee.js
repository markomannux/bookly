const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  _id: {
      type: String
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  avatarUrl: {
    type: String
  }
})

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;