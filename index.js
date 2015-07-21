function createFixedLengthTextParser(execlib) {
  'use strict';
  var lib = execlib.lib;

  function FixedLengthTextParser(options) {
    if('number' !== typeof this.recordDelimiter){
      throw new lib.Error('NO_RECORD_DELIMITER','FixedLengthTextParser must have a recordDelimiter defined in its prototype');
    }
    if(!this.fieldDescriptor){
      throw new lib.Error('NO_FIELD_DESCRIPTOR','FixedLengthTextParser must have a fieldDescriptor defined in its prototype');
    }
    this.buffer = null;
  }
  FixedLengthTextParser.prototype.destroy = function () {
    this.buffer = null;
  };
  FixedLengthTextParser.prototype.fileToData = function (data) {
    var ret;
    if (this.isNewRecord(data)) {
      ret = this.buffer;
      this.buffer = this.createBuffer(data);
    } else {
      this.augmentBuffer(data);
    }
    if (ret) {
      return ret;
    }
  };
  FixedLengthTextParser.prototype.finalize = function(){
    if(this.buffer){
      return this.buffer;
    }
  };
  FixedLengthTextParser.prototype.isNewRecord = function (data) {
    return true;
  };
  FixedLengthTextParser.prototype.createBuffer = function (data) {
    var ret = {};
    lib.traverse(this.fieldDescriptor, this.createFileToDataItem.bind(this, data, ret));
    return ret;
  };
  FixedLengthTextParser.prototype.createFileToDataItem = function (inputbuffer, resulthash, fieldprocessor, fieldprocessorname) {
    var range = fieldprocessor.range,
      rangelen = range[1]-range[0],
      align = fieldprocessor.align,
      item = inputbuffer.toString('utf8', fieldprocessor.range[0], fieldprocessor.range[1]).trim();
    if(!align && item.length!==rangelen){
      throw new lib.Error('FIELD_WITHOUT_ALIGN_MUST_HAVE_FULL_LENGTH','Field that should have been '+rangelen+' long turned out to be '+item.length+' long');
    }
    resulthash[fieldprocessorname] =  item;
  };
  FixedLengthTextParser.prototype.recordDelimiter = null;
  FixedLengthTextParser.prototype.fieldDescriptor = null;
  return FixedLengthTextParser;
}

module.exports = createFixedLengthTextParser;
