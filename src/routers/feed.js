const express = require('express')
const auth = require('../middleware/auth')
const Feed = require('../models/feed')
const multer = require('multer')
const router = new express.Router()


//upload image
const upload = multer({
    dest : 'image',
    limits : {
        fieldSize : 100000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('File must be image !'))
        }
        cb(undefined, true)
    }
})
//feed create
router.post('/feed',auth,upload.single('image'), async (req, res) => {
    
    try {
        const feed = new Feed({
            ...req.body,
            image:req.file.filename,
            owner:req.user._id           
        })
        await feed.save()
        res.status(201).send(feed)
    } catch (e) {
        res.status(400).send(e.message)
    }
})



//feed list
router.get('/feed',auth, async (req, res) => {

    const match={}
    const sort = {}
    if(req.query.message){
        match.message = req.query.message
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1           //localhost:3000/feed?sortBy=createdAt:desc
    }

    try {
        await req.user.populate({
            path:'feed',
            match,
            options:{
                limit:parseInt(req.query.limit),         // give only 2 feed per page  feed?limit=10&skip=0  => start with first page , per page =10
                skip:parseInt(req.query.skip),
                sort
            },

        }).execPopulate() 
        res.send(req.user.feed)
        
    } catch (e) {
        res.status(500).send(e.message)
    }

})

//feed details
router.get('/feed/:id',auth, async (req, res) => {
    
    try {
        const _id = req.params.id
        const feed = await Feed.findOne({_id,owner:req.user._id})   //only user related feed, other feed not available
        if (!feed) {
            return res.status(404).send('no feed !!')
        }
        res.send(feed)

    } catch (e) {
        res.status(500).send(e.message)
    }
})

//feed update
router.patch('/feed/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates =['message']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        res.status(400).send('Invalid Updates !')
    }
    try {
        const feed = await Feed.findOne({_id:req.params.id, owner:req.user._id})
           if (!feed) {
            return res.status(404).send('no feed !!')
        }
        updates.forEach((update)=> feed[update]=req.body[update])
        await feed.save()
        res.send(feed)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

//feed delete
router.delete('/feed/:id',auth,async(req,res)=>{
    try{
        const feed = await Feed.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!feed){
            res.status(404).send('no feed for delete !!')
        }
        res.send(feed)
    }catch(e){
        res.status(500).send(e.message)
    }
})

module.exports = router