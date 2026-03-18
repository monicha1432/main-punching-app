let rec = JSON.parse(localStorage.rec || "[]"), dW = JSON.parse(localStorage.dW || "[]");
let allow = JSON.parse(localStorage.allow || "[]"), recv = JSON.parse(localStorage.recv || "[]"), dS = JSON.parse(localStorage.dS || "[]");
let mSal = parseFloat(localStorage.mSal || 0), otR = parseFloat(localStorage.otR || 0), isAdmin = false;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
window.onload = () => {
    let d = new Date();
    months.forEach((m, i) => calMonth.innerHTML += `<option value="${i}" ${i==d.getMonth()?'selected':''}>${m}</option>`);
    for(let y=2024; y<=2030; y++) calYear.innerHTML += `<option value="${y}" ${y==d.getFullYear()?'selected':''}>${y}</option>`;
    render();
};

function toggleMenu() { let m = document.getElementById('menu'); m.style.left = m.style.left === "0px" ? "-250px" : "0px"; }
function go(p) { document.querySelectorAll(".page").forEach(x => x.classList.remove("active")); document.getElementById(p).classList.add("active"); document.getElementById('menu').style.left = "-250px"; render(); }

/* --- PUNCH SYSTEM --- */
function punchIn() {
    if(!uid.value){ msg.innerText="Enter ID!"; return; }
    rec.push({ id:uid.value, d:new Date().toDateString(), in:new Date().getTime(), out:null, h:0, s:0, otS:0 });
    msg.innerText="Punched In!"; uid.value=""; save(); setTimeout(()=>msg.innerText="",2000);
}
function punchOut() {
    let d=new Date().toDateString(), r=rec.find(x=>x.d===d);
    if(!r){ msg.innerText="No In Entry!"; return; }
    r.out = new Date().getTime();
    let hrs = (r.out-r.in)/3600000;
    r.h = hrs.toFixed(2);
    r.s = (mSal/26).toFixed(2);
    r.otS = (hrs > 8 ? (hrs-8)*otR : 0).toFixed(2);
    msg.innerText="Punched Out!"; save(); setTimeout(()=>msg.innerText="",2000);
}

/* --- MASTER EDIT RENDER (UPDATED) --- */
function renderMaster() {
    let html = `<div class="m-section-title">Edit Work Log</div>`;
    rec.forEach((r, i) => {
        html += `<div class="m-card">
            <b>ID: ${r.id} - ${r.d}</b><br>
            Hrs: <input type="number" id="mh${i}" value="${r.h}" style="width:50px"> 
            Sal: <input type="number" id="ms${i}" value="${r.s}" style="width:70px"> 
            OT ₹: <input type="number" id="mo${i}" value="${r.otS}" style="width:60px">
            <button onclick="saveMWork(${i})">Update</button></div>`;
    });

    html += `<div class="m-section-title">Edit Salary/Allowance</div>`;
    recv.forEach((r, i) => {
        html += `<div class="m-card"><b>Received:</b> <input id="mri${i}" value="${r.a}" style="width:60px"> <button onclick="saveMSal(${i},'r')">Save</button></div>`;
    });
    allow.forEach((r, i) => {
        html += `<div class="m-card"><b>Allowance:</b> <input id="mai${i}" value="${r.a}" style="width:60px"> <button onclick="saveMSal(${i},'a')">Save</button></div>`;
    });

    html += `<div class="m-section-title">Admin Calendar View</div>
             <div class="calendar-wrapper" style="transform:scale(0.9);">${document.getElementById('calendar').innerHTML}</div>`;
    
    masterList.innerHTML = html;
}

function saveMWork(i) {
    rec[i].h = document.getElementById(`mh${i}`).value;
    rec[i].s = document.getElementById(`ms${i}`).value;
    rec[i].otS = document.getElementById(`mo${i}`).value;
    save(); alert("Work Updated");
}

function saveMSal(i, type) {
    if(type=='r') recv[i].a = document.getElementById(`mri${i}`).value;
    else allow[i].a = document.getElementById(`mai${i}`).value;
    save(); alert("Salary Entry Updated");
}

