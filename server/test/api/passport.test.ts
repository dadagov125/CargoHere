import {assert, expect} from "chai";
import * as SuperTest from "supertest";
import {ExpressApplication} from "@tsed/common";
import {bootstrap, Done, inject} from "@tsed/testing";
import {Server} from "../../app/Server";
import {getDBConnection} from "../TestDB";
import {User} from "../../app/entities/User";

async function cleanDB() {
  let connection = await getDBConnection();
  await   connection.getMongoRepository(User).deleteMany({"email": "passport@test.com"})
}


describe("Passport API", () => {

  before(bootstrap(Server));
  after(async () => {
    await cleanDB()
  });

  describe("POST rest/passport/signup", () => {
    let regData = {
      "email": "passport@test.com",
      "password": "myPswd",
      "firstName": "test",
      "lastName": "test"
    };

    before(async () => {
      await cleanDB()
    });
    it("Should return new user", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      SuperTest(expressApplication)
          .post("/rest/passport/signup")
          .send(regData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 200);
            assert.isNotNull(resp.body._id);
            assert.equal(regData.email, resp.body.email);
            assert.isUndefined(resp.body.pswdHash);
            done()
          })
    }));

    it("Should return email already registered", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      SuperTest(expressApplication)
          .post("/rest/passport/signup")
          .send(regData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 400);
            assert.equal(resp.text, "Email is already registered");
            done()
          })
    }));

    it("Should return Email is invalid", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      regData.email = "blabla.aa";
      SuperTest(expressApplication)
          .post("/rest/passport/signup")
          .send(regData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 400);
            assert.equal(resp.text, "Email is invalid");
            done()
          })
    }))


  });

  describe("POST rest/passport/sigin", () => {
    let loginData = {
      "email": "passport@test.com",
      "password": "myPswd"
    };


    it("Should login success", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      SuperTest(expressApplication)
          .post("/rest/passport/signin")
          .send(loginData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 200);
            assert.equal(loginData.email, resp.body.email);
            assert.isNotNull(resp.body._id);
            done()
          })
    }));

    it("Should return Password invalid", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      loginData.password = "blabla";
      SuperTest(expressApplication)
          .post("/rest/passport/signin")
          .send(loginData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 404);
            assert.equal(resp.text, "Password invalid");
            done()
          })
    }));

    it("Should return User not found", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      loginData.email = loginData.email + "blabla";
      SuperTest(expressApplication)
          .post("/rest/passport/signin")
          .send(loginData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 404);
            assert.equal(resp.text, "User not found");
            done()
          })
    }));

    it("Should return Email is invalid", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      loginData.email = "blabla";
      SuperTest(expressApplication)
          .post("/rest/passport/signin")
          .send(loginData)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 400);
            assert.equal(resp.text, "Email is invalid");
            done()
          })
    }));


  });

  describe("POST rest/passport/info", () => {

    let loginData = {
      "email": "passport@test.com",
      "password": "myPswd"
    };


    it("Should return user info", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      SuperTest(expressApplication)
          .post("/rest/passport/info")
          .auth(loginData.email, loginData.password)
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 200);
            assert.equal(loginData.email, resp.body.email);
            assert.isNotNull(resp.body._id);
            done()
          })
    }));

    it("Should return Unauthenticated", inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
      SuperTest(expressApplication)
          .post("/rest/passport/info")
          .end((err, resp: SuperTest.Response) => {
            assert.equal(resp.status, 403);
            assert.equal(resp.text, "Unauthenticated");
            done()
          })
    }));

  })

});

