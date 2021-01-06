const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("noteful_notes");
  },
  getNoteByID(knex, id) {},
  insertNote(knex, newNote) {},
  deleteNote(knex, id) {},
  updateNote(knex, id, newNoteFields) {},
};

module.exports = NotesService;
