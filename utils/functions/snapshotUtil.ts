// map indexed choice number to choice string
export function mapChoiceIndex(
  type: string | undefined,
  choices: string[] | undefined,
  choice: number | number[] | { [key: string]: number } | undefined
) {
  if (typeof choice === "string") return "🔐";

  if (!type || !choices || !choice) return "Unknown";

  if (["approval", "ranked-choice"].includes(type)) {
    // choice = [1,2,3]
    const choiceArr = choice as number[];
    return choiceArr.map((c: number) => choices[c - 1]);
  } else if (["quadratic", "weighted"].includes(type)) {
    // choice = {"1": 1, "2": 2, "3": 3}
    const choiceObj = choice as { [key: string]: number };
    const mapped: { [key: string]: number } = {};
    Object.entries(choiceObj).map(([key, value]) => {
      mapped[choices[parseInt(key) - 1]] = value;
    });
    return mapped;
  } else {
    // choice = 1
    return choices[(choice as number) - 1];
  }
}

export function getColorOfChoice(choice: string | string[]) {
  if (choice == "For") {
    return "text-green-500";
  } else if (choice == "Against") {
    return "text-red-500";
  } else if (choice == "Abstain") {
    return "text-gray-500";
  } else {
    return "text-gray-500";
  }
}

export function processChoicesCount(
  type: string | undefined,
  choice: any
): { [k: string]: number } {
  if (!choice || !type) return {};
  if (choice === "🔐") return {}; // undefined entry appears with shutter voting
  if (type == "approval" || type == "ranked-choice") {
    const choices = choice as string[];
    const ret: { [k: string]: number } = {};
    choices.forEach((c) => (ret[c] = 1));
    return ret;
  } else if (type == "quadratic" || type == "weighted") {
    const obj = choice as { [key: string]: number };
    Object.entries(obj).map((entry) => (obj[entry[0]] = 1));
    return obj;
  } else {
    const c = choice as string;
    return { [c]: 1 };
  }
}

export function processChoices(
  type: string | undefined,
  choice: any
): string | string[] {
  if (!choice || !type) return "";
  if (choice === "🔐") return ["🔐"]; // undefined entry appears with shutter voting
  if (type == "approval") {
    return choice as string[];
  } else if (type == "ranked-choice") {
    const arr = choice as string[];
    return arr.map((v, i) => `(${i + 1}th) ${v}`);
  } else if (type == "quadratic" || type == "weighted") {
    const obj = choice as { [key: string]: number };
    const totalUnits = Object.values(obj).reduce((a, b) => a + b, 0);
    return Object.entries(obj).map(
      ([key, value]) => `${Math.round((value / totalUnits) * 100)}% for ${key}`
    );
  } else {
    return choice as string;
  }
}

export function strategySymbolsOf(strategies: any[] | undefined) {
  let symbols = strategies
    ?.map((strategy) => strategy.params.symbol)
    .filter((symbol) => symbol);

  if (!symbols) return "";

  symbols = symbols.map((symbol) => `$${symbol}`);

  if (symbols.length === 1) return `${symbols[0]}`;

  return `(${symbols.join(", ")})`;
}
