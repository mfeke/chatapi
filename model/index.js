const mongoose = require("mongoose")
const dbConfig = require("../config/db.config")
mongoose.Promise = global.Promise

const db ={};
db.mongoose = mongoose
db.user = require("./user.model")
db.role = require("./role.model")

db.url = dbConfig.url
db.ROLES = ["user"]

module.exports = db