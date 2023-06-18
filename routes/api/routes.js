const express = require("express");
const router = express.Router();
const ctrlContacts = require("../../controllers/contactControllers");
const ctrlUser = require("../../controllers/userController");
const auth = require("../../auth/auth");

router.post("/users/register", auth, ctrlUser.register);

router.post("/users/signin", auth, ctrlUser.login);

router.get("/contacts", ctrlContacts.getContact);

router.get("/contacts/:contactId", ctrlContacts.getById);

router.post("/contacts", ctrlContacts.create);

router.delete("/contacts/:contactId", ctrlContacts.remove);

router.put("/contacts/:contactId", ctrlContacts.update);

router.patch("/contacts/:contactId/favorite", ctrlContacts.updateStatus);

module.exports = router;
