export class TicketFilterControls {
  constructor(table) {
    this.table = table;
    this.searchInput = document.querySelector("#ticketSearch");
    this.statusSelect = document.querySelector("#statusFilter");
    this.categorySelect = document.querySelector("#categoryFilter");
    this.prioritySelect = document.querySelector("#priorityFilter");
    this.resetButton = document.querySelector("#resetFiltersButton");
  }

  initialize() {
    this.searchInput?.addEventListener("input", (event) => {
      this.table.applyFilter("phrase", event.target.value);
    });

    this.statusSelect?.addEventListener("change", (event) => {
      this.table.applyFilter("status", event.target.value);
    });

    this.categorySelect?.addEventListener("change", (event) => {
      this.table.applyFilter("category", event.target.value);
    });

    this.prioritySelect?.addEventListener("change", (event) => {
      this.table.applyFilter("priority", event.target.value);
    });

    this.resetButton?.addEventListener("click", () => {
      this.reset();
    });
  }

  resetSelect(select) {
    if (!select) return;

    select.selectedIndex = 0;
  }

  reset() {
    if (this.searchInput) {
      this.searchInput.value = "";
    }

    this.resetSelect(this.statusSelect);
    this.resetSelect(this.categorySelect);
    this.resetSelect(this.prioritySelect);

    this.table.resetFilters();
  }
}
