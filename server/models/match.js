/*****
    Match Mongoose Model
*/
var mongoose = require("mongoose");
var othello = require("./othello.js");

var MatchSchema = new mongoose.Schema({
    winner: {
        type: Number,
        min: -1,  // `-1` -> tie game
        max: 2,
        default: 0  // `0` -> no winner (game still in play)
    },
    turn: {
        type: Number,
        min: 0,  // `0` -> game over 
        max: 2,
        default: 1
    },
    board: [],
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    ai: {
        type: String,
        enum: ["easy_ai", "normal_ai"]
    }
}, {
    timestamps: true
});
MatchSchema.statics.findAllContainingPlayer = function (pid, callback)
{
    var User = mongoose.model("User");
    User.findById(pid, function (err, user) {
        if (err) { callback(err); }
        User.populate(user, "matches", function (err, user) {
            console.log(user);
            callback(err, user.matches);
        });
    });
};
MatchSchema.statics.findAllContainingPlayers = function (pidA, pidB, callback)
/*
    callback(err, matches)
*/
{
    if (pidB == "easy_ai" || pidB == "normal_ai") {
        this.find({
            $and: [
                { players: [pidA] },
                { ai: pidB }
            ]
        }, callback);
    } else {
        this.find({
            $or: [
                { players: [pidA, pidB] }, 
                { players: [pidB, pidA] }
            ]
        }, callback);
    }
};
MatchSchema.statics.findCurrentContainingPlayers = function (pidA, pidB, callback)
/*
    callback(err, match)
*/
{
    this.findAllContainingPlayers(pidA, pidB, function (err, matches) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < matches.length; i++) {
            if (!matches[i].winner) {
                return callback(null, matches[i]);
            }
        }
        return callback(null, null);
    });
};
MatchSchema.statics.findAllContainingPlayersFBID = function (fbidA, fbidB, callback)
/*
    callback(err, matches)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findTwoUsersByFBID(fbidA,fbidB, function (userA, userB, err) {
        if (err) {
            return callback(err, null);
        }
        self.findAllContainingPlayers(userA, userB, callback);
    });
};
MatchSchema.statics.findCurrentContainingPlayersFBID = function (fbidA, fbidB, callback)
/*
    callback(err, match)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findTwoUsersByFBID(fbidA,fbidB, function (userA, userB, err) {
        if (err) {
            return callback(err, null);
        }
        self.findCurrentContainingPlayers(userA, userB, callback);
    });
};
MatchSchema.statics.forfeitMatch = function (matchId, loserId, callback)
/*
    callback(err)
*/
{
    var self = this;
    self.findById(matchId, function (err, match) {
        if (err) { return callback(err); }
        if (!match) { return callback("No Match Found Containing Provided Id"); };
        if (match.winner) {
            return callback("Match Is Already Finished");
        }
        if (match.players[0].toString() == loserId) {
            match.winner = 2;
        } else if (match.players[1].toString() == loserId) {
            match.winner = 1;
        } else {
            return callback("User `" + loserId + "` Not Found In Match `" + match._id + "`");
        }
        match.save(function (err) {
            if (err) { return callback(err); }
            callback();
        });
    });
};
MatchSchema.statics.forfeitMatchWithFBID = function (matchId, loserFBID, callback)
/*
    callback(err)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findByFBID(loserFBID, function (err, loser) {
        if (err) { return callback(err); }
        if (!loser) { return callback("User With Provided FaceBook Id Not Found."); }
        self.forfeitMatch(matchId, loser._id, callback);
    });
};
MatchSchema.pre("save", function (next) {
    if (!this.board.length) {
        this.board = othello.makeEmptyBoard();
    }
    next();
});

mongoose.model("Match", MatchSchema);
