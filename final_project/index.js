const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const appConfig = require('./config.json');
const app = express();

app.use(express.json());

const secret = "fingerprint_customer";

app.use("/customer",session({secret,resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) {
        let token = req.session.authorization['accessToken']; 
        
        jwt.verify(token, secret,(err,user)=>{
            if(!err){
                req.user = user;
                next();
            } else{
                return res.status(403).json({message: "User not authenticated"})
            }
         });
     } else {
         return res.status(403).json({message: "User not logged in"})
     }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(appConfig.port,()=>console.log("Server is running"));
