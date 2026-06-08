import type { GroupSpec } from "../types";
import { consumption } from "./consumption";
import { supply } from "./supply";
import { inflation } from "./inflation";
import { rates } from "./rates";
import { sentiment } from "./sentiment";
import { breadth } from "./breadth";
import { market } from "./market";

/** 七组 24 张图(23 张主题图 + F&G) */
export const GROUPS: GroupSpec[] = [market, sentiment, rates, breadth, inflation, consumption, supply];
