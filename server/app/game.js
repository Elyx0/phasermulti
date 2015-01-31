'use strict';

    var Node = require('../../shared/core/node'),
     _ = require('lodash'),
     utils = require('../../shared/utils'),
     config = require('../../shared/config.json'),
     p2 = require('p2'),
     Game;

    Game = utils.inherit(Node,{
        constructor: function(clients)
        {
            this.clients = clients;
            this._snapshotSequence = 0;
            this.init();
        },
        init: function()
        {
            //Create P2 World
            this.world = {};
            this._startedAt = _.now();
            setInterval(this.gameLoop.bind(this), 1000 / config.tickRate)
        },
        gameLoop: function()
        {
            var now = _.now(),
                elapsed = now - this._lastTickAt;
            this.updateEntities();
            this.syncClients();
            this._lastTickAt = now;
        },
        syncClients: function()
        {
            //don't sync all the time clients to let them interpolate
            if (!this._lastSync || _now() - this._lastTickAt > 1000 / config.syncRate)
            {
                //Sync !
                var snapshot = this.createSnapshot();
                for (var id in this.clients)
                {
                    this.clients[id].syncGame(snapshot);
                }
            }
        },
        createSnapshot: function()
        {
            var snapshot = {};
            snapshot.clients = {};
            snapshot._takenAt = _.now();
            snapshot._elapsed = snapshot._takenAt - this._startedAt;
            snapshot.sequence = this._snapshotSequence++;
            for (var id in this.clients)
            {
                snapshot.clients[this.clients[id].id] = this.clients[id].serialize();
            }

            return snapshot;
        },
        updateEntities: function()
        {

        }
    });

module.exports = Game;