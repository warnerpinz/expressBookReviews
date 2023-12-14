const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  /**
   * The code should take the ‘username’ and ‘password’ provided in the body of the request for registration. 
   * If the username already exists, it must mention the same & must also show other errors like eg. when username &/ password are not provided.
   */
   let exist = users.find(u => u.username === req.body.username);

   if (exist) {
    return res.status(404).json({message: "User already exists!"});
   }

   if (!req.body.username || !req.body.password) {
    return res.status(404).json({message: "Username or password not provided!"});
   }

   users.push({username: req.body.username, password: req.body.password});

  return res.status(200).json({message: `User ${req.body.username} successfully registered!`});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

public_users.get("/books", async (req, res, next) => {
  let books = {};
  try {
    const response = await axios.get("http://localhost:6000/");
    return res.status(200).json(response.data);
  } catch(err) {
    console.error(err);
    return res.status(200).json(books);
  }
})


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let foundBook = Object.entries(books)
                        .find(([isbn, data] = book) => isbn === req.params.isbn);


    if (foundBook) {
        return res.status(200).json(foundBook);
    }

    return res.status(404).json({message: `Book with ISBN ${req.params.isbn} not found!`});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let booksByAuthor = Object.keys(books)
        .filter(isbn => books[isbn].author == req.params.author)
        .map(isbn => books[isbn]);
    return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let booksByTitle = Object.keys(books)
        .filter(isbn => books[isbn].title == req.params.title)
        .map(isbn => books[isbn]);
    return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let booksReviewsByIsbn = books[req.params.isbn].reviews;

    return res.status(200).json(booksReviewsByIsbn);
});

module.exports.general = public_users;
