const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Error:", err);
});


// User Schema
const UserSchema = new mongoose.Schema({

    username: String,

    password: String,

    balance: {
        type: Number,
        default: 0
    },

    unlimited: {
        type: Boolean,
        default: false
    }

});


const User = mongoose.model("User", UserSchema);




// Register
app.post("/api/register", async (req,res)=>{

    try {

        const {username,password} = req.body;


        const existingUser =
        await User.findOne({username});


        if(existingUser){

            return res.json({
                error:"Account already exists"
            });

        }



        const hashedPassword =
        await bcrypt.hash(password, 12);



        await User.create({

            username,

            password: hashedPassword,

            balance: 0

        });



        const token =
        jwt.sign(
            {username},
            process.env.JWT_SECRET
        );



        res.json({

            success:true,

            token

        });



    } catch(error){

        res.status(500).json({
            error:"Server error"
        });

    }

});








// Login
app.post("/api/login", async(req,res)=>{

    try {


        const {username,password} = req.body;



        const user =
        await User.findOne({
            username
        });



        if(!user){

            return res.json({
                error:"Incorrect password or username/Account doesn't exist"
            });

        }



        const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );



        if(!passwordMatch){

            return res.json({
                error:"Incorrect password or username/Account doesn't exist"
            });

        }



        const token =
        jwt.sign(
            {
                username:user.username
            },
            process.env.JWT_SECRET
        );



        res.json({

            success:true,

            token

        });



    } catch(error){

        res.status(500).json({
            error:"Server error"
        });

    }

});








// Get Account Data
app.get("/api/profile", async(req,res)=>{

    const token =
    req.headers.authorization;


    if(!token){

        return res.status(401).json({
            error:"No token"
        });

    }



    try{


        const decoded =
        jwt.verify(
            token.replace("Bearer ",""),
            process.env.JWT_SECRET
        );



        const user =
        await User.findOne({
            username:decoded.username
        })
        .select("-password");



        res.json(user);



    }catch{

        res.status(401).json({
            error:"Invalid token"
        });

    }

});








// Send Robux
app.post("/api/send", async(req,res)=>{


    const {
        from,
        to,
        amount
    } = req.body;



    const sender =
    await User.findOne({
        username:from
    });



    const receiver =
    await User.findOne({
        username:to
    });



    if(!receiver){

        return res.json({
            error:"Username doesn't exist"
        });

    }



    if(sender.balance < amount){

        return res.json({
            error:"Not enough Robux"
        });

    }



    sender.balance -= amount;

    receiver.balance += amount;



    await sender.save();

    await receiver.save();



    res.json({
        success:true
    });


});








// Withdraw Request
app.post("/api/withdraw", async(req,res)=>{


    const {
        username,
        amount,
        robloxUsername
    } = req.body;



    if(amount < 250){

        return res.json({

            error:
            "Not enough Robux to Withdraw"

        });

    }



    console.log({

        username,

        amount,

        robloxUsername,

        status:"Pending"

    });



    res.json({

        message:
        "Submitted! You'll get your robux in pending within the next 12 hours"

    });


});








// Roblox Gamepass Verification Placeholder
app.post("/api/verify-gamepass",(req,res)=>{


    /*
      Roblox ownership checking goes here.
      This must stay on the server,
      not inside frontend JavaScript.
    */


    res.json({

        message:
        "Verification endpoint ready"

    });


});








// Vercel export
module.exports = app;
