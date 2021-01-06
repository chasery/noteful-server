const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("noteful_notes");
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into("noteful_notes")
      .returning("*")
      .then((rows) => rows[0]);
  },
  getNoteByID(knex, id) {
    return knex.select("*").from("noteful_notes").where("id", id).first();
  },
  deleteNote(knex, id) {},
  updateNote(knex, id, newNoteFields) {},
};

module.exports = NotesService;