/* --- DATA RENDER --- */
function renderWork() {
    let h = `<tr><th>ID</th><th>Date</th><th>In/Out</th><th>Day ₹</th><th>OT ₹</th><th>Hrs</th>${isAdmin?'<th>X</th>':''}</tr>`;
    let total = 0;
    rec.forEach((r, i) => {
        total += parseFloat(r.h || 0);
        h += `<tr><td>${r.id}</td><td>${r.d}</td>
        <td>${new Date(r.in).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}<br>${r.out?new Date(r.out).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'--'}</td>
        <td>${r.s}</td><td>${r.otS}</td><td>${r.h}</td>
        ${isAdmin?`<td><button onclick="delItem(${i},'w')">X</button></td>`:''}</tr>`;
    });
    h += `<tr class="total-row"><td colspan="5">Total Hours:</td><td>${total.toFixed(2)}</td>${isAdmin?'<td></td>':''}</tr>`;
    workTable.innerHTML = h;
}

function renderSalary() {
    let total = 0, h = `<tr><th>Date</th><th>Type</th><th>Amt</th>${isAdmin?'<th>X</th>':''}</tr>`;
    recv.forEach((x, i) => { total += Number(x.a); h += `<tr style="color:green"><td>${x.d}</td><td>Recv</td><td>+${x.a}</td>${isAdmin?`<td><button onclick="delItem(${i},'r')">X</button></td>`:''}</tr>`; });
    allow.forEach((x, i) => { total -= Number(x.a); h += `<tr style="color:red"><td>${x.d}</td><td>Allow</td><td>-${x.a}</td>${isAdmin?`<td><button onclick="delItem(${i},'a')">X</button></td>`:''}</tr>`; });
    h += `<tr class="total-row"><td>TOTAL</td><td></td><td>₹${total.toFixed(2)}</td><td></td></tr>`;
    salaryTable.innerHTML = h;
}

function drawCalendar() {
    let m = parseInt(calMonth.value), y = parseInt(calYear.value);
    let days = new Date(y, m + 1, 0).getDate(), first = new Date(y, m, 1).getDay();
    calGrid.innerHTML = "";
    for (let i = 0; i < first; i++) calGrid.innerHTML += `<div class="day" style="background:#eee"></div>`;
    for (let i = 1; i <= days; i++) {
        let div = document.createElement("div"), dStr = new Date(y, m, i).toDateString(), r = rec.find(x => x.d === dStr), isSun = new Date(y, m, i).getDay() === 0;
        div.className = "day"; div.innerText = i;
        if (isSun) div.classList.add("sun");
        if (isSun && r) div.classList.add("sun-work"); else if (r) div.classList.add("present");
        div.onclick = () => { selDate.innerText = dStr; selDetails.innerHTML = r ? `Work: ${r.h}h | ID: ${r.id}` : "No Entry"; dayInfoCard.style.display="block"; };
        calGrid.appendChild(div);
    }
}

function login() {
    if(user.value === "monicha@143" && pass.value === "monicha@1432") {
        isAdmin = true; loginSection.style.display="none"; adminSettings.style.display="block"; adminPortal.style.display="block"; render();
    }
}
function logout() { isAdmin = false; location.reload(); }
function addSalData(t) {
    let obj = { d:new Date().toDateString(), a:(t=='allow'?aamt.value:ramt.value) };
    if(t=='allow'){ allow.push(obj); aamt.value=""; atype.value=""; } else { recv.push(obj); ramt.value=""; rtype.value=""; }
    save();
}
function delItem(i, t) {
    if(t=='w') dW.push(rec.splice(i, 1)[0]);
    else if(t=='r') dS.push(recv.splice(i, 1)[0]);
    else dS.push(allow.splice(i, 1)[0]);
    save();
}
function saveRates() { localStorage.mSal = mSalInput.value; localStorage.otR = otRInput.value; mSal = mSalInput.value; otR = otRInput.value; alert("Saved"); }
function save() {
    localStorage.rec = JSON.stringify(rec); localStorage.dW = JSON.stringify(dW);
    localStorage.allow = JSON.stringify(allow); localStorage.recv = JSON.stringify(recv); localStorage.dS = JSON.stringify(dS);
    render();
}
function render() { renderWork(); renderSalary(); drawCalendar(); renderMaster(); }