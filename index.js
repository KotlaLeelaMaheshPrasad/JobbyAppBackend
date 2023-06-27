const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const user = require('./models/user');
const cors = require('cors');
const dotenv=require("dotenv");
dotenv.config();

const app = express();

//origin changed

app.use(cors({ origin: process.env.ORIGIN }));

app.use(express.json());

const create_user = async(username, password, shortBio) => {
    const hashed_password = await bcrypt.hash(password, 10);
    let user_details = {
        _id: new mongoose.Types.ObjectId(),
        username: username,
        password: hashed_password,
        short_bio: shortBio
    };
    await user.create(user_details);
}

const auth = (request, response, next) => {
    //console.log(request.headers.authorization);
    const jwtToken = request.headers.authorization.split(" ")[1];
    //console.log(jwtToken);
    if(!jwtToken)
    response.send("user doesnot logged in")
    const {username} = jwt.verify(jwtToken, process.env.JWT_SECRET_TOKEN);
    request.username = username;
    next();
};

app.get('/', async(request, response) => {
    response.json("Welcome to the JobbyApp Backend");
}) 

app.get('/profile', auth,  async(request, response) => {
    const details = await user.find({username: request.username});
    //console.log(details);
    const profile_details = {
      profile_image_url: "https://assets.ccbp.in/frontend/react-js/male-avatar-img.png",
      name: details[0].username,
      short_bio: details[0].short_bio
    };
    response.json(profile_details);
})

app.post('/login', async(request, response) => {
    //console.log(request.body);
    const {username, password} = request.body;
    //console.log(username);
    const user_details = await user.find({username});
    console.log(user_details);
    let result = false;
    if(user_details.length!==0)
    result = await bcrypt.compare(password, user_details[0].password);
    if(user_details.length===0)
    {
        response.status(401).json('user not present');
    }
    else if(!result)
    response.status(401).json('incorrect password');
    else{
        const token = await jwt.sign({username: username}, process.env.JWT_SECRET_TOKEN, {expiresIn: '1h'});
        response.status(200).json(
          {
            token: token,
            credentials: {
                    username: 'rahul',
                    password: 'rahul@2021'
                }
              });
    }
})

app.post('/register', async(request, response) => {
    const {username, password, shortBio} = request.body;
    console.log(username);
    const user_details = await user.find({username});
    console.log(user_details);
    if(user_details.length !==0){
      console.log("USER ALREADY EXISTS");
        response.status(403).json("username already exists");
    }else{
        await create_user(username, password, shortBio);
        response.status(200).json("user created");
    }
})

const initializeDbandServer = async() => {
    try{
        app.listen(8000);
        await mongoose.connect(process.env.MONGO_URI);
    }catch(err){
            console.log(`Db error: ${err}`);
    }  
}

initializeDbandServer();