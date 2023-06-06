const express = require("express");
const router = express.Router();
const Joi = require("joi").extend(require("joi-phone-number"));

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts");

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().phoneNumber().required(),
});

const checkContactId = (contact, contactId, res) => {
  if (!contact) {
    return res
      .status(404)
      .json({ message: `Contact with id=${contactId} was not found.` });
  }
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json({ data: { contacts } });
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    checkContactId(contact, contactId, res);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const { name, email, phone } = body;
    const { error } = schema.validate({ name, email, phone });
    if (error) {
      return res.status(400).json({ message: "missing required name - field" });
    }
    const newContact = await addContact(body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await removeContact(contactId);
    checkContactId(contact, contactId, res);

    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const body = req.body;
    const { name, email, phone } = body;
    const { contactId } = req.params;
    const { error } = schema.validate({ name, email, phone });
    if (error) {
      return res.status(400).json({ message: "missing fields" });
    }

    const contact = await updateContact(contactId, body);
    checkContactId(contact, contactId, res);
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
