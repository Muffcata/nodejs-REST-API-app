const express = require("express");
const router = express.Router();
const ctrlContacts = require("../../controllers/contactControllers");
const ctrlUser = require("../../controllers/userController");
const auth = require("../../auth/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");

router.post("/users/register", ctrlUser.register);

router.post("/users/signin", ctrlUser.login);

router.get("/users/current", auth, ctrlUser.currentUser);

router.get("/users/logout", auth, ctrlUser.logout);

router.patch("/users", auth, ctrlUser.subscription);

// router.patch("/users/avatars", ctrlUser.avatar);

router.get("/contacts", ctrlContacts.getContact);

router.get("/contacts/:contactId", ctrlContacts.getById);

router.post("/contacts", ctrlContacts.create);

router.delete("/contacts/:contactId", ctrlContacts.remove);

router.put("/contacts/:contactId", ctrlContacts.update);

router.patch("/contacts/:contactId/favorite", ctrlContacts.updateStatus);

const storeAvatar = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeAvatar);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: 1048576,
});

const upload = multer({ storage });

router.patch(
  "/users/avatars",
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { email } = req.user;
      const { path: tempName, originalname } = req.file;
      const fileName = path.join(storeAvatar, originalname);

      await fs.rename(tempName, fileName);
      const img = await Jimp.read(fileName);
      await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName);
      await fs.rename(
        fileName,
        path.join(process.cwd(), "public/avatars", originalname)
      );
      const avatarURL = path.join(
        process.cwd(),
        "public/avatars",
        originalname
      );
      const cleanAvatarURL = avatarURL.replace(/\\/g, "/");
      const user = await ctrlUser.avatar(email, cleanAvatarURL);

      res.json({
        status: 200,
        data: user,
        message: "File uploaded",
      });
    } catch (error) {
      next(error);
      return res.status(400).json({ message: "Missing required field email" });
    }
  }
);

module.exports = router;
