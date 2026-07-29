//create one promises thet will display user name and password
//using resolve and if data will be rejected its display error message
/* new Promise((resolve, reject) => {
    setTimeout(() => {
        let err = true;

        if (!err) {
            resolve("user:CSE21, password:123");
        } else {
            reject("ERROR: Data failed");
        }
    }, 2000);
})
.then((result) => {
    console.log(result);
})
.catch((error) => {
    console.log(error);
});
*/
  //aasync /await

  async function test(){
    console.log("1");
    await console.log("2");
    console.log("3");
    console.log("4");
  }
  test();
  console.log("6");