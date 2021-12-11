const mongoose = require("mongoose");
const schema = mongoose.Schema;
const user = new schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
});
module.exports = mongoose.model("register", user);
