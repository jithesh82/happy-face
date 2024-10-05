import { Client } from "@gradio/client";
import { handle_file } from "@gradio/client";
import fs from "fs";
import { request } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import express, { urlencoded } from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

var outPut;

const app = express();
// app.use(bodyParser(urlencoded({ extended:true })));
app.use(bodyParser.urlencoded({extended:true} ));
// app.use(bodyParser.json());
app.use(fileUpload())
app.use(express.static("public"))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const indexHtml = path.resolve(__dirname, "index.html")
// console.log(img)


// makePrediction('love');


app.get(
	"/apps/happy-face",
	(req, res) => {
		res.sendFile(indexHtml);
	}
)

app.post(
	"/apps/happy-face/submit",
	async (req, res) => {
		let sampleFile;
		let uploadPath;
		let prediction;

		
		if (!req.files || Object.keys(req.files).length === 0) {
    		return res.status(400).send('No files were uploaded.');
		}
		
		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  		sampleFile = req.files.file;
		uploadPath = __dirname + '/public/' + sampleFile.name;
		
		// Use the mv() method to place the file somewhere on your server
 		 sampleFile.mv(uploadPath, function(err) {
    		if (err)
      			return res.status(500).send(err);

    			// res.send('File uploaded!');
  			});

		
		console.log(req.files.file);
		console.log("here");

		prediction = await makePrediction(uploadPath);
		console.log(prediction);
		console.log(sampleFile.name);

		// res.send("<h2>" + prediction + "</h2>");
		outPut = {prediction:prediction, path:sampleFile.name};
		res.render(
			"index.ejs",
			outPut,
		)

		//fs.unlink(
		//	uploadPath,
		//	() => {
		//		if (err) {
		//			console.log("Error removing file!!")
		//			
		//		}
		//	}
		//)

	}
)

app.listen(
	3000,
	() => {
		console.log('listening @3000');
	}
)


async function makePrediction(fileName) {

	
	const client = await Client.connect("jithesh82/happy_facial_expression");

	// const response_0 = await fetch(reqImg);
	const response_0 = await handle_file(readFileSync(fileName));

	const result = await client.predict("/predict", { 
					img: response_0, 
	});

	console.log(result);
	console.log(result["data"][0]["label"]);
	return result["data"][0]["label"];

}
