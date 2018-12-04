var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class Condition {
       
    constructor() {
        this.field = null;
        this.inCondition = new Array();
        this.notInCondition = new Array();
        this.likeCondition = null;
        this.notLikeCondition = null;
        this.eqCondition = null;
        this.neqCondition = null;
        this.charIdxCondition = null;
        this.patIdxCondition = null;
        this.isNullCondition = false;
        this.isNotNullCondition = false;
        this.isFieldRef = false;
        this.activeCondition = null;
        this.whereConditionType = null;
        this.lenCondition = null;
        this.dateDiffCondition = null;
    }

    setField(field) { this.field = field; }

    getField() { return this.field; }

    setInCondition(condition) { this.inCondition = condition; }

    getInCondition() { return this.inCondition; }

    setNotInCondition(condition) { this.notInCondition = condition; }

    getNotInCondition() { return this.notInCondition; }

    setLikeCondition(condition) { this.likeCondition = condition; }

    getLikeCondition() { return this.likeCondition; }

    setNotLikeCondition(condition) { this.notLikeCondition = condition; }

    getNotLikeCondition() { return this.notLikeCondition; }

    setEqCondition(condition){  this.eqCondition = condition; }

    getEqCondition() {  return this.eqCondition; }

    setNeqCondition(condition){  this.neqCondition = condition; }

    getNeqCondition() {  return this.neqCondition; }

    setCharIdxCondition(condition) { return this.charIdxCondition = condition; }

    getCharIdxCondition() { return this.charIdxCondition; }

    setPatIdxCondition(condition) { return this.patIdxCondition = condition; }

    getPatIdxCondition() { return this.patIdxCondition; }

    setIsNullCondition(condition){  this.isNullCondition = condition; }

    getIsNullCondition() {  return this.isNullCondition; }

    setIsNotNullCondition(condition){  this.isNotNullCondition = condition; }

    getIsNotNullCondition() {  return this.isNotNullCondition; }

    setLenCondition(condition) { this.lenCondition = condition; }

    getLenCondition() { return this.lenCondition; }

    setIsFieldRef(ref){  this.isFieldRef = ref; }

    getIsFieldRef() {  return this.isFieldRef; }

    setActiveCondition(condition){  this.activeCondition = condition; }

    getActiveCondition() {  return this.activeCondition; }

    setWhereConditionType(type) { this.whereConditionType = type; }

    getWhereConditionType() { return this.whereConditionType; }

    setDateDiffCondition(condition) { this.dateDiffCondition = condition; }

    getDateDiffCondition() { return this.dateDiffCondition; }

}

module.exports = Condition;