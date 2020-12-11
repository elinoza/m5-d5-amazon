const express = require("express")
const multer = require("multer")
//const fs = require("fs")
const { writeFile, createReadStream } = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../../lib/utilities")
const { check, validationResult } = require("express-validator")
const upload = multer({})

const router = express.Router()
const productsFolderPath = path.join(__dirname, "../../public/img/projects")

const productsFilePath = path.join(__dirname, "products.json")

// FOR GETTING ALL PROJECTS
router.get("/", async(req, res,next) => {
 try{
const productsDB =  await readDB(productsFilePath )
  res.send(productsDB)}
  catch(error){next(error)}
})
/// getting project with an id
  router.get("/:id", async (req, res,next) => {
    try{
  const productsDB = await readDB(productsFilePath )
  const project= productsDB.filter(project=> String(project.ID) === req.params.id)
      if (project.length>0){res.send(project)}
      else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
      }
  }
  catch(error){
    next(error)
  }
})

/// uploading image by id

router.post("/:id/uploadPhoto", upload.single("image"), async (req, res,next) => {
  try{
    await writeFile(
      path.join(productsFolderPath, req.params.id + ".jpg"),
      req.file.buffer
      )
      res.send("ok")
}
catch(error){
  console.log(error)
  next(error)
}
})


/// getting project with specific query 
router.get("/", async(req, res,next) => {
  try{ 
      const productsDB =  await readDB(productsFilePath )
      if (req.query && req.query.name) {
        const filteredprojects = productsDB.filter(
          project =>
            project.hasOwnProperty("name") &&
            project.name.toLowerCase() === req.query.name.toLowerCase()
        )
        res.send(filteredprojects)
      } else {
        res.send(productsDB)
  }}
    catch(error){
      next(error)
    }
})

///POSTING NEW PROJECT
router.post("/", 
[
  check("name")
    .isLength({ min: 2 })
    .withMessage("Name should be more than 2 letters")
    .exists() ///What does this mean???
    .withMessage("Insert a name!"),
],
[
  check("RepoURL")
    .isURL()
    .withMessage("Repo should be an URL")
    .exists() ///What does this mean???
    .withMessage("add your repo!"),
],
[
  check("StudentID")
    .isLength({ min: 5 })
    .withMessage("your Id should be at least 5 letter")
    .exists() ///What does this mean???
    .withMessage("add your student Id!"),
],
async (req, res, next) => {
      try{
       
          const errors = validationResult(req)
    
          if (!errors.isEmpty()) {
            const err = new Error()
            err.message = errors
            err.httpStatusCode = 400
            next(err)
          } else {
            const productsDB =  await readDB(productsFilePath )
            const newproject = {
              ...req.body,
              ID: uniqid(),
              modifiedAt: new Date(),
            }
    
            productsDB.push(newproject)
            await writeDB(productsFilePath ,productsDB )
    
            res.status(201).send({ id: newproject.ID })
          }
        } 
        
    catch(error){next(error)
    }
  
})

///EDITIN' BY ID
router.put("/:id", async (req, res, next) => {
  try
  {
    const productsDB = await readDB(productsFilePath )
  const project = productsDB.filter(project => String(project.ID) !== req.params.id)

  const modifiedUser = {
    ...req.body,
    ID: req.params.id,
    modifiedAt: new Date(),
  }

  project.push(modifiedUser)
  await writeDB(productsFilePath ,project )
  

  res.send({ id: modifiedUser.ID })}
  catch(error){
    next(error)
  }
  
})
///DELETING BY ID
router.delete("/:id", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath )
    const project  = productsDB.filter(project => project.ID !== req.params.id)
    await writeDB(productsFilePath ,project  )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})


module.exports = router