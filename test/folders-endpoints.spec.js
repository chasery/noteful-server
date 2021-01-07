const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeFoldersArray, makeMaliciousFolder } = require("./folders.fixtures");

describe("Folders Endpoints", () => {
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

  describe("GET /api/folders", () => {
    context("Given no folder", () => {
      it("responds with 200 and an empty list", () =>
        supertest(app).get("/api/folders").expect(200, []));
    });

    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () =>
        db.into("noteful_folders").insert(testFolders)
      );

      it("responds with 200 and all of the folders", () =>
        supertest(app).get("/api/folders").expect(200, testFolders));
    });

    context("Given an XSS attack folder", () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach("insert malicious folder", () =>
        db.into("noteful_folders").insert([maliciousFolder])
      );

      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200)
          .expect((res) => {
            expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });

  describe("GET /api/folders/:id", () => {
    context("Given there are no folders", () => {
      it("returns a 404", () => {
        const folderId = 123456;

        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, {
            error: { message: "Folder doesn't exist" },
          });
      });
    });

    context("Given there are folders", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () =>
        db.into("noteful_folders").insert(testFolders)
      );

      it("returns a 200 and the requested folder", () => {
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];

        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder);
      });
    });

    context(`Given an XSS attack folder`, () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach("insert malicious folder", () =>
        db.into("noteful_folders").insert([maliciousFolder])
      );

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });

  describe("POST /api/folders", () => {
    const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

    it("creates a folder, responds with a 201, and returns the full folder", () => {
      const newFolder = {
        folder_name: "BEET IT",
      };

      return supertest(app)
        .post("/api/folders")
        .send(newFolder)
        .expect(201)
        .expect((res) => {
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
          expect(res.body.folder_name).to.eql(newFolder.folder_name);
        });
    });

    it(`responds with 400 and an error message when the 'folder_name' is missing`, () => {
      const newFolder = { irrelevantField: "foo" };

      return supertest(app)
        .post("/api/folders")
        .send(newFolder)
        .expect(400, {
          error: { message: `Missing 'folder_name' in request body` },
        });
    });

    it("removes XSS attack content", () => {
      return supertest(app)
        .post("/api/folders")
        .send(maliciousFolder)
        .expect(201)
        .expect((res) => {
          expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
        });
    });
  });

  describe("DELETE /api/folders", () => {
    context("Given no folders", () => {
      it("responds with a 404", () => {
        const folderId = 123456;

        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: "Folder doesn't exist" } });
      });
    });

    context("Given there are folders", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () =>
        db.into("noteful_folders").insert(testFolders)
      );

      it("should return a 204 and the folder is deleted in the db", () => {
        const folderId = 2;
        const expectedFolders = testFolders.filter(
          (folder) => folder.id !== folderId
        );

        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(204)
          .then((res) =>
            supertest(app).get("/api/folders").expect(expectedFolders)
          );
      });
    });
  });

  describe("PATCH /api/folders/:id", () => {
    context("Given no folders", () => {
      it("responds with a 404", () => {
        const folderId = 123456;
        const updatedFolder = {
          folder_name: "BEET IT",
        };

        return supertest(app)
          .patch(`/api/folders/${folderId}`)
          .send(updatedFolder)
          .expect(404, { error: { message: "Folder doesn't exist" } });
      });
    });

    context("Given there are folders", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders and notes", () =>
        db.into("noteful_folders").insert(testFolders)
      );

      it("should return a 204 and update the folder", () => {
        const folderId = 2;
        const updatedFolder = {
          folder_name: "BEET IT",
        };
        const expectedFolder = {
          ...testFolders[folderId - 1],
          ...updatedFolder,
        };

        return supertest(app)
          .patch(`/api/folders/${folderId}`)
          .send({
            ...updatedFolder,
            fieldToIgnore: "this should not be in the GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/folders/${folderId}`)
              .expect(expectedFolder)
          );
      });

      it("responds with 400 when no required fields supplied", () => {
        const folderId = 2;

        return supertest(app)
          .patch(`/api/folders/${folderId}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: "Request body must contain 'folder_name'",
            },
          });
      });
    });
  });
});
