let [form] = Array.from(document.getElementsByTagName('form'));
if (!('last_id' in localStorage)) localStorage.setItem('last_id', '0'); // keep check of prev_id
const searchBar = document.getElementById('search-bar');

type User = {
  FirstName: string;
  LastName: string;
  Email: string;
  ContactNumber: string;
  Position: string;
  BirthDate: string;
  Address: string
};

interface dataFormat{
  address: {
    city: string,
    geo: {
      lat: string,
      lng: string
    },
    street: string,
    suit: string,
    zipcode: string
  },
  company: {
    bs: string,
    catchPhrase: string,
    name: string
  },
  email: string,
  id: string,
  name: string,
  phone: string,
  username: string,
  website: string
}

// fetching data from dummy API
const fetchFromAPI = async (): Promise<void> => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const json: Array<dataFormat> = await res.json(); 
  let id = Math.round(Math.random() * 10);
  id = id == 10 ? 9 : id; // choosing random user from api out of 10 users
  const data = json[id];
  const [FirstName,LastName] = data.name.split(' ');
  let [phone] = data.phone.split(' ');
  phone = phone.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, ''); // removing extra characters from phone number

  const userInfo: User = {
    FirstName: FirstName,
    LastName: LastName,
    Email: data.email,
    ContactNumber: phone.length > 10 ? phone.substring(1) : phone,
    Position: 'SDE',
    BirthDate: '2003-12-20',
    Address: data.address.city,
  };

  localStorage.setItem('apiData', JSON.stringify(userInfo));
};

//loads all cards stored in local storage
const loadAll = (): void => {
  Object.keys(localStorage).forEach((id) => {
    if (id === 'last_id') {
      return;
    }

    let obj: User;
    const item = localStorage.getItem(id);
    if (typeof item === 'string') {
      obj = JSON.parse(item);
      updateDom(id, obj);
    }
  });
};
// creates a new card
const createContact = (event: Event): void => {
  event.preventDefault();
  if (form.checkValidity()) {
    const obj: User = createObj();
    const item = localStorage.getItem('last_id');
    let id: string;
    if (typeof item === 'string') {
      id = (parseInt(item) + 1).toString();
      localStorage.setItem('last_id', id);
      localStorage.setItem(id, JSON.stringify(obj));
      updateDom(id, obj);
      form.reset();
      showCard(undefined, id);
    }
  } else {
    form.reportValidity();
  }
};

// updates side-nav dom
const updateDom = (id: string, obj: User, update: boolean = false): void => {
  const [contactBox] = Array.from(document.getElementsByClassName('contact-name'));
  if (update) {
    let element = contactBox?.querySelector(`[id='${id}']`)?.querySelector('.name-area');
    if (element !== null && element !== undefined) {
      (element as HTMLBodyElement).innerText = `${obj.FirstName} ${obj.LastName}`;
    }
    return;
  }
  const [contactcard] = Array.from(document.getElementsByClassName('contact-card'));
  const contactDiv = document.createElement('div');
  contactDiv.classList.add('p1');
  contactDiv.classList.add('flex-row');
  contactDiv.classList.add('btn-box');
  contactDiv.id = `${id}`;
  contactcard.id = `${id}`;
  contactDiv.innerHTML = `
  <div>
    <h2 class="m0 name-area">${obj.FirstName} ${obj.LastName}</h2>
  </div>
  <div>
    <button class="view btn-2"><i class="fa-solid fa-eye icon" onclick="showCard(event)"></i></button>
    <button class="edit btn-2"><i class="fa-solid fa-pen-to-square icon"  onclick="showInput(event)"></i></button>
    <button class="delete btn-2"><i class="fa-solid fa-delete-left icon" onclick="deleteContact(event)"></i></button>
  </div>
  `;
  contactBox.appendChild(contactDiv);
  const line = document.createElement('hr');
  line.classList.add('hr-width');
  contactBox.appendChild(line);
};

