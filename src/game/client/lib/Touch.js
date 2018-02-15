// @flow

export default class Touch {
  isTouch: boolean;
  isDragging: boolean;
  clientX: number;
  clientY: number;
  deltaX: number;
  deltaY: number;
  onClick: (number, number) => void;
  onDrag: (number, number) => void;
  onEndDrag: (number, number) => void;

  constructor({ onClick, onDrag, onEndDrag } : {
    onClick: (number, number) => void;
    onDrag: (number, number) => void;
    onEndDrag: (number, number) => void;
  }) {
    this.isTouch = false;
    this.isDragging = false;

    this.onClick = onClick;
    this.onDrag = onDrag;
    this.onEndDrag = onEndDrag;
  }

  start(clientX: number, clientY: number) {
    this.isTouch = true;
    this.clientX = clientX;
    this.clientY = clientY;
  }

  move(clientX: number, clientY: number) {
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
