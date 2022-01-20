var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin");
var _answer = require("./answer");
var _calOption = require("./calOption");
var _calculator = require("./calculator");
var _certiContent = require("./certiContent");
var _certification = require("./certification");
var _comment = require("./comment");
var _community = require("./community");
var _file = require("./file");
var _post = require("./post");
var _question = require("./question");
var _recommend = require("./recommend");
var _tree = require("./tree");
var _user = require("./user");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes);
  var answer = _answer(sequelize, DataTypes);
  var calOption = _calOption(sequelize, DataTypes);
  var calculator = _calculator(sequelize, DataTypes);
  var certiContent = _certiContent(sequelize, DataTypes);
  var certification = _certification(sequelize, DataTypes);
  var comment = _comment(sequelize, DataTypes);
  var community = _community(sequelize, DataTypes);
  var file = _file(sequelize, DataTypes);
  var post = _post(sequelize, DataTypes);
  var question = _question(sequelize, DataTypes);
  var recommend = _recommend(sequelize, DataTypes);
  var tree = _tree(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  answer.belongsTo(calOption, { as: "opt", foreignKey: "optId"});
  calOption.hasMany(answer, { as: "answers", foreignKey: "optId"});
  question.belongsTo(calculator, { as: "calc", foreignKey: "calcId"});
  calculator.hasMany(question, { as: "questions", foreignKey: "calcId"});
  comment.belongsTo(certiContent, { as: "certiContent", foreignKey: "certiContentId"});
  certiContent.hasMany(comment, { as: "comments", foreignKey: "certiContentId"});
  file.belongsTo(certiContent, { as: "certiContent", foreignKey: "certiContentId"});
  certiContent.hasMany(file, { as: "files", foreignKey: "certiContentId"});
  recommend.belongsTo(certiContent, { as: "certiContent", foreignKey: "certiContentId"});
  certiContent.hasMany(recommend, { as: "recommends", foreignKey: "certiContentId"});
  certiContent.belongsTo(certification, { as: "certiTitle", foreignKey: "certiTitleId"});
  certification.hasMany(certiContent, { as: "certiContents", foreignKey: "certiTitleId"});
  post.belongsTo(community, { as: "board", foreignKey: "boardId"});
  community.hasMany(post, { as: "posts", foreignKey: "boardId"});
  comment.belongsTo(post, { as: "writ", foreignKey: "writId"});
  post.hasMany(comment, { as: "comments", foreignKey: "writId"});
  file.belongsTo(post, { as: "writ", foreignKey: "writId"});
  post.hasMany(file, { as: "files", foreignKey: "writId"});
  recommend.belongsTo(post, { as: "writ", foreignKey: "writId"});
  post.hasMany(recommend, { as: "recommends", foreignKey: "writId"});
  calOption.belongsTo(question, { as: "qtn", foreignKey: "qtnId"});
  question.hasMany(calOption, { as: "calOptions", foreignKey: "qtnId"});
  answer.belongsTo(user, { as: "uid_user", foreignKey: "uid"});
  user.hasMany(answer, { as: "answers", foreignKey: "uid"});
  certiContent.belongsTo(user, { as: "uid_user", foreignKey: "uid"});
  user.hasMany(certiContent, { as: "certiContents", foreignKey: "uid"});
  comment.belongsTo(user, { as: "uid_user", foreignKey: "uid"});
  user.hasMany(comment, { as: "comments", foreignKey: "uid"});
  post.belongsTo(user, { as: "uid_user", foreignKey: "uid"});
  user.hasMany(post, { as: "posts", foreignKey: "uid"});
  recommend.belongsTo(user, { as: "uid_user", foreignKey: "uid"});
  user.hasMany(recommend, { as: "recommends", foreignKey: "uid"});

  return {
    admin,
    answer,
    calOption,
    calculator,
    certiContent,
    certification,
    comment,
    community,
    file,
    post,
    question,
    recommend,
    tree,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
