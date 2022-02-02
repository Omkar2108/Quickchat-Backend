const express = require('express');
const cors = require('cors');
const {sequelize, Users, messages} = require('./models');
const argon2 = require('argon2');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());
const port = 4000;


app.use(cors());

function check(req, res, next){
    // console.log(req.headers.auth);
    // res.send({req});
    const token = req.headers.auth;
    const user = req.headers.user;
    try{
        jwt.verify(token, user, (err, result)=>{
        // console.log(err, result);
        if(err){
            return res.send({auth:false})
        }
        next();
        })
    }catch(err){
        return res.json({auth:false});
    }
}

app.get('/', check, (req, res)=>{
    res.json({auth:true});
})


app.post('/register',  async (req,res)=>{
    const {email, password} = req.body;
    const hashedPassword = await argon2.hash(password);
    var token;
    try{
        const user = await Users.create({email, password:hashedPassword});
        if(true){
            token = jwt.sign({data: email }, email, { expiresIn: 3600 });
            // console.log(token);
        }
        res.json({auth: true, email, token});
    }catch(err){
        res.status(500).json({err});
    }
})

app.get('/getall', check, async (req,res)=>{
    try{
        return res.json(await Users.findAll());
    }catch(err){
        return res.status(500).json({err});
    }
})

app.post('/forgotpassword', async(req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await Users.findOne({where:{email}});
        if(!user){
            return res.json({message:"User not found"});
        }else if(password==='' && user) {
            return res.json({user:true});
        }
        if(password){
            const hashedPassword = await argon2.hash(password);
            user.password = hashedPassword;
            await user.save();
            return res.json({message:"Password updated"});
        }
        return res.json({user:false, message:"Password not updated"});
    }catch(err){
        res.status(500).json({err});
    }
})

app.get('/get/:id', check, async (req, res)=>{
    try{
        const id = req.params.id;
        const user = await Users.findOne({where: {id}});
        if(!user){
            throw Error("user do not exit");
        }
        return res.json(user);
    }catch(err){
        console.log(err);
        return res.status(500).json({err:err});
    }
})


app.post('/login', async(req, res)=>{
    const {email, password} = req.body;
    try{
        const user = await Users.findOne({where: {email}});
        const result =await argon2.verify(user.password, password);
        if(result){
            const token = jwt.sign({data:email}, email, {expiresIn: 3600});
            return res.json({auth: true, email, token});
        }
        return res.json({auth:false});
    }catch(err){
        console.log(err);
        res.status(500).json({err});
    }
})


app.post('/sendmsg', check, async(req, res)=>{
    const {email, msg} = req.body;
    console.log(email, msg);
    try{
        const newmsg = await messages.create({email, message:msg});
        await newmsg.save();
        return res.json({message:"Message sent"});
    }catch(err){
        // console.log(err);
        res.status(500).json({err});
    }
});

app.get('/getmessages', check, async(req, res)=>{
    try{
        const message = await messages.findAll();
        return res.json(message);
    }catch(err){
        res.status(500).json({err});
    }
})

app.listen(port,async ()=>{
    await sequelize.authenticate();
    console.log(`Listening on port ${port}`);
})




