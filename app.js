const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");
const ITEM_NAME_MAX_LENGTH = 50;
const ITEM_DESCRIPTION_MAX_LENGTH = 100;
const ITEM_DESCRIPTION_FULL_MAX_LENGTH = 500;
const ITEM_HTML_LINK_MAX_LENGTH = 100;
const ITEM_FAQ_MAX_LENGTH = 500;

const ADMIN_USERNAME = "Kajsa";
const ADMIN_PASSWORD = "PappaÄrBäst";

const db = new sqlite3.Database("wdf_portfolio.db");

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
    extname: "hbs",
  })
);

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: "fdgfdskdjslakfj",
  })
);

app.use(function (request, response, next) {
  response.locals.session = request.session;
  next();
});

app.get("/", function (request, response) {
  isLoggedIn = request.session.isLoggedIn;

  const query = `SELECT * FROM Projects LIMIT 3`;

  db.all(query, function (error, projects) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      projects,
      isLoggedIn,
    };

    response.render("homepage.hbs", model);
  });
});

app.get("/projects", function (request, response) {
  const query = `SELECT * FROM Projects`;
  isLoggedIn = request.session.isLoggedIn;

  db.all(query, function (error, projects) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      projects,
      isLoggedIn
    };

    response.render("projects.hbs", model);
  });
});

app.get("/project/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM Projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, project) {
    const model = {
      project,
    };

    response.render("project.hbs", model);
  });
});

app.get("/projects/create", function (request, response) {
  response.render("create_project.hbs");
});

app.post("/projects/create", function (request, response) {
  console.log("request.body:", request.body);

  const name = request.body.name;
  const description = request.body.description;
  const description_full = request.body.description_full;
  const html_link = request.body.html_link;

  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("Not logged in");
  }

  if (name == "") {
    errorMessages.push("Name can't be empty");
  } else if (ITEM_NAME_MAX_LENGTH < name.length) {
    errorMessages.push(
      "Description may be at most " + ITEM_NAME_MAX_LENGTH + " characters long"
    );
  }

  if (ITEM_DESCRIPTION_MAX_LENGTH < description.length) {
    errorMessages.push(
      "Description may be at most " +
        ITEM_DESCRIPTION_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_DESCRIPTION_FULL_MAX_LENGTH < description_full.length) {
    errorMessages.push(
      "Full Description may be at most " +
        ITEM_DESCRIPTION_FULL_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_HTML_LINK_MAX_LENGTH < name.length) {
    errorMessages.push(
      "HTML Link may be at most " +
        ITEM_HTML_LINK_MAX_LENGTH +
        " characters long"
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO projects (name, description, description_full, html_link) VALUES (?, ?, ?, ?)`;
    // Note: id is auto inserted by the databas

    const values = [name, description, description_full, html_link];

    db.run(query, values, function (error) {
      console.log(error);

      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          name,
          description,
          description_full,
          html_link,
        };

        response.render("create_project.hbs", model);
      } else {
        response.redirect("/projects");
      }
    });
  } else {
    const model = {
      errorMessages,
      name,
      description,
      description_full,
      html_link,
    };

    response.render("create_project.hbs", model);
  }
});

app.get("/projects/update/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM Projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, project) {
    const model = {
      project,
    };

    response.render("update_project.hbs", model);
  });
});

app.post("/projects/update/:id", function (request, response) {
  const name = request.body.name;
  const description = request.body.description;
  const description_full = request.body.description_full;
  const html_link = request.body.html_link;
  const id = request.params.id;

  const errorMessages = [];

  if (name == "" || typeof name === "undefined") {
    errorMessages.push("Name can't be empty");
  } else if (ITEM_NAME_MAX_LENGTH < name.length) {
    errorMessages.push(
      "Description may be at most " +
        ITEM_NAME_TITLE_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_DESCRIPTION_MAX_LENGTH < description.length) {
    errorMessages.push(
      "Description may be at most " +
        ITEM_DESCRIPTION_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_DESCRIPTION_MAX_LENGTH < description_full.length) {
    errorMessages.push(
      "Full Description may be at most " +
        ITEM_DESCRIPTION_FULL_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_HTML_LINK_MAX_LENGTH < name.length) {
    errorMessages.push(
      "Name may be at most " + ITEM_HTML_LINK_MAX_LENGTH + " characters long"
    );
  }

  if (errorMessages.length == 0) {
    const query = `UPDATE projects SET name =?, description = ?, description_full =?, html_link = ? WHERE id = ?`;

    const values = [name, description, description_full, html_link, id];

    db.run(query, values, function (error) {
      console.log(error);

      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          name,
          description,
          description_full,
          html_link,
          id,
        };

        response.render("update_project.hbs", model);
      } else {
        response.redirect("/projects");
      }
    });
  } else {
    const model = {
      errorMessages,
      name,
      description,
      description_full,
      html_link,
      id,
    };
    response.render("create_project.hbs", model);
  }
});

app.get("/projects/delete/:id", function (request, response) {
  const id = request.params.id;
  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("Not logged in");
  }

  if (typeof id === "undefined") {
    errorMessages.push("No record specified");
  }

  if (errorMessages.length == 0) {
    const query = `DELETE FROM Projects WHERE id = ?`;
    const values = [id];

    db.run(query, values, function (error, project) {
      const model = {
        project,
      };

      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          id,
        };
        console.log("hejhopp");
        response.redirect("/project_adminpage");
      } else {
        response.redirect("/project_adminpage");
        //response.render("adminpage.hbs", model);
      }
    });
  } else {
    const model = {
      errorMessages,
      id,
    };

    response.render("project_adminpage.hbs", model);
  }
});

app.get("/create_project", function (request, response) {
  response.render("create_project.hbs");
});

app.get("/faq", function (request, response) {
  const query = `SELECT * FROM FAQ WHERE reply NOT NULL`;

  db.all(query, function (error, faq) {
    const errorMessages = [];

    console.log(faq);
    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      faq,
    };

    response.render("faq.hbs", model);
  });
});

app.post("/faq", function (request, response) {
  const question = request.body.question;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("Question can't be empty");
  } else if (ITEM_NAME_MAX_LENGTH < question.length) {
    errorMessages.push(
      "Description may be at most " + ITEM_NAME_MAX_LENGTH + " characters long"
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO faq (question) VALUES (?)`;
    // Note: id is auto inserted by the databas

    const value = [question];

    db.run(query, value, function (error) {
      console.log(error);

      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          question,
        };

        response.render("faq.hbs", model);
      } else {
        const updated = true;

        response.redirect("/faq");
      }
    });
  } else {
    const model = {
      errorMessages,
      question,
    };

    response.render("faq.hbs", model);
  }
});

