
//function in js:block code
//syntax
//function fname(){
//}
//fname();
function add(num1, num2) {
    console.log("Standard function result:", num1 + num2);
    return num1 + num2;
}
add(10, 20);

//arrow function
//variable in js:conatiner to store data
//var, let, const
// syntax:()=>{}
const addArrow = () => {
    console.log("arrow function");
}
addArrow();

const addArrowWithParams = (num1, num2) => {
    return num1 + num2;
}
console.log("Arrow function with params result:", addArrowWithParams(10, 20));

//argument:array list object 
function addNum(...args) {
    console.log("Arguments passed:", args);
}
addNum(10, 20, 30, 40, 50);

//node js:runtime environment to run js code outside the browser
