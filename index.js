const container = document.querySelector(".container");
const usersList = document.querySelector(".friends");
const formAll = document.querySelector(".form");
const inputName = document.querySelector('input[data-search="name"]');
const inputAge = document.querySelector('input[data-search="age"]');
const menuButton = document.querySelector(".header__button");
const menu = document.querySelector(".menu");
const pagination = document.getElementById("pagination-numbers");
const resetButton = document.querySelector(".reset");

const onEscapeClose = ({ code }) => {
  if (code === "Escape") {
    menuClose();
  }
};

const menuClose = () => {
  menu.classList.remove("is-open");
  menuButton.classList.remove("close");
  window.removeEventListener("keydown", onEscapeClose);
};

const openMenu = () => {
  menu.classList.add("is-open");
  menuButton.classList.add("close");
  window.addEventListener("keydown", onEscapeClose);
};

menuButton.addEventListener("click", () => {
  menu.classList.contains("is-open") ? menuClose() : openMenu();
});

let usersQuantity = 48;
let users = [];
let copyOfUsers = [];
let page = 1;
let usersForPage = 6;
let currentPage = null;
let prevPage = null;

const fetchUsers = async () => {
  const BASE_URL = `https://randomuser.me/api/?results=${usersQuantity}`;
  const response = await fetch(BASE_URL);
  const data = await response.json();
  users = [...data.results];
  copyOfUsers = [...users];
  return users;
};

const renderUsers = (usersData) => {
  let usersForRender = usersData.slice((page - 1) * usersForPage, page * usersForPage);
  if (!usersForRender.length) {
    usersForRender = usersData;
  }
  console.log(usersForRender);
  const markup = usersForRender
    .map(
      ({
        email,
        picture,
        gender,
        phone,
        location,
        name,
        dob,
      }) => `<li class="friends__card">
      <p class="friends__name">${name.first} ${name.last}</p>
            <div class="thumb">
              <img src="${picture.large}" class="friends__photo" />
            </div> 
            <div class="friends__info">
              <div class="wrapper">
                <p class="friends__age">Age: ${dob.age}</p>
                <svg class="friends__sex">
   <use href="./images/sprite.svg#${gender}"></use>
              </svg>
              </div>
              <div class="friends__contacts">
              <a href="mailto:${email}" class="friends__mail"> <svg class="friends__mail--icon" width="35" height="35">
   <use href="./images/sprite.svg#envelop"></use>
 </svg>${email}</a>
              <a href="tel:${phone}" class="friends__phone"> <svg class="friends__phone--icon" width="35" height="35">
   <use href="./images/sprite.svg#mobile"></use>
 </svg>${phone}</a>
              <p class="friends__place"> <svg class="friends__place--icon" width="35" height="35">
   <use href="./images/sprite.svg#location"></use>
 </svg>${location.city}</p>
              </div>
           </div>
          </li>`
    )
    .join("");
  usersList.innerHTML = markup;
};

const sortUsers = (users, { target }) => {
  if (target.dataset.sort === "name") {
    return sortByName(users);
  } else if (target.dataset.sort === "age") {
    return sortByAge(users);
  } else {
    return users;
  }
};

const sortByAge = (users) => {
  if (formAll.sorter.value === "ascending") {
    return users.sort((firstUser, secondUser) => firstUser.dob.age - secondUser.dob.age);
  } else if (formAll.sorter.value === "descending") {
    return users.sort((firstUser, secondUser) => secondUser.dob.age - firstUser.dob.age);
  } else {
    return users;
  }
};

const compareName = (firstUser, secondUser) => {
  const nameToSortFirst = (firstUser.name.first + firstUser.name.last).toLowerCase();
  const nameToSortSecond = (secondUser.name.first + secondUser.name.last).toLowerCase();
  return nameToSortFirst.localeCompare(nameToSortSecond);
};

const sortByName = (users) => {
  if (formAll.sorter.value === "ascending") {
    return users.sort((firstUser, secondUser) => compareName(firstUser, secondUser));
  } else if (formAll.sorter.value === "descending") {
    return users.sort((firstUser, secondUser) => compareName(secondUser, firstUser));
  } else {
    return users;
  }
};

const filterByGender = (users) => {
  if (formAll.sex.value === "female" || formAll.sex.value === "male") {
    return users.filter((user) => user.gender === formAll.sex.value);
  } else {
    return users;
  }
};

const filterByName = (users) => {
  users = users.filter((user) =>
    (user.name.first + user.name.last)
      .toLowerCase()
      .includes(inputName.value.trim().toLowerCase())
  );
  return users;
};

const filterByAge = (users) => {
  if (inputAge.value.length) {
    users = users.filter((user) => user.dob.age.toString()[0] === [...inputAge.value][0]);
  }
  if ([...inputAge.value][1]) {
    users = users.filter((el) => el.dob.age === Number(inputAge.value));
  }
  if (inputAge.value === "") {
    users = users;
  }
  return users;
};

formAll.addEventListener("input", (event) => {
  renderUsers(filterByName(filterByAge(filterByGender(sortUsers(users, event)))));
  createNavPagination(
    filterByName(filterByAge(filterByGender(sortUsers(users, event)))).length
  );
});

const showUsers = async () => {
  try {
    const fethchedUsers = await fetchUsers();
    renderUsers(fethchedUsers);
    createNavPagination(usersQuantity);
  } catch (error) {
    alert("Oops, something  wrong. Please, try again");
    console.log(error);
  }
};

resetButton.addEventListener("click", () => {
  document.querySelectorAll("input").forEach((input) => (input.checked = false));
  console.log(formAll.search.value);
  inputName.value = "";
  inputAge.value = "";
  renderUsers(copyOfUsers);
  createNavPagination(copyOfUsers.length);
});

const createNavPagination = (quantityOfUsers) => {
  const buttons = [];
  for (let i = 0; i < quantityOfUsers / usersForPage; i++) {
    buttons.push(` <button type="button" class="pagination__number">${i + 1}</button>`);
    pagination.innerHTML = buttons.join("");
  }
};

const changePage = ({ target }) => {
  if (target.nodeName !== "BUTTON") {
    return;
  }
  page = target.textContent;
  prevPage = currentPage;
  currentPage = target;
  console.log(prevPage);
  console.log(currentPage);
  currentPage.classList.add("active");
  if (prevPage) prevPage.classList.remove("active");

  renderUsers(filterByName(filterByAge(filterByGender(sortUsers(users, { target })))));
};

pagination.addEventListener("click", changePage);
showUsers();
