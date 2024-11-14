let timeRef = document.querySelector(".timer-display");
const hourInput = document.getElementById("hourInput");
const minuteInput = document.getElementById("minuteInput");
const activeAlarms = document.querySelector(".activeAlarms");
const setAlarm = document.getElementById("set");
let alarmsArray = JSON.parse(localStorage.getItem("alarms")) || [];
const alarmSound = new Audio("./alarm.mp3");

let initialHour = 0;
let initialMinute = 0;
let alarmIndex = 0;

const appendZero = (value) => (value < 10 ? "0" + value : value);

const searchObject = (parameter, value) => {
  let alarmIndex,
    objIndex,
    exists = false;
  alarmsArray.forEach((alarm, index) => {
    if (alarm[parameter] === value) {
      exists = true;
      alarmIndex = alarm;
      objIndex = index;
    }
  });
  return [exists, alarmIndex, objIndex];
};

const populateTimeDropdowns = () => {
  for (let i = 0; i < 24; i++) {
    let hourOption = document.createElement("option");
    hourOption.value = appendZero(i);
    hourOption.textContent = appendZero(i);
    hourInput.appendChild(hourOption);
  }

  for (let i = 0; i < 60; i++) {
    let minuteOption = document.createElement("option");
    minuteOption.value = appendZero(i);
    minuteOption.textContent = appendZero(i);
    minuteInput.appendChild(minuteOption);
  }
};

function displayTimer() {
  let data = new Date();
  let [hours, minutes, seconds] = [
    appendZero(data.getHours()),
    appendZero(data.getMinutes()),
    appendZero(data.getSeconds()),
  ];
  timeRef.textContent = `${hours}:${minutes}:${seconds}`;
  // Alarms
  alarmsArray.forEach((alarm, index) => {
    if (alarm.isActive) {
      if (`${alarm.alarmHour}:${alarm.alarmMinute}` === `${hours}:${minutes}`) {
        if (alarmSound && alarmSound.paused) {
          // Mencegah suara berbunyi berulang-ulang
          alarmSound.play();
          alarmSound.loop = true;

          // Nonaktifkan alarm setelah dimainkan
          alarmsArray.isActive = false;
          localStorage.setItem("alarms", JSON.stringify(alarmsArray));
        }
      }
    }
  });
}

// Buat alarm
const createAlarm = (alarmObj) => {
  const { id, alarmHour, alarmMinute, isActive } = alarmObj;
  let alarmDiv = document.createElement("div");
  alarmDiv.classList.add("alarm");
  alarmDiv.setAttribute("data-id", id);
  alarmDiv.innerHTML = `<span>${alarmHour}:${alarmMinute}</span>`;

  let checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.checked = isActive;
  checkBox.addEventListener("click", (e) => {
    if (e.target.checked) {
      startAlarm(e);
    } else {
      stopAlarm(e);
    }
  });
  alarmDiv.appendChild(checkBox);

  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", (e) => deleteAlarm(e));
  alarmDiv.appendChild(deleteButton);
  activeAlarms.appendChild(alarmDiv);
};

setAlarm.addEventListener("click", () => {
  if (!hourInput.value || !minuteInput.value) {
    alert("Silahakan atur jam dan menit sebelum membuat alarm");
    return;
  }
  alarmIndex += 1;

  let alarmObj = {};
  alarmObj.id = `${alarmIndex}_${hourInput.value}_${minuteInput.value}`;
  alarmObj.alarmHour = hourInput.value;
  alarmObj.alarmMinute = minuteInput.value;
  alarmObj.isActive = false;

  alarmsArray.push(alarmObj);
  localStorage.setItem("alarms", JSON.stringify(alarmsArray));

  createAlarm(alarmObj);

  hourInput.value = appendZero(initialHour);
  minuteInput.value = appendZero(initialMinute);
});

const startAlarm = (e) => {
  let searchId = e.target.parentElement.getAttribute("data-id");
  let [exists, obj, index] = searchObject("id", searchId);
  if (exists) {
    alarmsArray[index].isActive = true;
    localStorage.setItem("alarms", JSON.stringify(alarmsArray));
  }
};

const stopAlarm = (e) => {
  let searchId = e.target.parentElement.getAttribute("data-id");
  let [exists, obj, index] = searchObject("id", searchId);
  if (exists) {
    alarmsArray[index].isActive = false;
    localStorage.setItem("alarms", JSON.stringify(alarmsArray));
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }
};

const deleteAlarm = (e) => {
  let searchId = e.target.parentElement.getAttribute("data-id");
  let [exists, obj, index] = searchObject("id", searchId);
  if (exists) {
    e.target.parentElement.remove();
    alarmsArray.splice(index, 1);
    localStorage.setItem("alarms", JSON.stringify(alarmsArray));
  }
};

window.onload = () => {
  setInterval(displayTimer, 1000);
  initialHour = 0;
  initialMinute = 0;
  alarmIndex = alarmsArray.length;
  hourInput.value = appendZero(initialHour);
  minuteInput.value = appendZero(initialMinute);
  populateTimeDropdowns();
  alarmsArray.forEach((alarmObj) => createAlarm(alarmObj));
};
