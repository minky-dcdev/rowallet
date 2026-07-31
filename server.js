const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();


const app = express();

app.use(express.json());
app.use(cors());



// DATABASE

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Database connected");
})
.catch(err=>{
    console.log(err);
});



const UserSchema = new mongoose.Schema({

    username:{
        type:String,
        unique:true
    },

    password:String,

    balance:{
        type:Number,
        default:0
    }

});


const User = mongoose.model("User",UserSchema);





// AUTH MIDDLEWARE

function auth(req,res,next){

    const token=req.headers.authorization;


    if(!token)
        return res.status(401).json({
            error:"Not logged in"
        });


    try{

        const decoded=
        jwt.verify(
            token.replace("Bearer ",""),
            process.env.JWT_SECRET
        );


        req.user=decoded;

        next();

    }catch{

        res.status(401).json({
            error:"Invalid token"
        });

    }

}






// CREATE ACCOUNT

app.post("/register",async(req,res)=>{


    const {
        username,
        password
    }=req.body;



    const exists=
    await User.findOne({
        username
    });


    if(exists)
        return res.json({
            error:"Account already exists"
        });



    const hashed=
    await bcrypt.hash(password,12);



    await User.create({

        username,

        password:hashed

    });



    const token=
    jwt.sign(
        {
            username
        },
        process.env.JWT_SECRET
    );


    res.json({
        token
    });


});








// LOGIN

app.post("/login",async(req,res)=>{


    const {
        username,
        password
    }=req.body;



    const user=
    await User.findOne({
        username
    });



    if(!user)
        return res.json({
            error:"Incorrect username or password"
        });



    const match=
    await bcrypt.compare(
        password,
        user.password
    );


    if(!match)
        return res.json({
            error:"Incorrect username or password"
        });



    const token=
    jwt.sign(
        {
            username
        },
        process.env.JWT_SECRET
    );


    res.json({
        token
    });


});









// GET PROFILE

app.get("/profile",auth,async(req,res)=>{


    const user=
    await User.findOne({
        username:req.user.username
    })
    .select("-password");


    res.json(user);

});








// SEND ROBUX

app.post("/send",auth,async(req,res)=>{


    const {
        target,
        amount
    }=req.body;



    const sender=
    await User.findOne({
        username:req.user.username
    });


    const receiver=
    await User.findOne({
        username:target
    });



    if(!receiver)
        return res.json({
            error:"Username doesn't exist"
        });



    if(sender.balance < amount)
        return res.json({
            error:"Not enough Robux"
        });



    sender.balance-=amount;

    receiver.balance+=amount;



    await sender.save();

    await receiver.save();



    res.json({
        success:true
    });


});








// WITHDRAW REQUEST

app.post("/withdraw",auth,async(req,res)=>{


    const {
        amount,
        robloxUsername
    }=req.body;



    if(amount < 250)
        return res.json({
            error:"Minimum is 250 Robux"
        });



    // Later:
    // add pending withdrawals database


    res.json({

        message:
        "Submitted! You'll get your robux in pending within the next 12 hours"

    });


});








// ROBLOX VERIFICATION PLACEHOLDER

app.post("/verify-purchase",auth,async(req,res)=>{


    const {
        userId,
        gamepassId
    }=req.body;



    /*
       Here you would check Roblox ownership
       using Roblox APIs from the server.

       Never do this in frontend JS.
    */



    res.json({

        message:
        "Verification system ready for Roblox API"

    });


});








app.listen(
    process.env.PORT || 3000,
    ()=>{
        console.log(
            "ROWALLET server running"
        );
    }
);
