let currentUser = null;


const gamepasses = {
    50:"https://www.roblox.com/game-pass/1930891531/50-Robux",
    100:"https://www.roblox.com/game-pass/1934120626/100-Robux",
    250:"https://www.roblox.com/game-pass/1933238891/250-Robux",
    500:"https://www.roblox.com/game-pass/1933598803/500-Robux",
    1000:"https://www.roblox.com/game-pass/1935158552/1000-Robux",
    2500:"https://www.roblox.com/game-pass/1933736825/2500-Robux",
    4000:"https://www.roblox.com/game-pass/1932842949/4000-Robux",
    5000:"https://www.roblox.com/game-pass/1935296520/5000-Robux",
    7500:"https://www.roblox.com/game-pass/1933262879/7500-Robux",
    10000:"https://www.roblox.com/game-pass/1932677204/10000-Robux"
};



function notify(text){

    let n=document.getElementById("notification");

    n.innerText=text;
    n.style.display="block";

    setTimeout(()=>{
        n.style.display="none";
    },3000);
}



function showPage(id){

    document.querySelectorAll(".page")
    .forEach(x=>x.classList.remove("active"));

    document.getElementById(id)
    .classList.add("active");
}



function openLogin(){
    showPage("loginPage");
}


function openRegister(){
    showPage("registerPage");
}


function goHome(){
    showPage("home");
}



function register(){

    let user=document.getElementById("registerUser").value;
    let pass=document.getElementById("registerPass").value;


    if(!user || !pass){
        notify("Fill all fields");
        return;
    }


    let users=JSON.parse(localStorage.users || "{}");


    if(users[user]){
        notify("Account already exists");
        return;
    }


    users[user]={
        password:pass,
        balance:0
    };


    localStorage.users=JSON.stringify(users);


    currentUser=user;

    localStorage.login=user;

    loadDashboard();
}



function login(){

    let user=document.getElementById("loginUser").value;
    let pass=document.getElementById("loginPass").value;


    let users=JSON.parse(localStorage.users || "{}");


    if(!users[user] || users[user].password!==pass){

        notify("Incorrect password or username/Account doesn't exist");
        return;
    }


    currentUser=user;
    localStorage.login=user;

    loadDashboard();

}



function loadDashboard(){

    showPage("dashboard");


    let users=JSON.parse(localStorage.users);


    document.getElementById("usernameDisplay")
    .innerText="@"+currentUser;


    document.getElementById("balance")
    .innerText=users[currentUser].balance;


    createChargeButtons();

}



function logout(){

    currentUser=null;
    localStorage.removeItem("login");

    showPage("home");

}




function showTab(id){

    document.querySelectorAll(".tab")
    .forEach(x=>x.classList.add("hidden"));


    document.getElementById(id)
    .classList.remove("hidden");

}



function withdraw(){

    let amount=
    Number(document.getElementById("withdrawAmount").value);


    if(amount<250){

        notify("Not enough Robux to Withdraw");
        return;
    }


    notify("Submitted! You'll get your robux in pending within the next 12 hours");

}



function sendRobux(){

    let users=JSON.parse(localStorage.users);


    let target=
    document.getElementById("sendUser").value;


    let amount=
    Number(document.getElementById("sendAmount").value);



    if(!users[target]){

        notify("Username doesn't exist");
        return;

    }


    if(users[currentUser].balance<amount){

        notify("Not enough Robux");
        return;

    }


    users[currentUser].balance-=amount;
    users[target].balance+=amount;


    localStorage.users=
    JSON.stringify(users);


    loadDashboard();

}



function clickGame(){

    let users=JSON.parse(localStorage.users);

    users[currentUser].balance+=0.001;


    localStorage.users=
    JSON.stringify(users);


    loadDashboard();

}



function reportUser(){

    notify("Report submitted");

}



function createChargeButtons(){

    let box=document.getElementById("chargeButtons");

    box.innerHTML="";


    Object.keys(gamepasses).forEach(amount=>{

        let btn=document.createElement("button");

        btn.className="charge-btn";

        btn.innerText=amount+" Robux";


        btn.onclick=()=>{

            window.open(
                gamepasses[amount],
                "_blank"
            );

        };


        box.appendChild(btn);

    });

}



window.onload=()=>{

    let saved=localStorage.login;


    if(saved){

        currentUser=saved;
        loadDashboard();

    }

};
