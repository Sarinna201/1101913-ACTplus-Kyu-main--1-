-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: shortline.proxy.rlwy.net:43548
-- Generation Time: Sep 18, 2025 at 06:49 PM
-- Server version: 9.4.0
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `railway`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`%` PROCEDURE `recalculate_user_skills` (IN `target_user_id` INT)   BEGIN
    -- ลบข้อมูลเก่าของ user
    DELETE FROM user_skills WHERE user_id = target_user_id;

    -- ใส่ข้อมูลใหม่จาก user_skill_history
    INSERT INTO user_skills(user_id, skill_id, total_points, level, last_updated)
    SELECT 
        user_id,
        skill_id,
        SUM(points) AS total_points,
        CASE 
            WHEN SUM(points) = 0 THEN 0
            WHEN SUM(points) <= 10 THEN 1
            WHEN SUM(points) <= 25 THEN 2
            WHEN SUM(points) <= 50 THEN 3
            WHEN SUM(points) <= 100 THEN 4
            ELSE 5
        END AS level,
        NOW() AS last_updated
    FROM user_skill_history
    WHERE user_id = target_user_id
    GROUP BY user_id, skill_id;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `sync_all_user_skills` ()   BEGIN
    -- ลบข้อมูลเก่า
    DELETE FROM user_skills;

    -- ใส่ข้อมูลใหม่จาก user_skill_history โดยรวมคะแนนต่อ user และ skill
    INSERT INTO user_skills(user_id, skill_id, total_points, level, last_updated)
    SELECT 
        user_id,
        skill_id,
        SUM(points) AS total_points,
        CASE 
            WHEN SUM(points) = 0 THEN 0
            WHEN SUM(points) <= 10 THEN 1
            WHEN SUM(points) <= 25 THEN 2
            WHEN SUM(points) <= 50 THEN 3
            WHEN SUM(points) <= 100 THEN 4
            ELSE 5
        END AS level,
        NOW() AS last_updated
    FROM user_skill_history
    GROUP BY user_id, skill_id;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`%` FUNCTION `calculate_skill_level` (`points` INT) RETURNS INT DETERMINISTIC BEGIN
    IF points = 0 THEN
        RETURN 0;
    ELSEIF points <= 10 THEN
        RETURN 1;
    ELSEIF points <= 25 THEN
        RETURN 2;
    ELSEIF points <= 50 THEN
        RETURN 3;
    ELSEIF points <= 100 THEN
        RETURN 4;
    ELSE
        RETURN 5;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateStart` datetime(3) NOT NULL,
  `dateEnd` datetime(3) DEFAULT NULL,
  `year` int NOT NULL,
  `term` int NOT NULL,
  `volunteerHours` int NOT NULL DEFAULT '0',
  `authority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uid` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_skills`
--

