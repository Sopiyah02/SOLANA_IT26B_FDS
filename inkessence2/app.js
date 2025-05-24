let supplies = [];

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("loginPage").classList.add("hidden");
      document.getElementById("dashboardPage").classList.remove("hidden");
      await loadItems(); 
      document.getElementById("loginError").classList.add("hidden");
    } else {
      document.getElementById("loginError").classList.remove("hidden");
    }
  } catch (error) {
    alert('Login error: ' + error.message);
  }
}


function logout() {
  document.getElementById("dashboardPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

// Retrieve function — loads all supplies and clears search input
async function loadItems() {
  try {
    document.getElementById("searchInput").value = ""; // clear search input

    const res = await fetch('http://localhost:3000/api/supplies');
    if (!res.ok) throw new Error('Failed to load supplies');
    supplies = await res.json();
    renderTable();
  } catch (error) {
    alert('Error loading supplies: ' + error.message);
  }
}

// Search supplies based on input field value
function searchItems() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filtered = supplies.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );
  renderTable(filtered);
}

// Add a new item
async function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const quantity = parseInt(document.getElementById("itemQty").value);
  if (!name || quantity <= 0) return;

  try {
    const res = await fetch('http://localhost:3000/api/supplies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity }),
    });
    if (!res.ok) throw new Error('Failed to add item');

    await loadItems(); // refresh list after adding

    document.getElementById("itemName").value = "";
    document.getElementById("itemQty").value = "";
  } catch (error) {
    alert('Error adding item: ' + error.message);
  }
}

// Render supplies in table
function renderTable(filtered = supplies) {
  const table = document.getElementById("supplyTable");
  table.innerHTML = "";
  filtered.forEach((item) => {
    table.innerHTML += `
      <tr class="hover:bg-purple-50">
        <td class="p-3">${item.name}</td>
        <td class="p-3">${item.quantity}</td>
        <td class="p-3">
          <button onclick="deleteItem(${item.supply_id})" class="text-red-600 hover:underline">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Delete a supply item by id
async function deleteItem(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/supplies/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete item');
    await loadItems(); // refresh list after deletion
  } catch (error) {
    alert('Error deleting item: ' + error.message);
  }
}
