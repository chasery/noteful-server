function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: "Bears",
      modified: "2018-05-16T23:00:00.000Z",
      folder_id: 1,
      note_content:
        "Donec eros dolor, facilisis quis mollis et, molestie ut velit. Etiam mattis diam quis sapien tristique pellentesque. Morbi venenatis enim eget tortor maximus, eget ultrices mauris consectetur. Nulla quis arcu facilisis, dapibus purus at, vulputate nunc. Pellentesque a dolor laoreet, pulvinar elit eu, tristique nibh. Etiam malesuada lectus malesuada, ultricies lectus non, efficitur metus. Cras consequat interdum magna at rutrum. Pellentesque commodo efficitur dui non vulputate. Nam non augue volutpat, pharetra ipsum non, cursus leo. Cras facilisis, orci in placerat semper, est sem iaculis felis, et gravida ipsum erat lobortis purus. Nulla facilisi.",
    },
    {
      id: 2,
      note_name: "Beets",
      modified: "2018-04-11T23:00:00.000Z",
      folder_id: 2,
      note_content:
        "Nulla semper vel lacus sed porta. Vestibulum auctor fringilla justo, non dapibus nunc aliquam vitae. Pellentesque quis odio ut justo aliquet interdum ut vitae risus. Pellentesque vitae tellus dictum, scelerisque neque nec, tristique ipsum. Nulla dictum nisi at maximus tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla eget venenatis urna. Duis leo est, mattis sed libero et, maximus tristique neque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut volutpat neque at volutpat commodo. Mauris consectetur dolor elit, mattis interdum velit cursus sed. Curabitur pulvinar facilisis sollicitudin. Donec purus felis, porta sed ex id, sollicitudin commodo nibh. Curabitur rutrum gravida nunc, id ornare nisl auctor efficitur. Nunc vitae eros a eros facilisis luctus.",
    },
    {
      id: 3,
      note_name: "Battlestar Galactica",
      modified: "2018-04-26T23:00:00.000Z",
      folder_id: 2,
      note_content:
        "Integer accumsan eget felis quis hendrerit. Aenean consectetur, neque sit amet porttitor ultrices, metus leo finibus tellus, at aliquam augue eros a sapien. Suspendisse in metus ac erat pretium aliquam. Suspendisse potenti. Vestibulum consectetur fringilla turpis nec dignissim. Praesent sit amet eros vel erat fringilla eleifend. Proin magna est, pellentesque et ex sed, sodales blandit metus. Sed mattis ipsum eget ante rutrum, rhoncus accumsan metus lacinia. Ut lorem dui, faucibus eget dignissim id, finibus ac ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porttitor velit ac ipsum aliquet euismod. Phasellus semper tortor quis arcu posuere, ac malesuada leo tristique. Donec nec porttitor elit. Phasellus porta neque nec vestibulum fermentum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean eget odio dictum, tristique mi sit amet, ornare est.",
    },
  ];
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 1,
    note_name: `<script>alert("xss");</script>`,
    modified: "2018-05-16T23:00:00.000Z",
    folder_id: 1,
    note_content: `Fix this <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"> and allow this <strong>all</strong>`,
  };
  const expectedNote = {
    ...maliciousNote,
    note_name: `&lt;script&gt;alert("xss");&lt;/script&gt;`,
    note_content: `Fix this <img src="https://url.to.file.which/does-not.exist"> and allow this <strong>all</strong>`,
  };

  return {
    maliciousNote,
    expectedNote,
  };
}

module.exports = {
  makeNotesArray,
  makeMaliciousNote,
};
