const express = require('express')
require('dotenv').config()
require('./db/mongoose')
const userRoute = require('./routers/user')

const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(userRoute)

app.listen(port ,() => {
    console.log('Server listen at port : ',port);
})

