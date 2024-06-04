const request = require("supertest");
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

process.env.NODE_ENV = "test"

describe("Book Routes Test", function() {
    beforeEach(async function(){
        await db.query("DELETE FROM books");

        let book1 = await Book.create({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane", 
            language: "English",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
    });

    describe("GET /books/", function(){
        test('retrieves all existing books', async function() {
            let response = await request(app).get('/books/');
            console.log('response is', response);

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({"books": [{            
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane", 
                "language": "English",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017}]});
        });
    });

    describe("GET /books/:isbn", function(){
        test('retrieves an existing book', async function(){
            let response = await request(app).get('/books/0691161518');

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Matthew Lane",
                    "language": "English",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2017}});
        });
        test('returns 404 error if not found', async function(){
            let response = await request(app).get('/books/9782546365245')

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '9782546365245",
                    "status": 404
                }
            });
        });
    });

    describe("POST /books/", function(){
        test('adds a book to the database', async function(){
            let response = await request(app).post('/books/').send({
                book: {
                    isbn: "9781608687718",
                    amazon_url: "https://www.amazon.com/Barking-Up-Right-Tree-Practice/dp/1608687716",
                    author: "Camden Tadhg", 
                    language: "English", 
                    pages: 376,
                    publisher: "New World Library", 
                    title: "Barking Up the Right Tree", 
                    year: 2023
                }});
            let query = await db.query(`SELECT isbn FROM books WHERE title = 'Barking Up the Right Tree'`)
            expect(response.status).toEqual(201);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "9781608687718",
                    "amazon_url": "https://www.amazon.com/Barking-Up-Right-Tree-Practice/dp/1608687716",
                    "author": "Camden Tadhg",
                    "language": "English",
                    "pages": 376,
                    "publisher": "New World Library",
                    "title": "Barking Up the Right Tree",
                    "year": 2023
                }});
            expect(query.rows).toEqual([{isbn: '9781608687718'}]);
        });
        test('returns appropriate errors if invalid data is given', async function(){
            let response = await request(app).post('/books/').send({
                book: {
                    isbn: "978160868771",
                    amazon_url: "amazon.com/Barking-Up-Right-Tree-Practice/dp/1608687716", 
                    author: "Camden Tadhg",
                    language: "English",
                    pages: -10,
                    publisher: "New World Library",
                    title: "The Barking Up the Right Tree",
                    year: 2023
                }});
            let query = await db.query(`SELECT isbn FROM books WHERE title = 'The Barking Up the Right Tree'`);
            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                "error": {
                    "message": [
                        "instance.book.isbn does not match pattern \"^(?:.{10}|.{13})$\"",
                        "instance.book.amazon_url does not conform to the \"uri\" format",
                        "instance.book.pages must be strictly greater than 0",
                        "instance.book.title does not match pattern \"^(?!The |An |A (?!is )).*$\""
                    ],
                    "status": 400
                }});
            expect(query.rows).toEqual([]);
        });
        test('returns appropriate errors if invalid data types are given', async function(){
            let response = await request(app).post('/books/').send({
                book: {
                    isbn: 9781254689524,
                    amazon_url: true,
                    author: 10,
                    language: false,
                    pages: "10", 
                    publisher: 123,
                    title: 25,
                    year: "2023"
                }});
            let query = await db.query(`SELECT isbn FROM books WHERE title = 'The Barking Up the Right Tree'`);
            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                    "error": {
                        "message": [
                            "instance.book.isbn is not of a type(s) string",
                            "instance.book.amazon_url is not of a type(s) string",
                            "instance.book.author is not of a type(s) string",
                            "instance.book.language is not of a type(s) string",
                            "instance.book.pages is not of a type(s) integer",
                            "instance.book.publisher is not of a type(s) string",
                            "instance.book.title is not of a type(s) string",
                            "instance.book.year is not of a type(s) integer"
                        ],
                        "status": 400
                    }
                });
            expect(query.rows).toEqual([]);
        });
    });

    describe("PUT /books/:isbn", function(){
        test('updates an existing book', async function(){
            let response = await request(app).put('/books/0691161518').send({
                book: {
                    amazon_url: "http://www.amazon.com/Power-Up-Unlocking-Hidden-Mathematics-Video/dp/0691196389",
                    author: "Matthew Lane", 
                    language: "English",
                    pages: 296,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2019
                }});
            let query = await db.query(`SELECT year FROM books WHERE author = 'Matthew Lane'`);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0691161518", 
                    "amazon_url": "http://www.amazon.com/Power-Up-Unlocking-Hidden-Mathematics-Video/dp/0691196389",
                    "author": "Matthew Lane", 
                    "language": "English", 
                    "pages": 296,
                    "publisher": "Princeton University Press", 
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2019
                }});
            expect(query.rows).toEqual([{year: 2019}]);
        });
        test('returns 404 error if not found', async function(){
            let response = await request(app).put('/books/9782546365245').send({    
                book: {
                    amazon_url: "http://www.amazon.com/Power-Up-Unlocking-Hidden-Mathematics-Video/dp/0691196389",
                    author: "Matthew Lane", 
                    language: "English",
                    pages: 296,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2019
                }});
            let query = await db.query(`SELECT year FROM books WHERE author = 'Matthew Lane'`);

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '9782546365245",
                    "status": 404
                }});
            expect(query.rows).toEqual([{year: 2017}]);
        });
        test('returns appropriate errors if invalid data is given', async function(){
            let response = await request(app).put('/books/0691161518').send({
                book: {
                    amazon_url: "a.co/eobPtX2",
                    author: "Matthew Lane", 
                    language: "English",
                    pages: -3,
                    publisher: "Princeton University Press",
                    title: "The Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }});
            let query = await db.query(`SELECT year FROM books WHERE author = 'Matthew Lane'`);
            
            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                "error": {
                    "message": [
                        "instance.book.amazon_url does not conform to the \"uri\" format",
                        "instance.book.pages must be strictly greater than 0",
                        "instance.book.title does not match pattern \"^(?!The |An |A (?!is )).*$\""
                    ],
                    "status": 400
                }});
            expect(query.rows).toEqual([{year: 2017}]);

        });
        test('returns appropriate errors if invalid data types are given', async function(){
            let response = await request(app).put('/books/0691161518').send({
                book: {
                    amazon_url: 23,
                    author: true, 
                    language: 11,
                    pages: "264",
                    publisher: false,
                    title: 2017,
                    year: "2017"
                }});
            let query = await db.query(`SELECT year FROM books WHERE author = 'Matthew Lane'`);

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                "error": {
                    "message": [
                        "instance.book.amazon_url is not of a type(s) string",
                        "instance.book.author is not of a type(s) string",
                        "instance.book.language is not of a type(s) string",
                        "instance.book.pages is not of a type(s) integer",
                        "instance.book.publisher is not of a type(s) string",
                        "instance.book.title is not of a type(s) string",
                        "instance.book.year is not of a type(s) integer"
                    ],
                    "status": 400
                }
            });
            expect(query.rows).toEqual([{year: 2017}]);
        });
    });


    describe("DELETE /books/:isbn", function(){
        test('deletes an existing book', async function(){
            let response = await request(app).delete('/books/0691161518');
            let query = await db.query(`SELECT isbn FROM books WHERE author = 'Matthew Lane'`);

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                "message": "Book deleted"
            });
            expect(query.rows).toEqual([]);
        });
        test('returns 404 error if not found', async function(){
            let response = await request(app).delete('/books/2569875412365');

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '2569875412365",
                    "status": 404
                }});
        });
    })

    afterAll(async function(){
        await db.end();
    });
});