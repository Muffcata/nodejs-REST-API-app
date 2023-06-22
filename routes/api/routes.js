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

router.patch("/users/avatars", ctrlUser.avatar);

router.get("/contacts", ctrlContacts.getContact);

router.get("/contacts/:contactId", ctrlContacts.getById);

router.post("/contacts", ctrlContacts.create);

router.delete("/contacts/:contactId", ctrlContacts.remove);

router.put("/contacts/:contactId", ctrlContacts.update);

router.patch("/contacts/:contactId/favorite", ctrlContacts.updateStatus);

const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

const storeAvatar = path.join(process.cwd(), "public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeAvatar);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: { fileSize: 2000000 },
});

const upload = multer({ storage });

router.post("/avatars", upload.single("avatar"), async (req, res, next) => {
  const { path: tempName, originalname } = req.file;

  const fileName = path.join(storeAvatar, originalname);

  try {
    await fs.rename(tempName, fileName);
  } catch (error) {
    await fs.unlink(tempName);
    next(error);
  }

  res.json({
    status: 200,
    message: "File uploaded",
  });
});

module.exports = router;
