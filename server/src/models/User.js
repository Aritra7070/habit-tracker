import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      reminderDefaults: {
        times: {
          type: [String],
          default: [],
        },
        notificationType: {
          type: String,
          enum: ["email", "push", "both"],
          default: "push",
        },
      },
      offMode: {
        start: {
          type: String,
          default: "",
        },
        end: {
          type: String,
          default: "",
        },
        vacationMode: {
          type: Boolean,
          default: false,
        },
        autoPauseStreaks: {
          type: Boolean,
          default: true,
        },
        offDays: {
          type: [String],
          default: [],
        },
      },
      locale: {
        timeZone: {
          type: String,
          default: "UTC",
        },
        timeFormat: {
          type: String,
          enum: ["12h", "24h"],
          default: "12h",
        },
        language: {
          type: String,
          default: "en",
        },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving, but only if it was modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
