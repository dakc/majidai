const MERO_DB = require("./merodb.min");
const CRYPTO = require("crypto");

// @NOTE
// users are not allowed to save  key __ID, __TM, __LG
const USER_ID = require("./constants").SESSION_VAR.userId; // __ID
const LAST_ACCESS_TIME = require("./constants").SESSION_VAR.lastAccess; // __TM
const COLLECTION_NAME = "user";

class Ksession{
  /**
   * create user collection
   * 
   * @param {number} sesTime | session alive time
   */
  constructor(sesTime) {
    // create user collection to store user data
    this.kDb = new MERO_DB();
    this.kDb.createCollection(COLLECTION_NAME, true);
    // session alive time
    this.allowedTime = sesTime;
  }

  /**
   * create a unique id with given length
   * 
   * @param {number} cnt | length of id, default is 8
   * @returns {string} unique id
   */
  uniqueId(cnt) {
    if (cnt == undefined || typeof cnt != "number") cnt = 8;
    return CRYPTO.randomBytes(cnt).toString("hex");
  }

  /**
   * generate an ID for user
   * 
   * @returns {string} unique id + current time in milliseconds
   * uqnique id will be of length 16
   * current time in ms will be of length 13
   */
  genId() {
    let id  = this.uniqueId(16);
    let timeStamp = +new Date();
    let sessId = `${id}${timeStamp}`;
    this.createUser(sessId);
    return sessId;
  }

  /**
   * insert the id, and access time in milliseconds
   * of user into user collection
   * 
   * @param {string} id 
   */
  createUser(id) {
    // from es6 var myValue = "this_is_value";var myKey = "this_is_key";var obj = {[myKey]: myValue}; // => {"this_is_key": "this_is_value"}
    this.kDb.insert({[USER_ID]: id, [LAST_ACCESS_TIME]: +new Date()});
  }

  /**
   * remove the overtimed session id 
   * and update access time for current user
   * 
   * @param {string} userId | id 
   */
  validate(userId) {
    // delete the data from session whose access time is over then the given time.
    var deleteCond = { [LAST_ACCESS_TIME]: { $lt: (+new Date() - this.allowedTime) } };
    this.kDb.delete(deleteCond);

    // update the access time to current time
    this.kDb.update({[USER_ID]: userId}, {$set: {[LAST_ACCESS_TIME]: +new Date()}});
  }

  /**
   * regenerate the id for a given user
   * 
   * @param {string} id | user id
   */
  regenId(id) {
    // delete all the datas
    this.destroy(id);
    // create new unique id
    return this.genId();
  }

  /**
   * set user data as {key:val} into db
   * 
   * @param {string} id 
   * @param {string} key 
   * @param {any} val 
   * @returns {boolean} false if failed else true
   */
  put(id, key, val) {
    if (id == undefined || id == null || id == "" || id === USER_ID || id === LAST_ACCESS_TIME) return false;
    if (key == undefined || typeof key !== "string" || key.trim() == "") return false;
    if (val == undefined) return false;

    let usrDt = this.getAll(id);
    if (typeof usrDt !== "object") return false;
    Object.defineProperty(usrDt, key, {
      value: val,
      enumerable: true,
      configurable:true
    })

    return true;
  }

  /**
   * get data for a given user
   * it will return all the documents if key is not received
   * else, will return the value of that key
   * 
   * @param {string} id 
   * @param {string} key 
   */
  get(id, key) {
    if (id == undefined || id == null || id == "") return "";
    var usrDt = this.getAll(id);
    if (key == undefined || key == null || key == "") return usrDt;

    if (usrDt.hasOwnProperty(key)) return usrDt[key];
    return "";
  }

  /**
   * get data for a given user
   * 
   * @param {string} id | user id
   */
  getAll(id) {
    return this.kDb.find({ [USER_ID]: id })[0] || {};
  }

  /**
   * delete the data with given key from user data
   * 
   * @param {string} id | user id
   * @param {string} key | key to be deleted
   */
  delete(id, key) {
    if (id == undefined || id == null || id == "") return;
    if (key == undefined || typeof key !== "string") return;
    let usrDt = this.getAll(id);
    if (typeof usrDt !== "object") return;

    if (usrDt.hasOwnProperty(key)) delete usrDt[key];
    // this.kDb.update(usrDt);
  }

  /**
   * delete all the datas for a given user
   * 
   * @param {string} id | id of the user whose data is to be deleted
   */
  destroy(id) {
    this.kDb.delete({ [USER_ID]: id });
  }

  /**
   * get all the datas from db
   */
  getAllUserData() {
    return this.kDb.find({});
  }
}

module.exports = Ksession;