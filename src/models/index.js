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
import OfferDealBanner from './OfferDealBanner.js';
import PromotionalBanner from './PromotionalBanner.js';
import SellerWithdrawMethod from './SellerWithdrawMethod.js';
import SellerWithdrawRequest from './SellerWithdrawRequest.js';
import DeliveryWithdrawMethod from './DeliveryWithdrawMethod.js';
import DeliveryWithdrawRequest from './DeliveryWithdrawRequest.js';
import Currency from './Currency.js';
import Setting from './Setting.js';
import PaymentGateway from './PaymentGateway.js';
import BlogCategory from './BlogCategory.js';
import Blog from './Blog.js';
import BlogComment from './BlogComment.js';
import AboutUsPage from './AboutUsPage.js';
import TermsConditionsPage from './TermsConditionsPage.js';
import PrivacyPolicyPage from './PrivacyPolicyPage.js';
import ContactUsPage from './ContactUsPage.js';
import LoginPage from './LoginPage.js';
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
    OfferDealBanner: OfferDealBanner(sequelize, Sequelize.DataTypes),
    PromotionalBanner: PromotionalBanner(sequelize, Sequelize.DataTypes),
    SellerWithdrawMethod: SellerWithdrawMethod(sequelize, Sequelize.DataTypes),
    SellerWithdrawRequest: SellerWithdrawRequest(sequelize, Sequelize.DataTypes),
    DeliveryWithdrawMethod: DeliveryWithdrawMethod(sequelize, Sequelize.DataTypes),
    DeliveryWithdrawRequest: DeliveryWithdrawRequest(sequelize, Sequelize.DataTypes),
    Currency: Currency(sequelize, Sequelize.DataTypes),
    Setting: Setting(sequelize, Sequelize.DataTypes),
    PaymentGateway: PaymentGateway(sequelize, Sequelize.DataTypes),
    BlogCategory: BlogCategory(sequelize, Sequelize.DataTypes),
    Blog: Blog(sequelize, Sequelize.DataTypes),
    BlogComment: BlogComment(sequelize, Sequelize.DataTypes),
    AboutUsPage: AboutUsPage(sequelize, Sequelize.DataTypes),
    TermsConditionsPage: TermsConditionsPage(sequelize, Sequelize.DataTypes),
    PrivacyPolicyPage: PrivacyPolicyPage(sequelize, Sequelize.DataTypes),
    ContactUsPage: ContactUsPage(sequelize, Sequelize.DataTypes),
    LoginPage: LoginPage(sequelize, Sequelize.DataTypes),

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