const Contact = require("./models/contactsModel");
const User = require("./models/users");

const listContacts = async (options) => {
  const { favorite } = options;
  if (favorite) {
    const contacts = await Contact.paginate({ favorite }, options);
    return contacts;
  } else {
    const contacts = await Contact.paginate({}, options);
    return contacts;
  }
};

const getContactById = (id) => {
  return Contact.findById(id).exec();
};

const removeContact = (id) => {
  return Contact.findByIdAndDelete(id);
};

const addContact = (body) => {
  const contact = new Contact(body);
  contact.save();
};

const updateContact = (id, body) => {
  return Contact.findByIdAndUpdate(id, body);
};
const updateStatusContact = (contactId, favorite) => {
  return Contact.findByIdAndUpdate(
    contactId,
    { $set: { favorite } },
    { new: true }
  );
};

const updateSubscription = (email, subscription) =>
  User.findOneAndUpdate({ email }, { subscription }, { new: true });

const verifyUser = (verificationToken) =>
  User.findOneAndUpdate(
    { verificationToken },
    { isVerified: true, verificationToken: null }
  );
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  updateSubscription,
  verifyUser,
};
