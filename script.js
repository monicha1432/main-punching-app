// --- INITIAL DATA LOAD ---
let recs = JSON.parse(localStorage.getItem('ch_recs') || "[]");
let finEntries = JSON.parse(localStorage.getItem('ch_fin') || "[]");
let delRecs = JSON.parse(localStorage.getItem('ch_del_recs') || "[]");
let delFin = JSON.parse(localStorage.getItem('ch_del_fin') || "[]");
let mSal = parseFloat(localStorage.getItem('ch_msal') || 0);
let otR = parseFloat(localStorage.getItem('ch_ot') || 0);
let localStaffList = JSON.parse(localStorage.getItem('ch_staff') || "[]");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let viewDate = new Date();

function save() { 
    localStorage.setItem('ch_recs', JSON.stringify(recs)); 
    localStorage.setItem('ch_fin', JSON.stringify(finEntries)); 
    localStorage.setItem('ch_del_recs', JSON.stringify(delRecs)); 
    localStorage.setItem('ch_del_fin', JSON.stringify(delFin)); 
    localStorage.setItem('ch_staff', JSON.stringify(localStaffList)); 
}

function toggleMenu() {
    let m = document.getElementById('menu');
    m.style.left = (m.style.left === "0px") ? "-260px" : "0px";
}

function go(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('menu').style.left = "-260px";
    if(id === 'work') renderWork();
    if(id === 'calendar') renderCalendar();
    if(id === 'salary') renderSalary();
    if(id === 'masterEdit') renderMaster();
    if(id === 'deletedHistory') renderDeleted();
    if(id === 'addMember') renderStaffTables();
}

function login() { 
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === "monicha@143" && p === "monicha@1432") { 
        document.getElementById('adminLogin').style.display = 'none'; 
        document.getElementById('adminPanel').style.display = 'block'; 
        document.getElementById('delLink').style.display = 'block';
    } else { alert("Invalid Credentials!"); }
}

// --- STAFF MANAGEMENT & MASTER EDIT (FIXED) ---

function renderStaffTables() {
    // 1. Admission Page Reference Table
    let regHtml = `<tr><th>ID</th><th>Staff Name</th></tr>`;
    localStaffList.forEach(s => {
        regHtml += `<tr><td><b>${s.id}</b></td><td>${s.name}</td></tr>`;
    });
    document.getElementById('staffRegTable').innerHTML = regHtml;

    // 2. Master Staff Edit Section (with Rows/Columns)
    let masterHtml = `<button onclick="addNewStaffRow()" class="btn-blue" style="margin-bottom:15px;">➕ Add New Staff Row</button>`;
    localStaffList.forEach((s, i) => {
        masterHtml += `
        <div class="m-box" style="background:white; color:black; padding:15px; margin-bottom:10px; border-radius:8px; border-left: 5px solid #3498db;">
            <div style="display:flex; gap:10px;">
                <div style="flex:1">
                    <label style="font-size:10px; color:#666;">Staff ID</label>
                    <input type="number" value="${s.id}" onchange="updateStaffData(${i}, 'id', this.value)" style="width:100%; padding:8px; border:1px solid #ddd;">
                </div>
                <div style="flex:2">
                    <label style="font-size:10px; color:#666;">Staff Name</label>
                    <input type="text" value="${s.name}" onchange="updateStaffData(${i}, 'name', this.value)" style="width:100%; padding:8px; border:1px solid #ddd;">
                </div>
            </div>
            <button onclick="deleteStaff(${i})" style="background:#e74c3c; color:white; width:100%; margin-top:10px; padding:8px; border-radius:5px;">Delete Member</button>
        </div>`;
    });
    document.getElementById('masterStaffList').innerHTML = masterHtml;
}

function addNewStaffRow() {
    const nextId = localStaffList.length > 0 ? Math.max(...localStaffList.map(s => parseInt(s.id))) + 1 : 101;
    localStaffList.push({ id: nextId, name: "New Staff" });
    save();
    renderMaster();
}

function saveNewStaff() {
    const nameBox = document.getElementById('regName');
    if(!nameBox.value.trim()) return alert("Enter Name");
    const nextId = localStaffList.length > 0 ? Math.max(...localStaffList.map(s => parseInt(s.id))) + 1 : 101;
    localStaffList.push({ id: nextId, name: nameBox.value.trim() });
    save();
    nameBox.value = '';
    renderStaffTables();
}

