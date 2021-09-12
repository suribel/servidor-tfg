const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        require: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true,
    },
    avatar: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        require: true,
        trim: true,
    },
    role: {
        type: String, 
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
    active: Boolean,
    confirmation_code: {
        type: String,
        unique: true,
    },
    reset_password_code: {
        type: String,
    },
    reset_password_exp: {
        type: Date,
    },
    verificate: {
        type: Boolean,
        default: false
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);
