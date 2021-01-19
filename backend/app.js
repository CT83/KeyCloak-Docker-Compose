var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var Keycloak = require('keycloak-connect');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());

// Enable CORS support
app.use(cors());

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwUEk1UTFidWJXVlRxWTVUSHlSZExBM1Vwekh5TXdFQnc0MkNvTWVrUEhFIn0.eyJleHAiOjE2MTEwNjI1NDAsImlhdCI6MTYxMTA1Mzk1MywiYXV0aF90aW1lIjoxNjExMDI2NTQxLCJqdGkiOiIzZjUwNzAzZS0xMTA0LTQ2MTctYjY1MS1lMTI3ZmQ1YzBkYzUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvVGVzdFJlYWxtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjM2NjMzMTljLTkxNDMtNDU2Mi1iOTZhLTY2YTA1MjlkMDYwYSIsInR5cCI6IkJlYXJlciIsImF6cCI6InJlYWN0LXdlYi1hcHAiLCJub25jZSI6ImQ2ZGZiMWNhLWVjY2UtNDBkYi1hMjI0LWFlM2M4MzMzNmVjOCIsInNlc3Npb25fc3RhdGUiOiIxNGI0YTdiNi0wYjEzLTQ0ZDEtOTMwYy00YmI1Y2I4OTY4NDUiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJhcHAtdXNlciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWN0LXdlYi1hcHAiOnsicm9sZXMiOlsidXNlciJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgY2xpZW50X3JvbGVzX3JlYWN0LXdlYi1hcHAgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlcjEiLCJ0b2tlbl9jbGFpbV9uYW1lIjpbInVzZXIiXX0.NOXBsTngaXc8aHSshhfDyKHYCAahMZODf9DFOuGEJvmSHTSFUH822TCk9DfMVvI_R90Rk4KJJlsNqzuTGJ9lRWNWhMH8hH8jhdR7U7O5_69UCLuHrE4YWj45OD6lLIg7AYBwBU7mSjp9_rhMKMSSb3S4nTy0R_i2bVjtfk3otW9mkzhY9em0TO5TPAuVffJKMoscCKWwQwvMw3cHcw2XgmV0xxlPqt2VJJ5F_eCjYo14g66xBdnViAg61OhP0Uu_GKjwhg4fiQZdsISpj8I6YSh9uLvuRkeqzYgpNkkeyAlVVQcR1DMd_eXq5PigIpUSePrfwaGWWEcZ42JyiLk3KA',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

var keycloakConfig = {
  "realm": "TestRealm",
  "bearer-only": true,
  "auth-server-url": "http://localhost:8080/auth/",
  "ssl-required": "external",
  "resource": "node-microservice",
  "verify-token-audience": true,
  "use-resource-role-mappings": true,
  "confidential-port": 0
}

var keycloak = new Keycloak({
  store: memoryStore
}, keycloakConfig);

app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

app.get('/service/public', function (req, res) {
  res.json({ message: 'public' });
});

app.get('/service/secured', keycloak.protect('user'), function (req, res) {
  res.json({ message: 'secured' });
});

app.get('/service/admin', keycloak.protect('admin'), function (req, res) {
  res.json({ message: 'admin' });
});

app.use('*', function (req, res) {
  res.send('Not found!');
});

app.listen(5000, function () {
  console.log('Started at port 5000');
});
