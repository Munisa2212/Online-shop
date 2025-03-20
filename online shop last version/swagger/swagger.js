const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: { 
        openapi: "3.0.0",
        info: {
            title: "Online Shop",
            version: "1.0.0",
            description: "Online shop where you can buy everything except human",
        },
        servers: [{ url: "http://localhost:3009" }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ["./routes/*.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;