// delete's contact
const deleteContact = (e: Event): void => {
  const Target: HTMLButtonElement | null = e.target as HTMLButtonElement;
  if (Target !== null && Target.parentElement?.parentElement?.parentElement != undefined) {
    const element: HTMLElement = Target.parentElement.parentElement.parentElement;
    const id: string = element.id;

    if (element.nextElementSibling !== null) {
      element.nextElementSibling.remove();
      element.remove();
    }

    localStorage.removeItem(id);
    showCard(undefined, '0'); // after deletion show default contact Sarakshi
    activate('0');
  }
};

// shows Input with values for editing
const showInput = (e: Event): void => {
  const Target: HTMLButtonElement | null = e.target as HTMLButtonElement;
  if (Target !== null && Target.parentElement?.parentElement?.parentElement != undefined) {
    const element = Target.parentElement.parentElement.parentElement;
    const id = element.id;
    let obj: User | null = null;
    const item = localStorage.getItem(id);
    if (typeof item === 'string') {
      obj = JSON.parse(item);
    }
    showEdit(true);
    activate(id);
    const [contactBox] = Array.from(document.getElementsByClassName('contact-card'));
    contactBox.id = id;
    if (obj !== null) {
      (document.getElementById(`FirstName`) as HTMLInputElement).value = obj.FirstName;
      (document.getElementById(`LastName`) as HTMLInputElement).value = obj.LastName;
      (document.getElementById(`Email`) as HTMLInputElement).value = obj.Email;
      (document.getElementById(`ContactNumber`) as HTMLInputElement).value = obj.ContactNumber;
      (document.getElementById(`Position`) as HTMLInputElement).value = obj.Position;
      (document.getElementById(`BirthDate`) as HTMLInputElement).value = obj.BirthDate;
      (document.getElementById(`Address`) as HTMLInputElement).value = obj.Address;
    }
  }
};

// saves updated information
const saveUpdate = (e: Event): void => {
  e.preventDefault();
  if (form.checkValidity()) {
    const [contactBox] = Array.from(document.getElementsByClassName('contact-card'));
    const id = contactBox.id;
    const updatedObj = createObj(id);
    updateDom(id, updatedObj, true);
    showCard(undefined, id);
  } else {
    form.reportValidity();
  }
};

//creates and also updates obj to be stored in local storage
const createObj = (id: string | null = null): User => {
  const FirstName = (document.getElementById(`FirstName`) as HTMLInputElement).value;
  const LastName = (document.getElementById(`LastName`) as HTMLInputElement).value;
  const Email = (document.getElementById(`Email`) as HTMLInputElement).value;
  const ContactNumber = (document.getElementById(`ContactNumber`) as HTMLInputElement).value;
  const Position = (document.getElementById(`Position`) as HTMLInputElement).value;
  const BirthDate = (document.getElementById(`BirthDate`) as HTMLInputElement).value;
  const Address = (document.getElementById(`Address`) as HTMLInputElement).value;
  const obj: User = {
    FirstName,
    LastName,
    Email,
    ContactNumber,
    Position,
    BirthDate,
    Address,
  };

  if (id != null) {
    localStorage.setItem(id, JSON.stringify(obj));
  }
  return obj;
};

