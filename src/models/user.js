const mongoose = require('mongoose')
const validator = require('validator')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
                }
            }
        },
        password: {
            type: String,
            trim: true,
            minlength: 7,
            required: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password can not contain password')
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
    },
    {
        timestamps:true
    }
)

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() } , process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token: token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })

    if (!user) {
        throw new Error('Unable to login !')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login !')
    }
    return user
}

const User = mongoose.model('User', userSchema)
module.exports = User