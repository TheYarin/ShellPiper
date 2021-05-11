import "./utils";
import { yieldPairs } from "./utils";

test("Array.prototype.skip basic case", () => {
  expect([1, 2, 3, 4, 5].skip((item) => item < 3)).toEqual([[3, 4, 5], 2]);
});

test("Array.prototype.skip returns an empty array when all items meet the predicate", () => {
  expect([1, 2, 3, 4, 5].skip((item) => item < 100)).toEqual([[], 5]);
});

test("Array.prototype.skip returns the original array when none of the items meet the predicate", () => {
  expect([1, 2, 3, 4, 5].skip((item) => item > 100)).toEqual([[1, 2, 3, 4, 5], 0]);
});

test("Array.prototype.skip stops skipping on first item that fails to meet the condition", () => {
  expect([1, 2, 3, 2, 1].skip((item) => item < 3)).toEqual([[3, 2, 1], 2]);
});

test("yieldPairs #1", () => {
  expect(Array.from(yieldPairs([1, 2, 3, 4]))).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
  ]);
});

test("yieldPairs #2", () => {
  expect(Array.from(yieldPairs([1, 2, 3]))).toEqual([
    [1, 2],
    [2, 3],
  ]);
});

test("yieldPairs #3", () => {
  expect(Array.from(yieldPairs([1, 2]))).toEqual([[1, 2]]);
});

test("yieldPairs #4", () => {
  expect(Array.from(yieldPairs([1]))).toEqual([]);
});

test("yieldPairs #5", () => {
  expect(Array.from(yieldPairs([]))).toEqual([]);
});

// test('splitting string to chunks #1', () => {
//   expect(splitToChunks('12345678901234567890', 10)).toEqual([
//     '1234567890',
//     '1234567890',
//   ]);
// });

// test('splitting string to chunks #2', () => {
//   expect(splitToChunks('123456789012345678', 5)).toEqual([
//     '12345',
//     '67890',
//     '12345',
//     '678',
//   ]);
// });

test("Array.equals #1", () => {
  expect([].equals([])).toEqual(true);
});

test("Array.equals #2", () => {
  expect([1].equals([])).toEqual(false);
});

test("Array.equals #3", () => {
  expect(([] as any[]).equals([1])).toEqual(false);
});

test("Array.equals #4", () => {
  expect(([1, 2, 3] as any[]).equals([1, 2])).toEqual(false);
});

test("Array.equals #5", () => {
  expect([1, 2, 3].equals([1, 2, 3])).toEqual(true);
});

test("Array.equals #6", () => {
  expect([1, 2].equals([1, 2, 3])).toEqual(false);
});

test("Array.splitByPredicate #1", () => {
  expect([1, 2, 3].splitByPredicate((item) => item % 2 === 0)).toEqual([[2], [1, 3]]);
});

test("Array.splitByPredicate #2", () => {
  expect([].splitByPredicate((item) => item % 2 === 0)).toEqual([[], []]);
});

test("Array.splitByPredicate #3", () => {
  expect([1].splitByPredicate((item) => item % 2 === 0)).toEqual([[], [1]]);
});

test("Array.splitByPredicate #4", () => {
  expect([2].splitByPredicate((item) => item % 2 === 0)).toEqual([[2], []]);
});

test("Array.splitByPredicate #5", () => {
  expect([1, 2, 3, 4, 5].splitByPredicate((item, index) => index > 2)).toEqual([
    [4, 5],
    [1, 2, 3],
  ]);
});
