const { Product } = require('./product.module')
const { Category } = require('./category.module')
const { Region } = require('./region.module')
const { User } = require('./user.module')
const { Order } = require('./order.module')
const { OrderItem } = require('./order_item.module')
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

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
OrderItem.belongsTo(Product, {
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
  OrderItem,
  Comment,
  Product,
  Category,
  Region,
}
