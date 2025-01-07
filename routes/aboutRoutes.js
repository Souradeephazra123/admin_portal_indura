const express = require("express");
const About = require("../controllers/aboutController");

const path = require("path");
const router = express.Router();

router.post("/about", About.uploadFullAboutData);

router.get("/about", About.getAboutPageData);
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
});

router.post(
  "/upload-image-seo",
  upload.single("image"), // Expecting a single file with field name 'image'
  About.uploadImageByType
);

router.post(
  "/upload-image",
  upload.single("image"), // Expecting a single file with field name 'image'
  About.uploadImage
);

router.put("/update", About.updateRecord);

router.post("/message-content", About.insertMessageContent);

router.post("/faculty", About.insertFaculty);

router.post("/about-points", About.insertAboutPoint);

router.get("/academics", About.getAcademicsData);
router.get("/admissions", About.getAdmissionsPageData);
router.post("/admissions/form", About.handleAdmissionForm);
router.get("/contact", About.getContactPageData);
router.post("/contact/form", About.handleContactForm);
router.post("/galleryImage", upload.single("image"), About.uploadImageGalley);
router.get("/galleryPage", About.getGalleryData);
router.post("/newsdata", About.insertNewsPageData);
router.get("/newspagedata", About.getNewsPageData);
router.post("/insertSchoolInfo", About.insertSchoolInfo);
router.post("/insertaffiliationDocuments", About.insertaffiliationDocuments);
router.get("/schoolpage", About.getSchoolPageData);

router.post("/slide-items", upload.single("image"), About.addSlideItem);
router.post("/news-events", About.addNewsEvent);
router.post(
  "/recent-activities",
  upload.single("image"),
  About.addRecentActivity
);
router.post(
  "/alumni-achievers",
  upload.single("image"),
  About.addAlumniAchiever
);

router.get("/homePageData", About.getHomePageData);
router.post("/header", upload.single("image"), About.addHeader);
router.post("/navbar", About.addNavbars);
router.get("/header", About.getHeaderPageData);
router.post("/footer", upload.single("image"), About.addFooter);
router.post("/quick-links", About.addQuickLink);
router.post("/social-media", About.addSocialMedia);
router.get("/footer", About.getFooterPageData);
router.get("/fetch-data", About.getData);
router.get("/tables", About.getTables);

router.post("/academic-description", About.insertAcademicDescription);
router.post("/academic-feature", About.insertAcademicFeature);
router.post("/academic-program", About.insertAcademicProgram);

router.post("/login", About.login);

router.post("/register", About.register);
module.exports = router;
