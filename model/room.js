const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const dateUtils = require('../utils/date-utils')


const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    archived: {
        type: Boolean,
    },
    notAvailableOn: [
        {type: Date}
    ]
})

const Room = mongoose.model('Room', roomSchema)

Room.roomsWithReservations = async (year, month, date) => {
  const d = dateUtils.localDate(year, month, date)
  return await Room.aggregate(
    [
    {
        '$lookup': {
        'from': 'reservations', 
        'let': {
            'room_id': '$_id'
        }, 
        'pipeline': [
            {
            '$match': {
                '$expr': {
                '$and': [
                    {
                    '$eq': [
                        '$room', '$$room_id'
                    ]
                    }, {
                    '$eq': [
                        '$date', d
                    ]
                    }
                ]
                }
            }
            }, {
            '$lookup': {
                'from': 'users', 
                'localField': 'user', 
                'foreignField': '_id', 
                'as': 'user'
            }
            }, {
            '$unwind': {
                'path': '$user'
            }
            }
        ], 
        'as': 'reservations'
        }
    }, {
        '$addFields': {
            'capacityLeft': {
                '$subtract': [
                    '$capacity', {
                        '$size': '$reservations'
                    }
                ]
            }
        }
    }
    ]
  )
}

module.exports = Room