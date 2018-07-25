
/**
 * @param {!Array<{at: number}>} a
 * @param {number} x
 * @return {number}
 */
function bisectRight(a, x) {
  let low = 0, high = a.length;
  while (low < high) {
    const mid = ~~((low + high) / 2);
    if (x < a[mid].at) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}
