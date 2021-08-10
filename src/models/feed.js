const mongoose = require('mongoose')
const validator = require('validator')

const feedSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,       //foreign key
            required: true,
            ref: 'User'
        },
        image:{
            type:Buffer,
        }
    },
    {
        timestamps:true
    }
    )
const Feed = mongoose.model('Feed', feedSchema)

module.exports = Feed