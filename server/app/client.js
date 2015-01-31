'use strict';

    var Node = require('../../shared/core/node'),
     _ = require('lodash'),
     utils = require('../../shared/utils'),
     config = require('../../shared/config.json'),
     Client;

    Client = utils.inherit(Node,{
        constructor: function(id,remote,playersList,game)
        {
            this.playersList = playersList;
            this.id = id;
            this.remote = remote;
            this.laststate = [];

            this.name = null;
            this.color = null;
            this.x = config.canvasWidth/2;
            this.y = config.canvasHeight/2;
            this.vx = 0;
            this.vy = 0;

            this.keys = [];


            this.init();
        },
        init: function()
        {
            //provoke setId on desktop js
            this.remote.setId(this.id);
        },
        otherDisconnected: function(id)
        {
            this.remote.kill(id);
        },
        addKeys: function(keys)
        {
            console.log('GOT KEYS',keys);
            this.keys.push(keys);
        },
        syncGame:function(snapshot)
        {
            //1 Client receives this
            //console.log('SYNC!');
            this.remote.updateState(snapshot);
            //console.log(snapshot);
        },
        velocity: function(){
            return {x:this.vx,y:this.vy};
        },
        spawnEnemy: function(client)
        {
            //serialize ?
            this.remote.spawnEnemy(client.id,client.x,client.y,client.name,client.color,client.velocity);
        },
        serialize: function()
        {
            return {
                x:this.x,
                y:this.y,
                vx:this.vx,
                vy:this.vy,
                keys: this.keys[this.keys.length - 1] || null
            }
        }
    });

module.exports = Client;