const { Schema, model } = require("mongoose");
const { ROLES, CLIENT } = require("../const");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: {
      type: String, unique: true
    },
    password: { type: String, required: true },
    avatar: { type: String },
    credit: { type: Number, default: 500 },
    oldtrips: [{ type: Schema.Types.ObjectId, ref: 'trips' }],
    role: { type: String, enum: ROLES, default: CLIENT },
    inProcess: { type: boolean, default: false },
    // Just the drivers
    rating: [{ type: Number }],
    carModel: { type: String },
    carImg: { type: String }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    versionKey: false
  }
);


const UserModel = model("users", userSchema);

module.exports = UserModel;