// // event emitter
// //  emit("event param"): trigger/create/fire and on ("event emitter param",callback fun)
// const EventEmitter=require("events");
// const event=new EventEmitter();
// event.on("greet",()=>{
//     console.log("this is event emitter");
// })
// event.once("greet",()=>{
//     console.log("call event only once")
// })
// event.emit("greet");
// event.emit("greet");
// event.emit("greet");
// event.emit("greet");

// creatr a custom eventemitter that triggers "greet " and "exit"
// simulate DOM-like event handling in node.js using events
const EventEmitter=require("events");
class MyEmitter extends EventEmitter{}
const event =new MyEmitter()
event.on("greet",(msg)=>{
console.log(`hello ${msg}`); // template literals: $(var)
})
event.on("exit",()=>{
    console.log("exits  my emitter aplication.... ");
})
event.emit("greet","cse21 this fsd class");
event.emit("exit")
// 2. simulate DOM-like event handling in node.js using events
// Button:click and mouseover events
class Button extends EventEmitter{

click(){
    console.log("call button click event");
    this.emit("click");
    }
    mouseover(){
        console.log("call button mouseover event");
        this.emit("mouseover");
    }   
        
}
    const button=new Button();
    button.on("click",()=>{
        console.log("button hovered!");
    });