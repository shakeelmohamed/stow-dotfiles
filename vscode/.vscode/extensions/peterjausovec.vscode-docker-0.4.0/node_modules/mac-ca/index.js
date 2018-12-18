const https = require('https');
const formatter = require('./lib/formatter');

if (process.platform !== 'darwin') {
  module.exports.all = () => [];
  module.exports.each = () => {};
  return;
}

const child_process = require('child_process');

const splitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;
const systemRootCertsPath = '/System/Library/Keychains/SystemRootCertificates.keychain';
const args = [ 'find-certificate', '-a', '-p' ];

const allTrusted = child_process.spawnSync('/usr/bin/security', args)
  .stdout.toString().split(splitPattern);

const allRoot = child_process.spawnSync('/usr/bin/security', args.concat(systemRootCertsPath))
  .stdout.toString().split(splitPattern);

https.globalAgent.options.ca = https.globalAgent.options.ca || [];

const ca = https.globalAgent.options.ca;

function duplicated(cert, index, arr) {
  return arr.indexOf(cert) === index;
}

const all = allTrusted.concat(allRoot);

all.filter(duplicated).forEach(cert => ca.push(cert));

module.exports.der2 = formatter.validFormats;

module.exports.all = function(format){
  return all
    .map(formatter.transform(format))
    .filter(c => c);
};

module.exports.each = function(format, callback) {
  if (typeof format === 'function') {
    callback = format;
    format = undefined;
  }
  return all
    .map(formatter.transform(format))
    .filter(c => c)
    .forEach(callback);
};
