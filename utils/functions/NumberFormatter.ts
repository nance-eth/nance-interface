import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
export const formatNumber = (num: number | bigint) => {
  if (num === 0) return 0;
  if (num < .01) return `~0`;
  return formatter.format(num);
};

export function formatTokenBalance(balance: BigNumber): string {
  console.log(balance);
  return formatter.format(parseInt(formatEther(balance)));
}

export function numToPrettyString(_num: number | string | undefined, fixed = 1) {
  const num = Number(_num);
  if (num === undefined) {
    return '';
  } if (num === 0) {
    return 0;
  } if (num > 1E9) {
    return `${(num / 1E9).toFixed(fixed)}B`;
  } if (num >= 1E6) {
    return `${(num / 1E6).toFixed(fixed)}M`;
  } if (num >= 1E3) {
    return `${(num / 1E3).toFixed(fixed)}k`;
  }
  return num.toFixed(fixed);
}
