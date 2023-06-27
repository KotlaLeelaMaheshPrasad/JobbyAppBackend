const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: [true, 'usename is required'],
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'password is required']
    },
    short_bio: {
        type: String,
        required: [true, 'short_bio is required']
    }
}, {timestamps: true});

const user = mongoose.model('users', userschema);

module.exports = user;