CREATE TABLE `activity_skills` (
  `id` int NOT NULL,
  `activity_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `points` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `activity_skills_summary`
-- (See below for the actual view)
--
CREATE TABLE `activity_skills_summary` (
`activity_id` int
,`title` varchar(191)
,`skills_count` bigint
,`total_skill_points` decimal(32,0)
,`skill_codes` text
);

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` int NOT NULL,
  `mid` int NOT NULL,
  `order` int NOT NULL,
  `type` enum('image','pdf','markdown') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` enum('Beginner','Intermediate','Advanced') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `createdAt` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments_courses`
--

CREATE TABLE `enrollments_courses` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `star` tinyint NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `cid` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order` int NOT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `participates`
--

CREATE TABLE `participates` (
  `id` int NOT NULL,
  `uid` int NOT NULL,
  `aid` int NOT NULL,
  `role` enum('user','instructor','staff') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `participates`
--
DELIMITER $$
CREATE TRIGGER `trigger_update_user_skills_after_delete` AFTER DELETE ON `participates` FOR EACH ROW BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE skill_id INT;
    DECLARE new_total_points INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT DISTINCT skill_id FROM activity_skills WHERE activity_id = OLD.aid;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO skill_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- ลบประวัติ user_skill_history
        DELETE FROM user_skill_history
        WHERE user_id = OLD.uid AND activity_id = OLD.aid AND skill_id = skill_id;

        -- คำนวณ total_points ใหม่
        SELECT COALESCE(SUM(points), 0) INTO new_total_points
        FROM user_skill_history
        WHERE user_id = OLD.uid AND skill_id = skill_id;

        IF new_total_points > 0 THEN
            UPDATE user_skills
            SET total_points = new_total_points,
                level = calculate_skill_level(new_total_points),
                last_updated = NOW()
            WHERE user_id = OLD.uid AND skill_id = skill_id;
        ELSE
            DELETE FROM user_skills
            WHERE user_id = OLD.uid AND skill_id = skill_id;
        END IF;

    END LOOP;
    CLOSE cur;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_update_user_skills_after_insert` AFTER INSERT ON `participates` FOR EACH ROW BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE skill_id INT;
    DECLARE skill_points INT;

    -- Cursor สำหรับ skill ของ activity
    DECLARE cur CURSOR FOR 
        SELECT skill_id, points FROM activity_skills WHERE activity_id = NEW.aid;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO skill_id, skill_points;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Insert history
        INSERT INTO user_skill_history(user_id, skill_id, activity_id, points, earned_at)
        VALUES (NEW.uid, skill_id, NEW.aid, skill_points, NOW());

        -- Update or insert user_skills
        INSERT INTO user_skills(user_id, skill_id, total_points, level, last_updated)
        VALUES (NEW.uid, skill_id, skill_points, calculate_skill_level(skill_points), NOW())
        ON DUPLICATE KEY UPDATE
            total_points = total_points + VALUES(total_points),
            level = calculate_skill_level(total_points + VALUES(total_points)),
            last_updated = NOW();
    END LOOP;
    CLOSE cur;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#3B82F6',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `total_points` int NOT NULL DEFAULT '0',
  `level` int NOT NULL DEFAULT '1',
  `last_updated` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_skills_summary`
-- (See below for the actual view)
--
CREATE TABLE `user_skills_summary` (
`user_id` int
,`username` varchar(191)
,`email` varchar(191)
,`active_skills_count` bigint
,`total_skill_points` decimal(32,0)
,`average_skill_level` decimal(14,4)
,`last_skill_update` datetime(3)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_skill_history`
--

CREATE TABLE `user_skill_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `activity_id` int NOT NULL,
  `points` int NOT NULL,
  `earned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `activity_skills_summary`
--
DROP TABLE IF EXISTS `activity_skills_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `activity_skills_summary`  AS SELECT `a`.`id` AS `activity_id`, `a`.`title` AS `title`, count(`ass`.`skill_id`) AS `skills_count`, coalesce(sum(`ass`.`points`),0) AS `total_skill_points`, group_concat(`s`.`code` order by `s`.`code` ASC separator ', ') AS `skill_codes` FROM ((`activities` `a` left join `activity_skills` `ass` on((`a`.`id` = `ass`.`activity_id`))) left join `skills` `s` on((`ass`.`skill_id` = `s`.`id`))) GROUP BY `a`.`id`, `a`.`title` ;

-- --------------------------------------------------------

--
-- Structure for view `user_skills_summary`
--
DROP TABLE IF EXISTS `user_skills_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `user_skills_summary`  AS SELECT `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, count(`us`.`skill_id`) AS `active_skills_count`, coalesce(sum(`us`.`total_points`),0) AS `total_skill_points`, coalesce(avg(`us`.`level`),0) AS `average_skill_level`, max(`us`.`last_updated`) AS `last_skill_update` FROM (`users` `u` left join `user_skills` `us` on((`u`.`id` = `us`.`user_id`))) GROUP BY `u`.`id`, `u`.`username`, `u`.`email` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activities_uid_fkey` (`uid`);

--
-- Indexes for table `activity_skills`
--
ALTER TABLE `activity_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activity_skills_activity_id_skill_id_key` (`activity_id`,`skill_id`),
  ADD KEY `idx_activity_skills_activity_id` (`activity_id`),
  ADD KEY `idx_activity_skills_skill_id` (`skill_id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mid` (`mid`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enrollments_courses`
--
ALTER TABLE `enrollments_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_id` (`course_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cid` (`cid`);

--
-- Indexes for table `participates`
--
ALTER TABLE `participates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`,`aid`,`role`),
  ADD KEY `aid` (`aid`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `skills_code_key` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_skills_user_id_skill_id_key` (`user_id`,`skill_id`),
  ADD KEY `idx_user_skills_user_id` (`user_id`),
  ADD KEY `idx_user_skills_skill_id` (`skill_id`),
  ADD KEY `idx_user_skills_level` (`level`);

--
-- Indexes for table `user_skill_history`
--
ALTER TABLE `user_skill_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_skill_history_user_id` (`user_id`),
  ADD KEY `idx_user_skill_history_skill_id` (`skill_id`),
  ADD KEY `idx_user_skill_history_activity_id` (`activity_id`),
  ADD KEY `idx_user_skill_history_earned_at` (`earned_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_skills`
--
ALTER TABLE `activity_skills`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments_courses`
--
ALTER TABLE `enrollments_courses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `participates`
--
ALTER TABLE `participates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_skills`
--
ALTER TABLE `user_skills`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_skill_history`
--
ALTER TABLE `user_skill_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `activity_skills`
--
ALTER TABLE `activity_skills`
  ADD CONSTRAINT `activity_skills_activity_id_fkey` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `activity_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`mid`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `enrollments_courses`
--
ALTER TABLE `enrollments_courses`
  ADD CONSTRAINT `enrollments_courses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enrollments_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `participates`
--
ALTER TABLE `participates`
  ADD CONSTRAINT `participates_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `participates_ibfk_2` FOREIGN KEY (`aid`) REFERENCES `activities` (`id`);

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_skills_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_skill_history`
--
ALTER TABLE `user_skill_history`
  ADD CONSTRAINT `user_skill_history_activity_id_fkey` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_skill_history_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_skill_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
