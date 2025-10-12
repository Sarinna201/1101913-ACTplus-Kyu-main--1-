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