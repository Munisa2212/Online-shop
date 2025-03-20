const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./config/db');
const swaggerDocs = require('./swagger/swagger');
const UserRoute = require('./routes/user.route');
const ProductRoute = require('./routes/product.route');
const RegionRoute = require('./routes/region.route');
const CategoryRoute = require("./routes/category.route");
const OrderRoute = require("./routes/order.route");
const CommentRoute = require("./routes/comment.route");
const UploadRoute = require("./routes/upload.route");

const app = express();
app.use(express.json());



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDB();
app.use("/upload",UploadRoute);
app.use('/user', UserRoute);
app.use('/product', ProductRoute);
app.use('/region', RegionRoute);
app.use('/category', CategoryRoute);
app.use('/order', OrderRoute);
app.use('/comment', CommentRoute);

app.listen(3000, () => console.log('Server is running on port 3000'));