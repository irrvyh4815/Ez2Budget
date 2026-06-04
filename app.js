const STORAGE_KEYS = {
  current: "ez2budget-state-v3",
  books: "ez2budget-budget-books-v1",
  previous: "ez2budget-state-v2",
  legacy: "ez2budget-state-v1",
};

const AI_PRICE_ENDPOINT = window.EZ2BUDGET_AI_PRICE_ENDPOINT || "";

const defaultCategories = [
  "假設工程",
  "土方工程",
  "基礎工程",
  "結構工程",
  "裝修工程",
  "機電工程",
  "道路工程",
  "排水工程",
  "景觀工程",
  "其他",
];

let categories = [...defaultCategories];

const templates = {
  building: [
    { code: "A-001", category: "假設工程", name: "臨時圍籬與安全設施", material: "鍍鋅浪板、固定鐵件、安全警示配件", unit: "式", quantity: 1, price: 85000 },
    { code: "A-002", category: "假設工程", name: "施工架及防護網", material: "鋼管鷹架、防墜網、踢腳板", unit: "m2", quantity: 650, price: 520 },
    { code: "B-001", category: "土方工程", name: "基地開挖及運棄", material: "挖土、裝車、合法棄土場運棄", unit: "m3", quantity: 420, price: 780 },
    { code: "C-001", category: "基礎工程", name: "基礎鋼筋綁紮", material: "SD420W 鋼筋、鐵絲、墊塊", unit: "kg", quantity: 9800, price: 34 },
    { code: "C-002", category: "基礎工程", name: "基礎混凝土澆置", material: "預拌混凝土 3000psi、泵送與整平", unit: "m3", quantity: 155, price: 3350 },
    { code: "D-001", category: "結構工程", name: "柱梁版鋼筋工程", material: "SD420W 鋼筋、續接器、綁紮工資", unit: "kg", quantity: 42500, price: 33 },
    { code: "D-002", category: "結構工程", name: "模板組立拆除", material: "清水模板、支撐架、組拆工資", unit: "m2", quantity: 3100, price: 720 },
    { code: "D-003", category: "結構工程", name: "結構混凝土澆置", material: "預拌混凝土 3500psi、泵送與搗實", unit: "m3", quantity: 760, price: 3450 },
    { code: "E-001", category: "裝修工程", name: "水泥砂漿粉刷", material: "水泥砂漿、打底、面層修飾", unit: "m2", quantity: 2400, price: 390 },
    { code: "E-002", category: "裝修工程", name: "地坪磁磚鋪設", material: "止滑地磚、黏著劑、填縫劑", unit: "m2", quantity: 980, price: 1550 },
    { code: "F-001", category: "機電工程", name: "給排水配管及衛生設備", material: "PVC/不銹鋼配管、閥件、衛浴設備", unit: "式", quantity: 1, price: 1250000 },
    { code: "F-002", category: "機電工程", name: "電氣配管配線及配電盤", material: "EMT 管、電線電纜、配電盤與開關", unit: "式", quantity: 1, price: 1680000 },
  ],
  civil: [
    { code: "R-001", category: "假設工程", name: "交通維持與安全管制", material: "交維設施、警示燈、交通錐、義交", unit: "式", quantity: 1, price: 180000 },
    { code: "R-002", category: "道路工程", name: "路面刨除", material: "瀝青路面刨除、清運、現場整理", unit: "m2", quantity: 2600, price: 115 },
    { code: "R-003", category: "土方工程", name: "路基整修夯實", material: "路基整平、灑水、壓路機夯實", unit: "m2", quantity: 2600, price: 95 },
    { code: "R-004", category: "道路工程", name: "級配粒料底層", material: "級配粒料、運搬、鋪築壓實", unit: "m3", quantity: 390, price: 1100 },
    { code: "R-005", category: "道路工程", name: "瀝青混凝土鋪面", material: "AC 瀝青混凝土、鋪裝、滾壓", unit: "ton", quantity: 620, price: 2550 },
    { code: "R-006", category: "排水工程", name: "U 型溝新設", material: "預鑄 U 型溝、基礎、接縫處理", unit: "m", quantity: 180, price: 4200 },
    { code: "R-007", category: "排水工程", name: "集水井施作", material: "RC 集水井、鑄鐵蓋、開挖回填", unit: "座", quantity: 8, price: 32000 },
    { code: "R-008", category: "道路工程", name: "標線繪設", material: "熱拌標線漆、玻璃珠、放樣", unit: "m", quantity: 1450, price: 48 },
    { code: "R-009", category: "景觀工程", name: "人行道鋪面修復", material: "高壓磚、砂墊層、收邊材料", unit: "m2", quantity: 420, price: 1850 },
  ],
  empty: [],
};

const defaultState = {
  project: {
    budgetName: "新建工程預算書",
    name: "新建工程預算書",
    client: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
  },
  rates: {
    overhead: 8,
    profit: 7,
    contingency: 3,
    tax: 5,
  },
  categories: [...defaultCategories],
  expandedCategories: Object.fromEntries(defaultCategories.map((category) => [category, true])),
  items: templates.building,
};

