import RLean from "../RLean";
import { getValue } from "@rlean/utils";

export default function useEntity(key: string) {
  const zustand = getValue(RLean, "state", {}) as typeof RLean.state;
  const state = zustand((s) => s.global);

  const add = (value: any) => {
    const data = getValue(state[key], "data", []);
    data.push(value);
    save({ value });
  };

  const select = (exp: any) => {
    const data = getValue(state[key], "data", []);

    return data.filter(exp);
  };

  const selectAll = () => {
    return getValue(state[key], "data", []);
  };

  const save = (value: any) => {};

  const remove = (/* exp: any */) => {};

  const clear = () => {};

  const get = () => {};

  const post = () => {};

  const put = () => {};

  const patch = () => {};

  const del = () => {};

  return {
    add,
    select,
    selectAll,
    remove,
    clear,
    get,
    post,
    put,
    patch,
    del,
  };
}
