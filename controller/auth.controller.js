const config = require("../config/auth.config")
const db = require("../model")
const User = db.user
let jwt = require("jsonwebtoken")
let bcrypt = require("bcryptjs")
const Role = require("../model/role.model")


exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, roles } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = new User({ fullName, email, password: hashedPassword });

    const savedUser = await user.save();

    if (roles && roles.length > 0) {
      const foundRoles = await Role.find({ name: { $in: roles } }).exec();
      savedUser.roles = foundRoles.map(role => role._id);
    } else {
      const defaultRole = await Role.findOne({ name: 'user' }).exec();
      savedUser.roles = [defaultRole._id];
    }

    await savedUser.save();

    res.send({ message: 'User was registered successfully!' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};



exports.signin = (req, res) =>{
  
    User.findOne({
        email: req.body.email
    }).populate("roles","-__v" )
    .then(user=>{
        if(!user){
            return res.status(404).send({message:"User Not found"})

        }
        var passwordlsVaild = bcrypt.compareSync(
            req.body.password,
            user.password
        )
        if(!passwordlsVaild){
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            })
        }
        var token= jwt.sign({id:user.id}, config.secret,{
            expiresIn: 86400 

        })

        var authorities = []
        for (let i = 0; i < user.roles.length; i++){
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }
        res.status(200).send({
            id: user._id, 
            fullName: user.fullName, 
            email: user.email,
            roles: authorities,
            accessToken:token

        })
    })


}
