const express = require("express");
const About = require("../controllers/aboutController");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Image upload configuration
const imageUpload = multer({
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
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Images only!"));
    }
  },
});

// PDF upload configuration
const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/documents");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = file.mimetype === "application/pdf";

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("PDF files only!"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Universal file upload configuration
const universalUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, "uploads/images");
      } else if (file.mimetype === "application/pdf") {
        cb(null, "uploads/documents");
      } else {
        cb(null, "uploads/other");
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType =
      file.mimetype === "application/pdf" || file.mimetype.startsWith("image/");

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(
        new Error("Only images (JPEG, JPG, PNG) and PDF files are allowed!")
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get("/home-page", About.getHomePageData);
router.post("/home-page", About.addHeroWithMetadata);
router.post("/hero-buttons", About.addHeroButton);
router.post("/feature", About.addFeature);
router.post("/program", About.addProgram);
router.post("/update-image-hero", imageUpload.single("image"), About.updateheroImage);

router.get("/about-page", About.getAboutPageData);
router.post("/about-page", About.addwhoweareWithMetadata);
router.post("/about-page/our-approach", About.whoweare_app);
router.post("/values", About.addValuesTable);
router.post("/whoweare-faculty", About.whoweare_faculty);
router.post("/whoweare-image", imageUpload.single("image"), About.updatewhoweareImage);
router.post(
  "/update-image-whoweare-faculty",
  imageUpload.single("image"),
  About.updatewhoweare_facultyImage
);

router.get("/contact-page", About.getContactPageData);
router.post("/contact-page", About.addcontactWithMetadata);
router.post("/contact-page/faq", About.addFAQ);

router.get("/study-hub", About.getStudyHubData);
router.post("/study-hub/metadata", About.addMetadata);
router.post("/study-hub/data", About.addData);
router.post("/study-hub/video-or-doubt", About.addforstudyhub);
router.post("/study-hub/revision", About.addforrevision);

router.get("/join-us", About.getEducationData);
router.post("/join-us/hero", About.hero_section_join_us);
router.post("/join-us/hero-button", About.hero_section_button_join_us);
router.post("/join-us/feature", About.features_join_us);
router.post("/join-us/program", About.programs_join_us);
router.post("/join-us/step", About.stepsJoinUs);
router.post("/join-us/eligibility", About.eligibility_join_us);
router.post("/join-us/criteria", About.criteria_join_us);
router.post("/join-us/process", About.selection_process_join_us);

router.post("/programs/hero", About.insertHeroSectionPrograms);
router.post("/programs/category", About.insertCategory);
router.post("/programs/program", About.insertProgram);
router.get("/programs", About.getCategoriesWithPrograms);

router.post("/success/hero", About.insertHeroSectionSuccess);
router.post("/success/story", About.insertSuccessStory);
router.post("/success/metrics", About.insertSuccessMetrics);
router.get("/success", About.getSuccessMetrics);
router.post("/success/update-image", imageUpload.single("image"), About.updatesuccess_storiesImage);

router.get("/exam-page/:id", About.getExamPage);
router.post("/exam-page", About.insertExamPage);

router.post("/quick-link", About.insertQuickLink);
router.get("/quick-link", About.getQuickLinks);

router.post("/blog/hero", About.insertHeroSection);
router.post("/blog/upcoming-event", About.insertUpcomingEvent);
router.post("/blog/news", About.insertNews);
router.post("/blog/insights", About.insertInsights);
router.post("/blog/social-media", About.insertSocialLinks);
router.get("/blog", About.getBlogData);

// router.post("/image-activity", About.updateActivityImage);
// router.post("/image-testimonial", About.updatetestimonailImage);
// router.post("/image-homepage", About.updateHomeImage);

// router.get("/our-stroy", About.getOurStoryPageData);
// router.post("/our-stroy/description", About.addWhoWeAreDescription);
// router.post("/our-stroy/value", About.addWhoWeAreValue);
// router.post("/our-stroy/milestone", About.addMilestone);
// router.post("/our-stroy/leader", About.addLeader);
// router.post("/our-stroy/voice", About.addVoiceStory);

// router.post("/update-image-seo", About.updateseoImage);
// router.post("/update-image-milestone", About.updatemilestoneImage);
// router.post("/update-image-leader", About.updateleaderImage);

router.get("/fetch-data", About.getData);
router.get("/tables", About.getTables);
router.put("/update", About.updateRecord);
router.post("/login", About.login);

router.post("/register", About.register);

// PDF upload routes
router.post("/upload-pdf", pdfUpload.single("pdf"), About.uploadPDF);
router.post("/upload-file", universalUpload.single("file"), About.uploadUniversalFile);

module.exports = router;
