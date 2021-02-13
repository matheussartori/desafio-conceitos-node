const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, _, next) {
  const { method, url } = request

  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  console.log(`[${time}] 🌐 [${method}] - ${url}`)

  return next()
}

function validateProjectId(request, response, next) {
  const { id } = request.params

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository ID.'})
  }
  
  return next()
}

app.get("/repositories", logRequests, (request, response) => {
  const { title } = request.query

  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories

  return response.json(results)
});

app.post("/repositories", logRequests, (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", [logRequests, validateProjectId], (request, response) => {
  const { id } = request.params
  const { title, url, techs } = request.body

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' })
  }

  const repository = {
    id,
    title: title ? title : repositories[repositoryIndex].title,
    url: url ? url : repositories[repositoryIndex].url,
    techs: techs ? techs : repositories[repositoryIndex].techs
  }

  repositories[repositoryIndex] = Object.assign(repositories[repositoryIndex], repository)

  return response.json(repositories[repositoryIndex])
});

app.delete("/repositories/:id", [logRequests, validateProjectId], (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' })
  }

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", [logRequests, validateProjectId], (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' })
  }

  repositories[repositoryIndex] = {...repositories[repositoryIndex], likes: repositories[repositoryIndex].likes + 1}

  return response.json({ likes: repositories[repositoryIndex].likes })
});

module.exports = app;
