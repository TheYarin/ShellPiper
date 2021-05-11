/* eslint-disable react/no-this-in-sfc */

import { clipboard } from "electron";
import fs from "fs";

/**
 *
 * @param iterable
 * @returns All consecutive pairs, or an empty iterable if there aren't any
 */
export function* yieldPairs<T>(iterable: Iterable<T>): Iterable<[T, T]> {
  const iterator = iterable[Symbol.iterator]();
  let current = iterator.next();
  let next = iterator.next();

  while (!next.done) {
    yield [current.value, next.value];
    current = next;
    next = iterator.next();
  }
}

export function copyToClipboard(text: string): void {
  clipboard.writeText(text);
}

export function doesDirectoryExist(path: string): boolean {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}
export function doesFileExist(path: string): boolean {
  return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

// export function splitToChunks(str: string, chunkSize: number): string[] {
//   const numChunks = Math.ceil(str.length / chunkSize);
//   const chunks = new Array(numChunks);

//   for (let i = 0, o = 0; i < numChunks; ++i, o += chunkSize) {
//     chunks[i] = str.substr(o, chunkSize);
//   }

//   return chunks;
// }

// #region Array prototype overrides

declare global {
  interface Array<T> {
    insert(index: number, item: T): void;
    removeByIndex(index: number): void;
    skip(predicate: (item: T) => boolean): [Array<T>, number];

    /** @throws {Error} if empty. */
    last(): T;
    lastOrUndefined(): T | undefined;
    equals(array: Array<T>): boolean;
    isEmpty(): boolean;

    /** @throws {Error} if empty. */
    indexOfLastItem(): number;

    /**
     * @returns {null} if no item that fulfills the condition could be found.
     */
    findLastIndex(predicate: (item: T, index: number) => boolean): number | null;

    splitByPredicate(predicate: (item: T, index: number) => boolean): [T[] /* true */, T[] /* false */];
  }
}

Array.prototype.insert = function ArrayInsert<T>(index: number, item: T) {
  this.splice(index, 0, item);
};

Array.prototype.removeByIndex = function ArrayRemoveByIndex(index: number) {
  this.splice(index, 1);
};

Array.prototype.isEmpty = function ArrayIsEmpty() {
  return this.length === 0;
};

Array.prototype.indexOfLastItem = function ArrayIndexOfLastItem() {
  if (this.isEmpty()) throw new Error("Can't get you the index of the last item, the array is empty.");

  return this.length - 1;
};

Array.prototype.skip = function ArraySkip<T>(predicate: (item: T) => boolean): [Array<T>, number] {
  for (let i = 0; i < this.length; i++) {
    const item = this[i];

    if (!predicate(item)) return [this.slice(i), i];
  }

  return [[], this.length];
};

Array.prototype.lastOrUndefined = function ArrayLastOrUndefined() {
  return this[this.length - 1];
};

Array.prototype.last = function ArrayLast() {
  if (this.isEmpty()) throw new Error("Last item could not be retrieved, array is empty.");

  return this[this.length - 1];
};

// Copied from https://stackoverflow.com/a/14853974/7009364
Array.prototype.equals = function ArrayEquals(array) {
  // if the other array is a falsy value, return
  if (!array) return false;

  // compare lengths - can save a lot of time
  if (this.length !== array.length) return false;

  for (let i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] !== array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};

Array.prototype.findLastIndex = function ArrayFindLastIndex<T>(predicate: (item: T, index: number) => boolean) {
  for (let i = this.indexOfLastItem(); i >= 0; i--) {
    const item = this[i];

    if (predicate(item, i)) return i;
  }

  return null;
};

Array.prototype.splitByPredicate = function ArraySplitByPredicate<T>(predicate: (item: T, index: number) => boolean) {
  const trues = [];
  const falses = [];
  for (let i = 0; i < this.length; i++) {
    const item = this[i];

    if (predicate(item, i)) trues.push(item);
    else falses.push(item);
  }

  return [trues, falses];
};

// #endregion
