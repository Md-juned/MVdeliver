import { Sequelize } from 'sequelize';
import dbConfig from '../common/config/db.js';
import User from './User.js';
import Admin from './Admin.js';
import DeviceToken from './DeviceToken.js';
import FoodCategory from './FoodCategory.js';
import Product from './Product.js';
import Restaurant from './Restaurant.js';
import Addon from './Addon.js';
import ProductAddon from './ProductAddon.js';
import ProductSize from './ProductSize.js';
import ProductSpecification from './ProductSpecification.js';
import Cuisine from './Cuisine.js';
import City from './City.js';
import Favorite from './Favorite.js';
import Cart from './Cart.js';
import Deliveryman from './Deliveryman.js';
import Coupon from './Coupon.js';
import Offer from './Offer.js';
import OfferProduct from './OfferProduct.js';



const sequelize = new Sequelize(dbConfig.url, {
    ...dbConfig,
});

const models = {
    User: User(sequelize, Sequelize.DataTypes),
    DeviceToken: DeviceToken(sequelize, Sequelize.DataTypes),
    Admin: Admin(sequelize, Sequelize.DataTypes),
    FoodCategory: FoodCategory(sequelize, Sequelize.DataTypes),
    Product: Product(sequelize, Sequelize.DataTypes),
    Restaurant: Restaurant(sequelize, Sequelize.DataTypes),
    Addon: Addon(sequelize, Sequelize.DataTypes),
    ProductAddon: ProductAddon(sequelize, Sequelize.DataTypes),
    ProductSize: ProductSize(sequelize, Sequelize.DataTypes),
    ProductSpecification: ProductSpecification(sequelize, Sequelize.DataTypes),
    Cuisine: Cuisine(sequelize, Sequelize.DataTypes),
    City: City(sequelize, Sequelize.DataTypes),
    Favorite: Favorite(sequelize, Sequelize.DataTypes),
    Cart: Cart(sequelize, Sequelize.DataTypes),
    Deliveryman: Deliveryman(sequelize, Sequelize.DataTypes),
    Coupon: Coupon(sequelize, Sequelize.DataTypes),
    Offer: Offer(sequelize, Sequelize.DataTypes),
    OfferProduct: OfferProduct(sequelize, Sequelize.DataTypes),

};

// Setup associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;