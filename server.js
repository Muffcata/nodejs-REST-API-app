const app = require("./app");
const createDir = require("./auth/helpers");

app.listen(3000, () => {
  createDir("./tmp");
  createDir("./public/avatars");
  console.log("Server running. Use our API on port: 3000");
});
