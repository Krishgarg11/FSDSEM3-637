function add (num1,num2){
    console.log(num1,num2);
}
add(2,1);  //arrow function
const addi=()=>{
    console.log("Arrow function")
}
addi();
const addi=(num1,num2)=>{
    return num1+num2;

}
console.log(add(2,1));