// shows particular contact's info
const showCard = (e: Event | null = null, ID: string | null = null): void => {
  let id: string | null = null;
  if (e !== null) {
    // gets id from btn-box, can't use closest('.btn-box') as it is targeting wrong element
    const Target: HTMLButtonElement | null = e.target as HTMLButtonElement;
    if (Target !== null && Target.parentElement?.parentElement?.parentElement != undefined) {
      const parent = Target.parentElement.parentElement.parentElement;
      id = parent.id;
    }
  }

  if (ID === null) {
    activate(id);
  } else {
    activate(ID);
  }

  id = ID !== null ? ID : id;
  let obj: User | null = null;
  if (id !== null) {
    const item = localStorage.getItem(id) as string;

    obj = JSON.parse(item) || {
      FirstName: 'Sarakshi',
      LastName: 'Kaur',
      Email: 'sk@abc.com',
      ContactNumber: '9988567128',
      Position: 'Intern',
      BirthDate: '20/03/2003',
      Address: 'Kharar',
    };
  }

  showInfo();
  if (obj !== null) {
    (document.getElementById('Fname') as HTMLBodyElement).innerText = obj.FirstName;
    (document.getElementById('Lname') as HTMLBodyElement).innerText = obj.LastName;
    (document.getElementById('Mail') as HTMLBodyElement).innerText = obj.Email;
    (document.getElementById('Phone') as HTMLBodyElement).innerText = obj.ContactNumber;
    (document.getElementById('position') as HTMLBodyElement).innerText = obj.Position;
    (document.getElementById('DOB') as HTMLBodyElement).innerText = obj.BirthDate;
    (document.getElementById('address') as HTMLBodyElement).innerText = obj.Address;
  }
};

// shows Input and updates dom for edit mode
const showEdit = (status: boolean): void => {
  form.reset();
  const [inputHeading] = Array.from(document.getElementsByClassName('inp-heading'));
  const [btn] = Array.from(document.getElementsByClassName('btn'));
  const btnParent = btn.parentElement;
  const newBtn = document.createElement('button');
  newBtn.classList.add('btn');
  btn.remove();
  // depending on requirement of edit it will display different heading and buttons
  if (status) {
    inputHeading.innerHTML = "<span class='update'>Update</span> Details Of Contact";
    newBtn.innerText = 'Save Now';
    newBtn.addEventListener('click', (e) => saveUpdate(e));
  } else {
    activate();
    inputHeading.innerHTML = "<span class='add'>Add</span> Details For New Contact";
    newBtn.innerText = 'Submit';
    newBtn.addEventListener('click', (e) => createContact(e));
  }
  if (btnParent !== null) {
    btnParent.append(newBtn);
  }
  const [contactDdiv] = Array.from(document.getElementsByClassName('details'));
  contactDdiv.classList.remove('hidden');
  const [detailCard] = Array.from(document.getElementsByClassName('contact-card'));
  detailCard.classList.add('hidden');
};

// hides input and shows card
const showInfo = (): void => {
  const [detailCard] = Array.from(document.getElementsByClassName('contact-card'));
  detailCard.classList.remove('hidden');
  const [contactDiv] = Array.from(document.getElementsByClassName('details'));
  contactDiv.classList.add('hidden');
};

const activate = (id: string | null = null): void => {
  let prevContactCard = document.querySelector('.activated');
  prevContactCard !== null && prevContactCard.classList.remove('activated');

  if (id !== null) {
    let contactCard = document.querySelector(`.btn-box[id="${id}"]`);
    if (contactCard !== null) {
      contactCard.classList.add('activated');
    }
  }
};

const toggleSideNav = (): void => {
  let [sidenav] = Array.from(document.getElementsByClassName('side-nav'));
  sidenav.classList.toggle('hidden');
};

window.addEventListener('resize', (): void => {
  const width = window.innerWidth;
  if (width > 992) {
    const [nav] = Array.from(document.getElementsByClassName('side-nav'));
    nav.classList.remove('hidden');
  }
});

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  if (!localStorage.getItem('apiData')) {
    await fetchFromAPI();
  }

  loadAll();
  // handles search bar
  (searchBar as HTMLElement).addEventListener('input', () => {
      const searchText = (searchBar as HTMLInputElement).value.toLowerCase().trim();
      const contactBoxes = document.querySelectorAll('.btn-box');

      contactBoxes.forEach((box) => {
        const contactName = (box.querySelector('.name-area') as HTMLBodyElement).innerText.toLowerCase();
        if (contactName.includes(searchText)) {
          box.classList.remove('hidden');
          (box.nextElementSibling as HTMLElement).classList.remove('hidden');
        } else {
          box.classList.add('hidden');
          (box.nextElementSibling as HTMLElement).classList.add('hidden');
        }
      });
    });
});