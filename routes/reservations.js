var express = require('express');
const Room = require('../model/room');
const Reservation = require('../model/reservation');
const dateUtils = require('../utils/date-utils');
const redirect = require('../utils/redirect');
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
  
  const rooms = await Room.roomsWithReservations(req.params.year, req.params.month, req.params.date)
  res.render('reservations/day', { 
    title: 'Prenotazioni',
    rooms,
    user: req.user,
    prevLink: dayLink(prevDate),
    nextLink: dayLink(nextDate)
  });
});

router.post('/save', async function(req, res, next) {
  const date = dateUtils.localDate(req.body.year, req.body.month, req.body.date)

  const alreadyReserved = await Reservation.findOne({
    user: req.user._id,
    date: date
  })

  if (alreadyReserved) {
    res.redirect(dayLink(date))
    return
  }

  const reservation = new Reservation(req.body)
  reservation.date = date
  reservation.user = req.user._id

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