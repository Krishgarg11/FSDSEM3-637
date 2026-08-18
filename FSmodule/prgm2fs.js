const fs = require("fs");
fs.writeFileSync("Student.txt", "Name:Himanshu\nRoll No: 101");
console.log("File created successfully");
let data = fs.readFileSync("Student.txt", "utf8");
console.log("\nFile Content:");
console.log(data);
fs.appendFileSync("Student.txt", "\nCourse: B.Tech CSE");
console.log("\nFile updated successfully");