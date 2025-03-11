const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true
    },
    class: {
      type: Number,
      required: [true, "Class is required"],
      min: [1, "Class must be at least 1"],
      max: [12, "Class cannot be more than 12"]
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either 'active' or 'inactive'"
      },
      default: "active"
    },
    capacity: {
      type: Number,
      min: [0, "Capacity cannot be negative"],
      default: 30
    }
  },
  {
    timestamps: true
  }
);

// Virtual for section group
sectionSchema.virtual("sectionGroup").get(function() {
  if (this.class >= 4 && this.class <= 6) return 1;
  if (this.class >= 7 && this.class <= 9) return 2;
  if (this.class >= 10 && this.class <= 12) return 3;
  return 0;
});

// Virtual for section group name
sectionSchema.virtual("sectionGroupName").get(function() {
  if (this.class >= 4 && this.class <= 6) return "Section 1";
  if (this.class >= 7 && this.class <= 9) return "Section 2";
  if (this.class >= 10 && this.class <= 12) return "Section 3";
  return "Other";
});

// Ensure virtuals are included in JSON output
sectionSchema.set("toJSON", { virtuals: true });
sectionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Section", sectionSchema);