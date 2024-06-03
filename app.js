/** Express app for bookstore. */


const express = require("express");
const app = express();

app.use(express.json());

const ExpressError = require("./expressError")
const bookRoutes = require("./routes/books");

app.use("/books", bookRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});


/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;

//read through code
// create database and run data.sql file
//use JSON Schema to validate the creation and updating of books. Display an error message containing all of the validation errors if book creation or updating fails.
// add integration tests for all book routes with edge cases (set process.env.NODE_ENV = "test" in file

//create functionality to partially update a book (not all fields)
//write test for functionality to partially update a book
//build a front end
//add a more complex database schema. Tag books by genre. Create many to many relationship between authors and books. Redesign the database and then build it, with new routes and tests as needed