import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: Number(process.env.MYSQL_PORT),
});

try {
    const [results, fields] = await connection.query(
        'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45'
    );

    console.log(results); // results contains rows returned by server
    console.log(`Database is working`);
    console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
    console.log(err);
}

try {
    const [results] = await connection.query(
        'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
        ['Page', 45]
    );
    console.log(results);
} catch (err) {
    console.log(err);
}

export default connection