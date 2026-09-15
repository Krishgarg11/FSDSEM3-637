import express from "express"
import cors from "cors";
import fs from "fs";
const app=express();
app.use(cors());
app.use(express.json());
app.get("/products", (req, res) => {
    const data = fs.readFileSync("products.json", "utf-8");
    const products = JSON.parse(data);
    res.json(products);
});
app.post("/products", (req, res) => {
   const data = fs.readFileSync("products.json", "utf-8");
   const products=JSON.parse(data);
   const newProduct={
    id:products.length+1,
    name:req.body.name,
    price:req.body.price,
   }
   products.push(newProduct);
   fs.writeFileSync("products.json",JSON.stringify(products));
   res.json({message:"product added successfully"});
});
app.listen(4000, () => {
    console.log("server is running on port 4000");
});
