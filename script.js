const addDialog = document.querySelector("#add-dialog");
const infoDialog = document.querySelector("#info-dialog");
const teacherList = document.querySelector("#teacher-list");

for (const button of document.querySelectorAll(".add-teacher")) {
  button.addEventListener("click", () => addDialog.showModal());
}
for (const button of document.querySelectorAll(".close-dialog")) {
  button.addEventListener("click", () => button.closest("dialog").close());
}
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}

function openTeacher(card) {
  const data = card.dataset;
  const photo = document.querySelector("#profile-photo");
  const picture = card.querySelector("img");
  photo.replaceChildren();
  if (picture) {
    const image = picture.cloneNode();
    if (data.id === "ihor") image.src = "assets/ihor-full.jpg";
    image.alt = data.name;
    photo.append(image);
  } else {
    const initials = document.createElement("span");
    initials.className = "initials";
    initials.textContent = card.querySelector(".initials").textContent;
    photo.append(initials);
  }
  document.querySelector("#profile-name").textContent = data.name;
  document.querySelector("#profile-speciality").textContent = data.speciality;
  document.querySelector("#profile-location").textContent = [data.city, data.country].filter(Boolean).join(", ");
  document.querySelector("#profile-demographics").textContent = [data.age, data.sex].filter(Boolean).join(", ");
  for (const kind of ["email", "phone"]) {
    const link = document.querySelector(`#profile-${kind}`);
    link.textContent = data[kind] || "";
    link.parentElement.hidden = !data[kind];
    link.href = (kind === "email" ? "mailto:" : "tel:") + (data[kind] || "");
  }
  document.querySelector("#profile-notes").textContent = data.notes || "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet consectetur culpa cumque, distinctio dolore dolorem doloremque ea explicabo facilis nam nesciunt nisi pariatur perspiciatis porro quis similique temporibus veniam veritatis? A ab ad, aliquam amet consequatur cupiditate debitis deserunt doloribus dolorum earum eius eos minus nostrum odit omnis perferendis...";
  document.querySelector("#profile-map").href = "https://www.openstreetmap.org/search?query=" + encodeURIComponent(`${data.city || ""} ${data.country}`);
  document.querySelector(".map-details").open = false;
  infoDialog.showModal();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".teacher-open");
  if (!button) return;
  let card = button.closest(".teacher-card");
  if (card.dataset.teacher) card = [...teacherList.children].find((item) => item.dataset.id === card.dataset.teacher);
  if (card) openTeacher(card);
});

// У цій лабораторній форми потрібні лише для верстки.
for (const form of document.querySelectorAll("form")) {
  form.addEventListener("submit", (event) => event.preventDefault());
}
