process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

// Before each functions
beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '12341234',
          'https://amazon.com/books',
          'John Johnson',
          'English',
          100,
          'Nothing publishers',
          'I am a Book Title', 2008)
        RETURNING isbn`);

    book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
    test("Gets a list of books", async function () {
        const response = await request(app).get(`/books`);
        const books = response.body.books;

        expect(response.status).toBe(200);

        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
        expect(books[0]).toHaveProperty("author");
        expect(books[0]).toHaveProperty("language");
        expect(books[0]).toHaveProperty("pages");
        expect(books[0]).toHaveProperty("publisher");
        expect(books[0]).toHaveProperty("title");
        expect(books[0]).toHaveProperty("year");
    });
});

describe("GET /book/:id", function () {
    test("Gets a book by ispn", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);
        const book = response.body.book;

        expect(response.status).toBe(200);

        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("amazon_url");
        expect(book).toHaveProperty("author");
        expect(book).toHaveProperty("language");
        expect(book).toHaveProperty("pages");
        expect(book).toHaveProperty("publisher");
        expect(book).toHaveProperty("title");
        expect(book).toHaveProperty("year");
    });
});

describe("POST /books", function () {
    test("Creates a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                book: {
                    isbn: "32794782",
                    amazon_url: "https://taco.com",
                    author: "mctest",
                    language: "english",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000,
                },
            });

        const book = response.body.newBook;

        expect(response.status).toBe(201);

        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("amazon_url");
        expect(book).toHaveProperty("author");
        expect(book).toHaveProperty("language");
        expect(book).toHaveProperty("pages");
        expect(book).toHaveProperty("publisher");
        expect(book).toHaveProperty("title");
        expect(book).toHaveProperty("year");
    });

    test("Creates a new book: Missing property", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                book: {
                    isbn: "32794782",
                    amazon_url: "https://taco.com",
                    author: "mctest",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000,
                },
            });

        expect(response.status).toBe(400);
    });
});

describe("PUT /books/:isbn", function () {
    test("Updates book", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            amazon_url: "https://update.com",
            author: "mctest",
            language: "Pig Latin",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000,
        });

        const book = response.body.book;

        expect(response.status).toBe(200);

        console.log(book);

        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("amazon_url");
        expect(book).toHaveProperty("author");
        expect(book).toHaveProperty("language");
        expect(book).toHaveProperty("pages");
        expect(book).toHaveProperty("publisher");
        expect(book).toHaveProperty("title");
        expect(book).toHaveProperty("year");

        expect(book.amazon_url).toBe("https://update.com");
        expect(book.language).toBe("Pig Latin");
    });
});

describe("DELETE /books/:isbn", function () {
    test("Updates book", async function () {
        const response = await request(app).delete(`/books/${book_isbn}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Book deleted" });
    });
});

//   After Each functions
afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
    await db.end();
});
