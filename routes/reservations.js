var express = require('express');
const Employee = require('../model/employee');
const Room = require('../model/room');
const Reservation = require('../model/reservation');
const User = require('../model/user');
const BasecampClient = require ('../utils/basecamp-client')
const dateUtils = require('../utils/date-utils');
const redirect = require('../utils/redirect');
const {encrypt, decrypt} = require('../utils/crypto')
var router = express.Router();

localParams = function(req, res, next) {
  res.locals.params = req.params;
  next();
};

router.get('/today', async function(req, res, next) {
  res.redirect(dayLink(new Date()))
})


router.get('/:year/:month/:date', localParams, async function(req, res, next) {

  const prevDate = dateUtils.prevDate(req.params.year, req.params.month, req.params.date)
  const nextDate = dateUtils.nextDate(req.params.year, req.params.month, req.params.date)
  
  const user = await User.findById(req.user._id)
  const token = decrypt(user.basecamp.access_token)

  const rooms = await Room.roomsWithReservations(req.params.year, req.params.month, req.params.date)
  let people = await BasecampClient.getColleagues(token)
  
  res.render('reservations/day', { 
    title: 'Prenotazioni',
    rooms,
    people,
    user: req.user,
    prevLink: dayLink(prevDate),
    nextLink: dayLink(nextDate)
  });
});

router.post('/save', async function(req, res, next) {
  const date = dateUtils.localDate(req.body.year, req.body.month, req.body.date)

  //TODO controllare il ruolo per verificare che possa fare prenotazioni per terzi

  //TODO upsert di employee con tutti i dati
  const user = await User.findById(req.user._id)
  const token = decrypt(user.basecamp.access_token)
  const employeeFromApi = await BasecampClient.getPerson(token, req.body.employee)
  const employee = await Employee.findByIdAndUpdate(
        employeeFromApi.id,
        {
          _id: employeeFromApi.id,
          name: employeeFromApi.name,
          email: employeeFromApi.email_address,
          avatarUrl: employeeFromApi.avatar_url
        },
        {
            upsert: true
        }
      )


  const alreadyReserved = await Reservation.findOne({
    employee: req.body.employee,
    date: date
  })

  if (alreadyReserved) {
    req.flash('alert', 'Esiste già una prenotazione per questo giorno')
    redirect(res, dayLink(date))
    return
  }

  console.log(req.body)
  const reservation = new Reservation(req.body)
  reservation.date = date

  await reservation.save()

  redirect(res, dayLink(date))
  return
})

router.delete('/delete/:id', async function(req, res, next) {
  const deleted = await Reservation.findByIdAndDelete(req.params.id)
  redirect(res, dayLink(deleted.date))
})

function dayLinkFromTokens(year, month, date) {
  return `/reservations/${year}/${(month).toString().padStart(2, '0')}/${date.toString().padStart(2, '0')}`
}

function dayLink(date) {
  return dayLinkFromTokens(date.getUTCFullYear(), 1 + date.getUTCMonth(), date.getUTCDate())
}

module.exports = router