app.get("/project_adminpage", function (request, response) {
  const projQuery = `SELECT * FROM Projects`;
  const isLoggedIn = request.session.isLoggedIn;

  db.all(projQuery, function (error, projects) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      projects,
      isLoggedIn,
    };

    response.render("project_adminpage.hbs", model);
  });
});



app.get("/faq/update/:id", function (request, response) {
  const id = request.params.id;
  const isLoggedIn = request.session.isLoggedIn;

  const query = `SELECT * FROM Projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, faq) {
    const model = {
      faq, 
      isLoggedIn
    };

    response.render("update_faq.hbs", model);
  });
});

app.post("/faq/update/:id", function (request, response) {
  const question = request.body.question;
  const reply = request.reply;
  const id = request.params.id;
  const isLoggedIn = request.session.isLoggedIn;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("Question can't be empty");
  } else if (ITEM_FAQ_MAX_LENGTH < question.length) {
    errorMessages.push(
      "Question may be at most " +
        ITEM_FAQ_MAX_LENGTH +
        " characters long"
    );
  }

  if (ITEM_FAQ_MAX_LENGTH < reply.length) {
    errorMessages.push(
      "Reply may be at most " +
        ITEM_FAQ_MAX_LENGTH +
        " characters long"
    );
  }

  

  if (errorMessages.length == 0) {
    const query = `UPDATE faq SET question =?, reply = ? WHERE id = ?`;

    const values = [question, reply, id];

    db.run(query, values, function (error) {
      
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          question,
          reply,
          id,
          isLoggedIn
        };

        response.render("update_faq.hbs", model);
      } else {
        response.redirect("/projects");
      }
    });
  } else {
    const model = {
      errorMessages,
      question,
      reply,
      id,
      isLoggedIn
    };
    response.render("update_faq.hbs", model);
  }
});


app.get("/FAQ/delete/:id", function (request, response) {
  const id = request.params.id;
  const errorMessages = [];

  if (!request.session.isLoggedIn) {
    errorMessages.push("Not logged in");
  }

  if (typeof id === "undefined") {
    errorMessages.push("No record specified");
  }

  if (errorMessages.length == 0) {
    const query = `DELETE FROM faq WHERE id = ?`;
    const values = [id];

    db.run(query, values, function (error, faq) {
      const model = {
        faq,
      };

      if (error) {
        errorMessages.push("Internal server error");

        response.redirect("/faq_adminpage");
      } else {
        response.redirect("/faq_adminpage");
      }
    });
  } else {
    const model = {
      errorMessages,
      id,
    };

    response.render("faq_adminpage.hbs", model);
  }
});

app.get("/faq_adminpage", function (request, response) {
  const faqQuery = `SELECT * FROM FAQ`;
  const isLoggedIn = request.session.isLoggedIn;

  db.all(faqQuery, function (error, faq) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      faq,
      isLoggedIn,
    };

    response.render("faq_adminpage.hbs", model);
  });
});

app.get("/login", function (request, response) {
  response.render("login.hbs");
});

app.get("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/");
});

app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (username == ADMIN_USERNAME && password == ADMIN_PASSWORD) {
    request.session.isLoggedIn = true;

    response.redirect("/");
  } else {
    const model = {
      failedToLogin: true,
    };

    response.render("login.hbs", model);
  }
});

app.get("/adminpage", function (request, response) {
  response.render("adminpage.hbs");
});

app.listen(8080);