function updateStaffData(index, key, value) {
    if(key === 'id') value = parseInt(value);
    localStaffList[index][key] = value;
    save();
    renderStaffTables();
}

function deleteStaff(index) {
    if(confirm("Delete this staff member?")) {
        localStaffList.splice(index, 1);
        save();
        renderStaffTables();
    }
}

// --- PUNCHING LOGIC ---
function verifyPunch(mode) {
    const idInput = parseInt(document.getElementById('manualId').value);
    const staff = localStaffList.find(s => parseInt(s.id) === idInput);
    if(staff) {
        document.getElementById('punchModal').style.display = 'flex';
        document.getElementById('punchTargetName').innerText = staff.name;
        document.getElementById('confirmPunchBtn').onclick = () => {
            doPunch(mode, staff.name);
            document.getElementById('punchModal').style.display = 'none';
            document.getElementById('manualId').value = '';
        };
    } else { alert("ID not found!"); }
}

function doPunch(mode, name) {
    let d = new Date().toDateString(), t = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if(mode === 'in') { 
        recs.push({ name, date: d, inT: t, outT: '--', hrs: 0, ot: 0, rawIn: Date.now() }); 
    } else {
        let r = recs.find(x => x.name === name && x.date === d && x.outT === '--');
        if(!r) return alert("No Punch In found.");
        r.outT = t; 
        r.hrs = ((Date.now() - r.rawIn) / 3600000).toFixed(2);
    }
    save(); alert("Success: " + name);
}

// --- MASTER DATA RENDERING ---
function renderMaster() {
    renderStaffTables(); // This now includes the "Add Row" button
    
    // Work Records Table
    let wL = document.getElementById('masterWorkList'); wL.innerHTML = '';
    recs.forEach((r, i) => {
        wL.innerHTML += `<div class="m-box" style="background:white; color:black; padding:15px; margin-bottom:10px; border-radius:8px;"><label>Name</label><input type="text" onchange="updateW(${i},'name',this.value)" value="${r.name}" style="width:90%; padding:8px;"><label>Date</label><input type="text" onchange="updateW(${i},'date',this.value)" value="${r.date}" style="width:90%; padding:8px;"><div style="display:flex; gap:5px"><div><label>In</label><input type="text" onchange="updateW(${i},'inT',this.value)" value="${r.inT}" style="width:80%; padding:8px;"></div><div><label>Out</label><input type="text" onchange="updateW(${i},'outT',this.value)" value="${r.outT}" style="width:80%; padding:8px;"></div></div><label>Hrs</label><input type="number" onchange="updateW(${i},'hrs',this.value)" value="${r.hrs}" style="width:90%; padding:8px;"><button onclick="deleteWork(${i})" style="background:red;color:white;width:100%;margin-top:10px; padding:10px; border-radius:5px;">Delete</button></div>`;
    });

    // Finance Records Table
    let fL = document.getElementById('masterFinList'); fL.innerHTML = '';
    finEntries.forEach((e, i) => {
        fL.innerHTML += `<div class="m-box" style="background:white; color:black; padding:15px; margin-bottom:10px; border-radius:8px; border-left: 5px solid ${e.type==='salary'?'green':'red'}"><label>Reason</label><input type="text" onchange="updateF(${i},'reason',this.value)" value="${e.reason}" style="width:90%; padding:8px;"><label>Amt</label><input type="number" onchange="updateF(${i},'amt',this.value)" value="${e.amt}" style="width:90%; padding:8px;"><button onclick="deleteFin(${i})" style="background:red;color:white;width:100%;margin-top:10px; padding:10px; border-radius:5px;">Delete</button></div>`;
    });
}

// --- OTHER UTILITIES ---
function updateW(i, k, v) { recs[i][k] = v; save(); }
function updateF(i, k, v) { finEntries[i][k] = (k==='amt')?parseFloat(v):v; save(); }
function deleteWork(i) { delRecs.push(recs.splice(i, 1)[0]); save(); renderMaster(); }
function deleteFin(i) { delFin.push(finEntries.splice(i, 1)[0]); save(); renderMaster(); }
function saveRates() { mSal = parseFloat(document.getElementById('setSal').value); otR = parseFloat(document.getElementById('setOT').value); localStorage.setItem('ch_msal', mSal); localStorage.setItem('ch_ot', otR); alert("Updated"); }

