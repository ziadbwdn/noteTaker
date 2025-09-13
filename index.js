// --- AppManager: Controls the overall application state and routing ---
const AppManager = {
  state: { currentView: "users" },
  elements: {
    mainContentArea: document.getElementById("main-content-area"),
    sidebarNav: document.getElementById("sidebar-nav"),
  },
  init() {
    this.elements.sidebarNav.addEventListener(
      "click",
      this.handleNavClick.bind(this)
    );
    // Attach global modal listeners once
    document.body.addEventListener("click", this.handleGlobalClick.bind(this));
    this.render();
  },
  handleGlobalClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    if (action === "close-user-modal") UsersView.closeModal();
    if (action === "add-user") UsersView.addUser();
  },
  handleNavClick(e) {
    e.preventDefault();
    const navLink = e.target.closest("a[data-view]");
    if (navLink && navLink.dataset.view !== this.state.currentView) {
      this.state.currentView = navLink.dataset.view;
      this.render();
    }
  },
  render() {
    this.elements.sidebarNav.querySelectorAll("a").forEach((link) => {
      link.classList.toggle(
        "active",
        link.dataset.view === this.state.currentView
      );
    });
    const currentViewManager =
      this.state.currentView === "users" ? UsersView : NotesView;
    this.elements.mainContentArea.innerHTML = currentViewManager.getHTML();
    currentViewManager.attachEventListeners();
  },
};

// --- UsersView: Manages the User Dashboard ---
const UsersView = {
  state: {
    users: [
      {
        id: 1,
        name: "John Anderson",
        email: "john.anderson@example.com",
        role: "Administrator",
        avatar: "JA",
      },
    ],
    filteredUsers: [],
  },
  getHTML() {
    return `
          <div class="bg-white border-b px-6 py-4 flex items-center justify-between">
              <h1 class="text-2xl font-bold text-gray-800">Users</h1>
              <button data-action="open-user-modal" class="bg-admin-orange hover:bg-admin-orange-hover text-white px-4 py-2 rounded-lg font-medium">New User</button>
          </div>
          <div class="bg-white border-b px-6 py-3 flex justify-end gap-3">
              <select id="role-filter" class="border rounded px-3 py-1 text-sm"><option>All Roles</option><option>Administrator</option><option>Editor</option><option>Author</option><option>Subscriber</option></select>
              <input id="search-input" type="text" placeholder="Search users..." class="border rounded px-3 py-1 text-sm w-64">
          </div>
          <div class="flex-1 overflow-auto bg-white"><table class="w-full">
              <thead class="bg-gray-50 border-b"><tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase">Avatar</th> <th class="px-6 py-3 text-left text-xs font-semibold uppercase">Name</th> <th class="px-6 py-3 text-left text-xs font-semibold uppercase">Email</th> <th class="px-6 py-3 text-left text-xs font-semibold uppercase">Role</th> <th class="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr></thead>
              <tbody id="usersTableBody" class="divide-y">${this._renderTableRows(
                this.state.users
              )}</tbody>
          </table></div>`;
  },
  attachEventListeners() {
    this.elements = {
      main: document.getElementById("main-content-area"),
      tableBody: document.getElementById("usersTableBody"),
      searchInput: document.getElementById("search-input"),
      roleFilter: document.getElementById("role-filter"),
    };
    this.elements.main.addEventListener(
      "click",
      this._handleViewClick.bind(this)
    );
    this.elements.searchInput.addEventListener(
      "input",
      this._applyFilters.bind(this)
    );
    this.elements.roleFilter.addEventListener(
      "change",
      this._applyFilters.bind(this)
    );
  },
  _handleViewClick(e) {
    const action = e.target.dataset.action;
    if (action === "open-user-modal") this.openModal();
    if (action === "delete-user")
      this._deleteUser(parseInt(e.target.dataset.id));
  },
  openModal() {
    document.getElementById("addUserModal").classList.replace("hidden", "flex");
  },
  closeModal() {
    document.getElementById("addUserModal").classList.replace("flex", "hidden");
  },
  addUser() {
    const form = document.getElementById("addUserForm");
    const name = form.elements.name.value,
      email = form.elements.email.value;
    if (!name || !email) return alert("Name and Email are required.");
    const newUser = {
      id: Date.now(),
      name,
      email,
      role: form.elements.role.value,
      avatar: name
        .split(" ")
        .map((n) => n[0])
        .join(""),
    };
    this.state.users.unshift(newUser);
    this._applyFilters();
    this.closeModal();
    form.reset();
  },
  _deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      this.state.users = this.state.users.filter((u) => u.id !== userId);
      this._applyFilters();
    }
  },
  _applyFilters() {
    const searchTerm = this.elements.searchInput.value.toLowerCase();
    const selectedRole = this.elements.roleFilter.value;
    this.state.filteredUsers = this.state.users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)) &&
        (selectedRole === "All Roles" || user.role === selectedRole)
    );
    this.elements.tableBody.innerHTML = this._renderTableRows(
      this.state.filteredUsers
    );
  },
  _renderTableRows(users) {
    return users
      .map(
        (user) => `
          <tr class="table-row">
              <td class="px-6 py-4"><div class="w-10 h-10 rounded-full bg-admin-orange text-white flex items-center justify-center font-semibold">${user.avatar}</div></td>
              <td class="px-6 py-4 font-medium">${user.name}</td><td class="px-6 py-4 text-gray-600">${user.email}</td>
              <td class="px-6 py-4 text-gray-600">${user.role}</td>
              <td class="px-6 py-4"><button data-action="delete-user" data-id="${user.id}" class="text-red-600 hover:text-red-800 font-medium">Delete</button></td>
          </tr>`
      )
      .join("");
  },
};

