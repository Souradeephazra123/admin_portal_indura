
use hemsida_admin_indura;
CREATE TABLE seo_metadata (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text,
  `og_image` text,
  `twitter_title` varchar(255) DEFAULT NULL,
  `twitter_description` text,
  `twitter_image` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE about_page (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seo_id` int DEFAULT NULL,
  `hero_title` varchar(255) DEFAULT NULL,
  `hero_subtitle` text,
  `hero_background_image` text,
  `hero_alt` varchar(255) DEFAULT NULL,
  `why_indura_title` varchar(255) DEFAULT NULL,
  `why_indura_description` text,
  `mission_title` varchar(255) DEFAULT NULL,
  `mission_description` text,
  `vision_title` varchar(255) DEFAULT NULL,
  `vision_description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE about_points (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `about_page_id` int DEFAULT NULL,
  `point` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE faculty (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `about_page_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `image` text,
  `alt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE messages (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `about_page_id` int DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image` text,
  `alt` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `qualifications` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `messages_chk_1` CHECK ((`role` in (_utf8mb4'Principal',_utf8mb4'Chairperson')))
);
CREATE TABLE message_content (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` int DEFAULT NULL,
  `content_line` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE academics_page (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `approach_heading` varchar(255) DEFAULT NULL,
  `academics_features_title` varchar(255) DEFAULT NULL,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE academic_description (
    id SERIAL PRIMARY KEY,
    academics_page_id INT,
    content TEXT
);
CREATE TABLE academic_features (
    id SERIAL PRIMARY KEY,
    academics_page_id INT,
    feature TEXT
);

CREATE TABLE academic_programs (
    id SERIAL PRIMARY KEY,
    academics_page_id INT,
    program_id VARCHAR(50),
    title VARCHAR(255),
    content TEXT
);

START TRANSACTION;

-- Insert into `seo_metadata`
INSERT INTO seo_metadata (page_title, meta_description, meta_keywords, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image)
VALUES (
  'Academics at Indura English School',
  'Explore our rigorous and well-rounded academics that foster intellectual curiosity and critical thinking.',
  'Academics, Indura English School, Curriculum, Key Features, Programs',
  'Academics - Indura English School',
  'Learn about our academic approach, key features, and programs.',
  'https://example.com/academics-og.jpg',
  'Academics at Indura',
  'Discover our approach to modern education.',
  'https://example.com/academics-twitter.jpg'
);

SET @seo_id = LAST_INSERT_ID();

-- Insert into `academics_page`
INSERT INTO academics_page (title, approach_heading, academics_features_title, seo_id)
VALUES (
  'Academics at Indura English School',
  'Our Approach',
  'Key Features of Our Academics:',
  @seo_id
);

SET @academics_page_id = LAST_INSERT_ID();

-- Insert into `academic_description`
INSERT INTO academic_description (academics_page_id, content)
VALUES
  (@academics_page_id, 'Committed to academically rigorous and well-rounded education.'),
  (@academics_page_id, 'Curriculum integrates modern teaching methods and hands-on learning.');

-- Insert into `academic_features`
INSERT INTO academic_features (academics_page_id, feature)
VALUES
  (@academics_page_id, 'Experienced Faculty'),
  (@academics_page_id, 'Interactive Learning'),
  (@academics_page_id, 'Smart Classrooms'),
  (@academics_page_id, 'Subject Specialization'),
  (@academics_page_id, 'Co-curricular Integration');

-- Insert into `academic_programs`
INSERT INTO academic_programs (academics_page_id, program_id, title, content)
VALUES
  (@academics_page_id, 'elementary', 'Jumbo Kids Nursery to Senior KG', 'Focus on building a strong foundation and creative expression.'),
  (@academics_page_id, 'middle', 'Semi English Medium Grade 1st to 5th', 'Transition to advanced studies; development of critical thinking.'),
  (@academics_page_id, 'high', 'English Medium Grade 1st to 10th', 'Rigorous curriculum, AP courses, college counseling, internships.');

COMMIT;

CREATE TABLE admissions_page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255), -- Admissions page title
    seo_id INT, -- Foreign key linking to SEO metadata
    introduction_heading VARCHAR(255), -- Introduction heading
    introduction_button_text VARCHAR(255), -- Button text in the introduction section
    introduction_button_link VARCHAR(255), -- Button link in the introduction section
    process_title VARCHAR(255), -- Title for the admission process section
    eligibility_title VARCHAR(255), -- Title for the eligibility section
    important_dates_title VARCHAR(255), -- Title for the important dates section
    contact_phone VARCHAR(50), -- Contact phone number
    contact_email VARCHAR(255), -- Contact email address
    application_heading VARCHAR(255), -- Application heading
    application_description TEXT, -- Application description
    application_button_text VARCHAR(255), -- Application button text
    application_button_link VARCHAR(255) -- Application button link
);

CREATE TABLE admission_introduction_paragraphs (
    id SERIAL PRIMARY KEY,
    admissions_page_id INT,
    content TEXT
);

CREATE TABLE admission_process_steps (
    id SERIAL PRIMARY KEY,
    admissions_page_id INT,
    step TEXT
);

CREATE TABLE admission_eligibility (
    id SERIAL PRIMARY KEY,
    admissions_page_id INT,
    criteria TEXT
);

CREATE TABLE admission_important_dates (
    id SERIAL PRIMARY KEY,
    admissions_page_id INT,
    label VARCHAR(255),
    date DATE
);

-- Insert into `seo_metadata`
INSERT INTO seo_metadata (
    page_title, 
    meta_description, 
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'Admissions at Indura English School',
    'Join our community at Indura English School. Learn about eligibility, process, and important dates.',
    'Admissions, Indura English School, Enrollment, Eligibility, Important Dates',
    'Admissions - Indura English School',
    'Steps to join our vibrant community of learners.',
    'https://example.com/admissions-og.jpg',
    'Admissions at Indura',
    'Find out how to apply and start your journey.',
    'https://example.com/admissions-twitter.jpg'
);

SET @seo_id = LAST_INSERT_ID();

-- Insert into `admissions_page`
INSERT INTO admissions_page (
    title,
    seo_id,
    introduction_heading,
    introduction_button_text,
    introduction_button_link,
    process_title,
    eligibility_title,
    important_dates_title,
    contact_phone,
    contact_email,
    application_heading,
    application_description,
    application_button_text,
    application_button_link
) 
VALUES (
    'Admissions at Indura English School',
    @seo_id,
    'Join Our Community',
    'Apply Now',
    '#apply',
    'Admission Process',
    'Eligibility',
    'Important Dates',
    '+91 9494382424',
    'demo@gmail.com',
    'Ready to Apply?',
    'Start your journey by submitting your application. For queries, contact our Admissions Office.',
    'Start Application',
    '/admission/form'
);

SET @admissions_page_id = LAST_INSERT_ID();

-- Insert into `admission_introduction_paragraphs`
INSERT INTO admission_introduction_paragraphs (admissions_page_id, content) 
VALUES
    (@admissions_page_id, 'Welcome to Indura English School in Enjangaon East, Basmath, Hingoli.'),
    (@admissions_page_id, 'We invite parents to explore our school, where academic excellence and holistic development are priorities.');

-- Insert into `admission_process_steps`
INSERT INTO admission_process_steps (admissions_page_id, step) 
VALUES
    (@admissions_page_id, 'Visit the School'),
    (@admissions_page_id, 'Fill the Admission Form'),
    (@admissions_page_id, 'Submit Required Documents'),
    (@admissions_page_id, 'Entrance Test/Interview'),
    (@admissions_page_id, 'Confirmation of Admission');

-- Insert into `admission_eligibility`
INSERT INTO admission_eligibility (admissions_page_id, criteria) 
VALUES
    (@admissions_page_id, 'Pre-Primary: Age as per Maharashtra State guidelines.'),
    (@admissions_page_id, 'Primary & Secondary: Transfer students must provide previous academic records.'),
    (@admissions_page_id, 'Special Needs: We welcome students with special needs.');

-- Insert into `admission_important_dates`
INSERT INTO admission_important_dates (admissions_page_id, label, date) 
VALUES
    (@admissions_page_id, 'Admission Open', '2024-01-01'),
    (@admissions_page_id, 'Last Date for Submission', '2024-01-01'),
    (@admissions_page_id, 'Start of Academic Year', '2024-01-01');

COMMIT;


CREATE TABLE admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    student_type VARCHAR(20) NOT NULL,
    class VARCHAR(10) NOT NULL,
    uid_no VARCHAR(20) NOT NULL,
    nationality VARCHAR(50),
    religion VARCHAR(50),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    category VARCHAR(50),
    address TEXT,
    mobile_no VARCHAR(15),
    email VARCHAR(100),
    school_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE contact_page_data (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(480) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `officeHours` varchar(255) DEFAULT NULL,
  `mapiframeSrc` varchar(480) default NULL,
  `mapalt` varchar(480) default NULL,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

INSERT INTO seo_metadata (
    page_title, 
    meta_description, 
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'Contact Us - Indura English School',
    'Get in touch with Indura English School. Find our address, phone number, and email.',
    'Contact Indura School, Address, Phone, Email',
    'Contact Indura English School',
    'Reach out to Indura for more information.',
    'https://example.com/admissions-og.jpg',
    'Contact Indura English School',
    'Get in touch with us for more details.',
    'https://example.com/admissions-twitter.jpg'
);

SET @seo_id = LAST_INSERT_ID();

INSERT INTO contact_page_data (
    address,
    phone,
    email,
    officeHours,
    mapiframeSrc,
    mapalt,
    seo_id
) 
VALUES (
    "123 School Street, City, State 12345",
    "(555) 123-4567",
    "info@indura.edu",
    "Mon-Fri, 8:00 AM - 4:00 PM",
    "https://www.google.com/maps/embed?...",
    "Google Map of Indura English School",
    @seo_id
);

COMMIT;

CREATE TABLE contactpage (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(480) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `subject` varchar(480) DEFAULT NULL,
  `message` varchar(480) default NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);


CREATE TABLE galleryPage (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE galleryItem (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `galleryPageId` int default NULL,
  `galleryItemsSrc` varchar(480) DEFAULT NULL,
  `galleryItemsAlt` varchar(480) DEFAULT NULL,
  `caption` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

INSERT INTO seo_metadata (
    page_title, 
    meta_description, 
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'Gallery - Indura English School',
    'Explore the vibrant campus, including classrooms, labs, sports facilities, and more.',
    'school gallery, campus tour, classrooms, sports, labs',
    'Gallery - Indura English School',
    'Take a virtual tour of our campus through our gallery.',
    'https://example.com/admissions-og.jpg',
    'Gallery - Indura',
    'Explore our beautiful campus.',
    'https://example.com/admissions-twitter.jpg'
);
SET @seo_id = LAST_INSERT_ID();

INSERT INTO galleryPage (
    seo_id
) 
VALUES (
    @seo_id
);


CREATE TABLE news_event_page (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE news_event_items (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `news_event_page_id` int default NULL,
  `title` varchar(480) DEFAULT NULL,
  `date` DATE,
  `description` varchar(480) DEFAULT NULL,
  `link` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
INSERT INTO seo_metadata (
    page_title, 
    meta_description,
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'News & Events - Indura English School',
    'Stay updated with the latest news and events from Indura English School.',
    'news, events, updates, Indura English School',
    'News & Events - Indura',
    'Stay updated with the latest news and events.',
    'https://example.com/admissions-og.jpg',
    'News & Events - Indura',
    'School updates and announcements.',
    'https://example.com/admissions-twitter.jpg'
);
SET @seo_id = LAST_INSERT_ID();

INSERT INTO news_event_page (
    seo_id
) 
VALUES (
    @seo_id
);

CREATE TABLE school_policies (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE schoolInfo (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_policies_id` int default NULL,
  `label` varchar(480) DEFAULT NULL,
  `value` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE affiliationDocuments (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_policies_id` int default NULL,
  `title` varchar(480) DEFAULT NULL,
  `link` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

INSERT INTO seo_metadata (
    page_title, 
    meta_description, 
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'School Policies and Information',
    'Detailed information about school policies, affiliation, and certificates.',
    'school policies, affiliation certificates, safety certificates',
    'School Policies and Information',
    'Explore the school policies and important affiliation documents.',
    'https://example.com/admissions-og.jpg',
    'School Policies',
    'Explore the policies and affiliation documents.',
    'https://example.com/admissions-twitter.jpg'
);
SET @seo_id = LAST_INSERT_ID();

INSERT INTO school_policies (
    seo_id
) 
VALUES (
    @seo_id
);

CREATE TABLE home_page (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `welcome_title` varchar(480) NULL,
  `welcome_description` varchar(480) NULL,
  `seo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE slide_items (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `home_page_id` int default NULL,
  `image` varchar(480) default NULL,
  `title` varchar(480) DEFAULT NULL,
  `description` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE newsEvents (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `home_page_id` int default NULL,
  `title` varchar(480) DEFAULT NULL,
  `date` DATE,
  `description` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE recentActivities (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `home_page_id` int default NULL,
  `name` varchar(480) default NULL,
  `date` DATE,
  `image` varchar(480) default NULL,
  `description` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE alumniAchievers (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `home_page_id` int default NULL,
  `name` varchar(480) default NULL,
  `image` varchar(480) default NULL,
  `achievement` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

INSERT INTO seo_metadata (
    page_title, 
    meta_description, 
    meta_keywords, 
    og_title, 
    og_description, 
    og_image, 
    twitter_title, 
    twitter_description, 
    twitter_image
) 
VALUES (
    'Welcome to Indura English School',
    'Discover excellence in education with Indura English School in Hingoli.',
    'Indura English School, education, Hingoli, activities, alumni',
    'Indura English School',
    'Excellence in education at Hingoli.',
    'https://example.com/admissions-og.jpg',
    'Indura English School',
    "Your child's future begins here.",
    'https://example.com/admissions-twitter.jpg'
);
SET @seo_id = LAST_INSERT_ID();

INSERT INTO home_page (
	welcome_title,
    welcome_description,
    seo_id
) 
VALUES (
	"Trusted Education in Hingoli District",
    "Indura English School, in Enjangaon East, prepares minds for success.",
    @seo_id
);

CREATE TABLE header (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `logo_src` varchar(480) NULL,
  `logo_alt` varchar(480) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE header_nav (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `header_page_id` int default NULL,
  `name` varchar(480) default NULL,
  `href` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE footer (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `schoolName` varchar(480) NULL,
  `owner` varchar(480) NULL,
   `address` varchar(480) NULL,
  `coursesOffered` varchar(480) NULL,
   `email` varchar(480) NULL,
  `phone` varchar(480) NULL,
  `logo_src` varchar(480) NULL,
  `logo_alt` varchar(480) NULL,
  `footerText` varchar(480) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE quickLinks (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `footer_id` int default NULL,
  `name` varchar(480) default NULL,
  `href` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE socialMedia (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `footer_id` int default NULL,
  `label` varchar(480) default NULL,
  `url` varchar(480) DEFAULT NULL,
  `icon` varchar(480) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

