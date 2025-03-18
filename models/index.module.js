const { Product } = require("./product.model");
const { Category } = require("./category.model");
const { Region } = require("./region.model");
const { User } = require("./user.model");
const { Order } = require("./order.model");
const { OrderItem } = require("./orderItem.model");
const { Comment } = require("./comment.model");

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Comment, { foreignKey: "product_id" });
Comment.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

Region.hasMany(User, { foreignKey: "region_id" });
User.belongsTo(Region, { foreignKey: "region_id" });

module.exports = {
    User,
    Order,
    OrderItem,
    Comment,
    Product,
    Category,
    Region,
}