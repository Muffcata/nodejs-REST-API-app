const Contact = require("./models/contactsModel");

const listContacts = async () => {
  return Contact.find();
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
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
