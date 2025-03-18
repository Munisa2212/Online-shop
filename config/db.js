const {Sequelize} = require('sequelize');

const db = new Sequelize("test","root","12345678",{
    host: "localhost",
    dialect: "mysql",
})

async function connectDB() {
    try {
        await db.authenticate();
        console.log("Connected to database");
        await db.sync({force: true});
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

module.exports = {db, connectDB};
