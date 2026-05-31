export const numeral = (value: number, decimals: number = 2): string => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixIndex = 0;
  let dividedValue = value;

  while (dividedValue >= 1000 && suffixIndex < suffixes.length - 1) {
    dividedValue /= 1000;
    suffixIndex++;
  }

  const roundedValue = Math.floor(dividedValue * Math.pow(10, decimals)) / Math.pow(10, decimals);

  return `${roundedValue}${suffixes[suffixIndex]}`;
};