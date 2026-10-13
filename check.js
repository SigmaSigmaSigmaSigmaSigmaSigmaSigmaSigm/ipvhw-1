// Запуск у браузері описано в README.txt.
(async () => {
  await document.fonts.ready;
  let count = 0;
  function check(ok, message) {
    if (!ok) throw new Error(message);
    count++;
  }
  const $ = (selector) => document.querySelector(selector);
  const visible = () => [...$("#teacher-list").children].filter((card) => !card.hidden);
  function change(selector, value) {
    const element = $(selector);
    if (typeof value === "boolean") element.checked = value;
    else element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function resetFilters() {
    $("#filters").reset();
    $("#search").value = "";
    $("#filters").dispatchEvent(new Event("change", { bubbles: true }));
  }
  function centered(dialog) {
    const rect = dialog.getBoundingClientRect();
    check(Math.abs(rect.left + rect.width / 2 - innerWidth / 2) < 2, "Popup is not centered horizontally");
    check(Math.abs(rect.top + rect.height / 2 - innerHeight / 2) < 2, "Popup is not centered vertically");
    check(rect.top >= 8 && rect.bottom <= innerHeight - 8, "Popup exceeds the viewport");
  }

  check(document.documentElement.lang === "en", "Page language is missing");
  check($("meta[name=viewport]") !== null, "Viewport meta is missing");
  check(document.querySelectorAll("dialog").length === 2, "Expected two popups");
  check(visible().length === 8, "Expected eight original teachers");
  check($("#statistics-body").rows.length === 10, "Expected ten original statistics rows");
  check(getComputedStyle($("#teacher-list")).display === "grid", "Teacher layout must use grid");
  check(getComputedStyle($(".header-top")).display === "flex", "Header must use flexbox");
  check(document.documentElement.scrollWidth <= innerWidth, "Page overflows horizontally");
  for (const image of document.images) {
    await image.decode();
    check(image.naturalWidth > 0, "Image failed to load: " + image.src);
  }
  const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
  check(ids.length === new Set(ids).size, "Duplicate HTML id");
  const columns = getComputedStyle($("#teacher-list")).gridTemplateColumns.split(" ").length;
  check(columns === (innerWidth < 768 ? 2 : 5), "Incorrect responsive column count");

  $("#search").value = "iHoR";
  $("#search").dispatchEvent(new Event("input", { bubbles: true }));
  check(visible().length === 1 && visible()[0].dataset.id === "ihor", "Name search failed");
  $("#search").value = "no-such-teacher";
  $("#search").dispatchEvent(new Event("input", { bubbles: true }));
  check(visible().length === 0 && !$("#no-teachers").hidden, "Empty search result missing");
  resetFilters();
  change("#with-photo", true);
  check(visible().length === 6, "Photo filter failed");
  resetFilters();
  change("#only-favorites", true);
  check(visible().length === 2, "Favorites filter failed");
  resetFilters();
  change("#age", "18-31");
  change("#region", "Europe");
  change("#sex", "Male");
  check(visible().length === 1 && visible()[0].dataset.id === "john", "Combined filters failed");
  resetFilters();

  $('#teacher-list [data-id="ihor"] .teacher-open').click();
  check($("#info-dialog").open, "Teacher popup did not open");
  check($("#profile-name").textContent === "Ihor Tkachuk", "Wrong teacher information");
  check($("#profile-location").textContent === "Kyiv, Ukraine", "Teacher location missing");
  check($("#profile-email").getAttribute("href") === "mailto:ihor_tkachuk@domain.com", "Invalid email link");
  check(getComputedStyle($(".profile-photo")).float === (innerWidth < 768 ? "none" : "left"), "Incorrect float layout");
  centered($("#info-dialog"));
  $("#profile-favorite").click();
  check($('#teacher-list [data-id="ihor"]').dataset.favorite === "true", "Favorite was not added");
  check($("#profile-favorite").getAttribute("aria-pressed") === "true", "Favorite accessibility state is incorrect");
  $("#profile-favorite").click();
  check($('#teacher-list [data-id="ihor"]').dataset.favorite === "false", "Favorite was not removed");
  $("#info-dialog .close-dialog").click();
  check(!$("#info-dialog").open, "Teacher popup did not close");

  $("header .add-teacher").click();
  check($("#add-dialog").open, "Add popup did not open");
  centered($("#add-dialog"));
  const form = $("#teacher-form");
  check(!form.checkValidity(), "Empty form must be invalid");
  form.elements.name.value = "Test <b>Teacher</b>";
  form.elements.email.value = "not-an-email";
  form.elements.sex.value = "Female";
  check(!form.checkValidity(), "Invalid email was accepted");
  form.elements.email.value = "student@example.com";
  form.elements.country.value = "India";
  form.elements.city.value = "Delhi";
  form.elements.notes.value = "Test notes";
  check(form.checkValidity(), "Valid form was rejected");
  form.requestSubmit();
  check(!$("#add-dialog").open, "Add popup did not close after submit");
  check(visible().length === 9, "New teacher was not added");
  const added = $("#teacher-list").lastElementChild;
  check(added.dataset.region === "Asia", "Incorrect country region");
  check(added.querySelector(".teacher-name").textContent === "Test <b>Teacher</b>", "Name text was changed");
  check(!added.querySelector(".teacher-name b"), "HTML in a teacher name was executed");
  added.querySelector(".teacher-open").click();
  check($("#profile-notes").textContent === "Test notes", "Notes were not saved");
  check(!$("#profile-photo img"), "An absent photo needs initials");
  $("#info-dialog .close-dialog").click();

  $('[data-column="2"]').click();
  let ages = [...$("#statistics-body").rows].map((row) => Number(row.cells[2].textContent));
  check(ages.every((age, index) => !index || ages[index - 1] <= age), "Ascending age sort failed");
  $('[data-column="2"]').click();
  ages = [...$("#statistics-body").rows].map((row) => Number(row.cells[2].textContent));
  check(ages.every((age, index) => !index || ages[index - 1] >= age), "Descending age sort failed");
  $('[data-page="2"]').click();
  check($("#statistics-body").rows.length === 4, "Second statistics page did not open");
  $('[data-page="last"]').click();
  check($('[data-page="3"]').getAttribute("aria-current") === "page", "Last statistics page is incorrect");
  check(document.documentElement.scrollWidth <= innerWidth, "Page overflows after interactions");
  return `OK: ${count} checks, viewport ${innerWidth}px`;
})()
