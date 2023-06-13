const Joi = require("joi").extend(require("joi-phone-number"));
const service = require("../service/index");

const validateContact = (contact) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().phoneNumber().required(),
    favourite: Joi.boolean(),
  });
  return schema.validate(contact);
};

const getContact = async (req, res, next) => {
  try {
    const contacts = await service.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const contact = await service.getContactById(req.params.contactId);
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    validateContact(res, res.body);
    const newContact = service.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const contact = await service.removeContact(req.params.contactId);
    res.status(200).json({ message: "contact deleted" });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const update = async (req, res, next) => {
  try {
    validateContact(req.body);
    const updateContact = await service.updateContact(
      req.params.contactId,
      req.body
    );
    if (!updateContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updateContact);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: "Missing field favorite" });
  }
  try {
    const updatedContact = await service.updateStatusContact(
      req.params.contactId,
      favorite
    );
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({
        message: `Contact not found`,
        data: "Not Found",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContact,
  getById,
  create,
  update,
  remove,
  updateStatus,
  validateContact,
};
