const express= require("express");
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path=require('path');
require('dotenv/config');
const {Users} = require('./users');
var bodyParser = require('body-parser');


//middleware
app.use(express.static(path.join(__dirname,'./public')));
app.use(express.json());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Routes 

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname,'./public/custlogin.html'));
      
  });

  app.get('/showRegister', (req, res) => {

    res.sendFile(path.join(__dirname,'./public/custregister.html'));
      
  });


  app.post(`/register`, async (req, res) =>{

    let hashPassword = await bcrypt.hash(req.body.password, 10);
    console.log(req.params);
    const user = new Users({
        firstname: req.body.fname,
        lastname: req.body.lname,
        username: req.body.username,
        password: hashPassword
    });
    

    user.save().then((createdUser => {
            res.status(201).json(createdUser)
    })).catch((err)=>{
        console.log(err);
        res.status(500).json({

            error: err,
            success: false
        })
    }) 

});




app.post('/login', async (req, res) => {    try {
    const user = await Users.findOne({username:req.body.username});
    
    if(!user) {
        res.status(500).json({success: false});

    } 
    else{

        let submittedPass = req.body.password; 
        let storedPass = user.password; 
        
        const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
        if (passwordMatch) {
            let usrname = user.username;
            res.status(200).send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'>`);
        } else {
            res.status(200).send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='/'>login again</a></div>");
        }


        
    }
    
}
catch(err){
    console.log(err);
}
});


// Database
mongoose.connect(process.env.CONNECTION_STRING,
    {useNewUrlParser: true,useUnifiedTopology: true })
.then(()=>
{
    console.log('Connection Successfull mong');
}
).catch((err)=>
    {
            console.log(err);
    })


//Server
app.listen(3000, () => {
    console.log('Running the server successfully on port 3000');
})