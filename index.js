"use strict";
// load dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Mongo
var MongoClient = require('mongodb').MongoClient;
var dbCreds = require("./database.json");
const MONGO_USER = dbCreds.user;
const MONGO_PASS = dbCreds.pass;
const MONGO_URI = "mongodb://"+MONGO_USER+":"+MONGO_PASS+"@ds147510.mlab.com:47510/sriracha"

// Development dev token
var MonzoDevToken = require("./devtoken.json");
var accessToken = MonzoDevToken.token;
var accountId = MonzoDevToken.account_id;

// Monzo API wrapper
// https://github.com/solidgoldpig/monzo-bank
var monzo = require('monzo-bank');

const port = process.env.PORT || 8080;

function isValidToken(token) {
    return new Promise(function(resolve, reject) {
        monzo.tokenInfo(token)
        .then(function(data) {
            console.log(data);
            if (data.hasOwnProperty("authenticated")) {
                if (data.authenticated) {
                    resolve();
                } else {
                    reject();                    
                }
            } else {
                reject(data); // Api returned the wrong header for some reason
            }
        })
        .catch(function(data) {
            reject(data)
        }); // Something bad happened with the API
    });
}

app.get("/", function(req, res) {
    isValidToken(accessToken)
    .then(function() {
        monzo.createFeedItem({
            account_id: accountId,
            params: {
                title: "siracha sauce best sauce "+Math.random().toString(36).substring(7),
                body: "something else",
                image_url: "https://www.i.imgur.com/TWad5CE.gif"
            }
        }, accessToken)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
    })
    .catch(function() {
        // Refresh the token!
        // TODO Do we get a refresh token? If so where from?
        //monzo.refreshToken(accessToken)
        //.then(function(data) {
        //    res.send("refreshed token");
        //}).catch(function(data) {
        //    // Refresh failed
        //    res.send("Invalid token");
        //});
        res.send("your token sucks");
    })
});

http.listen(port, function(){
    console.log("Server up on http://localhost:%s", port);
});