const els = {
  budgetLibraryView: document.querySelector("#budgetLibraryView"),
  budgetEditorView: document.querySelector("#budgetEditorView"),
  backToLibraryButton: document.querySelector("#backToLibraryButton"),
  createBudgetBookButton: document.querySelector("#createBudgetBookButton"),
  newBudgetBookName: document.querySelector("#newBudgetBookName"),
  newBudgetTemplate: document.querySelector("#newBudgetTemplate"),
  budgetBookName: document.querySelector("#budgetBookName"),
  saveBudgetBookButton: document.querySelector("#saveBudgetBookButton"),
  toggleBudgetBooksButton: document.querySelector("#toggleBudgetBooksButton"),
  savedBudgetCount: document.querySelector("#savedBudgetCount"),
  budgetBooksList: document.querySelector("#budgetBooksList"),
  projectName: document.querySelector("#projectName"),
  clientName: document.querySelector("#clientName"),
  projectLocation: document.querySelector("#projectLocation"),
  estimateDate: document.querySelector("#estimateDate"),
  overheadRate: document.querySelector("#overheadRate"),
  profitRate: document.querySelector("#profitRate"),
  contingencyRate: document.querySelector("#contingencyRate"),
  taxRate: document.querySelector("#taxRate"),
  directCost: document.querySelector("#directCost"),
  feeCost: document.querySelector("#feeCost"),
  contingencyCost: document.querySelector("#contingencyCost"),
  taxCost: document.querySelector("#taxCost"),
  grandTotal: document.querySelector("#grandTotal"),
  itemsBody: document.querySelector("#itemsBody"),
  rowTemplate: document.querySelector("#itemRowTemplate"),
  addItemButton: document.querySelector("#addItemButton"),
  newCategoryName: document.querySelector("#newCategoryName"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  selectedCount: document.querySelector("#selectedCount"),
  bulkAiButton: document.querySelector("#bulkAiButton"),
  bulkDuplicateButton: document.querySelector("#bulkDuplicateButton"),
  bulkDeleteButton: document.querySelector("#bulkDeleteButton"),
  selectAllItems: document.querySelector("#selectAllItems"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  emptyState: document.querySelector("#emptyState"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  importJsonButton: document.querySelector("#importJsonButton"),
  jsonFileInput: document.querySelector("#jsonFileInput"),
  printButton: document.querySelector("#printButton"),
  aiDrawer: document.querySelector("#aiDrawer"),
  closeAiDrawer: document.querySelector("#closeAiDrawer"),
  aiDrawerTitle: document.querySelector("#aiDrawerTitle"),
  aiPromptOutput: document.querySelector("#aiPromptOutput"),
  aiResultText: document.querySelector("#aiResultText"),
  copyAiPromptButton: document.querySelector("#copyAiPromptButton"),
  openAiSearchLink: document.querySelector("#openAiSearchLink"),
};

let state = loadState();
let budgetBooks = loadBudgetBooks();
categories = [...state.categories];
let activeAiIndex = null;
const selectedItemIds = new Set();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEYS.current)
    || localStorage.getItem(STORAGE_KEYS.previous)
    || localStorage.getItem(STORAGE_KEYS.legacy);

  if (!saved) {
    return normalizeState(defaultState);
  }

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState(defaultState);
  }
}

function normalizeState(input) {
  const normalizedCategories = normalizeCategories(input.categories, input.items);
  categories = [...normalizedCategories];
  const expanded = { ...Object.fromEntries(normalizedCategories.map((category) => [category, true])), ...(input.expandedCategories || {}) };
  const normalized = {
    activeBudgetId: input.activeBudgetId || "",
    budgetBooksExpanded: input.budgetBooksExpanded !== false,
    project: { ...defaultState.project, ...(input.project || {}) },
    rates: { ...defaultState.rates, ...(input.rates || {}) },
    categories: normalizedCategories,
    expandedCategories: expanded,
    items: Array.isArray(input.items) ? input.items.map(normalizeItem) : [],
  };
  renumberItems(normalized.items);
  return normalized;
}

function normalizeCategories(inputCategories, inputItems = []) {
  const names = Array.isArray(inputCategories) && inputCategories.length > 0
    ? inputCategories
    : defaultCategories;
  const normalized = [];
  names.forEach((name) => {
    const clean = String(name || "").trim();
    if (clean && !normalized.includes(clean)) {
      normalized.push(clean);
    }
  });
  if (Array.isArray(inputItems)) {
    inputItems.forEach((item) => {
      const clean = String(item.category || "").trim();
      if (clean && !normalized.includes(clean)) {
        normalized.push(clean);
      }
    });
  }
  return normalized.length ? normalized : [...defaultCategories];
}

function loadBudgetBooks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.books) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeBudgetBook) : [];
  } catch {
    return [];
  }
}

function normalizeBudgetBook(book) {
  const normalizedState = normalizeState(book.state || book);
  return {
    id: book.id || createId(),
    name: book.name || normalizedState.project.budgetName || normalizedState.project.name || "未命名預算書",
    client: book.client || normalizedState.project.client || "",
    location: book.location || normalizedState.project.location || "",
    updatedAt: book.updatedAt || new Date().toISOString(),
    total: numberValue(book.total) || grandTotalValue(normalizedState),
    state: {
      project: normalizedState.project,
      rates: normalizedState.rates,
      categories: normalizedState.categories,
      expandedCategories: normalizedState.expandedCategories,
      items: normalizedState.items,
    },
  };
}

function saveBudgetBooks() {
  localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(budgetBooks));
}

