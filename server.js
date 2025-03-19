const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./config/db');
const UserRoute = require('./routes/user.route');
const ProductRoute = require('./routes/product.route');
const RegionRoute = require('./routes/region.route');
const CategoryRoute = require("./routes/category.route");
const OrderRoute = require("./routes/order.route");
const CommentRoute = require("./routes/comment.route");

const app = express();
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "Documentation for the API routes",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                UploadResponse: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL of the uploaded file",
                        },
                    },
                    example: {
                        url: "http://localhost:3000/uploads/unique-file-name.jpg",
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ["./routes/*.js", "./server.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: The URL of the uploaded file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 */
app.post("/upload", upload.single("file"), (req, res) => {
    res.send({ url: `http://localhost:3000/uploads/${req.file.filename}` });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use('/user', UserRoute);
app.use('/product', ProductRoute);
app.use('/region', RegionRoute);
app.use('/category', CategoryRoute);
app.use('/order', OrderRoute);
app.use('/comment', CommentRoute);

app.listen(3000, () => console.log('Server is running on port 3000'));
