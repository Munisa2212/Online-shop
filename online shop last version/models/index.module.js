const { Product } = require('./product.module')
const { Category } = require('./category.module')
const { Region } = require('./region.module')
const { User } = require('./user.module')
const { Order } = require('./order.module')
const { Order_item } = require('./order_item.module')
const { Comment } = require('./comment.module')

User.hasMany(Order, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Order.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Order.hasMany(Order_item, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Order_item.belongsTo(Order, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Product.hasMany(Order_item, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Order_item.belongsTo(Product, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Product.hasMany(Comment, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Comment.belongsTo(Product, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

User.hasMany(Comment, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Category.hasMany(Product, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Region.hasMany(User, {
  foreignKey: 'region_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
User.belongsTo(Region, {
  foreignKey: 'region_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

module.exports = {
  User,
  Order,
  Order_item,
  Comment,
  Product,
  Category,
  Region,
}
