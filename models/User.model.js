const { Schema, model } = require("mongoose");
const { ROLES, CLIENT } = require("../const");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: {
      type: String, unique: true, required: true
    },
    password: { type: String, required: true },
    avatar: {
      type: String, default: 'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png'
    },
    credit: { type: Number, default: 500 },
    oldtrips: [{ type: Schema.Types.ObjectId, ref: 'trips' }],
    role: { type: String, enum: ROLES, default: CLIENT },
    inProcess: { type: Boolean, default: false },
    currentTrip: { type: Schema.Types.ObjectId, ref: 'trips' },
    rating: [{ type: Number }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    // Just the drivers
    carModel: { type: String },
    carImg: { type: String },
    numberPlate: { type: String }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    versionKey: false
  }
);


const UserModel = model("users", userSchema);

module.exports = UserModel;