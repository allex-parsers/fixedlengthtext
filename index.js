function createLib(execlib) {
  return execlib.loadDependencies('client', ['allex:base:parser'], createFixedLengthTextParser.bind(null, execlib));
}

function createFixedLengthTextParser(execlib, BaseParser) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    parserRegistry = execSuite.parserRegistry;

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
    var range, rangelen, align, item;
    range = fieldprocessor.range;
    if (!range) {
      resulthash[fieldprocessorname] = null;
      return;
    }
    rangelen = range[1]-range[0];
    align = fieldprocessor.align;
    item = inputbuffer.toString('utf8', range[0], range[1]).trim();
    if(!align && item.length!==rangelen){
      throw new lib.Error('FIELD_WITHOUT_ALIGN_MUST_HAVE_FULL_LENGTH','Field that should have been '+rangelen+' long turned out to be '+item.length+' long');
    }
    resulthash[fieldprocessorname] = item;
  };
  FixedLengthTextParser.prototype.recordDelimiter = null;
  FixedLengthTextParser.prototype.fieldDescriptor = null;

  return q(FixedLengthTextParser);
}

module.exports = createLib;
