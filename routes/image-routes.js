const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");
const {uploadImageController, fetchImageController, deleteImageController} = require("../controllers/image-controller");
const uploadMiddleware = require("../middlewares/upload-middleware");

const router = express.Router();

//upload image
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('image'),
  uploadImageController
);

//get all images
router.get('/get', authMiddleware ,fetchImageController);

//delete the image
router.delete('/:id', authMiddleware, adminMiddleware, deleteImageController);


module.exports = router;
