const express = require('express')
const parser = require('body-parser')
const mongoose = require('./db/schema.js')
const Phrase = mongoose.model('Phrase')
const GameState = mongoose.model('GameState')
const Game = mongoose.model('Game')
const cors = require('cors')
const random = require('mongoose-random')

const app = express()

app.set('port', process.env.PORT || 3001)
app.use(parser.urlencoded({extended: true}))
app.use(parser.json())
app.use(cors())

app.get('/api/game', (req, res) => {
  Game.find()
  .then((games)=> {
    res.json(games)
  })
  .catch((err) => {
    console.log(err)
  })
})

app.put('/api/game/:id', (req, res) => {
  Game.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
    .then((game) => {
      res.json(game)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get('/api/game/:id', (req, res) => {
  Game.findOne({_id: req.params.id})
  .then((game) => {
    res.json(game)
  })
  .catch((err) => {
    console.log(err)
  })
})

app.post('/api/game', (req, res) => {
  Game.create(req.body)
    .then((game) => {
      Phrase.find()
      .then((phrase) => {
        game.phrase = phrase[(Math.floor(Math.random() * phrase.length))].phrase
        game.save()
        .then((game) => {
          res.status(200).json(game)
        })
      })
      res.json(game)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get('/api/game/:id/history', (req, res) => {
  Game.findOne({_id: req.params.id})
    .then((game) => {
      res.json(game.history)
    })
  })

app.post('/api/game/:id/history', (req, res) => {
  Game.findOne({_id: req.params.id})
    .then((game) => {
      let newGameState = new GameState(req.body)
        game.history.push(newGameState)
        game.guesses += 1
        if (game.guesses === game.player) {game.complete = true}
        game.save()
          .then((game) => {
            res.status(200).json(game)
          })
    })
})

app.delete('/api/game/:id', (req, res) => {
  Game.findOneAndRemove({_id: req.params.id})
  .then(() => {
    res.redirect('/api/game')
  })
})

app.listen(app.get('port'), () => {
  console.log('Server listening on port ' + app.get('port'))
})