function normalizeItem(item) {
  const quantity = numberValue(item.quantity || 1);
  const lineTotal = Array.isArray(item.subitems) && item.subitems.length
    ? item.subitems.reduce((sum, subitem) => sum + numberValue(subitem.quantity) * numberValue(subitem.price), 0)
    : 0;
  const migratedPrice = lineTotal > 0 && quantity > 0 ? Math.round(lineTotal / quantity) : numberValue(item.price);

  return {
    id: item.id || createItemId(),
    code: item.code || "N-000",
    category: categories.includes(item.category) ? item.category : categories[0],
    name: item.name || "",
    material: item.material || materialFromLegacySubitems(item) || "",
    unit: item.unit || "式",
    quantity,
    price: migratedPrice,
    aiSuggestedPrice: numberValue(item.aiSuggestedPrice || item.suggestedPrice),
    aiPriceVisible: Boolean(item.aiPriceVisible || item.aiUpdatedAt),
    aiSummary: item.aiSummary || "",
    aiUpdatedAt: item.aiUpdatedAt || "",
  };
}

function materialFromLegacySubitems(item) {
  if (!Array.isArray(item.subitems) || item.subitems.length === 0) {
    return "";
  }
  return item.subitems.map((subitem) => `${subitem.type || "項目"}:${subitem.name || ""}`).join("；");
}

function saveState() {
  state.categories = [...categories];
  localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(state));
}

function showLibrary() {
  closeAiDrawer();
  selectedItemIds.clear();
  els.budgetEditorView.hidden = true;
  els.budgetLibraryView.hidden = false;
  requestAnimationFrame(() => {
    els.budgetLibraryView.classList.add("is-active");
    els.budgetEditorView.classList.remove("is-active");
  });
  document.body.dataset.view = "library";
  renderBudgetBooks();
}

function showEditor() {
  els.budgetLibraryView.hidden = true;
  els.budgetEditorView.hidden = false;
  requestAnimationFrame(() => {
    els.budgetEditorView.classList.add("is-active");
    els.budgetLibraryView.classList.remove("is-active");
  });
  document.body.dataset.view = "editor";
}

