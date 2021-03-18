const mongoose = require('mongoose')
const Room = require('./room')
const User = require('./user')
const Schema = mongoose.Schema

const reservationSchema = new Schema({
    date: {
        type: Date
    },
    room: {
        type: Schema.Types.ObjectId, ref: 'Room' ,
        required: true
    },
    employee: {
        type: Schema.Types.String, ref: 'Employee'
    }
})

const Reservation = mongoose.model('Reservation', reservationSchema)


module.exports = Reservation