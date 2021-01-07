function makeFoldersArray() {
  return [
    {
      id: 1,
      folder_name: "The",
    },
    {
      id: 2,
      folder_name: "Office",
    },
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 1,
    folder_name: `<script>alert("xss");</script> Fix this <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"> and allow this <strong>all</strong>`,
  };
  const expectedFolder = {
    ...maliciousFolder,
    folder_name: `&lt;script&gt;alert("xss");&lt;/script&gt; Fix this <img src="https://url.to.file.which/does-not.exist"> and allow this <strong>all</strong>`,
  };

  return {
    maliciousFolder,
    expectedFolder,
  };
}

module.exports = {
  makeFoldersArray,
  makeMaliciousFolder,
};
