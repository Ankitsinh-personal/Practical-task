const express = require('express')
require('dotenv').config()
require('./db/mongoose')
const userRoute = require('./routers/user')
const feedRoute = require('./routers/feed')

const app = express()

const port = process.env.PORT

app.use(express.json())     //method inbuilt in express to recognize the incoming Request Object as a JSON Object. 
                            //This method is called as a middleware in your application
app.use(userRoute)
app.use(feedRoute)

app.listen(port ,() => {
    console.log('Server listen at port : ',port);
})

