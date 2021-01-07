const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("noteful_folders");
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("noteful_folders")
      .returning("*")
      .then((rows) => rows[0]);
  },
  getFolderByID(knex, id) {
    return knex.select("*").from("noteful_folders").where("id", id).first();
  },
  deleteFolder(knex, id) {
    return knex
      .select("*")
      .from("noteful_folders")
      .where("id", id)
      .first()
      .delete();
  },
  updateFolder(knex, id, newFolderFields) {
    return knex
      .select("*")
      .from("noteful_folders")
      .where("id", id)
      .first()
      .update(newFolderFields);
  },
};

module.exports = FoldersService;
