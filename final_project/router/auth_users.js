const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const secret = "fingerprint_customer";

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.find(u => u.username === username) != null;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let foundUser = users.find(u => u.username === username);
    return foundUser.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const credentials = req.body;

    if (!credentials || !credentials.username || ! credentials.password ||
      !isValid(credentials.username)
      ) {
        return res.status(401).json({message: "Invalid login"});
    }

    let user = users.find(u => u.username == credentials.username);
    if (!user) {
      return res.status(401).json({message: "Invalid login"});
    }

    if (authenticatedUser(credentials.username, credentials.password)) {
      let accessToken = jwt.sign({
        data: credentials
      }, secret, { expiresIn: 60 * 60 });

      if (accessToken) {
          req.session.authorization = {
              accessToken
          }
          return res.status(200).send("User successfully logged in");
      }
    }

    return res.status(401).json({message: "Invalid login"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let {message,star} = req.body;
    if (!message || !star) {
        return res.status(200).json({message: `Nothing to review.`});
    }

    let token = req.session.authorization['accessToken']; 
    let decodedJwtToken = jwt.verify(token, secret);
    let sessionUsername = decodedJwtToken.data.username;

    let foundBook = books[req.params.isbn];
  
    if (!foundBook) {
      return res.status(404).json(`Book with ISBN ${req.params.isbn} not found!`);
    }
    
    foundBook.reviews[sessionUsername] = {message, star};
    
  return res.status(200).json({message: `Book review for ISBN ${req.params.isbn} has been added.`});
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    let token = req.session.authorization['accessToken']; 
    let decodedJwtToken = jwt.verify(token, secret);
    let sessionUsername = decodedJwtToken.data.username;

    let foundBook = books[req.params.isbn];
  
    if (!foundBook) {
      return res.status(404).json(`Book with ISBN ${req.params.isbn} not found!`);
    }
    
    delete foundBook.reviews[sessionUsername];
    
    return res.status(200).json({message: `Your book review for ISBN ${req.params.isbn} has been deleted.`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
