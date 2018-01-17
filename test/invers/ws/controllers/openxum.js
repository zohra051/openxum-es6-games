'use strict';

let jsonfile = require('jsonfile');
let crypto = require('crypto');

const directory = './data/';

let OpenXum = require('../../../openxum');

exports = module.exports = function () {
  return {
    // New move of opponent player
    move: function (req, res) {
      const token = req.body.id;
      const file_name = directory + req.body.game + '_' + token + '.json';
      let data = JSON.parse(req.body.move);
      let obj = jsonfile.readFileSync(file_name);

      obj.moves.push(data);
      jsonfile.writeFileSync(file_name, obj);
      res.status(200).json({});
    },

    // Next move of player
    next_move: function (req, res) {
      const token = req.body.id;
      const file_name = directory + req.body.game + '_' + token + '.json';
      let obj = jsonfile.readFileSync(file_name);
      let engine = new OpenXum[req.body.game].Engine(obj.type, obj.color);
      let player = new OpenXum.MCTSPlayer(obj.player_color, engine);

      for (let i = 0; i < obj.moves.length; ++i) {
        let move = obj.moves[i];

        engine.apply_move(move);
      }

      let move = player.move();

      obj.moves.push(move.to_object());
      jsonfile.writeFileSync(file_name, obj);
      res.status(200).json(move.to_object());
    },

    // New game
    new_game: function (req, res) {

      crypto.randomBytes(32, function(err, buffer) {
        const token = buffer.toString('hex');
        const file_name = directory + req.body.game + '_' + token + '.json';

        jsonfile.writeFileSync(file_name, {game: req.body.game, type: req.body.type, color: req.body.color, player_color: req.body.player_color, moves: []});
        res.status(200).json({id: token});
      });
    }
  };
};