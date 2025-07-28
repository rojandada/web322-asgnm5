/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Rojan KC      Student ID: 171714231      Date: 2025-07-27
*
*  Published URL: web322-asgnm5.vercel.app
*
********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const projectService = require("./modules/projects");

// Use dynamic import for open (for ESM compatibility)
const open = (...args) => import("open").then(m => m.default(...args));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // ✅ Required for Vercel and Express to find .ejs files

// Routes
app.get("/", (req, res) => {
  res.redirect("/solutions/projects");
});

app.get("/solutions/projects", async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.render("projects", { projects });
  } catch (err) {
    res.status(500).render("500", { message: `Error fetching projects: ${err.message}` });
  }
});

app.get("/solutions/project/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.render("project", { project });
  } catch (err) {
    res.status(404).render("404", { message: err.message });
  }
});

app.get("/solutions/sector/:name", async (req, res) => {
  try {
    const projects = await projectService.getProjectsBySector(req.params.name);
    res.render("projects", { projects });
  } catch (err) {
    res.status(404).render("404", { message: err.message });
  }
});

app.get("/solutions/addProject", async (req, res) => {
  try {
    const sectors = await projectService.getAllSectors();
    res.render("addProject", { sectors });
  } catch (err) {
    res.status(500).render("500", { message: `Error loading form: ${err.message}` });
  }
});

app.post("/solutions/addProject", async (req, res) => {
  try {
    await projectService.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: `Error adding project: ${err.message}` });
  }
});

app.get("/solutions/editProject/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    const sectors = await projectService.getAllSectors();
    res.render("editProject", { project, sectors });
  } catch (err) {
    res.status(404).render("404", { message: err.message });
  }
});

app.post("/solutions/editProject", async (req, res) => {
  try {
    const { id, ...data } = req.body;
    await projectService.editProject(id, data);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: `Error editing project: ${err.message}` });
  }
});

app.get("/solutions/deleteProject/:id", async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: `Error deleting project: ${err.message}` });
  }
});

// Initialize DB and start server
projectService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is listening on port ${HTTP_PORT}`);
      open(`http://localhost:${HTTP_PORT}`);
    });
  })
  .catch(err => {
    console.error("Unable to start server:", err);
  });
