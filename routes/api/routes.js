const express = require("express");
const router = express.Router();
const ctrlContacts = require("../../controllers/contactControllers");
const ctrlUser = require("../../controllers/userController");
const auth = require("../../auth/auth");

router.post("/users/register", ctrlUser.register);

router.post("/users/signin", ctrlUser.login);

router.get("/users/current", auth, ctrlUser.currentUser);

router.get("/users/logout", auth, ctrlUser.logout);

router.patch("/users", auth, ctrlUser.subscription);

router.get("/contacts", ctrlContacts.getContact);

router.get("/contacts/:contactId", ctrlContacts.getById);

router.post("/contacts", ctrlContacts.create);

router.delete("/contacts/:contactId", ctrlContacts.remove);

router.put("/contacts/:contactId", ctrlContacts.update);

router.patch("/contacts/:contactId/favorite", ctrlContacts.updateStatus);

module.exports = router;
