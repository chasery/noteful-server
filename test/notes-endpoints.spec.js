const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeFoldersArray } = require("./folders.fixtures");
const { makeNotesArray, makeMaliciousNote } = require("./notes.fixtures");

describe("Notes Endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean tables", () =>
    db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
  );

  afterEach("clean up tables before next test", () =>
    db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
  );

  describe("GET /api/notes", () => {
    context("Given no notes", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/notes").expect(200, []);
      });
    });

    context("Given there are notes in the database", () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert(testNotes);
          });
      });

      it("responds with 200 and all of the notes", () => {
        return supertest(app).get("/api/notes").expect(200, testNotes);
      });
    });

    context("Given an XSS attack note", () => {
      const testFolders = makeFoldersArray();
      const { maliciousNote, expectedNote } = makeMaliciousNote();

      beforeEach("insert malicious note", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert([maliciousNote]);
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/notes")
          .expect(200)
          .expect((res) => {
            expect(res.body[0].note_name).to.eql(expectedNote.note_name);
            expect(res.body[0].note_content).to.eql(expectedNote.note_content);
          });
      });
    });
  });

  describe("GET /api/notes/:id", () => {
    context("Given there are no notes", () => {
      it("returns a 404", () => {
        const noteId = 123456;

        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, {
            error: { message: "Note doesn't exist" },
          });
      });
    });

    context("Given there are notes", () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => db.into("noteful_notes").insert(testNotes));
      });

      it("returns a 200 and the requested note", () => {
        const noteId = 2;
        const expectedNote = testNotes[noteId - 1];

        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote);
      });
    });

    context(`Given an XSS attack article`, () => {
      const testFolders = makeFoldersArray();
      const { maliciousNote, expectedNote } = makeMaliciousNote();

      beforeEach("insert malicious note", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert([maliciousNote]);
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/notes/${maliciousNote.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.note_name).to.eql(expectedNote.note_name);
            expect(res.body.note_content).to.eql(expectedNote.note_content);
          });
      });
    });
  });

  describe("POST /api/notes", () => {
    const testFolders = makeFoldersArray();
    const { maliciousNote, expectedNote } = makeMaliciousNote();

    beforeEach("insert folders", () => {
      return db.into("noteful_folders").insert(testFolders);
    });

    it("creates a note, responds with a 201, and returns the full note", () => {
      const newNote = {
        note_name: "BEET IT",
        note_content: "Sometimes you just have to beet it.",
        folder_id: 1,
      };

      return supertest(app)
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect((res) => {
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
          expect(res.body.note_name).to.eql(newNote.note_name);
          expect(res.body.note_content).to.eql(newNote.note_content);
          expect(res.body.folder_id).to.eql(newNote.folder_id);
          expect(res.body).to.have.property("id");
          const expectedDate = new Intl.DateTimeFormat("en-US").format(
            new Date()
          );
          const actualDate = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.modified)
          );
          expect(actualDate).to.eql(expectedDate);
        });
    });

    const requiredFields = ["note_name", "note_content", "folder_id"];

    requiredFields.forEach((field) => {
      const newNote = {
        note_name: "BEET IT",
        note_content: "Sometimes you just have to beet it.",
        folder_id: 1,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field];

        return supertest(app)
          .post("/api/notes")
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it("removes XSS attack content", () => {
      return supertest(app)
        .post("/api/notes")
        .send(maliciousNote)
        .expect(201)
        .expect((res) => {
          expect(res.body.note_name).to.eql(expectedNote.note_name);
          expect(res.body.note_content).to.eql(expectedNote.note_content);
        });
    });
  });
});
