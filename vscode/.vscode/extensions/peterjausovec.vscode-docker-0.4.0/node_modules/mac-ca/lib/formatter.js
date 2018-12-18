const forge = require('node-forge');
const package = require('../package.json');

var formats = module.exports.validFormats = {
  der: 0,
  pem: 1,
  txt: 2,
  asn1: 3
};

function myASN(pem) {
  const der = forge.pki.pemToDer(pem);
  const asn1 = forge.asn1;
  var crt = asn1.fromDer(der.data.toString('binary')).value[0].value;
  const serial = crt[0];
  const hasSerial = serial.tagClass === asn1.Class.CONTEXT_SPECIFIC && serial.type === 0 && serial.constructed;
  crt = crt.slice(hasSerial);
  return {
    serial: crt[0],
    issuer: crt[2],
    valid: crt[3],
    subject: crt[4]
  };
}

function txtFormat(pem) {
  const crt = myASN(pem);
  const d = new Date();
  return `Subject\t${crt.subject.value.map(rdn => rdn.value[0].value[1].value).join('/')}
Valid\t${crt.valid.value.map(date => date.value).join(' - ')}
Saved\t${d.toLocaleDateString()} ${d.toTimeString().replace(/\s*\(.*\)\s*/, '')} by ${package.name}@${package.version}
${pem}`;
}

module.exports.transform = function(format) {
  return function(pem) {
    try{
      switch(format){
        case formats.der:
          return forge.pki.pemToDer(pem);
        case formats.pem:
          return pem;
        case formats.txt:
          return txtFormat(pem);
        case formats.asn1:
          return myASN(pem);
        default:
          return forge.pki.certificateFromPem(pem);
      }
    } catch(er) {
      return;
    }
  };
};
