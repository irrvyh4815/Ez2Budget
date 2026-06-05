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
    type: "",
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
  items: templates.empty,
};

const els = {
  budgetLibraryView: document.querySelector("#budgetLibraryView"),
  budgetEditorView: document.querySelector("#budgetEditorView"),
  backToLibraryButton: document.querySelector("#backToLibraryButton"),
  createBudgetBookButton: document.querySelector("#createBudgetBookButton"),
  newBudgetBookName: document.querySelector("#newBudgetBookName"),
  budgetBookName: document.querySelector("#budgetBookName"),
  saveBudgetBookButton: document.querySelector("#saveBudgetBookButton"),
  saveStatus: document.querySelector("#saveStatus"),
  toggleBudgetBooksButton: document.querySelector("#toggleBudgetBooksButton"),
  savedBudgetCount: document.querySelector("#savedBudgetCount"),
  budgetBooksList: document.querySelector("#budgetBooksList"),
  projectName: document.querySelector("#projectName"),
  projectType: document.querySelector("#projectType"),
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
  clearItemsButton: document.querySelector("#clearItemsButton"),
  selectAllItems: document.querySelector("#selectAllItems"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  emptyState: document.querySelector("#emptyState"),
  emptyStateMessage: document.querySelector("#emptyStateMessage"),
  clearSearchButton: document.querySelector("#clearSearchButton"),
  exportMenuButton: document.querySelector("#exportMenuButton"),
  exportOptions: document.querySelector("#exportOptions"),
  exportPdfButton: document.querySelector("#exportPdfButton"),
  exportExcelButton: document.querySelector("#exportExcelButton"),
  aiDrawer: document.querySelector("#aiDrawer"),
  closeAiDrawer: document.querySelector("#closeAiDrawer"),
  aiDrawerTitle: document.querySelector("#aiDrawerTitle"),
  aiPromptOutput: document.querySelector("#aiPromptOutput"),
  aiResultText: document.querySelector("#aiResultText"),
  copyAiPromptButton: document.querySelector("#copyAiPromptButton"),
  openAiSearchLink: document.querySelector("#openAiSearchLink"),
  smartPriceModal: document.querySelector("#smartPriceModal"),
  skipSmartPriceReminder: document.querySelector("#skipSmartPriceReminder"),
  confirmSmartPriceButton: document.querySelector("#confirmSmartPriceButton"),
  unsavedReturnModal: document.querySelector("#unsavedReturnModal"),
  discardReturnButton: document.querySelector("#discardReturnButton"),
  continueEditingButton: document.querySelector("#continueEditingButton"),
  clearItemsModal: document.querySelector("#clearItemsModal"),
  confirmClearItemsButton: document.querySelector("#confirmClearItemsButton"),
  cancelClearItemsButton: document.querySelector("#cancelClearItemsButton"),
  createTransition: document.querySelector("#createTransition"),
  budgetAdvisor: document.querySelector("#budgetAdvisor"),
  budgetAdvisorToggle: document.querySelector("#budgetAdvisorToggle"),
  budgetAdvisorPanel: document.querySelector("#budgetAdvisorPanel"),
  closeBudgetAdvisorButton: document.querySelector("#closeBudgetAdvisorButton"),
  runBudgetAdviceButton: document.querySelector("#runBudgetAdviceButton"),
  budgetAdviceResults: document.querySelector("#budgetAdviceResults"),
};

let state = loadState();
let budgetBooks = loadBudgetBooks();
categories = [...state.categories];
let activeAiIndex = null;
const selectedItemIds = new Set();
let pendingSmartPriceAction = null;
let lastSavedBudgetSignature = "";
const SMART_PRICE_REMINDER_KEY = "ez2budget-smart-price-reminder-dismissed";

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

function currentBudgetSignature() {
  return JSON.stringify(snapshotCurrentBudget());
}

function markBudgetSaved() {
  lastSavedBudgetSignature = currentBudgetSignature();
}

function hasUnsavedBudgetChanges() {
  return document.body.dataset.view === "editor" && currentBudgetSignature() !== lastSavedBudgetSignature;
}

function validateRequiredProjectName(input = els.projectName) {
  const value = input.value.trim();
  if (value) {
    input.setCustomValidity("");
    input.classList.remove("is-invalid");
    return value;
  }
  input.setCustomValidity("請先輸入工程名稱");
  input.classList.add("is-invalid");
  input.reportValidity();
  input.focus();
  return "";
}

function openUnsavedReturnModal() {
  els.unsavedReturnModal.hidden = false;
  els.continueEditingButton.focus();
}

function closeUnsavedReturnModal() {
  els.unsavedReturnModal.hidden = true;
}

function requestShowLibrary() {
  if (hasUnsavedBudgetChanges()) {
    openUnsavedReturnModal();
    return;
  }
  showLibrary();
}

function discardAndShowLibrary() {
  closeUnsavedReturnModal();
  markBudgetSaved();
  showLibrary();
}

function showLibrary() {
  closeAiDrawer();
  closeBudgetAdvisor();
  selectedItemIds.clear();
  els.budgetEditorView.hidden = true;
  els.budgetLibraryView.hidden = false;
  els.budgetAdvisor.hidden = true;
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
  els.budgetAdvisor.hidden = false;
  showSaveStatus();
  requestAnimationFrame(() => {
    els.budgetEditorView.classList.add("is-active");
    els.budgetLibraryView.classList.remove("is-active");
  });
  document.body.dataset.view = "editor";
}

function showCreateTransition() {
  els.createTransition.hidden = false;
}

function hideCreateTransition() {
  els.createTransition.hidden = true;
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
  els.projectType.value = state.project.type || "";
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
  const queryText = els.searchInput.value.trim();
  const query = queryText.toLowerCase();
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

  updateEmptyState(visibleCount, queryText, selectedCategory);
  updateSelectionControls();
  calculate();
}

function updateEmptyState(visibleCount, queryText, selectedCategory) {
  const hasFilter = Boolean(queryText) || selectedCategory !== "all";
  els.emptyState.classList.toggle("is-visible", visibleCount === 0);
  els.clearSearchButton.hidden = !hasFilter;

  if (visibleCount > 0) {
    return;
  }

  if (state.items.length === 0) {
    els.emptyStateMessage.textContent = "這份預算書還沒有工項，先新增項目或套用範本。";
    return;
  }

  if (hasFilter) {
    const parts = [];
    if (queryText) {
      parts.push(`「${queryText}」`);
    }
    if (selectedCategory !== "all") {
      parts.push(`「${selectedCategory}」`);
    }
    els.emptyStateMessage.textContent = `沒有符合 ${parts.join("、")} 的工項。`;
    return;
  }

  els.emptyStateMessage.textContent = "目前沒有符合條件的工項。";
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
        <span class="drag-handle" draggable="true" title="調整大項排序" aria-label="調整大項排序">⋮</span>
        <button class="category-toggle" type="button" aria-expanded="${expanded}" title="展開或收合">
          <span class="chevron" aria-hidden="true"></span>
        </button>
        <strong class="category-number">${categoryNumber(category)}</strong>
        <input class="category-name-input" type="text" value="${escapeHtml(category)}" />
        <span class="category-count">${count} 項細項</span>
        <b class="category-total">${money(total)}</b>
        <button class="soft-button add-category-item" type="button">新增細項</button>
        <button class="text-action-button delete-category" type="button">刪除</button>
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
    type: els.projectType.value,
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
  markBudgetSaved();
  return book;
}

function saveBudgetBook() {
  if (!validateRequiredProjectName()) {
    return;
  }
  updateProject();
  updateRates();
  if (!els.budgetBookName.value.trim()) {
    els.budgetBookName.value = els.projectName.value.trim();
    updateProject();
  }
  upsertCurrentBudgetBook(els.budgetBookName.value.trim() || state.project.name.trim());
  hydrateControls();
  showSaveStatus();
}

function showSaveStatus() {
  const activeBook = budgetBooks.find((book) => book.id === state.activeBudgetId);
  const savedAt = activeBook?.updatedAt;
  if (!savedAt) {
    els.saveStatus.textContent = "尚未儲存";
    els.saveStatus.classList.add("is-visible");
    return;
  }
  const time = new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(savedAt));
  els.saveStatus.textContent = `上次儲存 ${time}`;
  els.saveStatus.classList.add("is-visible");
}