function addManualRow(type) {
    if(type === 'work') {
        recs.push({ name: "New Staff", date: new Date().toDateString(), inT: "09:00 AM", outT: "05:00 PM", hrs: "8.00", rawIn: Date.now() });
    } else {
        finEntries.push({ date: new Date().toDateString(), type: "expense", reason: "Manual Entry", amt: 0 });
    }
    save(); renderMaster();
}

function renderWork() {
    let h = `<tr><th>Name</th><th>Date</th><th>In/Out</th><th>Total Hrs</th><th>Work (8h)</th><th>OT Hrs</th></tr>`;
    recs.slice().reverse().forEach(r => {
        let totalHrs = parseFloat(r.hrs || 0), workHrs = totalHrs > 8 ? 8 : totalHrs, otHrs = totalHrs > 8 ? (totalHrs - 8) : 0;
        let workPay = (mSal / 26), otPay = otHrs * otR;
        h += `<tr><td>${r.name}</td><td>${r.date}</td><td>${r.inT}<br>${r.outT}</td><td><b>${totalHrs.toFixed(2)}h</b></td>
              <td>${workHrs.toFixed(2)}h <span class="amt-sub">₹${workPay.toFixed(2)}</span></td>
              <td>${otHrs.toFixed(2)}h <span class="amt-sub">₹${otPay.toFixed(2)}</span></td></tr>`;
    });
    document.getElementById('workTable').innerHTML = h;
}

function renderSalary() {
    let net = 0;
    let h = `<tr><th>Date</th><th>Entry</th><th>Amount</th></tr>`;
    recs.forEach(r => {
        let otHrs = parseFloat(r.hrs) > 8 ? (parseFloat(r.hrs) - 8) : 0;
        let pay = (mSal/26) + (otHrs * otR); net += pay;
        h += `<tr><td>${r.date}</td><td>Auto: ${r.name}</td><td>+${pay.toFixed(2)}</td></tr>`;
    });
    finEntries.forEach(e => {
        if(e.type === 'salary') { net += e.amt; h += `<tr style="color:green"><td>${e.date}</td><td>${e.reason}</td><td>+${e.amt}</td></tr>`; }
        else { net -= e.amt; h += `<tr style="color:red"><td>${e.date}</td><td>${e.reason}</td><td>-${e.amt}</td></tr>`; }
    });
    h += `<tr style="background:#eee"><td><b>TOTAL</b></td><td></td><td><b>₹${net.toFixed(2)}</b></td></tr>`;
    document.getElementById('salaryTable').innerHTML = h;
}

function changeMonth(offset) { viewDate.setMonth(viewDate.getMonth() + offset); renderCalendar(); }
function renderCalendar() {
    const m = viewDate.getMonth(), y = viewDate.getFullYear();
    const grid = document.getElementById('calGrid');
    if(!grid) return;
    document.getElementById('calMonthLabel').innerText = months[m];
    document.getElementById('calYearLabel').innerText = y;
    grid.innerHTML = '';
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for(let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    for(let d = 1; d <= daysInMonth; d++) {
        let dStr = new Date(y, m, d).toDateString();
        let isSun = new Date(y, m, d).getDay() === 0;
        let present = recs.some(r => r.date === dStr);
        let cls = isSun ? (present ? "cal-sun-att" : "cal-sunday") : (present ? "cal-present" : "");
        grid.innerHTML += `<div class="day ${cls}" onclick="showDayDetails('${dStr}')">${d}</div>`;
    }
}

function renderDeleted() {
    let hW = `<tr><th>Name</th><th>Date</th><th>Action</th></tr>`;
    delRecs.forEach((r, i) => hW += `<tr><td>${r.name}</td><td>${r.date}</td><td><button onclick="restoreWork(${i})" style="background:green;color:white;padding:4px">Restore</button></td></tr>`);
    document.getElementById('delWorkTable').innerHTML = hW;
    let hF = `<tr><th>Reason</th><th>Amt</th><th>Action</th></tr>`;
    delFin.forEach((e, i) => hF += `<tr><td>${e.reason}</td><td>${e.amt}</td><td><button onclick="restoreFin(${i})" style="background:green;color:white;padding:4px">Restore</button></td></tr>`);
    document.getElementById('delFinTable').innerHTML = hF;
}

function restoreWork(i) { recs.push(delRecs.splice(i, 1)[0]); save(); renderDeleted(); }
function restoreFin(i) { finEntries.push(delFin.splice(i, 1)[0]); save(); renderDeleted(); }

document.getElementById('setSal').value = mSal;
document.getElementById('setOT').value = otR;
renderStaffTables();
renderCalendar();