// --- NotesView: Manages the Note Taker ---
const NotesView = {
  state: {
    notes: [],
    selectedNoteId: null,
    searchQuery: "",
    debounceTimer: null,
  },
  getHTML() {
    return `<div class="flex h-full bg-white">
          <div class="w-80 border-r flex flex-col"><div class="p-4 border-b">
              <h2 class="text-xl font-bold mb-4">My Notes</h2>
              <input id="notes-search" type="text" placeholder="Search notes..." class="w-full px-3 py-2 border rounded-lg" value="${this.state.searchQuery}">
          </div>
          <div id="notes-list" class="flex-1 overflow-y-auto"></div>
          <div class="p-4 border-t"><button data-action="create-note" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">New Note</button></div></div>
          <div id="note-editor" class="flex-1 flex flex-col"></div>
      </div>`;
  },
  attachEventListeners() {
    this._loadFromLocalStorage();
    if (this.state.notes.length === 0)
      this._createNote("Welcome!", "Start writing here.", false);
    if (!this.state.selectedNoteId && this.state.notes.length > 0)
      this.state.selectedNoteId = this._getFilteredAndSortedNotes()[0].id;

    this.elements = { main: document.getElementById("main-content-area") };
    this.elements.main.addEventListener(
      "click",
      this._handleViewClick.bind(this)
    );
    this.elements.main.addEventListener("input", this._handleInput.bind(this));
    this._render();
  },
  _render() {
    this._renderNotesList();
    this._renderEditor();
  },
  _getFilteredAndSortedNotes() {
    const filtered = this.state.notes.filter(
      (n) =>
        n.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(this.state.searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },
  _renderNotesList() {
    const notes = this._getFilteredAndSortedNotes();
    const notesListEl = document.getElementById("notes-list");
    if (!notesListEl) return;
    if (notes.length === 0) {
      notesListEl.innerHTML = `<p class="p-4 text-gray-500">No notes found.</p>`;
      return;
    }
    notesListEl.innerHTML = notes
      .map(
        (note) => `
          <div data-action="select-note" data-id="${
            note.id
          }" class="note-item p-3 border-b cursor-pointer ${
          note.id === this.state.selectedNoteId ? "bg-blue-50" : ""
        }">
              <div class="flex items-start justify-between pointer-events-none">
                  <h3 class="font-medium truncate pr-2">${
                    note.isPinned ? "📌 " : ""
                  }${note.title}</h3>
                  <span class="text-xs text-gray-400 flex-shrink-0">${new Date(
                    note.updatedAt
                  ).toLocaleDateString()}</span>
              </div>
              <p class="text-sm text-gray-500 line-clamp-2 mt-1 pointer-events-none">${
                note.content || "No content"
              }</p>
          </div>`
      )
      .join("");
  },
  _renderEditor() {
    const editorEl = document.getElementById("note-editor");
    if (!editorEl) return;
    const note = this.state.notes.find(
      (n) => n.id === this.state.selectedNoteId
    );
    if (!note) {
      editorEl.innerHTML = `<div class="p-8 text-center text-gray-500 self-center">Select or create a note to begin.</div>`;
      return;
    }
    editorEl.innerHTML = `<div class="p-4 border-b flex justify-between items-center">
          <input id="note-title-input" class="text-xl font-bold w-full outline-none" value="${
            note.title
          }">
          <div class="flex items-center gap-2">
              <button data-action="toggle-pin" data-id="${
                note.id
              }" class="p-2 ${
      note.isPinned ? "text-yellow-500" : "text-gray-400"
    }" title="Pin Note">📌</button>
              <button data-action="delete-note" data-id="${
                note.id
              }" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
          </div></div>
          <div class="flex-1 p-4"><textarea id="note-content-area" class="w-full h-full resize-none outline-none">${
            note.content
          }</textarea></div>`;
  },
  _handleViewClick(e) {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (action === "create-note") this._createNote();
    if (action === "select-note") this._selectNote(id);
    if (action === "delete-note") this._deleteNote(id);
    if (action === "toggle-pin") this._togglePin(id);
  },
  _handleInput(e) {
    const targetId = e.target.id;
    if (targetId === "notes-search") {
      this.state.searchQuery = e.target.value;
      this._renderNotesList(); // Only update list on search
    }
    // BUG FIX: The main fix is here. We no longer do a full re-render on every keystroke.
    if (targetId === "note-title-input" || targetId === "note-content-area") {
      const note = this.state.notes.find(
        (n) => n.id === this.state.selectedNoteId
      );
      if (note) {
        // 1. Update state directly from the input fields
        note.title = document.getElementById("note-title-input").value;
        note.content = document.getElementById("note-content-area").value;
        note.updatedAt = new Date();

        // 2. Save the changes
        this._saveToLocalStorage();

        // 3. DEBOUNCE LOGIC: Update the side list only after the user stops typing
        clearTimeout(this.state.debounceTimer);
        this.state.debounceTimer = setTimeout(() => {
          this._renderNotesList();
        }, 300);
      }
    }
  },
  _createNote(title = "New Note", content = "", render = true) {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.state.notes.unshift(newNote);
    this.state.selectedNoteId = newNote.id;
    this._saveToLocalStorage();
    if (render) this._render();
  },
  _selectNote(id) {
    this.state.selectedNoteId = id;
    this._render();
  },
  _deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
      this.state.notes = this.state.notes.filter((n) => n.id !== id);
      if (this.state.selectedNoteId === id)
        this.state.selectedNoteId =
          this._getFilteredAndSortedNotes()[0]?.id || null;
      this._saveToLocalStorage();
      this._render();
    }
  },
  _togglePin(id) {
    const note = this.state.notes.find((n) => n.id === id);
    if (note) {
      note.isPinned = !note.isPinned;
      note.updatedAt = new Date(); // Pinning should also count as an update
      this._saveToLocalStorage();
      this._render();
    }
  },
  _saveToLocalStorage() {
    localStorage.setItem("mbt-notes", JSON.stringify(this.state.notes));
  },
  _loadFromLocalStorage() {
    this.state.notes = JSON.parse(localStorage.getItem("mbt-notes") || "[]");
  },
};

// --- Start the Application ---
document.addEventListener("DOMContentLoaded", () => AppManager.init());
