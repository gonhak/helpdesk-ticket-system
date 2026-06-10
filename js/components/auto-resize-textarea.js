export class AutoResizeTextarea {
  constructor(textarea, options = {}) {
    this.textarea = textarea;
    this.minHeight = options.minHeight || 44;
    this.maxHeight = options.maxHeight || 160;
  }

  resize() {
    if (!this.textarea) {
      return;
    }

    this.textarea.style.height = `${this.minHeight}px`;
    const nextHeight = Math.min(this.textarea.scrollHeight, this.maxHeight);
    this.textarea.style.height = `${Math.max(nextHeight, this.minHeight)}px`;
    this.textarea.style.overflowY =
      this.textarea.scrollHeight > this.maxHeight ? "auto" : "hidden";
  }

  initialize() {
    if (!this.textarea) {
      return;
    }

    this.textarea.addEventListener("input", () => {
      this.resize();
    });

    this.resize();
  }

  reset() {
    if (!this.textarea) {
      return;
    }

    this.textarea.value = "";
    this.resize();
  }
}
