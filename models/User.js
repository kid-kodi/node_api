const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    fullName: {
      type: String,
    },
    code: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: "Email exist",
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    
    followers: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: { type: Date },
    fcmToken: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountSet: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: ["AGENT", "ADMINISTRATEUR"],
      },
      default: "AGENT",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: {
            values: ["active", "trashed"],
          },
          required: true,
        },
        easy_login_count: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    verificationToken: { type: String },
    verified: { type: Date },
    resetToken: {
      token: String,
      expires: Date,
    },
    passwordReset: Date,
  },
  { timestamps: true }
);

// Custom Schema functions
userSchema.statics.findByCredentials = async (email, password, _id) => {
  let user = null;

  if (_id) {
    user = await User.findOne({ _id, email });
  } else {
    user = await User.findOne({ email });
  }

  if (!user) throw new Error("Cet utilisateur n'existe pas");

  // check if user is verified
  // if (!user.verified) throw new Error("Votre compte n'est pas verifié");

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new Error("Les informations renseignées sont invalides");

  return user;
};

userSchema.statics.findByIdAndPass = async (_id, password) => {
  const user = await User.findById(_id);

  if (!user) throw new Error({ error: "Unable to login!" });

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error({ error: "Unable to login!" });
  }

  return user;
};

userSchema.methods.signAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

userSchema.methods.changePassword = async function (data) {
  const user = this;
  if (user.isModified("password")) {
    user.password = bcrypt.hash(data.password, 8);
  }
  await user.save();
  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;

  return userObject;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;

  // Remove Object attach to the user
  //await Task.deleteMany({ owner: user._id });

  next();
});

userSchema.virtual("isVerified").get(function () {
  return !!(this.verified || this.passwordReset);
});

userSchema.virtual("initials").get(function () {
  return this.firstName.charAt(0) + this.lastName.charAt(0);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
