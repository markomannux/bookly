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
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    }
})

const Reservation = mongoose.model('Reservation', reservationSchema)


module.exports = Reservation