const express = require("express")
const cors = require("cors")
const app = express()
const userRouter = require("./routes/auth.route")

const bodyParser = require('body-parser')


app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }))


app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));
const db = require("./model")
const Role = db.role;
const connectDB = async () => {
  try {
    const conn = await db.mongoose
      .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => {
        console.log("Successfully connect to MongoDB")

        initial()
      })
      .catch(err => {
        console.error("Connection error", err)
        process.exit()
      })
  } catch (err) {
    console.log("error", err);
  }
}
connectDB()
async function initial() {
  try {
    const count = await Role.estimatedDocumentCount().exec();
    if (count === 0) {
      const role = new Role({ name: "user" });
      await role.save();
      console.log("added 'user' to roles collection");
    }
  } catch (err) {
    console.log("error", err);
  }
}



app.use('/api/auth', userRouter)


app.get("/", (req, res) => {
  res.json({ message: "Welcome to thulane application" })
})

const PORT = process.env.PORT || 2002

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})