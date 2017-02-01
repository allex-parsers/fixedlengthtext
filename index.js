function createFixedLengthTextParser(execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    parserRegistry = execSuite.parserRegistry,
    d = q.defer();

  parserRegistry.register('allex_baseparser').done(
    doCreate.bind(null, d)
  );

  function doCreate(defer, BaseParser) {
    function FixedLengthTextParser(options) {
      BaseParser.call(this, options);
      if('number' !== typeof this.recordDelimiter){
        throw new lib.Error('NO_RECORD_DELIMITER','FixedLengthTextParser must have a recordDelimiter defined in its prototype');
      }
      if(!this.fieldDescriptor){
        throw new lib.Error('NO_FIELD_DESCRIPTOR','FixedLengthTextParser must have a fieldDescriptor defined in its prototype');
      }
      this.buffer = null;
    }
    lib.inherit (FixedLengthTextParser, BaseParser);
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
        return this.postProcessFileToData(ret);
      }
    };
    FixedLengthTextParser.prototype.finalize = function(){
      var buff = this.buffer;
      this.buffer = null;
      if(buff){
        return this.postProcessFileToData(buff);
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
    defer.resolve(FixedLengthTextParser);
  }

  return d.promise;
}

module.exports = createFixedLengthTextParser;
