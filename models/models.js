const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const kittySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
    },
    person:{
        type: Number
    },
    comment: {
        type: String,
        trim: true
    },
    password:{
        type: String,
    },
    confirmpassword: {
        type: String,
    }
});

kittySchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        let hash = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, hash)
        this.confirmpassword = await bcrypt.hash(this.password, hash)
    }
    next();
})

const User = mongoose.model('User', kittySchema);

module.exports = User;