const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 20,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false }
);
contactSchema.plugin(mongoosePaginate);
const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
