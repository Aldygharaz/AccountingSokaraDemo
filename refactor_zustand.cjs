const fs = require('fs');

let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

if (!code.includes("import { create } from 'zustand';")) {
  code = code.replace("import Decimal from 'decimal.js';", "import Decimal from 'decimal.js';\nimport { create } from 'zustand';");
}

const zustandDef = `
export const useStore = create<AppState>((set, get) => {
  let initial = {
    accounts: INITIAL_ACCOUNTS,
    contacts: INITIAL_CONTACTS,
    products: INITIAL_PRODUCTS,
    journalEntries: [],
    invoices: [],
    purchaseBills: [],
    cashTransactions: [],
    stockMovements: [],
    fixedAssets: INITIAL_FIXED_ASSETS,
    bankStatements: [],
    closedPeriods: [],
    prepaidExpenses: INITIAL_PREPAID_EXPENSES,
    forexRates: DEFAULT_FOREX_RATES,
    forexExposures: DEMO_FOREX_EXPOSURES,
    currentUser: INITIAL_USERS[0],
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      initial = { ...initial, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return initial;
});
`;

if (!code.includes("export const useStore = create")) {
  code = code.replace("class AccountingStore {", zustandDef + "\nclass AccountingStore {");
}

const classProxyDef = `
  private _state: AppState;
  public state: AppState;
  private listeners: Set<() => void> = new Set();
  private mutatedKeys = new Set<keyof AppState>();

  private createDeepProxy(obj: any, rootKey?: keyof AppState): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    return new Proxy(obj, {
      get: (target, prop) => {
        const val = target[prop];
        if (typeof val === 'function') {
          return val.bind(target);
        }
        if (typeof val === 'object' && val !== null) {
          return this.createDeepProxy(val, rootKey || prop as keyof AppState);
        }
        return val;
      },
      set: (target, prop, value) => {
        target[prop] = value;
        if (rootKey) this.mutatedKeys.add(rootKey);
        return true;
      }
    });
  }

  constructor() {
    this._state = this.loadState();
    this.state = this.createDeepProxy(this._state);
    useStore.setState(this._state);
  }
`;

code = code.replace(
  /private state: AppState;\s+private listeners: Set<\(\) => void> = new Set\(\);\s+constructor\(\) \{\s+this\.state = this\.loadState\(\);\s+\}/,
  classProxyDef
);

code = code.replace(
  /private notify\(\) \{\s+this\.saveState\(\);\s+this\.listeners\.forEach\(\(l\) => l\(\)\);\s+\}/,
  `
  public notify() {
    if (this.mutatedKeys.size > 0) {
      const updates: Partial<AppState> = {};
      this.mutatedKeys.forEach((key) => {
        updates[key] = Array.isArray(this._state[key])
          ? [...(this._state[key] as any[])]
          : { ...this._state[key] };
        this._state[key] = updates[key] as any;
      });
      useStore.setState(updates);
      this.mutatedKeys.clear();
      this.state = this.createDeepProxy(this._state);
    }
    this.saveState();
    this.listeners.forEach((l) => l());
  }
`
);

code = code.replace(/localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(this\.state\)\);/g, "localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));");

fs.writeFileSync('src/lib/storage.ts', code);
console.log("storage.ts updated successfully with Zustand and Deep Proxy!");
