var pomParser = require("../lib");
var expect = require('chai').expect

var POM_CONTENT = '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
  '    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">' +
  '  <parent>' +
  '    <artifactId>tynamo-parent</artifactId>' +
  '    <groupId>org.tynamo</groupId>' +
  '    <version>0.0.9</version>' +
  '  </parent>' +
  '  <modelVersion parallel="now">4.0.0</modelVersion>'+
  '  <groupId>org.tynamo.examples</groupId>' +
  '  <artifactId>tynamo-example-federatedaccounts</artifactId>' +
  '  <version>0.0.1-SNAPSHOT</version>' +
  '  <packaging>war</packaging>' +
  '  <name>Tynamo Example - Federated Accounts</name>' +
  '</project>';

describe('require("pom-parser") using xml content', function () {

  describe('loading from strings', function() {
    var pomResponse = null;
    var pom = null;

    // Setup the tests using mocha's promise.
    before(function(done) {
      pomParser.parse({xmlContent: POM_CONTENT}, function(err, response) {
        expect(err).to.be.null;
        expect(response).to.be.an("object");

	pomResponse = response;
	pom = pomResponse.pomObject;
	done();
      });
    });

    // Tear down the tests by printing the loaded xml and the parsed object.
    after(function(done) {
      console.log("\n\nThe XML loaded");
      console.log(POM_CONTENT);
      console.log("\n\nThe parsed XML");
      console.log(JSON.stringify(pom, null, 2));
      done();
    });
 
    it('can parse any pom xml in strings properly', function(done) {
      expect(pomResponse.pomObject).to.be.an("object");
      done();
    });

    it('parses xml attributes as properties', function(done) {
      expect(pom.project.xmlns).to.equal("http://maven.apache.org/POM/4.0.0");
      expect(pom.project["xmlns:xsi"]).to.equal("http://www.w3.org/2001/XMLSchema-instance"); 
      done();
    });

    it('parses xml elements as properties', function(done) {
      expect(pom.project.parent).to.be.an("object");
      expect(pom.project.parent.artifactid).to.equal("tynamo-parent");
      done();
    });

  });
});