function clearSaveStatus() {
  els.saveStatus.textContent = "";
  els.saveStatus.classList.remove("is-visible");
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
  markBudgetSaved();
  showSaveStatus();
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
      budgetName: name,
      name,
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
  upsertCurrentBudgetBook(name);
  hydrateControls();
}

function createBudgetBookFromLibrary() {
  const name = validateRequiredProjectName(els.newBudgetBookName);
  if (!name) {
    return;
  }
  showCreateTransition();
  createBudgetBookFromTemplate("empty", name);
  els.newBudgetBookName.value = "";
  window.setTimeout(() => {
    hideCreateTransition();
    showEditor();
  }, 850);
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
  const item = {
    id: createItemId(),
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
  };
  state.items.push(item);
  renumberItems();
  saveState();
  renderItems();
  focusItemName(item.id);
}

function defaultCategoryForAdd() {
  return els.categoryFilter.value !== "all" ? els.categoryFilter.value : (categories[0] || "未分類");
}

function focusItemName(itemId) {
  window.requestAnimationFrame(() => {
    const row = Array.from(document.querySelectorAll(".detail-row")).find((candidate) => candidate.dataset.id === itemId);
    const input = row?.querySelector(".item-name");
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  });
}

function clearSearchFilters() {
  els.searchInput.value = "";
  els.categoryFilter.value = "all";
  renderItems();
  els.searchInput.focus();
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

function requestClearItems() {
  els.clearItemsModal.hidden = false;
  els.cancelClearItemsButton.focus();
}

function closeClearItemsModal() {
  els.clearItemsModal.hidden = true;
}

function clearItems() {
  closeClearItemsModal();
  state.items = [];
  state.activeBudgetId = "";
  selectedItemIds.clear();
  closeAiDrawer();
  saveState();
  renderBudgetBooks();
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

function shouldSkipSmartPriceReminder() {
  return localStorage.getItem(SMART_PRICE_REMINDER_KEY) === "true";
}

function requestSmartPriceConfirmation(action) {
  if (shouldSkipSmartPriceReminder()) {
    action();
    return;
  }
  pendingSmartPriceAction = action;
  els.skipSmartPriceReminder.checked = false;
  els.smartPriceModal.hidden = false;
  els.confirmSmartPriceButton.focus();
}

function confirmSmartPriceReminder() {
  if (els.skipSmartPriceReminder.checked) {
    localStorage.setItem(SMART_PRICE_REMINDER_KEY, "true");
  }
  const action = pendingSmartPriceAction;
  pendingSmartPriceAction = null;
  els.smartPriceModal.hidden = true;
  if (action) {
    action();
  }
}

function closeSmartPriceReminder() {
  pendingSmartPriceAction = null;
  els.smartPriceModal.hidden = true;
}

function toggleBudgetAdvisor() {
  const nextHidden = !els.budgetAdvisorPanel.hidden;
  els.budgetAdvisorPanel.hidden = nextHidden;
  els.budgetAdvisorToggle.setAttribute("aria-expanded", String(!nextHidden));
}

function closeBudgetAdvisor() {
  els.budgetAdvisorPanel.hidden = true;
  els.budgetAdvisorToggle.setAttribute("aria-expanded", "false");
}

function budgetAdviceChecks() {
  const projectType = String(state.project.type || "").trim();
  const projectText = `${state.project.name} ${projectType} ${state.project.location} ${state.project.client}`.toLowerCase();
  const itemText = state.items.map((item) => `${item.category} ${item.name} ${item.material}`).join(" ").toLowerCase();
  const hasAny = (keywords) => keywords.some((keyword) => itemText.includes(keyword.toLowerCase()));
  const isType = (keywords) => keywords.some((keyword) => projectText.includes(keyword.toLowerCase()));
  const advice = [];

  if (state.items.length === 0) {
    advice.push(`目前尚未建立任何明細，建議先依${projectType || "工程類型"}建立主要工項架構。`);
  }

  [
    { label: "施工安全與臨時設施", keywords: ["圍籬", "安全", "交通維持", "施工架", "臨時"] },
    { label: "廢棄物清運與合法處理", keywords: ["清運", "棄土", "廢棄物", "運棄"] },
    { label: "材料運搬與吊運", keywords: ["運搬", "吊運", "機具", "搬運"] },
    { label: "品質檢驗與試驗", keywords: ["試驗", "檢驗", "測試", "品管"] },
    { label: "竣工清潔與收尾", keywords: ["清潔", "收尾", "竣工", "整理"] },
  ].forEach((check) => {
    if (!hasAny(check.keywords)) {
      advice.push(`可能缺少：${check.label}。`);
    }
  });

  if (isType(["建築", "住宅", "新建", "廠房", "結構"]) && !hasAny(["模板", "鋼筋", "混凝土"])) {
    advice.push("建築或結構工程常需要確認模板、鋼筋、混凝土是否已分項列入。");
  }

  if (isType(["室內", "裝修", "裝潢"]) && !hasAny(["拆除", "泥作", "天花", "油漆", "地坪", "水電"])) {
    advice.push("室內裝修工程常需要確認拆除、泥作、天花、牆面、地坪、水電與清潔保護是否完整。");
  }

  if (isType(["道路", "土木", "鋪面", "人行道"]) && !hasAny(["標線", "排水", "交通維持"])) {
    advice.push("道路工程常需要確認交通維持、排水設施、標線或路面收邊是否已列入。");
  }

  if (isType(["排水", "水利", "管線", "下水道"]) && !hasAny(["開挖", "回填", "管材", "人孔", "集水井", "抽排水"])) {
    advice.push("排水或管線工程常需要確認開挖回填、管材、人孔/集水井、抽排水與既有管線保護。");
  }

  if (isType(["機電", "水電", "空調", "消防"]) && !hasAny(["配管", "配線", "盤", "設備", "測試", "消防"])) {
    advice.push("機電工程常需要確認配管配線、設備安裝、盤體、測試試運轉與消防介面項目。");
  }

  if (!hasAny(["稅", "準備金", "間接費", "利潤"])) {
    advice.push("費率區已有間接費、利潤、準備金與營業稅，送審前仍建議核對是否符合合約或業主格式。");
  }

  return advice.slice(0, 8);
}

function renderBudgetAdvice() {
  const advice = budgetAdviceChecks();
  if (advice.length === 0) {
    els.budgetAdviceResults.innerHTML = "<p>目前沒有明顯缺漏，建議仍依圖說、規範與契約條件逐項核對。</p>";
    return;
  }
  els.budgetAdviceResults.innerHTML = `
    <ul>
      ${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function runBulkAiPriceSearch() {
  requestSmartPriceConfirmation(runBulkAiPriceSearchAfterConfirmation);
}

function runBulkAiPriceSearchAfterConfirmation() {
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
  els.aiDrawerTitle.textContent = `批次智慧詢價 / ${selected.length} 項`;
  els.aiPromptOutput.value = prompt;
  els.openAiSearchLink.href = searchUrlForPrompt(prompt);
  els.aiResultText.textContent = "已顯示批次查價欄位與提示。接上智慧詢價後端後，可依細項編號逐項回填建議單價。";
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
  requestSmartPriceConfirmation(() => runAiPriceSearchAfterConfirmation(row));
}

async function runAiPriceSearchAfterConfirmation(row) {
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
  els.aiResultText.textContent = "正在準備智慧詢價參考...";

  const suggestedInput = row.querySelector(".item-suggested-price");
  const applyButton = row.querySelector(".apply-ai-price");
  suggestedInput.hidden = false;
  applyButton.hidden = false;

  if (!AI_PRICE_ENDPOINT) {
    els.aiResultText.textContent = "尚未連接智慧詢價後端；已顯示查價欄位、提示與搜尋連結。接上 EZ2BUDGET_AI_PRICE_ENDPOINT 後，可由後端彙整目前市價並回填建議單價。";
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
    els.aiResultText.textContent = result.summary || "智慧詢價已回傳建議資料，請檢查來源、規格與日期後再套用。";
    saveState();
  } catch {
    els.aiResultText.textContent = "智慧詢價端點目前無法使用；請先使用搜尋連結或複製提示到具備網路搜尋能力的工具。";
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

function closeExportMenu() {
  els.exportOptions.hidden = true;
  els.exportMenuButton.setAttribute("aria-expanded", "false");
}

function toggleExportMenu() {
  const nextHidden = !els.exportOptions.hidden;
  els.exportOptions.hidden = nextHidden;
  els.exportMenuButton.setAttribute("aria-expanded", String(!nextHidden));
}

function formalFilename(extension) {
  const name = state.project.budgetName || state.project.name || "Ez2Budget工程預算書";
  const cleanName = String(name).trim().replace(/[\\/:*?"<>|]/g, "-") || "Ez2Budget工程預算書";
  return `${cleanName}.${extension}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formalReportRows() {
  renumberItems();
  return groupItems()
    .filter(({ items }) => items.length > 0)
    .map(({ category, items }) => ({
      category,
      total: categoryTotal(category),
      items: items.map(({ item }) => item),
    }));
}

function reportTotals() {
  const direct = directTotal();
  const fee = direct * ((numberValue(state.rates.overhead) + numberValue(state.rates.profit)) / 100);
  const contingency = (direct + fee) * (numberValue(state.rates.contingency) / 100);
  const beforeTax = direct + fee + contingency;
  const tax = beforeTax * (numberValue(state.rates.tax) / 100);
  return {
    direct,
    fee,
    contingency,
    beforeTax,
    tax,
    total: beforeTax + tax,
  };
}

function buildFormalReportHtml(options = {}) {
  const includePrintActions = Boolean(options.includePrintActions);
  const totals = reportTotals();
  const rows = formalReportRows();
  const projectTitle = state.project.budgetName || state.project.name || "工程預算書";
  const detailRows = rows.map(({ category, total, items }) => `
    <tr class="category-row">
      <td colspan="6">${escapeHtml(category)}</td>
      <td>${money(total)}</td>
    </tr>
    ${items.map((item) => `
      <tr>
        <td>${escapeHtml(item.code)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.material || "")}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="number">${decimal(numberValue(item.quantity))}</td>
        <td class="number">${money(numberValue(item.price))}</td>
        <td class="number">${money(lineTotal(item))}</td>
      </tr>
    `).join("")}
  `).join("");

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(projectTitle)} - 預算書</title>
    <style>
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111827;
        background: #fff;
        font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", Arial, sans-serif;
        font-size: 12px;
      }
      .document { width: 100%; }
      h1 {
        margin: 0 0 14px;
        font-size: 24px;
        line-height: 1.2;
        text-align: center;
        letter-spacing: 0;
      }
      .meta-grid {
        width: 100%;
        margin-bottom: 14px;
        border-collapse: collapse;
      }
      .meta-grid th,
      .meta-grid td {
        border: 1px solid #9ca3af;
        padding: 7px 8px;
        text-align: left;
        vertical-align: middle;
      }
      .meta-grid th {
        width: 86px;
        background: #f3f4f6;
        font-weight: 800;
      }
      .summary-table,
      .detail-table {
        width: 100%;
        border-collapse: collapse;
      }
      .summary-table {
        margin-bottom: 14px;
      }
      .summary-table th,
      .summary-table td,
      .detail-table th,
      .detail-table td {
        border: 1px solid #9ca3af;
        padding: 7px 8px;
        vertical-align: top;
      }
      .summary-table th,
      .detail-table th {
        background: #e5e7eb;
        font-weight: 900;
        text-align: center;
      }
      .detail-table thead { display: table-header-group; }
      .detail-table tr { break-inside: avoid; page-break-inside: avoid; }
      .category-row td {
        background: #f3f4f6;
        font-weight: 900;
      }
      .number {
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .total-row td {
        background: #eef2f7;
        font-size: 13px;
        font-weight: 900;
      }
      .note {
        margin-top: 12px;
        color: #4b5563;
        font-size: 11px;
        line-height: 1.5;
      }
      ${includePrintActions ? `
        @media print {
          .print-actions { display: none; }
        }
        .print-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 12px;
        }
        .print-actions button {
          min-height: 34px;
          border: 1px solid #9ca3af;
          border-radius: 4px;
          padding: 6px 10px;
          background: #fff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }
      ` : ""}
    </style>
  </head>
  <body>
    <div class="document">
      ${includePrintActions ? `<div class="print-actions">
        <button type="button" onclick="window.print()">列印 / 另存 PDF</button>
      </div>` : ""}
      <h1>工程預算書</h1>
      <table class="meta-grid">
        <tbody>
          <tr>
            <th>預算書</th>
            <td>${escapeHtml(projectTitle)}</td>
            <th>編列日期</th>
            <td>${escapeHtml(formatDate(state.project.date))}</td>
          </tr>
          <tr>
            <th>工程名稱</th>
            <td>${escapeHtml(state.project.name || "")}</td>
            <th>工程類型</th>
            <td>${escapeHtml(state.project.type || "")}</td>
          </tr>
          <tr>
            <th>業主</th>
            <td>${escapeHtml(state.project.client || "")}</td>
            <th>工程地點</th>
            <td>${escapeHtml(state.project.location || "")}</td>
          </tr>
        </tbody>
      </table>

      <table class="summary-table">
        <thead>
          <tr>
            <th>直接工程費</th>
            <th>間接費與利潤</th>
            <th>準備金</th>
            <th>營業稅</th>
            <th>預算總價</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="number">${money(totals.direct)}</td>
            <td class="number">${money(totals.fee)}</td>
            <td class="number">${money(totals.contingency)}</td>
            <td class="number">${money(totals.tax)}</td>
            <td class="number"><strong>${money(totals.total)}</strong></td>
          </tr>
        </tbody>
      </table>

      <table class="detail-table">
        <thead>
          <tr>
            <th style="width: 70px;">編號</th>
            <th style="width: 22%;">項目名稱</th>
            <th>規格 / 說明</th>
            <th style="width: 54px;">單位</th>
            <th style="width: 80px;">數量</th>
            <th style="width: 92px;">單價</th>
            <th style="width: 100px;">複價</th>
          </tr>
        </thead>
        <tbody>
          ${detailRows || '<tr><td colspan="7" style="text-align: center;">無預算明細</td></tr>'}
          <tr class="total-row">
            <td colspan="6">預算總價</td>
            <td class="number">${money(totals.total)}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">本文件為工程預算書正式輸出，金額與數量請於送審或簽核前再次核對。</p>
    </div>
  </body>
</html>`;
}

function exportPdf() {
  closeExportMenu();
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    alert("瀏覽器封鎖了 PDF 預覽視窗，請允許彈出視窗後再試一次。");
    return;
  }
  reportWindow.document.open();
  reportWindow.document.write(buildFormalReportHtml({ includePrintActions: true }));
  reportWindow.document.close();
  reportWindow.focus();
  window.setTimeout(() => {
    reportWindow.print();
  }, 300);
}

function exportExcel() {
  closeExportMenu();
  const html = buildFormalReportHtml();
  download(formalFilename("xls"), `\ufeff${html}`, "application/vnd.ms-excel;charset=utf-8");
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
  [els.budgetBookName, els.projectName, els.projectType, els.clientName, els.projectLocation, els.estimateDate].forEach((input) => {
    input.addEventListener("input", updateProject);
  });
  [els.newBudgetBookName, els.projectName].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.setCustomValidity("");
        input.classList.remove("is-invalid");
      }
    });
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
  els.backToLibraryButton.addEventListener("click", requestShowLibrary);
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
  els.clearItemsButton.addEventListener("click", requestClearItems);
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
  els.clearSearchButton.addEventListener("click", clearSearchFilters);
  els.exportMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleExportMenu();
  });
  els.exportPdfButton.addEventListener("click", exportPdf);
  els.exportExcelButton.addEventListener("click", exportExcel);
  els.closeAiDrawer.addEventListener("click", closeAiDrawer);
  els.copyAiPromptButton.addEventListener("click", copyAiPrompt);
  els.confirmSmartPriceButton.addEventListener("click", confirmSmartPriceReminder);
  els.smartPriceModal.addEventListener("click", (event) => {
    if (event.target === els.smartPriceModal) {
      closeSmartPriceReminder();
    }
  });
  els.discardReturnButton.addEventListener("click", discardAndShowLibrary);
  els.continueEditingButton.addEventListener("click", closeUnsavedReturnModal);
  els.unsavedReturnModal.addEventListener("click", (event) => {
    if (event.target === els.unsavedReturnModal) {
      closeUnsavedReturnModal();
    }
  });
  els.confirmClearItemsButton.addEventListener("click", clearItems);
  els.cancelClearItemsButton.addEventListener("click", closeClearItemsModal);
  els.clearItemsModal.addEventListener("click", (event) => {
    if (event.target === els.clearItemsModal) {
      closeClearItemsModal();
    }
  });
  els.budgetAdvisorToggle.addEventListener("click", toggleBudgetAdvisor);
  els.closeBudgetAdvisorButton.addEventListener("click", closeBudgetAdvisor);
  els.runBudgetAdviceButton.addEventListener("click", renderBudgetAdvice);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".export-menu")) {
      closeExportMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeExportMenu();
      closeActionMenus();
      closeSmartPriceReminder();
      closeUnsavedReturnModal();
      closeClearItemsModal();
      closeBudgetAdvisor();
    }
  });
}

hydrateControls();
renderCategoryFilter();
bindEvents();
saveState();
renderBudgetBooks();
renderItems();
markBudgetSaved();
showLibrary();