function money(value) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function decimal(value) {
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 3 }).format(Number.isFinite(value) ? value : 0);
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createId() {
  return `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createItemId() {
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lineTotal(item) {
  return numberValue(item.quantity) * numberValue(item.price);
}

function categoryNumber(category) {
  const index = categories.indexOf(category);
  return String(index >= 0 ? index + 1 : categories.length || 1).padStart(2, "0");
}

function itemCode(category, sequence) {
  return `${categoryNumber(category)}-${String(sequence).padStart(3, "0")}`;
}

function renumberItems(items = state.items) {
  const counters = Object.fromEntries(categories.map((category) => [category, 0]));
  items.forEach((item) => {
    if (!item.id) {
      item.id = createItemId();
    }
    const category = categories.includes(item.category) ? item.category : (categories[0] || "未分類");
    item.category = category;
    counters[category] += 1;
    item.code = itemCode(category, counters[category]);
  });
}

function directTotal() {
  return state.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

function grandTotalValue(sourceState = state) {
  const direct = sourceState.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const rates = sourceState.rates;
  const fee = direct * ((numberValue(rates.overhead) + numberValue(rates.profit)) / 100);
  const contingency = (direct + fee) * (numberValue(rates.contingency) / 100);
  const beforeTax = direct + fee + contingency;
  return beforeTax + beforeTax * (numberValue(rates.tax) / 100);
}

function groupItems() {
  return categories.map((category) => ({
    category,
    items: state.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category === category),
  }));
}

function categoryTotal(category) {
  return state.items
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + lineTotal(item), 0);
}

function hydrateControls() {
  els.budgetBookName.value = state.project.budgetName || state.project.name;
  els.projectName.value = state.project.name;
  els.clientName.value = state.project.client;
  els.projectLocation.value = state.project.location;
  els.estimateDate.value = state.project.date;
  els.overheadRate.value = state.rates.overhead;
  els.profitRate.value = state.rates.profit;
  els.contingencyRate.value = state.rates.contingency;
  els.taxRate.value = state.rates.tax;
}

function renderBudgetBooks() {
  els.savedBudgetCount.textContent = String(budgetBooks.length);
  els.toggleBudgetBooksButton.setAttribute("aria-expanded", String(state.budgetBooksExpanded));
  els.budgetBooksList.hidden = !state.budgetBooksExpanded;
  els.budgetBooksList.innerHTML = "";

  if (budgetBooks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "saved-book-empty";
    empty.textContent = "尚未儲存任何預算書";
    els.budgetBooksList.append(empty);
    return;
  }

  budgetBooks
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((book) => {
      const row = document.createElement("div");
      row.className = "saved-book-row";
      row.dataset.id = book.id;
      if (book.id === state.activeBudgetId) {
        row.classList.add("is-active");
      }
      row.innerHTML = `
        <button class="saved-book-load" type="button">
          <strong>${escapeHtml(book.name)}</strong>
          <span>${escapeHtml(book.client || "未填業主")} / ${escapeHtml(book.location || "未填地點")}</span>
          <b>${money(book.total)}</b>
        </button>
        <button class="text-action-button delete-budget-book" type="button">刪除</button>
      `;
      els.budgetBooksList.append(row);
    });
}

function renderCategoryFilter() {
  els.categoryFilter.innerHTML = '<option value="all">全部類別</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  });
}

function renderItems() {
  renumberItems();
  const query = els.searchInput.value.trim().toLowerCase();
  const selectedCategory = els.categoryFilter.value;
  els.itemsBody.innerHTML = "";
  let visibleCount = 0;

  groupItems()
    .filter(({ category, items }) => {
      if (selectedCategory !== "all" && category !== selectedCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      return items.some(({ item }) => itemMatchesQuery(item, query));
    })
    .forEach(({ category, items }) => {
      const visibleItems = query ? items.filter(({ item }) => itemMatchesQuery(item, query)) : items;
      if (visibleItems.length === 0 && query) {
        return;
      }

      els.itemsBody.append(createCategoryRow(category, visibleItems));
      if (state.expandedCategories[category]) {
        visibleItems.forEach(({ item, index }) => {
          els.itemsBody.append(createDetailRow(item, index));
          visibleCount += 1;
        });
      } else {
        visibleCount += visibleItems.length;
      }
    });

  els.emptyState.classList.toggle("is-visible", visibleCount === 0);
  updateSelectionControls();
  calculate();
}

function itemMatchesQuery(item, query) {
  return `${item.code} ${item.category} ${item.name} ${item.material} ${item.unit}`.toLowerCase().includes(query);
}

function visibleItemIds() {
  return Array.from(document.querySelectorAll(".detail-row")).map((row) => row.dataset.id).filter(Boolean);
}

function selectedItems() {
  return state.items.filter((item) => selectedItemIds.has(item.id));
}

function updateSelectionControls() {
  const selectedCount = selectedItems().length;
  els.selectedCount.textContent = `已選取 ${selectedCount} 項`;
  els.bulkAiButton.disabled = selectedCount === 0;
  els.bulkDuplicateButton.disabled = selectedCount === 0;
  els.bulkDeleteButton.disabled = selectedCount === 0;

  const visibleIds = visibleItemIds();
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedItemIds.has(id));
  els.selectAllItems.checked = allVisibleSelected;
  els.selectAllItems.indeterminate = !allVisibleSelected && visibleIds.some((id) => selectedItemIds.has(id));
}

function closeActionMenus(exceptMenu = null) {
  document.querySelectorAll(".row-action-menu").forEach((menu) => {
    if (menu === exceptMenu) {
      return;
    }
    menu.classList.remove("is-open");
    menu.querySelector(".action-menu").hidden = true;
    menu.querySelector(".action-menu-toggle").setAttribute("aria-expanded", "false");
  });
}

function toggleActionMenu(menu) {
  const isOpen = menu.classList.contains("is-open");
  closeActionMenus(menu);
  menu.classList.toggle("is-open", !isOpen);
  menu.querySelector(".action-menu").hidden = isOpen;
  menu.querySelector(".action-menu-toggle").setAttribute("aria-expanded", String(!isOpen));
}

function createCategoryRow(category, visibleItems) {
  const row = document.createElement("tr");
  row.className = "category-row";
  row.dataset.category = category;
  const count = visibleItems.length;
  const total = categoryTotal(category);
  const expanded = state.expandedCategories[category];
  row.innerHTML = `
    <td colspan="10">
      <div class="category-layout">
        <span class="drag-handle" draggable="true" title="拖曳調整大項排序" aria-label="拖曳調整大項排序">⋮</span>
        <button class="category-toggle" type="button" aria-expanded="${expanded}" title="展開或收合">
          <span class="chevron">${expanded ? "v" : ">"}</span>
        </button>
        <strong class="category-number">${categoryNumber(category)}</strong>
        <input class="category-name-input" type="text" value="${escapeHtml(category)}" />
        <span class="category-count">${count} 項細項</span>
        <b class="category-total">${money(total)}</b>
        <button class="soft-button add-category-item" type="button">新增細項</button>
        <button class="text-action-button delete-category" type="button">刪除大項</button>
      </div>
    </td>
  `;
  return row;
}

function createDetailRow(item, index) {
  const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.index = String(index);
  row.dataset.id = item.id;
  row.querySelector(".item-select").checked = selectedItemIds.has(item.id);
  row.querySelector(".item-select").dataset.id = item.id;
  row.querySelector(".item-code").value = item.code;
  row.querySelector(".item-code").readOnly = true;
  row.querySelector(".item-code").title = "系統自動編號";
  row.querySelector(".item-name").value = item.name;
  row.querySelector(".item-material").value = item.material;
  row.querySelector(".item-unit").value = item.unit;
  row.querySelector(".item-quantity").value = item.quantity;
  row.querySelector(".item-price").value = item.price;
  row.querySelector(".line-total").textContent = money(lineTotal(item));

  const suggestedInput = row.querySelector(".item-suggested-price");
  const applyButton = row.querySelector(".apply-ai-price");
  if (item.aiPriceVisible) {
    suggestedInput.hidden = false;
    applyButton.hidden = false;
    suggestedInput.value = item.aiSuggestedPrice || "";
  }
  return row;
}

function calculate() {
  const direct = directTotal();
  const fee = direct * ((numberValue(state.rates.overhead) + numberValue(state.rates.profit)) / 100);
  const contingency = (direct + fee) * (numberValue(state.rates.contingency) / 100);
  const beforeTax = direct + fee + contingency;
  const tax = beforeTax * (numberValue(state.rates.tax) / 100);
  const total = beforeTax + tax;

  els.directCost.textContent = money(direct);
  els.feeCost.textContent = money(fee);
  els.contingencyCost.textContent = money(contingency);
  els.taxCost.textContent = money(tax);
  els.grandTotal.textContent = money(total);
  document.title = `${state.project.budgetName || state.project.name || "Ez2Budget"} - ${money(total)}`;
}

function updateProject() {
  state.project = {
    budgetName: els.budgetBookName.value,
    name: els.projectName.value,
    client: els.clientName.value,
    location: els.projectLocation.value,
    date: els.estimateDate.value,
  };
  saveState();
  calculate();
}

function snapshotCurrentBudget() {
  renumberItems();
  return {
    project: structuredClone(state.project),
    rates: structuredClone(state.rates),
    categories: structuredClone(categories),
    expandedCategories: structuredClone(state.expandedCategories),
    items: structuredClone(state.items),
  };
}

function upsertCurrentBudgetBook(name) {
  renumberItems();
  const finalName = String(name || "").trim() || state.project.budgetName || state.project.name || "未命名預算書";
  state.project.budgetName = finalName;
  const now = new Date().toISOString();
  const existingIndex = budgetBooks.findIndex((book) => book.id === state.activeBudgetId);
  const book = {
    id: existingIndex >= 0 ? budgetBooks[existingIndex].id : createId(),
    name: finalName,
    client: state.project.client,
    location: state.project.location,
    updatedAt: now,
    total: grandTotalValue(),
    state: snapshotCurrentBudget(),
  };

  if (existingIndex >= 0) {
    budgetBooks[existingIndex] = book;
  } else {
    budgetBooks.push(book);
  }

  state.activeBudgetId = book.id;
  saveBudgetBooks();
  saveState();
  renderBudgetBooks();
  return book;
}

function saveBudgetBook() {
  updateProject();
  updateRates();
  upsertCurrentBudgetBook(els.budgetBookName.value.trim() || state.project.name.trim() || "未命名預算書");
  hydrateControls();
}

function loadBudgetBook(id) {
  const book = budgetBooks.find((candidate) => candidate.id === id);
  if (!book) {
    return;
  }

  const loaded = normalizeState(book.state);
  state = {
    ...loaded,
    activeBudgetId: book.id,
    budgetBooksExpanded: state.budgetBooksExpanded,
  };
  closeAiDrawer();
  saveState();
  hydrateControls();
  renderBudgetBooks();
  renderItems();
  showEditor();
}

function deleteBudgetBook(id) {
  const book = budgetBooks.find((candidate) => candidate.id === id);
  if (book && !window.confirm(`確定刪除預算書「${book.name}」？此動作無法復原。`)) {
    return;
  }
  budgetBooks = budgetBooks.filter((book) => book.id !== id);
  if (state.activeBudgetId === id) {
    state.activeBudgetId = "";
  }
  saveBudgetBooks();
  saveState();
  renderBudgetBooks();
}

function createBudgetBookFromTemplate(templateName, name) {
  const templateItems = structuredClone(templates[templateName] || []);
  const nextCategories = normalizeCategories(null, templateItems);
  const fresh = normalizeState({
    ...defaultState,
    project: {
      ...defaultState.project,
      budgetName: name || "未命名預算書",
      name: name || "新建工程預算書",
      date: new Date().toISOString().slice(0, 10),
    },
    categories: nextCategories,
    expandedCategories: Object.fromEntries(nextCategories.map((category) => [category, true])),
    items: templateItems,
  });
  state = {
    ...fresh,
    activeBudgetId: "",
    budgetBooksExpanded: state.budgetBooksExpanded,
  };
  categories = [...fresh.categories];
  selectedItemIds.clear();
  closeAiDrawer();
  saveState();
  hydrateControls();
  renderBudgetBooks();
  renderItems();
  upsertCurrentBudgetBook(name || "未命名預算書");
  hydrateControls();
  showEditor();
}

function createBudgetBookFromLibrary() {
  const name = els.newBudgetBookName.value.trim() || "未命名預算書";
  createBudgetBookFromTemplate(els.newBudgetTemplate.value, name);
  els.newBudgetBookName.value = "";
}

function updateRates() {
  state.rates = {
    overhead: numberValue(els.overheadRate.value),
    profit: numberValue(els.profitRate.value),
    contingency: numberValue(els.contingencyRate.value),
    tax: numberValue(els.taxRate.value),
  };
  saveState();
  calculate();
}

function updateItem(row) {
  const index = Number(row.dataset.index);
  const item = state.items[index];
  if (!Number.isInteger(index) || !item) {
    return;
  }

  item.name = row.querySelector(".item-name").value;
  item.material = row.querySelector(".item-material").value;
  item.unit = row.querySelector(".item-unit").value;
  item.quantity = numberValue(row.querySelector(".item-quantity").value);
  item.price = numberValue(row.querySelector(".item-price").value);
  item.aiSuggestedPrice = numberValue(row.querySelector(".item-suggested-price").value);
  row.querySelector(".line-total").textContent = money(lineTotal(item));
  saveState();
  calculate();
}

function addItem(category = defaultCategoryForAdd()) {
  if (!categories.includes(category)) {
    categories.push(category);
    state.expandedCategories[category] = true;
  }
  state.expandedCategories[category] = true;
  state.items.push({
    code: "",
    category,
    name: "新增細項",
    material: "",
    unit: "式",
    quantity: 1,
    price: 0,
    aiSuggestedPrice: 0,
    aiPriceVisible: false,
    aiSummary: "",
    aiUpdatedAt: "",
  });
  renumberItems();
  saveState();
  renderItems();
}

function defaultCategoryForAdd() {
  return els.categoryFilter.value !== "all" ? els.categoryFilter.value : (categories[0] || "未分類");
}

function addCategory() {
  const name = els.newCategoryName.value.trim();
  if (!name || categories.includes(name)) {
    return;
  }
  categories.push(name);
  state.expandedCategories[name] = true;
  els.newCategoryName.value = "";
  saveState();
  renderCategoryFilter();
  renderItems();
}

function renameCategory(oldName, newName) {
  const cleanName = newName.trim();
  if (!cleanName || cleanName === oldName || categories.includes(cleanName)) {
    renderItems();
    return;
  }
  const index = categories.indexOf(oldName);
  if (index < 0) {
    return;
  }
  categories[index] = cleanName;
  state.items.forEach((item) => {
    if (item.category === oldName) {
      item.category = cleanName;
    }
  });
  state.expandedCategories[cleanName] = state.expandedCategories[oldName] !== false;
  delete state.expandedCategories[oldName];
  renumberItems();
  saveState();
  renderCategoryFilter();
  renderItems();
}

function reorderCategory(sourceCategory, targetCategory) {
  if (!sourceCategory || !targetCategory || sourceCategory === targetCategory) {
    return;
  }
  const index = categories.indexOf(sourceCategory);
  const targetIndex = categories.indexOf(targetCategory);
  if (index < 0 || targetIndex < 0) {
    return;
  }
  const [moved] = categories.splice(index, 1);
  categories.splice(targetIndex, 0, moved);
  renumberItems();
  saveState();
  renderCategoryFilter();
  renderItems();
}

function deleteCategory(category) {
  const itemCount = state.items.filter((item) => item.category === category).length;
  const message = itemCount > 0
    ? `確定刪除「${category}」及底下 ${itemCount} 個細項？此動作無法復原。`
    : `確定刪除「${category}」？`;
  if (!window.confirm(message)) {
    return;
  }
  categories = categories.filter((candidate) => candidate !== category);
  if (categories.length === 0) {
    categories = ["未分類"];
  }
  state.items = state.items.filter((item) => item.category !== category);
  selectedItemIds.clear();
  delete state.expandedCategories[category];
  renumberItems();
  saveState();
  renderCategoryFilter();
  renderItems();
}

function duplicateItem(index) {
  const item = state.items[index];
  if (!item) {
    return;
  }
  state.items.splice(index + 1, 0, {
    ...structuredClone(item),
    id: createItemId(),
    code: "",
    name: `${item.name} 副本`,
  });
  renumberItems();
  saveState();
  renderItems();
}

function deleteItem(index) {
  const item = state.items[index];
  if (!item || !window.confirm(`確定刪除細項「${item.code} ${item.name}」？此動作無法復原。`)) {
    return;
  }
  selectedItemIds.delete(item.id);
  state.items.splice(index, 1);
  renumberItems();
  saveState();
  renderItems();
}

function duplicateSelectedItems() {
  const selected = selectedItems();
  if (selected.length === 0) {
    return;
  }
  const clones = selected.map((item) => ({
    ...structuredClone(item),
    id: createItemId(),
    code: "",
    name: `${item.name} 副本`,
  }));
  state.items.push(...clones);
  selectedItemIds.clear();
  renumberItems();
  saveState();
  renderItems();
}

function deleteSelectedItems() {
  const selected = selectedItems();
  if (selected.length === 0) {
    return;
  }
  if (!window.confirm(`確定刪除已選取的 ${selected.length} 個細項？此動作無法復原。`)) {
    return;
  }
  state.items = state.items.filter((item) => !selectedItemIds.has(item.id));
  selectedItemIds.clear();
  renumberItems();
  saveState();
  renderItems();
}

function runBulkAiPriceSearch() {
  const selected = selectedItems();
  if (selected.length === 0) {
    return;
  }
  selected.forEach((item) => {
    item.aiPriceVisible = true;
  });
  const prompt = [
    `請批次彙整以下 ${selected.length} 個台灣工程預算細項的目前建議單價。`,
    "請逐項考慮大項分類、細項名稱、用料/規格、計價單位、預估數量、工程地點，並輸出建議單價區間、建議採用單價、資料來源與價格日期。",
    "",
    ...selected.map((item) => [
      `編號：${item.code}`,
      `大項：${item.category}`,
      `細項：${item.name}`,
      `用料/規格：${item.material || "未填"}`,
      `單位：${item.unit}`,
      `預估數量：${decimal(numberValue(item.quantity))}`,
      `工程地點：${state.project.location || "台灣"}`,
    ].join("\n")),
  ].join("\n\n");

  els.aiDrawer.hidden = false;
  els.aiDrawerTitle.textContent = `批次 AI 詢價 / ${selected.length} 項`;
  els.aiPromptOutput.value = prompt;
  els.openAiSearchLink.href = searchUrlForPrompt(prompt);
  els.aiResultText.textContent = "已顯示批次查價欄位與提示。接上 AI 後端後，可依細項編號逐項回填建議單價。";
  saveState();
  renderItems();
}

function buildAiPrompt(item) {
  return [
    `請彙整台灣目前「${item.name}」此工程細項的建議單價。`,
    `大項分類：${item.category}`,
    `細項名稱：${item.name}`,
    `用料/規格：${item.material || "未填，請依工程常用規格估列並列出假設"}`,
    `計價單位：${item.unit}`,
    `預估數量：${decimal(numberValue(item.quantity))}`,
    `工程地點：${state.project.location || "台灣"}`,
    "請考慮材料規格、施工人工、機具、運距、數量級距、地區差異與近期價格日期。",
    "請輸出建議單價區間、建議採用單價、資料來源、日期與不確定因素。若資料來源不足，請明確標示不可直接採用。",
  ].join("\n");
}

function searchUrlForPrompt(prompt) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${prompt}\n台灣 公共工程 單價 材料 工資 市價`)}`;
}

async function runAiPriceSearch(row) {
  updateItem(row);
  const index = Number(row.dataset.index);
  const item = state.items[index];
  if (!item) {
    return;
  }

  activeAiIndex = index;
  item.aiPriceVisible = true;
  const prompt = buildAiPrompt(item);
  els.aiDrawer.hidden = false;
  els.aiDrawerTitle.textContent = `${item.category} / ${item.name || "未命名細項"}`;
  els.aiPromptOutput.value = prompt;
  els.openAiSearchLink.href = searchUrlForPrompt(prompt);
  els.aiResultText.textContent = "正在準備 AI 詢價參考...";

  const suggestedInput = row.querySelector(".item-suggested-price");
  const applyButton = row.querySelector(".apply-ai-price");
  suggestedInput.hidden = false;
  applyButton.hidden = false;

  if (!AI_PRICE_ENDPOINT) {
    els.aiResultText.textContent = "尚未連接 AI 後端；已顯示查價欄位、提示與搜尋連結。接上 EZ2BUDGET_AI_PRICE_ENDPOINT 後，可由後端彙整目前市價並回填建議單價。";
    saveState();
    return;
  }

  try {
    const response = await fetch(AI_PRICE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, project: state.project, item }),
    });
    if (!response.ok) {
      throw new Error("AI price endpoint failed");
    }
    const result = await response.json();
    const suggested = numberValue(result.suggestedUnitPrice);
    if (suggested > 0) {
      item.aiSuggestedPrice = suggested;
      suggestedInput.value = suggested;
    }
    item.aiSummary = result.summary || "";
    item.aiUpdatedAt = new Date().toISOString();
    els.aiResultText.textContent = result.summary || "AI 已回傳建議資料，請檢查來源、規格與日期後再套用。";
    saveState();
  } catch {
    els.aiResultText.textContent = "AI 詢價端點目前無法使用；請先使用搜尋連結或複製提示到具備網路搜尋能力的 AI 工具。";
  }
}

function applyAiPrice(row) {
  const index = Number(row.dataset.index);
  const item = state.items[index];
  const suggested = numberValue(row.querySelector(".item-suggested-price").value);
  if (!item || suggested <= 0) {
    return;
  }

  item.price = suggested;
  row.querySelector(".item-price").value = suggested;
  updateItem(row);
  renderItems();
}

function closeAiDrawer() {
  activeAiIndex = null;
  els.aiDrawer.hidden = true;
}

function copyAiPrompt() {
  if (!els.aiPromptOutput.value) {
    return;
  }
  navigator.clipboard.writeText(els.aiPromptOutput.value).then(() => {
    els.copyAiPromptButton.textContent = "已複製";
    window.setTimeout(() => {
      els.copyAiPromptButton.textContent = "複製提示";
    }, 1200);
  });
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportJson() {
  renumberItems();
  download(`${state.project.budgetName || state.project.name || "ez2budget"}.json`, JSON.stringify(state, null, 2), "application/json");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  renumberItems();
  const header = ["大項", "細項編碼", "細項名稱", "用料/規格", "單位", "預估數量", "單價", "AI建議單價", "複價"];
  const rows = state.items.map((item) => [
    item.category,
    item.code,
    item.name,
    item.material,
    item.unit,
    item.quantity,
    item.price,
    item.aiPriceVisible ? item.aiSuggestedPrice || "" : "",
    lineTotal(item),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  download(`${state.project.budgetName || state.project.name || "ez2budget"}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
}

