class NotificationManager {
  private static instance: NotificationManager;
  private limitedTimeVisible = false;
  private currencySalesVisible = false;
  private listeners: Array<() => void> = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  setLimitedTimeVisible(visible: boolean) {
    this.limitedTimeVisible = visible;
    this.notifyListeners();
  }

  setCurrencySalesVisible(visible: boolean) {
    this.currencySalesVisible = visible;
    this.notifyListeners();
  }

  shouldShowCurrencySales(): boolean {
    return this.currencySalesVisible && !this.limitedTimeVisible;
  }

  addListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export default NotificationManager;