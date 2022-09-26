const { Schema, model } = require("mongoose");
const { ROLES } = require("../const");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
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
    role: { type: String, enum: ROLES },
    // Just the drivers
    rating: { type: Number },
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