function importJson(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result)));
      state.activeBudgetId = "";
      renumberItems();
      saveState();
      hydrateControls();
      renderBudgetBooks();
      renderItems();
    } catch {
      alert("JSON 格式無法讀取");
    }
  });
  reader.readAsText(file);
}

function bindEvents() {
  [els.budgetBookName, els.projectName, els.clientName, els.projectLocation, els.estimateDate].forEach((input) => {
    input.addEventListener("input", updateProject);
  });

  [els.overheadRate, els.profitRate, els.contingencyRate, els.taxRate].forEach((input) => {
    input.addEventListener("input", updateRates);
  });

  els.itemsBody.addEventListener("input", (event) => {
    if (event.target.closest(".item-select")) {
      const checkbox = event.target.closest(".item-select");
      if (checkbox.checked) {
        selectedItemIds.add(checkbox.dataset.id);
      } else {
        selectedItemIds.delete(checkbox.dataset.id);
      }
      updateSelectionControls();
      return;
    }

    const categoryInput = event.target.closest(".category-name-input");
    if (categoryInput) {
      return;
    }

    const row = event.target.closest(".detail-row");
    if (row) {
      updateItem(row);
    }
  });

  els.itemsBody.addEventListener("click", (event) => {
    const actionMenu = event.target.closest(".row-action-menu");
    if (event.target.closest(".action-menu-toggle") && actionMenu) {
      toggleActionMenu(actionMenu);
      return;
    }

    if (!event.target.closest(".action-menu")) {
      closeActionMenus();
    }

    const categoryRow = event.target.closest(".category-row");
    if (categoryRow && event.target.closest(".delete-category")) {
      deleteCategory(categoryRow.dataset.category);
      return;
    }

    if (categoryRow && event.target.closest(".category-toggle")) {
      const category = categoryRow.dataset.category;
      state.expandedCategories[category] = !state.expandedCategories[category];
      saveState();
      renderItems();
      return;
    }

    if (categoryRow && event.target.closest(".add-category-item")) {
      addItem(categoryRow.dataset.category);
      return;
    }

    const row = event.target.closest(".detail-row");
    if (!row) {
      return;
    }

    const index = Number(row.dataset.index);
    if (event.target.closest(".delete-row")) {
      closeActionMenus();
      deleteItem(index);
    }

    if (event.target.closest(".duplicate-row")) {
      closeActionMenus();
      duplicateItem(index);
    }

    if (event.target.closest(".ai-price-row")) {
      runAiPriceSearch(row);
    }

    if (event.target.closest(".apply-ai-price")) {
      applyAiPrice(row);
    }
  });

  els.itemsBody.addEventListener("dragstart", (event) => {
    const layout = event.target.closest(".category-layout");
    const row = event.target.closest(".category-row");
    if (!layout || !row) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.category);
    row.classList.add("is-dragging");
  });

  els.itemsBody.addEventListener("dragover", (event) => {
    const row = event.target.closest(".category-row");
    if (!row) {
      return;
    }
    event.preventDefault();
    row.classList.add("is-drop-target");
  });

  els.itemsBody.addEventListener("dragleave", (event) => {
    const row = event.target.closest(".category-row");
    if (row) {
      row.classList.remove("is-drop-target");
    }
  });

  els.itemsBody.addEventListener("drop", (event) => {
    const targetRow = event.target.closest(".category-row");
    if (!targetRow) {
      return;
    }
    event.preventDefault();
    const sourceCategory = event.dataTransfer.getData("text/plain");
    const targetCategory = targetRow.dataset.category;
    reorderCategory(sourceCategory, targetCategory);
  });

  els.itemsBody.addEventListener("dragend", () => {
    document.querySelectorAll(".category-row").forEach((row) => {
      row.classList.remove("is-dragging", "is-drop-target");
    });
  });

  els.itemsBody.addEventListener("change", (event) => {
    const categoryInput = event.target.closest(".category-name-input");
    if (categoryInput) {
      const categoryRow = categoryInput.closest(".category-row");
      renameCategory(categoryRow.dataset.category, categoryInput.value);
    }
  });

  els.addItemButton.addEventListener("click", () => addItem());
  els.backToLibraryButton.addEventListener("click", showLibrary);
  els.createBudgetBookButton.addEventListener("click", createBudgetBookFromLibrary);
  els.newBudgetBookName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      createBudgetBookFromLibrary();
    }
  });
  els.addCategoryButton.addEventListener("click", addCategory);
  els.newCategoryName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addCategory();
    }
  });
  els.selectAllItems.addEventListener("change", () => {
    visibleItemIds().forEach((id) => {
      if (els.selectAllItems.checked) {
        selectedItemIds.add(id);
      } else {
        selectedItemIds.delete(id);
      }
    });
    renderItems();
  });
  els.bulkAiButton.addEventListener("click", runBulkAiPriceSearch);
  els.bulkDuplicateButton.addEventListener("click", duplicateSelectedItems);
  els.bulkDeleteButton.addEventListener("click", deleteSelectedItems);
  els.saveBudgetBookButton.addEventListener("click", saveBudgetBook);
  els.toggleBudgetBooksButton.addEventListener("click", () => {
    state.budgetBooksExpanded = !state.budgetBooksExpanded;
    saveState();
    renderBudgetBooks();
  });
  els.budgetBooksList.addEventListener("click", (event) => {
    const row = event.target.closest(".saved-book-row");
    if (!row) {
      return;
    }
    if (event.target.closest(".delete-budget-book")) {
      deleteBudgetBook(row.dataset.id);
      return;
    }
    if (event.target.closest(".saved-book-load")) {
      loadBudgetBook(row.dataset.id);
    }
  });
  els.searchInput.addEventListener("input", renderItems);
  els.categoryFilter.addEventListener("change", renderItems);
  els.exportJsonButton.addEventListener("click", exportJson);
  els.exportCsvButton.addEventListener("click", exportCsv);
  els.printButton.addEventListener("click", () => window.print());
  els.importJsonButton.addEventListener("click", () => els.jsonFileInput.click());
  els.closeAiDrawer.addEventListener("click", closeAiDrawer);
  els.copyAiPromptButton.addEventListener("click", copyAiPrompt);
  els.jsonFileInput.addEventListener("change", () => {
    const [file] = els.jsonFileInput.files;
    if (file) {
      importJson(file);
      els.jsonFileInput.value = "";
    }
  });

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const templateName = button.dataset.template;
      const templateItems = structuredClone(templates[templateName] || []);
      categories = normalizeCategories(null, templateItems);
      state.categories = [...categories];
      state.items = templateItems.map(normalizeItem);
      renumberItems();
      state.expandedCategories = Object.fromEntries(categories.map((category) => [category, true]));
      state.activeBudgetId = "";
      selectedItemIds.clear();
      saveState();
      closeAiDrawer();
      renderBudgetBooks();
      renderItems();
    });
  });
}

hydrateControls();
renderCategoryFilter();
bindEvents();
saveState();
renderBudgetBooks();
renderItems();
showLibrary();
