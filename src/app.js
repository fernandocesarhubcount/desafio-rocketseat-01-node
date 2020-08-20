const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');


const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Aux
function UpdateLikes(repository){
  repository.likes++;
}

// Middlewares
function CheckID(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)) return response.status(400).json({erro:"Invalid ID repository. Check your requisition!"});

  var index = repositories.findIndex(a=>a.id == id);

  if(index<0) return response.status(404).json({erro:"Repository not found."});

  return next();
}

function CheckJsonArguments(request, response, next){
  const { title, url, techs, likes } = request.body;

  if(likes) return response.status(400).json({likes: 0});
  if(!title && !url && !techs) return response.status(400).json({error:"Nothing to do: there is no valid arguments! Possibles: title(string), url(string), techs(array of strings)"});
  
  return next();
}

// Routes
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", CheckJsonArguments, (request, response) => {
  const {title, url, techs} = request.body;
  try{
    if(!title || !url || !techs) return response.status(400).json({error: "Requireable var(s) are(is) missing. Possibles: title(string), url(string), techs(array of strings)"});
    if(!Array.isArray(techs)) return response.status(400).json({error:"The 'techs' variable is not an array!"});
    if(techs.find(a=>typeof(a) != "string") < 0) return response.status(400).json({error:"The 'techs' variable has some invalid value!"});
  
    const repository = {id: uuid(), title: title, url: url, techs: techs, likes: 0};
    repositories.push(repository);
  
    return response.json(repository);
  }
  catch(e){
    return response.status(500).json({error: "Something went wrong!", description: e});
  }
});

app.put("/repositories/:id", CheckID, CheckJsonArguments, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const index = repositories.findIndex(a=>a.id == id);

  if(techs)
  {
    if(!Array.isArray(techs)) return response.status(400).json({error:"The 'techs' variable is not an array!"});
    if(techs.find(a=>typeof(a) != "string") < 0) return response.status(400).json({error:"The 'techs' variable has some invalid value!"});
  }

  var repository = repositories[index];

  repository.title  = title ? title : repository.title;
  repository.url   = url ? url : repository.url;
  repository.techs = techs ? techs : repository.techs;

  return response.json(repository);
});

app.delete("/repositories/:id", CheckID, (request, response) => {
  const { id } = request.params;

  var index = repositories.findIndex(a=>a.id == id);

  repositories.splice(index, 1);

  return response.status(204).json();
});

app.post("/repositories/:id/like", CheckID, (request, response) => {
  const { id } = request.params;

  var index = repositories.findIndex(a=>a.id == id);

  UpdateLikes(repositories[index]);

  return response.json(repositories[index]);
});

module.exports = app;
