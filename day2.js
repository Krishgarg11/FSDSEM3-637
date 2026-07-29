//synchronous and asynchronous programming
//synchronous programming : code is executed 
// hello();
console.log("this is synch programming");
//ASynch PROGRAMMING : code is executed LINE BY LINE
//setTimeout is a method which is used to execute the code after a certain time
const hello=()=>{
    setTimeout(()=>{
        console.log("HELLO this is asynchronous programming");
    }, 2000)
}
hello();
console.log("this is asynchronous programming");

//callback,promises,async/await : ways to handle asynchronous operations in JavaScript
function add (num1,num2,callback){
    console.log(num1+num2);
    callback();
}
let a= 10;
let b= 20;
add(a,b,sayhi);
add(a,b,hello);
function sayhi(){
    console.log("this is a callback function");


}


//create a function display(callback) that print "welcome to ABES"
function display(callback){
    console.log("welcome to ABES");
    callback();
}
display(sayhi);