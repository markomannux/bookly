var express = require('express');
const Room = require('../model/room');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Room.find().then(rooms => {
    res.render('rooms/index', { title: 'Stanze', rooms });
  })
});

router.get('/create', function(req, res, next) {
  res.render('rooms/create', { title: 'Nuova Stanza', room: {} });
});

router.post('/save', function(req, res, next) {
    const room = new Room(req.body)
    room.save().then(() => {
        res.redirect('/rooms')
    })
    .catch((err) => {
        console.log(err);
        res.render('rooms/create', { title: 'Nuova Stanza', room, err });
    })
});

router.get('/edit/:id', function(req, res, next) {
    Room.findById(req.params.id).then(room => {
        res.render('rooms/edit', { title: 'Modifica Stanza', room });
    })
});

router.post('/update', async function(req, res, next) {
    let room = req.body
    try {
      room = await Room.findByIdAndUpdate(
          req.body.id,
          req.body
      )
    res.redirect('/rooms')
    } catch(err) {
      console.log(err);
      res.render('rooms/edit', { title: 'Nuova Stanza', room, err });
    }
});

router.post('/delete/:id', function(req, res, next) {
  Room.findById(req.params.id)
  .then((room) => {
    room.delete() })
  .then(() => {
    res.redirect('/rooms')
  })
})

module.exports = router;
