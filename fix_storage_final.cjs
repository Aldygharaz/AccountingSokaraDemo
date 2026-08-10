const fs = require('fs');

let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const classProxyDef = `
  private _state: AppState;
  public state: AppState;
  private subscribers: Array<() => void> = [];
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
    this._state = loadInitialState();
    this.state = this.createDeepProxy(this._state);
    useStore.setState(this._state);
  }
`;

code = code.replace(
  /private state: AppState;\s+private subscribers: Array<\(\) => void> = \[\];\s+constructor\(\) \{\s+this\.state = loadInitialState\(\);\s+\}/,
  classProxyDef
);

const notifyDef = `
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
    this.subscribers.forEach((l) => l());
  }
`;

code = code.replace(
  /private notify\(\) \{\s+this\.saveState\(\);\s+this\.subscribers\.forEach\(\(l\) => l\(\)\);\s+\}/,
  notifyDef
);

// If it's public notify() in the original code, try that too
code = code.replace(
  /public notify\(\) \{\s+this\.saveState\(\);\s+this\.subscribers\.forEach\(\(l\) => l\(\)\);\s+\}/,
  notifyDef
);

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Storage injected!");
