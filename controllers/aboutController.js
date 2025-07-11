const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/"); // Directory to store images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({
  storage,
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
}).single("image");

// PDF upload configuration
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/"); // Directory for PDFs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = file.mimetype === 'application/pdf';

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("PDF files only!"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single("pdf");

// Universal file upload configuration
const universalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose destination based on file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, "uploads/images/");
    } else if (file.mimetype === 'application/pdf') {
      cb(null, "uploads/documents/");
    } else {
      cb(null, "uploads/other/");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const universalUpload = multer({
  storage: universalStorage,
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = file.mimetype === 'application/pdf' || 
                    file.mimetype.startsWith('image/');

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) and PDF files are allowed!"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single("file");

// Universal file upload handler
exports.uploadUniversalFile = async (req, res) => {
  try {
    const { fileType, description } = req.body;
    const uploadedFile = req.file;

    if (!fileType) {
      return res.status(400).json({ error: "File type is required" });
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: "File is required" });
    }

    // Construct file path
    const filePath = uploadedFile.path.replace(/\\/g, '/');

    res.json({
      message: `File uploaded successfully`,
      filePath,
      originalName: uploadedFile.originalname,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadImageByType = async (req, res) => {
  try {
    const { imageType } = req.body;
    const imageFile = req.file;
    console.log(imageFile);

    if (!imageType) {
      return res.status(400).json({ error: "ImageType are required" });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Construct file path
    const imagePath = `uploads/images/${imageFile.filename}`;

    // Map imageType to the correct column in the database
    const columnMap = {
      ogimage: "og_image",
      twitterimage: "twitter_image",
    };
    console.log(columnMap[imageType.toLowerCase()]);
    const columnName = columnMap[imageType.toLowerCase()];
    console.log(columnName);

    // Update database
    await sequelize.query(
      `UPDATE seo_metadata
       SET ${columnName} = :imagePath`,
      {
        replacements: {
          imagePath,
        },
      }
    );

    res.json({
      message: `${imageType} uploaded successfully`,
      imagePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadFullAboutData = async (req, res) => {
  const {
    seo,
    hero,
    whyIndura,
    missionVision,
    principalMessage,
    chairpersonMessage,
    faculty,
  } = req.body;

  try {
    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Insert SEO metadata
      const [seoResult] = await sequelize.query(
        `INSERT INTO seo_metadata (page_title, meta_description, meta_keywords, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image)
         VALUES (:pageTitle, :metaDescription, :metaKeywords, :ogTitle, :ogDescription, :ogImage, :twitterTitle, :twitterDescription, :twitterImage)`,
        {
          replacements: seo,
          transaction,
        }
      );

      const seoId = seoResult; // Get the generated SEO ID
      console.log(seoId);
      // Insert or update About page data
      const [aboutPageResult] = await sequelize.query(
        `INSERT INTO about_page (seo_id, hero_title, hero_subtitle, hero_background_image, hero_alt, why_indura_title, why_indura_description, mission_title, mission_description, vision_title, vision_description)
         VALUES (:seo_id, :heroTitle, :heroSubtitle, :heroBackgroundImage, :heroAlt, :whyInduraTitle, :whyInduraDescription, :missionTitle, :missionDescription, :visionTitle, :visionDescription)`,
        {
          replacements: {
            seo_id: parseInt(seoId),
            heroTitle: hero.title,
            heroSubtitle: hero.subtitle,
            heroBackgroundImage: hero.backgroundImage,
            heroAlt: hero.alt,
            whyInduraTitle: whyIndura.title,
            whyInduraDescription: whyIndura.description,
            missionTitle: missionVision.mission.title,
            missionDescription: missionVision.mission.description,
            visionTitle: missionVision.vision.title,
            visionDescription: missionVision.vision.description,
          },
          transaction,
        }
      );
      const aboutPageId = aboutPageResult; // Get the generated About page ID

      // Insert Why Indura points
      for (const point of whyIndura.points) {
        await sequelize.query(
          `INSERT INTO about_points (about_page_id, point)
           VALUES (:aboutPageId, :point)`,
          {
            replacements: { aboutPageId, point },
            transaction,
          }
        );
      }

      // Insert Principal's Message
      await sequelize.query(
        `INSERT INTO messages (about_page_id, role, title, image, alt, name, qualifications)
         VALUES (:aboutPageId, 'Principal', :title, :image, :alt, :name, :qualifications)`,
        {
          replacements: {
            aboutPageId,
            title: principalMessage.title,
            image: principalMessage.image,
            alt: principalMessage.alt,
            name: principalMessage.name,
            qualifications: principalMessage.qualifications,
          },
          transaction,
        }
      );

      // Insert Chairperson's Message
      await sequelize.query(
        `INSERT INTO messages (about_page_id, role, title, image, alt, name, qualifications)
         VALUES (:aboutPageId, 'Chairperson', :title, :image, :alt, :name, :qualifications)`,
        {
          replacements: {
            aboutPageId,
            title: chairpersonMessage.title,
            image: chairpersonMessage.image,
            alt: chairpersonMessage.alt,
            name: chairpersonMessage.name,
            qualifications: chairpersonMessage.qualifications,
          },
          transaction,
        }
      );

      // Insert content for Principal's and Chairperson's messages
      const insertMessageContent = async (messageId, content) => {
        const id = messageId[0]?.id;
        for (const contentLine of content) {
          await sequelize.query(
            `INSERT INTO message_content (message_id, content_line)
             VALUES (:id, :contentLine)`,
            {
              replacements: { id, contentLine: contentLine },
              transaction,
            }
          );
        }
      };

      const [principalMessageResult] = await sequelize.query(
        `SELECT id FROM messages WHERE about_page_id = :aboutPageId AND role = 'Principal'`,
        {
          replacements: { aboutPageId },
          transaction,
        }
      );
      const principalMessageId = principalMessageResult;
      if (principalMessageId) {
        await insertMessageContent(
          principalMessageId,
          principalMessage.content
        );
      }

      const [chairpersonMessageResult] = await sequelize.query(
        `SELECT id FROM messages WHERE about_page_id = :aboutPageId AND role = 'Chairperson'`,
        {
          replacements: { aboutPageId },
          transaction,
        }
      );
      const chairpersonMessageId = chairpersonMessageResult;
      if (chairpersonMessageId) {
        await insertMessageContent(
          chairpersonMessageId,
          chairpersonMessage.content
        );
      }

      // Insert faculty data
      for (const member of faculty) {
        await sequelize.query(
          `INSERT INTO faculty (about_page_id, name, subject, image, alt)
           VALUES (:aboutPageId, :name, :subject, :image, :alt)`,
          {
            replacements: { aboutPageId, ...member },
            transaction,
          }
        );
      }

      // Commit transaction
      await transaction.commit();
      res.json({ message: "Data uploaded successfully" });
    } catch (error) {
      // Rollback transaction in case of an error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Adjust the path to your Sequelize instance

exports.getAboutPageData = async (req, res) => {
  try {
    // Fetch About Page Data
    const [aboutPageData] = await sequelize.query(`
      SELECT ap.*, 
      sm.page_title AS seoPageTitle,
        sm.meta_description AS seoMetaDescription,
        sm.meta_keywords AS seoMetaKeywords,
        sm.og_title AS seoOgTitle,
        sm.og_description AS seoOgDescription,
        sm.og_image AS seoOgImage,
        sm.twitter_title AS seoTwitterTitle,
        sm.twitter_description AS seoTwitterDescription,
        sm.twitter_image AS seoTwitterImage
      FROM about_page ap
      LEFT JOIN seo_metadata sm ON ap.seo_id = sm.id
    `);

    if (!aboutPageData || aboutPageData.length === 0) {
      return res.status(404).json({ message: "About page data not found" });
    }

    const aboutPageId = aboutPageData[0]?.id;
    console.log(aboutPageId);

    // Fetch Why Indura Points
    const [whyInduraPoints] = await sequelize.query(
      `
      SELECT * FROM about_points WHERE about_page_id = :aboutPageId
    `,
      { replacements: { aboutPageId } }
    );

    // Fetch Principal and Chairperson Messages
    const [messages] = await sequelize.query(
      `
      SELECT * FROM messages WHERE about_page_id = :aboutPageId
    `,
      { replacements: { aboutPageId } }
    );

    // Fetch Message Content
    const [messageContent] = await sequelize.query(
      `
      SELECT * FROM message_content WHERE message_id IN (
        SELECT id FROM messages WHERE about_page_id = :aboutPageId
      )
    `,
      { replacements: { aboutPageId } }
    );

    // Organize Messages with Content
    const messagesWithContent = messages.map((message) => ({
      ...message,
      content: messageContent
        .filter((content) => content.message_id === message.id)
        .map((content) => content.content_line),
    }));

    // Fetch Faculty Data
    const [facultyData] = await sequelize.query(
      `
      SELECT * FROM faculty WHERE about_page_id = :aboutPageId
    `,
      { replacements: { aboutPageId } }
    );

    // Combine Data
    const responseData = {
      aboutPage: aboutPageData[0],
      whyIndura: whyInduraPoints,
      messages: messagesWithContent,
      faculty: facultyData,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { id, imageType } = req.body;
    const imageFile = req.file;
    console.log(req.body);
    if (!id || !imageType) {
      return res
        .status(400)
        .json({ error: "Table name, record ID, and image type are required" });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Define valid tables and their image columns
    const tableMap = {
      about_page: ["hero_background_image"],
      messages: ["image"],
      faculty: ["image"],
    };

    const columnName = tableMap[imageType.toLowerCase()];
    console.log(columnName);

    // Construct file path
    const imagePath = `uploads/images/${imageFile.filename}`;
    console.log(`UPDATE ${imageType}
      SET ${columnName} = :imagePath
      WHERE id = :id`);
    // Update the database
    await sequelize.query(
      `UPDATE ${imageType}
       SET ${columnName} = :imagePath
       WHERE id = :id`,
      {
        replacements: {
          imagePath,
          id,
        },
      }
    );

    res.json({
      message: `Image for (ID: ${id}, Type: ${imageType}) uploaded successfully`,
      imagePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.insertMessageContent = async (req, res) => {
  const { message_id, content_line } = req.body;

  if (!message_id || !content_line) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO message_content (message_id, content_line)
       VALUES (:message_id, :content_line)`,
      {
        replacements: { message_id, content_line },
      }
    );

    res.json({ message: "Message content inserted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to insert message content.", error });
  }
};

// Insert into `faculty`
exports.insertFaculty = async (req, res) => {
  const { about_page_id, name, subject, alt } = req.body;

  if (!about_page_id || !name || !subject) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO faculty (about_page_id, name, subject, alt)
       VALUES (:about_page_id, :name, :subject, :alt)`,
      {
        replacements: { about_page_id, name, subject, alt },
      }
    );

    res.json({ message: "Faculty member inserted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to insert faculty member.", error });
  }
};

// Insert into `about_points`
exports.insertAboutPoint = async (req, res) => {
  const { about_page_id, point } = req.body;

  if (!about_page_id || !point) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO about_points (about_page_id, point)
       VALUES (:about_page_id, :point)`,
      {
        replacements: { about_page_id, point },
      }
    );

    res.json({ message: "About point inserted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to insert about point.", error });
  }
};

exports.getAcademicsData = async (req, res) => {
  try {
    // Fetch the academics page data
    const [academicPages] = await sequelize.query(`
      SELECT
        ap.id AS academicsPageId,
        ap.title,
        ap.approach_heading AS approachHeading,
        ap.academics_features_title AS featuresTitle,
        ap.seo_id AS seoid,
        sm.page_title AS seoPageTitle,
        sm.meta_description AS seoMetaDescription,
        sm.meta_keywords AS seoMetaKeywords,
        sm.og_title AS seoOgTitle,
        sm.og_description AS seoOgDescription,
        sm.og_image AS seoOgImage,
        sm.twitter_title AS seoTwitterTitle,
        sm.twitter_description AS seoTwitterDescription,
        sm.twitter_image AS seoTwitterImage
      FROM academics_page ap
      LEFT JOIN seo_metadata sm ON ap.seo_id = sm.id
    `);

    if (academicPages.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Extract the academicsPageId
    const academicsPageId = academicPages[0].academicsPageId;

    // Fetch descriptions
    const [descriptions] = await sequelize.query(
      `
      SELECT content
      FROM academic_description
      WHERE academics_page_id = :academicsPageId
    `,
      {
        replacements: { academicsPageId },
      }
    );

    // Fetch features
    const [features] = await sequelize.query(
      `
      SELECT feature
      FROM academic_features
      WHERE academics_page_id = :academicsPageId
    `,
      {
        replacements: { academicsPageId },
      }
    );

    // Fetch programs
    const [programs] = await sequelize.query(
      `
      SELECT program_id AS id, title, content
      FROM academic_programs
      WHERE academics_page_id = :academicsPageId
    `,
      {
        replacements: { academicsPageId },
      }
    );

    // Construct the response
    const response = {
      success: true,
      data: {
        seo: {
          seo_id: academicPages[0].seoid,
          pageTitle: academicPages[0].seoPageTitle,
          metaDescription: academicPages[0].seoMetaDescription,
          metaKeywords: academicPages[0].seoMetaKeywords,
          ogTitle: academicPages[0].seoOgTitle,
          ogDescription: academicPages[0].seoOgDescription,
          ogImage: academicPages[0].seoOgImage,
          twitterTitle: academicPages[0].seoTwitterTitle,
          twitterDescription: academicPages[0].seoTwitterDescription,
          twitterImage: academicPages[0].seoTwitterImage,
        },
        title: academicPages[0].title,
        academicsPageId: academicPages[0].academicsPageId,
        approach: {
          heading: academicPages[0].approachHeading,
          description: descriptions.map((desc) => desc.content),
        },
        features: {
          title: academicPages[0].featuresTitle,
          points: features.map((feat) => feat.feature),
        },
        programs: programs.map((program) => ({
          id: program.id,
          title: program.title,
          content: program.content,
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.insertAcademicDescription = async (req, res) => {
  const { academics_page_id, content } = req.body;

  if (!academics_page_id || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO academic_description (academics_page_id, content)
       VALUES (:academics_page_id, :content)`,
      {
        replacements: { academics_page_id, content },
      }
    );

    res.json({ message: "Academic description inserted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to insert academic description.", error });
  }
};

exports.insertAcademicFeature = async (req, res) => {
  const { academics_page_id, feature } = req.body;

  if (!academics_page_id || !feature) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO academic_features (academics_page_id, feature)
       VALUES (:academics_page_id, :feature)`,
      {
        replacements: { academics_page_id, feature },
      }
    );

    res.json({ message: "Academic feature inserted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to insert academic feature.", error });
  }
};

exports.insertAcademicProgram = async (req, res) => {
  const { academics_page_id, program_id, title, content } = req.body;

  if (!academics_page_id || !program_id || !title || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await sequelize.query(
      `INSERT INTO academic_programs (academics_page_id, program_id, title, content)
       VALUES (:academics_page_id, :program_id, :title, :content)`,
      {
        replacements: { academics_page_id, program_id, title, content },
      }
    );

    res.json({ message: "Academic program inserted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to insert academic program.", error });
  }
};

// Controller function to get academics page data
exports.getAdmissionsPageData = async (req, res) => {
  try {
    // Fetch the admissions page data with SEO data
    const [admissionsPages] = await sequelize.query(`
      SELECT
        ap.id AS admissionsPageId,
        ap.title,
        ap.introduction_heading AS introductionHeading,
        ap.introduction_button_text AS introductionButtonText,
        ap.introduction_button_link AS introductionButtonLink,
        ap.process_title AS processTitle,
        ap.eligibility_title AS eligibilityTitle,
        ap.important_dates_title AS importantDatesTitle,
        ap.contact_phone AS contactPhone,
        ap.contact_email AS contactEmail,
        ap.application_heading AS applicationHeading,
        ap.application_description AS applicationDescription,
        ap.application_button_text AS applicationButtonText,
        ap.application_button_link AS applicationButtonLink,
        ap.seo_id as seoId,
        sm.page_title AS seoPageTitle,
        sm.meta_description AS seoMetaDescription,
        sm.meta_keywords AS seoMetaKeywords,
        sm.og_title AS seoOgTitle,
        sm.og_description AS seoOgDescription,
        sm.og_image AS seoOgImage,
        sm.twitter_title AS seoTwitterTitle,
        sm.twitter_description AS seoTwitterDescription,
        sm.twitter_image AS seoTwitterImage
      FROM admissions_page ap
      LEFT JOIN seo_metadata sm ON ap.seo_id = sm.id
    `);

    if (admissionsPages.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Extract admissionsPageId
    const admissionsPageId = admissionsPages[0].admissionsPageId;

    // Fetch introduction paragraphs
    const [introductionParagraphs] = await sequelize.query(
      `
      SELECT id,content
      FROM admission_introduction_paragraphs
      WHERE admissions_page_id = :admissionsPageId
    `,
      {
        replacements: { admissionsPageId },
      }
    );

    // Fetch process steps
    const [processSteps] = await sequelize.query(
      `
      SELECT id,step
      FROM admission_process_steps
      WHERE admissions_page_id = :admissionsPageId
    `,
      {
        replacements: { admissionsPageId },
      }
    );

    // Fetch eligibility criteria
    const [eligibilityCriteria] = await sequelize.query(
      `
      SELECT id,criteria
      FROM admission_eligibility
      WHERE admissions_page_id = :admissionsPageId
    `,
      {
        replacements: { admissionsPageId },
      }
    );

    // Fetch important dates
    const [importantDates] = await sequelize.query(
      `
      SELECT id,label, date
      FROM admission_important_dates
      WHERE admissions_page_id = :admissionsPageId
    `,
      {
        replacements: { admissionsPageId },
      }
    );

    // Construct the response
    const response = {
      success: true,
      data: {
        seo: {
          seoId: admissionsPages[0].seoId,
          pageTitle: admissionsPages[0].seoPageTitle,
          metaDescription: admissionsPages[0].seoMetaDescription,
          metaKeywords: admissionsPages[0].seoMetaKeywords,
          ogTitle: admissionsPages[0].seoOgTitle,
          ogDescription: admissionsPages[0].seoOgDescription,
          ogImage: admissionsPages[0].seoOgImage,
          twitterTitle: admissionsPages[0].seoTwitterTitle,
          twitterDescription: admissionsPages[0].seoTwitterDescription,
          twitterImage: admissionsPages[0].seoTwitterImage,
        },
        title: admissionsPages[0].title,
        admissionsPageId: admissionsPageId,
        introduction: {
          heading: admissionsPages[0].introductionHeading,
          paragraphs: introductionParagraphs.map(
            (paragraph) => paragraph.content
          ),
          buttonText: admissionsPages[0].introductionButtonText,
          buttonLink: admissionsPages[0].introductionButtonLink,
        },
        process: {
          title: admissionsPages[0].processTitle,
          steps: processSteps.map((step) => step.step),
        },
        eligibility: {
          title: admissionsPages[0].eligibilityTitle,
          criteria: eligibilityCriteria.map((criteria) => criteria.criteria),
        },
        importantDates: {
          title: admissionsPages[0].importantDatesTitle,
          dates: importantDates.map((date) => `${date.label}: ${date.date}`),
          contact: {
            phone: admissionsPages[0].contactPhone,
            email: admissionsPages[0].contactEmail,
          },
        },
        application: {
          heading: admissionsPages[0].applicationHeading,
          description: admissionsPages[0].applicationDescription,
          buttonText: admissionsPages[0].applicationButtonText,
          buttonLink: admissionsPages[0].applicationButtonLink,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.handleAdmissionForm = async (req, res) => {
  const formData = req.body;

  const query = `
        INSERT INTO admissions 
        (name, date_of_birth, student_type, class, uid_no, nationality, religion, 
         father_name, mother_name, category, address, mobile_no, email, school_details) 
        VALUES (:name, :dateOfBirth, :studentType, :class, :uidNo, :nationality, 
                :religion, :fatherName, :motherName, :category, :address, :mobileNo, :email, :schoolDetails)
    `;

  try {
    // Insert data using Sequelize's raw query
    const [results, metadata] = await sequelize.query(query, {
      replacements: {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        studentType: formData.studentType,
        class: formData.class,
        uidNo: formData.uidNo,
        nationality: formData.nationality,
        religion: formData.religion,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        category: formData.category,
        address: formData.Address,
        mobileNo: formData.mobileNo,
        email: formData.email,
        schoolDetails: formData.schoolDetails,
      },
    });

    // Generate user credentials
    const userId = `USER ${results}`;
    const password = Math.random().toString(36).slice(-8); // Random 8-char password

    // Send email (if email is provided)
    if (formData.email) {
      await sendEmailNotification(formData.email, userId, password, formData);
    }

    // Respond with success
    res.status(200).json({ message: "Form submitted successfully." });
  } catch (error) {
    console.error("Error handling admission form:", error);
    res.status(500).json({ message: "Server error.", error });
  }
};

// Function to send email notification
const sendEmailNotification = async (email, userId, password, formData) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "Socialmedia.induraes@gmail.com",
      pass: "vqjh ngrz iegd gdhu",
    },
  });

  const mailOptions = {
    from: "Socialmedia.induraes@gmail.com",
    to: "Induraenglishschool@gmail.com",
    subject: "Admission Form Submission",
    text: `
        name: ${formData.name},
        dateOfBirth: ${formData.dateOfBirth},
        studentType: ${formData.studentType},
        class: ${formData.class},
        uidNo: ${formData.uidNo},
        nationality: ${formData.nationality},
        religion: ${formData.religion},
        fatherName: ${formData.fatherName},
        motherName: ${formData.motherName},
        category: ${formData.category},
        address: ${formData.Address},
        mobileNo: ${formData.mobileNo},
        email: ${formData.email},
        schoolDetails: ${formData.schoolDetails}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.getContactPageData = async (req, res) => {
  try {
    // Fetch contact page data along with SEO data
    const [contactPageData] = await sequelize.query(`
      SELECT
        sm.page_title AS pageTitle, 
        sm.meta_description AS metaDescription, 
        sm.meta_keywords AS metaKeywords, 
        sm.og_title AS ogTitle, 
        sm.og_description AS ogDescription, 
        sm.og_image AS ogImage, 
        sm.twitter_title AS twitterTitle, 
        sm.twitter_description AS twitterDescription, 
        sm.twitter_image AS twitterImage,
        cp.seo_id AS seoid,
        cp.address, 
        cp.phone, 
        cp.email, 
        cp.officeHours, 
        cp.mapiframeSrc AS iframeSrc, 
        cp.mapalt AS mapAlt
      FROM contact_page_data cp
      LEFT JOIN seo_metadata sm ON cp.seo_id = sm.id;
    `);

    if (contactPageData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No contact page data found." });
    }

    // Construct the response
    const response = {
      success: true,
      data: {
        seo: {
          seoid: contactPageData[0].seoid,
          officeHours: contactPageData[0].officeHours,
          pageTitle: contactPageData[0].pageTitle,
          metaDescription: contactPageData[0].metaDescription,
          metaKeywords: contactPageData[0].metaKeywords,
          ogTitle: contactPageData[0].ogTitle,
          ogDescription: contactPageData[0].ogDescription,
          ogImage: contactPageData[0].ogImage,
          twitterTitle: contactPageData[0].twitterTitle,
          twitterDescription: contactPageData[0].twitterDescription,
          twitterImage: contactPageData[0].twitterImage,
        },
        contactInfo: {
          address: contactPageData[0].address,
          phone: contactPageData[0].phone,
          email: contactPageData[0].email,
          officeHours: contactPageData[0].officeHours,
        },
        map: {
          iframeSrc: contactPageData[0].iframeSrc,
          alt: contactPageData[0].mapAlt,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching contact page data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.handleContactForm = async (req, res) => {
  const formData = req.body;

  const query = `
        INSERT INTO contactpage
        (name, email, subject, message) 
        VALUES (:name, :email, :subject, :message)
    `;

  try {
    // Insert data using Sequelize's raw query
    const [results, metadata] = await sequelize.query(query, {
      replacements: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
    });

    if (formData.email) {
      await sendEmailNotificationContact(formData.email);
    }

    // Respond with success
    res.status(200).json({ message: "Form submitted successfully." });
  } catch (error) {
    console.error("Error handling admission form:", error);
    res.status(500).json({ message: "Server error.", error });
  }
};

// Function to send email notification
const sendEmailNotificationContact = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "Socialmedia.induraes@gmail.com",
      pass: "vqjh ngrz iegd gdhu",
    },
  });

  const mailOptions = {
    from: "Socialmedia.induraes@gmail.com",
    to: email,
    subject: "Contact Form Submission",
    text: `Thank you for filling the contact form.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.uploadImageGalley = async (req, res) => {
  try {
    const { id, galleryItemsAlt, caption } = req.body; // Extract table name, record ID, and image type "galleryItemsSrc"
    const imageFile = req.file; // Uploaded image file
    console.log(req.body);
    if (!id || !galleryItemsAlt || !caption) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Construct file path
    const imagePath = `uploads/images/${imageFile.filename}`;
    console.log(imagePath);

    await sequelize.query(
      `INSERT INTO galleryItems 
       (galleryPageId, galleryItemsSrc, galleryItemsAlt, caption) 
       VALUES (:id, :imagePath, :galleryItemsAlt, :caption)`,
      {
        replacements: {
          id,
          imagePath,
          galleryItemsAlt,
          caption,
        },
      }
    );

    res.json({
      message: `Image uploaded successfully`,
      imagePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGalleryData = async (req, res) => {
  try {
    // Fetch SEO metadata for galleryPage
    const seoQuery = `
          SELECT page_title AS pageTitle, meta_description AS metaDescription, 
                 meta_keywords AS metaKeywords, og_title AS ogTitle, 
                 og_description AS ogDescription, og_image AS ogImage,
                 twitter_title AS twitterTitle, twitter_description AS twitterDescription, 
                 twitter_image AS twitterImage, id as seoId
          FROM seo_metadata
          WHERE id = (SELECT seo_id FROM galleryPage WHERE id = :galleryPageId)
      `;

    // Fetch gallery items
    const galleryItemsQuery = `
          SELECT galleryItemsSrc AS src, galleryItemsAlt AS alt, caption , id
          FROM galleryItems
          WHERE galleryPageId = :galleryPageId
      `;

    const galleryPageId = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries
    const [seoResults] = await sequelize.query(seoQuery, {
      replacements: { galleryPageId },
    });
    const [galleryItemsResults] = await sequelize.query(galleryItemsQuery, {
      replacements: { galleryPageId },
    });

    // Response
    res.json({
      success: true,
      data: {
        seo: seoResults.length ? seoResults[0] : null,
        galleryItems: galleryItemsResults,
      },
    });
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching gallery data.",
    });
  }
};

exports.insertNewsPageData = async (req, res) => {
  try {
    const { id, title, date, description, link } = req.body; // Extract table name, record ID, and image type "galleryItemsSrc"
    if (!id || !title || !date || !description || !link) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO news_event_items 
       (news_event_page_id, title, date, description,link) 
       VALUES (:id, :title, :date, :description, :link)`,
      {
        replacements: {
          id,
          title,
          date,
          description,
          link,
        },
      }
    );

    res.json({
      message: `News and event data uploaded.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getNewsPageData = async (req, res) => {
  try {
    // Fetch SEO metadata for galleryPage
    const seoQuery = `
          SELECT page_title AS pageTitle, meta_description AS metaDescription, 
                 meta_keywords AS metaKeywords, og_title AS ogTitle, 
                 og_description AS ogDescription, og_image AS ogImage,
                 twitter_title AS twitterTitle, twitter_description AS twitterDescription, 
                 twitter_image AS twitterImage, id as seoId
          FROM seo_metadata
          WHERE id = (SELECT seo_id FROM news_event_page WHERE id = :id)
      `;

    // Fetch gallery items
    const galleryItemsQuery = `
          SELECT *
          FROM news_event_items
          WHERE news_event_page_id = :id
      `;

    const id = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries
    const [seoResults] = await sequelize.query(seoQuery, {
      replacements: { id },
    });
    const [galleryItemsResults] = await sequelize.query(galleryItemsQuery, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        seo: seoResults.length ? seoResults[0] : null,
        newsEvents: galleryItemsResults,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.insertSchoolInfo = async (req, res) => {
  try {
    const { id, label, value } = req.body; // Extract table name, record ID, and image type "galleryItemsSrc"
    if (!id || !label || !value) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO schoolInfo
       (school_policies_id, label, value) 
       VALUES (:id, :label, :value)`,
      {
        replacements: {
          id,
          label,
          value,
        },
      }
    );

    res.json({
      message: `School info data uploaded.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.insertaffiliationDocuments = async (req, res) => {
  try {
    const { id, title, link } = req.body; // Extract table name, record ID, and image type "galleryItemsSrc"

    if (!id || !title || !link) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO affiliationDocuments
       (school_policies_id, title, link) 
       VALUES (:id, :title, :link)`,
      {
        replacements: {
          id,
          title,
          link,
        },
      }
    );

    res.json({
      message: `Affiliation Documents data uploaded.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSchoolPageData = async (req, res) => {
  try {
    // Fetch SEO metadata for galleryPage
    const seoQuery = `
          SELECT page_title AS pageTitle, meta_description AS metaDescription, 
                 meta_keywords AS metaKeywords, og_title AS ogTitle, 
                 og_description AS ogDescription, og_image AS ogImage,
                 twitter_title AS twitterTitle, twitter_description AS twitterDescription, 
                 twitter_image AS twitterImage,id as seoId
          FROM seo_metadata
          WHERE id = (SELECT seo_id FROM school_policies WHERE id = :id)
      `;

    // Fetch gallery items
    const galleryItemsQuery = `
          SELECT *
          FROM schoolInfo
          WHERE school_policies_id = :id
      `;

    const Documents = `
          SELECT *
          FROM affiliationDocuments
          WHERE school_policies_id = :id
      `;
    const id = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries
    const [seoResults] = await sequelize.query(seoQuery, {
      replacements: { id },
    });
    const [galleryItemsResults] = await sequelize.query(galleryItemsQuery, {
      replacements: { id },
    });
    const [DocumentsResult] = await sequelize.query(Documents, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        seo: seoResults.length ? seoResults[0] : null,
        schoolInfo: galleryItemsResults,
        affiliationDocuments: DocumentsResult,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

// Insert Slide Item
exports.addSlideItem = async (req, res) => {
  try {
    const { home_page_id, title, description } = req.body;
    const imageFile = req.file;

    if (!home_page_id || !title || !description) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imagePath = `uploads/images/${imageFile.filename}`;

    await sequelize.query(
      `INSERT INTO slide_items 
             (home_page_id, image, title, description) 
             VALUES (:home_page_id, :imagePath, :title, :description)`,
      {
        replacements: { home_page_id, imagePath, title, description },
      }
    );

    res.json({ message: "Slide item added successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Insert News Event
exports.addNewsEvent = async (req, res) => {
  try {
    const { home_page_id, title, date, description } = req.body;

    if (!home_page_id || !title || !date || !description) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO newsEvents 
             (home_page_id, title, date, description) 
             VALUES (:home_page_id, :title, :date, :description)`,
      {
        replacements: { home_page_id, title, date, description },
      }
    );

    res.json({ message: "News event added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Insert Recent Activity
exports.addRecentActivity = async (req, res) => {
  try {
    const { home_page_id, name, date, description } = req.body;
    const imageFile = req.file;

    if (!home_page_id || !name || !date || !description) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imagePath = `uploads/images/${imageFile.filename}`;

    await sequelize.query(
      `INSERT INTO recentActivities 
             (home_page_id, name, date, image, description) 
             VALUES (:home_page_id, :name, :date, :imagePath, :description)`,
      {
        replacements: { home_page_id, name, date, imagePath, description },
      }
    );

    res.json({ message: "Recent activity added successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Insert Alumni Achiever
exports.addAlumniAchiever = async (req, res) => {
  try {
    const { home_page_id, name, achievement } = req.body;
    const imageFile = req.file;

    if (!home_page_id || !name || !achievement) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imagePath = `uploads/images/${imageFile.filename}`;

    await sequelize.query(
      `INSERT INTO alumniAchievers 
             (home_page_id, name, image, achievement) 
             VALUES (:home_page_id, :name, :imagePath, :achievement)`,
      {
        replacements: { home_page_id, name, imagePath, achievement },
      }
    );

    res.json({ message: "Alumni achiever added successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHomePageData = async (req, res) => {
  try {
    // Fetch SEO metadata for homePage
    const seoQuery = `
          SELECT page_title AS pageTitle, meta_description AS metaDescription, 
                 meta_keywords AS metaKeywords, og_title AS ogTitle, 
                 og_description AS ogDescription, og_image AS ogImage,
                 twitter_title AS twitterTitle, twitter_description AS twitterDescription, 
                 twitter_image AS twitterImage, id as seoId
          FROM seo_metadata
          WHERE id = (SELECT seo_id FROM home_page WHERE id = :id)
      `;

    const homepage = `
      SELECT *
      FROM home_page
  `;

    const slide_items = `
          SELECT *
          FROM slide_items
          WHERE home_page_id = :id
      `;

    const newsEvents = `
          SELECT *
          FROM newsEvents
          WHERE home_page_id = :id
      `;

    const recentActivities = `
          SELECT *
          FROM recentActivities
          WHERE home_page_id = :id
      `;
    const alumniAchievers = `
      SELECT *
      FROM alumniAchievers
      WHERE home_page_id = :id
  `;

    const id = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries
    const [seoResults] = await sequelize.query(seoQuery, {
      replacements: { id },
    });

    const [homepageResults] = await sequelize.query(homepage, {
      replacements: { id },
    });
    const [slideItemsResults] = await sequelize.query(slide_items, {
      replacements: { id },
    });
    const [newsEventsResults] = await sequelize.query(newsEvents, {
      replacements: { id },
    });
    const [recentActivitiesResults] = await sequelize.query(recentActivities, {
      replacements: { id },
    });
    const [alumniAchieversResults] = await sequelize.query(alumniAchievers, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        seo: seoResults.length ? seoResults[0] : null,
        homepage: homepageResults.length ? homepageResults[0] : null,
        slideItems: slideItemsResults,
        newsEvents: newsEventsResults,
        recentActivities: recentActivitiesResults,
        alumniAchievers: alumniAchieversResults,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.addHeader = async (req, res) => {
  try {
    const { logo_alt } = req.body;
    const imageFile = req.file;

    if (!logo_alt) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imagePath = `uploads/images/${imageFile.filename}`;

    await sequelize.query(
      `INSERT INTO header 
             (logo_src,logo_alt) 
             VALUES (:imagePath,:logo_alt)`,
      {
        replacements: { imagePath: imagePath, logo_alt: logo_alt },
      }
    );

    res.json({ message: "Data Added successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.addNavbars = async (req, res) => {
  try {
    const { header_page_id, name, href } = req.body;

    if (!header_page_id || !name || !href) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO header_nav
             (header_page_id, name, href) 
             VALUES (:header_page_id, :name, :href)`,
      {
        replacements: { header_page_id, name, href },
      }
    );

    res.json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHeaderPageData = async (req, res) => {
  try {
    // Fetch SEO metadata for galleryPage

    const header = `
      SELECT *
      FROM header
  `;
    const navbar = `
          SELECT *
          FROM header_nav
          WHERE header_page_id = :id
      `;

    const id = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries

    const [headerResults] = await sequelize.query(header, {
      replacements: { id },
    });

    const [slideItemsResults] = await sequelize.query(navbar, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        header: headerResults.length ? headerResults[0] : null,
        navbarItems: slideItemsResults,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.addFooter = async (req, res) => {
  try {
    const {
      schoolName,
      owner,
      address,
      coursesOffered,
      email,
      phone,
      footerText,
      logo_alt,
    } = req.body;
    const imageFile = req.file;
    console.log(req.body);
    if (
      !schoolName ||
      !owner ||
      !address ||
      !coursesOffered ||
      !email ||
      !phone ||
      !footerText
    ) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imagePath = `uploads/images/${imageFile.filename}`;

    await sequelize.query(
      `INSERT INTO footer
         (schoolName, owner,address, email,coursesOffered, phone, footerText, logo_alt,logo_src)
         VALUES (:schoolName,:owner,:address,:email,:coursesOffered,:phone,:footerText,:logo_alt,:imagePath)
            `,
      {
        replacements: {
          schoolName,
          owner,
          address,
          email,
          coursesOffered,
          phone,
          footerText,
          logo_alt,
          imagePath,
        },
      }
    );

    res.json({ message: "Data Added successfully", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Insert Quick Link
exports.addQuickLink = async (req, res) => {
  try {
    const { footer_id, name, href } = req.body;

    if (!footer_id || !name || !href) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO quickLinks 
             (footer_id, name, href) 
             VALUES (:footer_id, :name, :href)`,
      {
        replacements: { footer_id, name, href },
      }
    );

    res.json({ message: "Quick link added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Insert Social Media Link
exports.addSocialMedia = async (req, res) => {
  try {
    const { footer_id, label, url, icon } = req.body;

    if (!footer_id || !label || !url || !icon) {
      return res.status(400).json({ error: "Send the valid data." });
    }

    await sequelize.query(
      `INSERT INTO socialMedia 
             (footer_id, label, url, icon) 
             VALUES (:footer_id, :label, :url, :icon)`,
      {
        replacements: { footer_id, label, url, icon },
      }
    );

    res.json({ message: "Social media link added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFooterPageData = async (req, res) => {
  try {
    // Fetch SEO metadata for galleryPage

    const footer = `
      SELECT *
      FROM footer
  `;
    const quickLinks = `
          SELECT *
          FROM quickLinks
          WHERE footer_id = :id
      `;
    const socialMedia = `
      SELECT *
      FROM socialMedia
      WHERE footer_id = :id
  `;

    const id = req.params.galleryPageId || 1; // Default to 1 if not provided

    // Execute queries

    const [footerResults] = await sequelize.query(footer, {
      replacements: { id },
    });
    const [quickLinksResults] = await sequelize.query(quickLinks, {
      replacements: { id },
    });
    const [socialMediaResults] = await sequelize.query(socialMedia, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        footer: footerResults.length ? footerResults[0] : null,
        quickLinks: quickLinksResults,
        socialMedia: socialMediaResults,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.getData = async (req, res) => {
  const tableName = req.query.tableName;

  if (!tableName) {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  try {
    // Update query
    const query = `SELECT * FROM ${tableName}`;

    // Execute the query
    const [Result] = await sequelize.query(query, {
      replacements: { tableName: tableName },
    });
    console.log(Result);

    res.json({ data: Result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update the record.", error });
  }
};

exports.getTables = async (req, res) => {
  try {
    // Update query
    const query = `SHOW TABLES`;

    // Execute the query
    const [Result] = await sequelize.query(query);
    console.log(Result);

    res.json({ data: Result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update the record.", error });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database
    await sequelize.query(
      `INSERT INTO users (email, password) VALUES (:email, :password)`,
      {
        replacements: {
          email,
          password: hashedPassword,
        },
      }
    );

    res.json({
      message: "User registered successfully.",
    });
  } catch (error) {
    if (error.original && error.original.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already registered." });
    }
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const JWT_SECRET = "wdiuhqwihjadhuhewdhwehsidhiuwhiuncd";

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find the user in the database
    const [results] = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email },
      }
    );

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  const { tableName, id, updates } = req.body;

  if (!tableName || !id || !updates || typeof updates !== "object") {
    return res.status(400).json({ message: "Invalid request payload." });
  }

  try {
    // Build the SET clause dynamically
    const setClause = Object.keys(updates)
      .map((key) => `${key} = :${key}`)
      .join(", ");

    // Update query
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = :id`;

    // Execute the query
    await sequelize.query(query, {
      replacements: { ...updates, id },
    });

    res.json({ message: `Record in ${tableName} updated successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update the record.", error });
  }
};

exports.getHomePageData = async (req, res) => {
  try {
    // Fetch SEO metadata for homePage
    const metadata = `
          SELECT title, description
          FROM metadata
          WHERE id = (SELECT metadata_id FROM hero WHERE id = :id)
      `;
    const metadatakeywords = `
          SELECT * 
FROM metadata_keywords 
WHERE metadata_id IN (SELECT metadata_id FROM hero WHERE id = :id);

      `;

    // Fetch homePage main content
    const hero = `
          SELECT *
          FROM hero
          WHERE id = :id
      `;
    const hero_image = `
          SELECT *
          FROM image_hero_home
      `;

    // Fetch aboutContent descriptions
    const heroSection_buttons = `
          SELECT *
          FROM heroSection_buttons
          WHERE hero_id = :id
      `;

    // Fetch whyChooseUsContent features
    const features = `
          SELECT *
          FROM features
          WHERE hero_id = :id
      `;

    // Fetch empoweringStudentsContent programs
    const programs = `
          SELECT *
          FROM programs
          WHERE hero_id = :id
      `;

    const id = req.params.homePageId || 1; // Default to 1 if not provided

    // Execute queries
    const [metadataResults] = await sequelize.query(metadata, {
      replacements: { id },
    });
    const metadatakeywordsResults = await sequelize.query(metadatakeywords, {
      replacements: { id },
    });

    const [heroResults] = await sequelize.query(hero, {
      replacements: { id },
    });
    const [heroImageResults] = await sequelize.query(hero_image, {
      replacements: { id },
    });
    const [heroSectionbuttonsResults] = await sequelize.query(
      heroSection_buttons,
      {
        replacements: { id },
      }
    );
    console.log(heroSectionbuttonsResults);
    const [featuresResult] = await sequelize.query(features, {
      replacements: { id },
    });
    const [programsResult] = await sequelize.query(programs, {
      replacements: { id },
    });

    // Response
    res.json({
      success: true,
      data: {
        seo: metadataResults.length ? metadataResults : null,
        seo_keyowrds: metadatakeywordsResults.length
          ? metadatakeywordsResults[0]
          : null,
        hero: heroResults.length ? heroResults : null,
        hero_image: heroImageResults.length ? heroImageResults : null,
        heroSection_buttons: heroSectionbuttonsResults.length
          ? heroSectionbuttonsResults
          : null,
        features: featuresResult,
        programs: programsResult,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.addHeroWithMetadata = async (req, res) => {
  const t = await sequelize.transaction(); // Start a transaction
  try {
    const {
      metadata_title,
      metadata_description,
      keywords_text, // This should be an array of keywords
      hero_title,
      subtitle,
      testimonialSection_title,
      testimonialSection_description,
      join_us_title,
      join_us_description,
      join_us_qoute,
    } = req.body;

    if (
      !metadata_title ||
      !metadata_description ||
      !keywords_text?.length ||
      !hero_title
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid data." });
    }

    // Insert into metadata
    const [metadataResult] = await sequelize.query(
      `INSERT INTO metadata (title, description) VALUES (:metadata_title, :metadata_description)`,
      {
        replacements: { metadata_title, metadata_description },
        transaction: t,
      }
    );

    const metadata_id = metadataResult; // Get the inserted metadata ID

    // Insert multiple keywords into metadata_keywords
    const keywordInsertPromises = keywords_text.map((keyword) => {
      return sequelize.query(
        `INSERT INTO metadata_keywords (keywords_text, metadata_id) VALUES (:keywords_text, :metadata_id)`,
        {
          replacements: { keywords_text: keyword, metadata_id },
          transaction: t,
        }
      );
    });

    await Promise.all(keywordInsertPromises); // Execute all keyword inserts concurrently

    // Insert into hero
    await sequelize.query(
      `INSERT INTO hero (title, metadata_id, subtitle, testimonialSection_title, testimonialSection_description, join_us_title, join_us_description,join_us_qoute) 
       VALUES (:hero_title, :metadata_id, :subtitle, :testimonialSection_title, :testimonialSection_description, :join_us_title,:join_us_description,:join_us_qoute)`,
      {
        replacements: {
          hero_title,
          metadata_id,
          subtitle,
          testimonialSection_title,
          testimonialSection_description,
          join_us_title,
          join_us_description,
          join_us_qoute,
        },
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    res.json({
      message:
        "Hero section with metadata and multiple keywords added successfully",
    });
  } catch (error) {
    await t.rollback(); // Rollback if any step fails
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.addHeroButton = async (req, res) => {
  try {
    const { text, hero_id, link } = req.body;
    console.log(text, hero_id, link);

    if (!text || !hero_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await sequelize.query(
      `INSERT INTO heroSection_buttons (text, hero_id, link) VALUES (:text, :hero_id, :link)`,
      {
        replacements: { text, hero_id, link },
      }
    );

    res.json({ message: "Hero button added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.addFeature = async (req, res) => {
  try {
    const { title, hero_id, description } = req.body;
    console.log(title, hero_id, description);
    if (!title || !hero_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await sequelize.query(
      `INSERT INTO features (title, hero_id, description) VALUES (:title, :hero_id, :description)`,
      {
        replacements: { title, hero_id, description },
      }
    );

    res.json({ message: "Feature added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.addProgram = async (req, res) => {
  try {
    const { name, hero_id, description } = req.body;

    if (!name || !hero_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await sequelize.query(
      `INSERT INTO programs (name, hero_id, description) VALUES (:name, :hero_id, :description)`,
      {
        replacements: { name, hero_id, description },
      }
    );

    res.json({ message: "Program added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateheroImage = async (req, res) => {
  try {
    // Use Multer to upload the image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.body;

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      // Update the image column in the database
      if (id) {
        await sequelize.query(
          `UPDATE image_hero_home
           SET image_url = :imagePath 
           WHERE id = :id`,
          {
            replacements: { imagePath, id },
          }
        );
      } else {
        await sequelize.query(
          `INSERT INTO image_hero_home (image_url) 
VALUES (:imagePath);
           `,
          {
            replacements: { imagePath },
          }
        );
      }

      res.json({ message: `Image successfully updated.` });
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAboutPageData = async (req, res) => {
  try {
    // Fetch SEO metadata for homePage
    const metadata = `
          SELECT title, description
          FROM metadata
          WHERE id = (SELECT metadata_id FROM whoweare WHERE id = :id)
      `;
    const metadatakeywords = `
          SELECT * 
FROM metadata_keywords 
WHERE metadata_id IN (SELECT metadata_id FROM whoweare WHERE id = :id);

      `;

    // Fetch homePage main content
    const hero = `
          SELECT *
          FROM whoweare
          WHERE id = :id
      `;

    // Fetch aboutContent descriptions
    const heroSection_buttons = `
          SELECT *
          FROM ValuesTable
          WHERE whoweare_id = :id
      `;

    // Fetch whyChooseUsContent features
    const features = `
          SELECT *
          FROM whoweare_faculty
          WHERE whoweare_id = :id
      `;
    const whoweare_app = `
          SELECT *
          FROM whoweare_ourApproach
      `;

    // Fetch empoweringStudentsContent programs

    const id = req.params.homePageId || 1; // Default to 1 if not provided

    // Execute queries
    const [metadataResults] = await sequelize.query(metadata, {
      replacements: { id },
    });
    const metadatakeywordsResults = await sequelize.query(metadatakeywords, {
      replacements: { id },
    });
    console.log(metadatakeywordsResults);
    const [whoweareResults] = await sequelize.query(hero, {
      replacements: { id },
    });
    const [whowearevaluesResults] = await sequelize.query(heroSection_buttons, {
      replacements: { id },
    });
    const [whoweare_facultyResult] = await sequelize.query(features, {
      replacements: { id },
    });

    const [whoweare_appResult] = await sequelize.query(whoweare_app);

    // Response
    res.json({
      success: true,
      data: {
        seo: metadataResults,
        seo_keyowrds: metadatakeywordsResults,

        whoweare: whoweareResults,
        whowearevalues: whowearevaluesResults,

        whoweare_faculty: whoweare_facultyResult,
        whoweare_app: whoweare_appResult,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
    });
  }
};

exports.updateWhoWeAreImage = async (req, res) => {
  try {
    // Use Multer to upload the image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      // Update the image column in the database

      await sequelize.query(
        `UPDATE whoweare
           SET image = :imagePath 
           WHERE id = :id`,
        {
          replacements: { imagePath, id },
        }
      );

      res.json({ message: `Image successfully updated.` });
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.addwhoweareWithMetadata = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      metadata_title,
      metadata_description,
      keywords_text,
      description,
      mission,
      additionalMission,
      joinus_title,
      joinus_description,
    } = req.body;

    console.log(req.body);
    if (!metadata_title || !metadata_description || !keywords_text?.length) {
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid data." });
    }

    // Insert into metadata
    const [metadataResult] = await sequelize.query(
      `INSERT INTO metadata (title, description) VALUES (:metadata_title, :metadata_description)`,
      {
        replacements: { metadata_title, metadata_description },
        transaction: t,
      }
    );

    const metadata_id = metadataResult;

    // Insert multiple keywords into metadata_keywords
    const keywordInsertPromises = keywords_text.map((keyword) => {
      return sequelize.query(
        `INSERT INTO metadata_keywords (keywords_text, metadata_id) VALUES (:keywords_text, :metadata_id)`,
        {
          replacements: { keywords_text: keyword, metadata_id },
          transaction: t,
        }
      );
    });

    await Promise.all(keywordInsertPromises); // Execute all keyword inserts concurrently

    // Insert into hero
    await sequelize.query(
      `INSERT INTO whoweare (description, metadata_id, mission, additionalMission, joinus_title, joinus_description) 
       VALUES (:description, :metadata_id, :mission, :additionalMission, :joinus_title, :joinus_description)`,
      {
        replacements: {
          description,
          metadata_id,
          mission,
          additionalMission,
          joinus_title: joinus_title, // Ensure correct key
          joinus_description: joinus_description, // Ensure correct key
        },
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    res.json({
      message:
        "Whoweare section with metadata and multiple keywords added successfully",
    });
  } catch (error) {
    await t.rollback(); // Rollback if any step fails
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.addValuesTable = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id, title, whoweare_id, description } = req.body;
      if (!title || !whoweare_id) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      await sequelize.query(
        `INSERT INTO ValuesTable (title, whoweare_id, description, image) VALUES (:title, :whoweare_id, :description, :image)`,
        {
          replacements: { title, whoweare_id, description, image: imagePath },
        }
      );

      res.json({ message: "Values added successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.whoweare_app = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id, title, description } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      await sequelize.query(
        `INSERT INTO whoweare_ourApproach (Title, Description, image) VALUES (:title, :description, :image)`,
        {
          replacements: { title, description, image: imagePath },
        }
      );

      res.json({ message: "whoweare ourApproach added successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.whoweare_faculty = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { whoweare_id, name, role } = req.body;

      if (!whoweare_id || !name || !role) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      // Insert the data into the database
      await sequelize.query(
        `INSERT INTO whoweare_faculty
         (whoweare_id, name, role, image) 
         VALUES (:whoweare_id, :name, :role, :image)`,
        {
          replacements: {
            whoweare_id,
            name,
            role,
            image: imagePath, // Ensure this is correctly assigned
          },
        }
      );

      res.json({ message: "Whoweare_faculty added successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updatewhoweareImage = async (req, res) => {
  try {
    // Use Multer to upload the image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { whoweare_id, imageField } = req.body;

      if (!whoweare_id || !imageField) {
        return res.status(400).json({ error: "Invalid id or imageField." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      // Update the image column in the database
      await sequelize.query(
        `UPDATE whoweare 
         SET ${imageField} = :imagePath 
         WHERE id = :whoweare_id`,
        {
          replacements: { imagePath, whoweare_id },
        }
      );

      res.json({ message: `Image successfully updated in ${imageField}.` });
    });
  } catch (error) {
    console.error("Error updating activity image:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.updatemilestoneImage = async (req, res) => {
  try {
    // Use Multer to upload the image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Invalid id." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      // Update the image column in the database
      await sequelize.query(
        `UPDATE milestonesContent_milestones
         SET image = :imagePath 
         WHERE id = :id`,
        {
          replacements: { imagePath, id },
        }
      );

      res.json({ message: `Image successfully updated.` });
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateleaderImage = async (req, res) => {
  try {
    // Use Multer to upload the image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Invalid id." });
      }

      // Get the uploaded file path
      const imagePath = req.file
        ? `/uploads/images/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      // Update the image column in the database
      await sequelize.query(
        `UPDATE leadersContent_leaders
         SET image = :imagePath 
         WHERE id = :id`,
        {
          replacements: { imagePath, id },
        }
      );

      res.json({ message: `Image successfully updated.` });
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database
    await sequelize.query(
      `INSERT INTO users (email, password) VALUES (:email, :password)`,
      {
        replacements: {
          email,
          password: hashedPassword,
        },
      }
    );

    res.json({
      message: "User registered successfully.",
    });
  } catch (error) {
    if (error.original && error.original.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already registered." });
    }
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const JWT_SECRET = "wdiuhqwihjadhuhewdhwehsidhiuwhiuncd";

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find the user in the database
    const [results] = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email },
      }
    );

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PDF upload handler
exports.uploadPDF = async (req, res) => {
  try {
    const { documentType, description } = req.body;
    const pdfFile = req.file;

    if (!documentType) {
      return res.status(400).json({ error: "Document type is required" });
    }

    if (!pdfFile) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    // Construct file path
    const pdfPath = `uploads/documents/${pdfFile.filename}`;

    // You can save PDF info to database here
    // Example: await sequelize.query(...)

    res.json({
      message: `PDF uploaded successfully`,
      pdfPath,
      originalName: pdfFile.originalname,
      size: pdfFile.size,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
