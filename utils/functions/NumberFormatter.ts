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

export function numToPrettyString(
  num: number | string | undefined,
  precision: number | "auto" = 2
): string {
  if (num === undefined) return "";

  const value = Number(num);
  if (value === 0) return "0";

  let decimals = typeof(precision) === "number" ? precision : 0;
  if (precision === "auto") {
    const stringNum = String(num);
    decimals = stringNum.includes(".")
      ? stringNum.split(".")[1].replace(/0+$/, "").length
      : 0;
  }

  const format = (n: number, divisor: number, suffix: string) =>
    `${(n / divisor).toFixed(decimals)}${suffix}`;

  if (value >= 1E9) return format(value, 1E9, "B");
  if (value >= 1E6) return format(value, 1E6, "M");
  if (value >= 1E3) return format(value, 1E3, "k");

  return value.toFixed(decimals);
}
