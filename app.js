const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();
const sqlite3 = require('sqlite3');
const expressSession = require('express-session');
const ITEM_NAME_MAX_LENGTH = 50;
const ITEM_DESCRIPTION_MAX_LENGTH = 100;
const ITEM_DESCRIPTION_FULL_MAX_LENGTH = 500;
const ITEM_HTML_LINK_MAX_LENGTH = 100;

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
		extended: false
	})
);


app.get("/", function (request, response) {
  	const model = {};

  	response.render("homepage.hbs", model);
});

app.get("/projects", function (request, response) {
  
  const query = `SELECT * FROM Projects`
	
	db.all(query, function(error, projects){
		
		const errorMessages = []
		
		if(error){
			errorMessages.push("Internal server error")
		}
		
		const model = {
			errorMessages,
			projects,
		}
		
		response.render('projects.hbs', model)
		
	})

});

app.get("/project/:id", function (request, response) {
  
  const id = request.params.id
	
	const query = `SELECT * FROM Projects WHERE id = ?`
	const values = [id]
	
	db.get(query, values, function(error, project){
		
		const model = {
			project,
		}
		
		response.render('project.hbs', model)
		
	})

});



app.get("/projects/create", function(request, response){
	response.render("create_project.hbs")
})

app.post("/projects/create", function(request, response){
	
	console.log("request.body:", request.body)
	
	const name = request.body.name
	const description = request.body.description
	const description_full = request.body.description_full
	const html_link = request.body.html_link
		
	const errorMessages = []
	
	if(name == ""){
		errorMessages.push("Name can't be empty")
	}else if(ITEM_NAME_MAX_LENGTH < name.length){
		errorMessages.push("Description may be at most "+ITEM_NAME_MAX_LENGTH+" characters long")
	}
	
	if(ITEM_DESCRIPTION_MAX_LENGTH < description.length){
		errorMessages.push("Description may be at most "+ITEM_DESCRIPTION_MAX_LENGTH+" characters long")
	}

	if(ITEM_DESCRIPTION_FULL_MAX_LENGTH < description_full.length){
		errorMessages.push("Full Description may be at most "+ITEM_DESCRIPTION_FULL_MAX_LENGTH+" characters long")
	}

	if(ITEM_HTML_LINK_MAX_LENGTH < name.length){
		errorMessages.push("HTML Link may be at most "+ITEM_HTML_LINK_MAX_LENGTH+" characters long")
	}

	
	if(errorMessages.length == 0){
		
		
		const query =  `INSERT INTO projects (name, description, description_full, html_link) VALUES (?, ?, ?, ?)`
		// Note: id is auto inserted by the databas 
		
		const values = [name, description, description_full, html_link]
		
		db.run(query, values, function(error){

			console.log(error)
			
			if(error){
				
				errorMessages.push("Internal server error")
				
				const model = {
					errorMessages,
					name,
					description,
					description_full,
					html_link
				}
				
				response.render('create_project.hbs', model)
				
			}else{
				
				response.redirect("/projects")
				
			}
			
		})
		
	}else{
		
		const model = {
			errorMessages,
			name,
			description,
			description_full,
			html_link
		}
		
		response.render('create_project.hbs', model)
	}
	
})



app.get("/projects/update/:id", function (request, response) {
  
	const id = request.params.id
	  
	  const query = `SELECT * FROM Projects WHERE id = ?`
	  const values = [id]
	  
	  db.get(query, values, function(error, project){
		  
		  const model = {
			  project
		  }
		  
		  response.render('update_project.hbs', model)
		  
	  })
  
  });
  

app.post("/projects/update/:id", function(request, response){
	
	const name = request.body.name
	const description = request.body.description
	const description_full = request.body.description_full
	const html_link = request.body.html_link
	// const id = request.body.id
	const id = request.params.id

	// Both methods work to get the id from the form  
	//console.log("paramter:", request.params.id)
	//console.log("body:    ", request.body.id)
			
	const errorMessages = []
	
	if((name == "")||(typeof name === 'undefined')){
		errorMessages.push("Name can't be empty")
	}else if(ITEM_NAME_MAX_LENGTH < name.length){
		errorMessages.push("Description may be at most "+ITEM_NAME_TITLE_MAX_LENGTH+" characters long")
	}
	
	if(ITEM_DESCRIPTION_MAX_LENGTH < description.length){
		errorMessages.push("Description may be at most "+ITEM_DESCRIPTION_MAX_LENGTH+" characters long")
	}

	if(ITEM_DESCRIPTION_MAX_LENGTH < description_full.length){
		errorMessages.push("Full Description may be at most "+ITEM_DESCRIPTION_FULL_MAX_LENGTH+" characters long")
	}

	if(ITEM_HTML_LINK_MAX_LENGTH < name.length){
		errorMessages.push("Name may be at most "+ITEM_HTML_LINK_MAX_LENGTH+" characters long")
	}
	
	if(errorMessages.length == 0){
		
		const query =  `UPDATE projects SET name =?, description = ?, description_full =?, html_link = ? WHERE id = ?`
		
		const values = [name, description, description_full, html_link, id]
				

		db.run(query, values, function(error){

			console.log(error)
			
			if(error){
				
				errorMessages.push("Internal server error")
				
				const model = {
					errorMessages,
					name,
					description,
					description_full,
					html_link,
					id

				}
				
				response.render('update_project.hbs', model)
				
			}else{
				
				response.redirect("/projects")
				
			}
			
		})
		
	}else{
		
		const model = {
			errorMessages,
			name,
			description,
			description_full,
			html_link,
			id
		}
		
		response.render('create_project.hbs', model)
		
	}
	
})


app.listen(8080);