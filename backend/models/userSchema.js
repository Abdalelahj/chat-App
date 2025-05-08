const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        tolowercase: true,
        unique: true,
        trim: true,
        minlength: 5,
        required: [true, 'username is required']
    },
    password: {
        type: String, required: true, validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&])(?=.*\d)[a-zA-Z\d@$!%*#?&]{8,12}$/.test(value)
            },
            message: (props) => `password ${props.value} is not valid ,  The password has to be Minimum eight characters,Maximum 12 characters and contain at least one uppercase letter, one lowercase letter and one number ex:1@myPassword`
        }
    },
    createdAt: { type: Date, default: Date.now }
})

userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 8)
})
module.exports = mongoose.model("User", userSchema);
