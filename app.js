const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
    extname: "hbs",
  })
);

app.get("/", function (request, response) {
  const model = {
    humans: dummyData.humans,
  };
  response.render("homepage.hbs", model);
});

app.get("/projects", function (request, response) {
  response.render("projects.hbs", {});
});

app.listen(8080);
