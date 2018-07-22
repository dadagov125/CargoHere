import {assert} from "chai";
import * as SuperTest from "supertest";
import {ExpressApplication} from "@tsed/common";
import {bootstrap, Done, inject} from "@tsed/testing";
import {Server} from "../../app/Server";
import "mocha"
import {Transport} from "../../app/entities/Transport";
import {User} from "../../app/entities/User";
import {getDBConnection} from "../TestDB";

async function cleanDB() {
  let connection = await getDBConnection();
  await   connection.getMongoRepository(User).deleteMany({"email": "transport@test.com"});
  await   connection.getMongoRepository(Transport).deleteMany({})
}

describe("transport API", () => {


  let loginData = {
    "email": "transport@test.com",
    "password": "myPswd",
    "firstName": "test",
    "lastName": "test"
  };

  let user: User;


  let transport = new Transport();
  // transport.workTime = Date.now();
  transport.model = "Камаз 304";
  transport.mark = "Камаз";
  transport.routes = "Москва-Грозный";
  transport.type = "Самосвал";
  before(bootstrap(Server));
  before(inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
    await  cleanDB();
    SuperTest(expressApplication)
        .post("/rest/passport/signup")
        .send(loginData)
        .end((err, resp: SuperTest.Response) => {
          assert.equal(resp.status, 200);
          assert.isNotNull(resp.body._id);
          assert.equal(loginData.email, resp.body.email);
          assert.isUndefined(resp.body.pswdHash);
          user = resp.body;
          done()
        })

  }));


  describe("POST rest/transport", () => {
    it("Should return new transport", inject([ExpressApplication, Done], (expressApplication: ExpressApplication, done: Done) => {

      SuperTest(expressApplication)
          .post("/rest/transport")
          .send(transport)
          .auth(loginData.email, loginData.password)
          .end((err, resp) => {
            assert.equal(200, resp.status);
            assert.isNotNull(resp.body);
            assert.equal(user.id, resp.body.ownerId);

            transport = resp.body;

            done()
          })
    }))
  });

  describe("PUT rest/transport", () => {
    it("Should return OK", inject([ExpressApplication, Done], (expressApplication: ExpressApplication, done: Done) => {

      transport.type = "Фура";
      SuperTest(expressApplication)
          .put("/rest/transport")
          .send(transport)
          .auth(loginData.email, loginData.password)
          .end((err, resp) => {
            assert.equal(200, resp.status);
            assert.isNotNull(resp.body);
            assert.equal("OK", resp.body.message);
            done()
          })
    }))
  });

  describe("PUT rest/transport", () => {
    it("Should return Can update only owner", inject([ExpressApplication, Done], (expressApplication: ExpressApplication, done: Done) => {

      transport.ownerId = "";
      SuperTest(expressApplication)
          .put("/rest/transport")
          .send(transport)
          .auth(loginData.email, loginData.password)
          .end((err, resp) => {
            assert.equal(403, resp.status);

            assert.equal("Can update only owner", resp.text);
            done()
          })
    }))
  });

  describe("GET rest/transport/:id", () => {
    it("Should return transport by id", inject([ExpressApplication, Done], (expressApplication: ExpressApplication, done: Done) => {

      SuperTest(expressApplication)
          .get("/rest/transport/" + transport.id)
          .end((err, resp) => {

            assert.equal(200, resp.status);
            assert.equal(transport.id, resp.body._id);
            assert.equal(transport.type, resp.body.type);
            done()
          })
    }))
  })


});

