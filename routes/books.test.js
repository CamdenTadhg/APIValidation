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
                }
            });
        });
        test('returns 404 error if not found', async function(){
            let response = await request(app).get('/books/9782546365245')

            expect(response.error.status).toEqual(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '978160868771",
                    "status": 404
                }
            });
        });
    });

    describe("POST /books/", function(){
        test('adds a book to the database', async function(
            let response = await request(app).post('/books/')
            .send({
                isbn: 
            })
        ){});
        test('returns appropriate errors if invalid data is given', async function(){});
        test('returns appropriate errors if invalid data types are given', async function(){});
    });

    describe("PUT /books/:isbn", function(){
        test('updates an existing book', async function(){});
        test('returns 404 error if not found', async function(){});
        test('returns appropriate errors if invalid data is given', async function(){});
        test('returns appropriate errors if invalid data types are given', async function(){});
    });


    describe("DELETE /books/:isbn", function(){
        test('deletes an existing book', async function(){});
        test('returns 404 error if not found', async function(){});
    })

    afterAll(async function(){
        await db.end();
    });
});