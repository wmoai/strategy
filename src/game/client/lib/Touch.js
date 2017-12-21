export default class Touch {
  constructor({ onClick, onDrag, onEndDrag }) {
    this.isTouch = false;
    this.isDragging = false;

    this.clientX = null;
    this.clientY = null;
    this.deltaX = null;
    this.deltaY = null;

    this.onClick = onClick;
    this.onDrag = onDrag;
    this.onEndDrag = onEndDrag;
  }

  start(clientX, clientY) {
    this.isTouch = true;
    this.clientX = clientX;
    this.clientY = clientY;
  }

  move(clientX, clientY) {
    if (this.isTouch && !this.isDragging) {
      const dx = Math.abs(this.clientX - clientX);
      const dy = Math.abs(this.clientY - clientY);
      if (dx > 10 || dy > 10) {
        this.isDragging = true;
      }
    }
    if (this.isDragging) {
      this.deltaX = this.clientX - clientX;
      this.deltaY = this.clientY - clientY;
      this.clientX = clientX;
      this.clientY = clientY;
      this.onDrag(this.deltaX, this.deltaY);
    }
  }

  end() {
    if (!this.isTouch) {
      return;
    }
    this.isTouch = false;
    if (!this.isDragging) {
      this.onClick(this.clientX, this.clientY);
      return;
    }
    this.isDragging = false;
    this.onEndDrag(this.deltaX, this.deltaY);
  }
}
