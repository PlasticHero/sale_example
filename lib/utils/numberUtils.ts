
// 숫자를 천단위 구분자와 함께 포맷팅
export const formatNumber = (
  num: number | string | undefined | null,
  decimals_max: number = 4,
  decimals_min?: number
): string => {
  if (num === undefined || num === null) return '0';
  try {
    let n = Number(num);
    if (isNaN(n)) return num.toString();

    // 버림 처리
    const factor = Math.pow(10, decimals_max);
    n = Math.floor(n * factor) / factor;

    // 소수점 자리수 맞추기
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals_min ?? decimals_max,
      maximumFractionDigits: decimals_max,
    });
  } catch (error) {
    console.error('formatNumber error : ', error);
  }
  return num.toString();
};


