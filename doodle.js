import { readdir, readFile, open } from "fs/promises"
import http from "node:http"
import fileHandle from "node:fs/promises"

const server = http.createServer(async(request, response) => {
  if(request.url === "/favicon.ico") return response.end("no favicon")
  if(request.url === "/"){
   servDirectory(request, response)
  }
  else{
   try{
    const fileHandle = await open(`./storage${decodeURIComponent(request.url) }`)
    const stat = await fileHandle.stat()
    if(stat.isDirectory()){
      servDirectory(request, response)
    }else{
      const readstream =  fileHandle.createReadStream()
      readstream.pipe(response)
  
    }
    
  }catch(err)
  {
    console.log(err.message)
    response.end ("Not found")

  }
   }
})

async function servDirectory(request, response) {
  const fileHandle = await open(`./storage${decodeURIComponent(request.url) }`)
    const stat = await fileHandle.stat()
    if(stat.isDirectory()){
      const itemList =  await readdir(`./storage/${request.url}`)
      console.log("Files in storage:", itemList) 
      let dynamicHTML = ""
      itemList.forEach((item) => {
         dynamicHTML +=  `${item} <a href = "${request.url === "/" ? "" : request.url}/${item}">open </a><br><a href = "${request.url === "/" ? "" : request.url}/${item}">Downlod </a><br>`
      });
      console.log(dynamicHTML)
      const boilerHTML = await readFile("./bolierplate.html", "utf-8")
    response.end(boilerHTML.replace("${dynamicHTML}",dynamicHTML))
}
}

server.listen(80, "0.0.0.0", () => {
    console.log("Server is running ")
})