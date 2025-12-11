import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantSize: String,
    plan: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },

    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    wallet: { type: Number, default: 0 },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      public_id: String,
      url: String,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [addressSchema],

    subscriptions: [subscriptionSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// must have email or phone
userSchema.pre("save", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("Either email or phone must be provided"));
  }
  next();
});

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// match password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export default mongoose.model("User", userSchema);
