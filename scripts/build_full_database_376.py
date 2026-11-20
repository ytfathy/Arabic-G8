# -*- coding: utf-8 -*-
"""
Master Builder: Exports all 376 questions into TypeScript files:
- src/data/questionsUnit1.ts (151 questions)
- src/data/questionsUnit2.ts (120 questions)
- src/data/questionsUnit3.ts (105 questions)
Total: 376 questions strictly matching the Egyptian Prep 2 Term 1 Assessment Book.
"""
import json
import os
from scripts.gen_unit1_full import get_full_unit1
from scripts.gen_unit2_full import get_full_unit2
from scripts.gen_unit3_full import get_full_unit3

def export_to_ts(filepath, var_name, questions):
    header = "import { Question } from '../types/curriculum';\n\n"
    content = header + f"export const {var_name}: Question[] = "
    content += json.dumps(questions, ensure_ascii=False, indent=2)
    content += ";\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Exported {len(questions)} questions to {filepath}")

def main():
    u1 = get_full_unit1()
    u2 = get_full_unit2()
    u3 = get_full_unit3()

    total = len(u1) + len(u2) + len(u3)
    print(f"Grand Total Questions across all units: {total}")

    export_to_ts("src/data/questionsUnit1.ts", "QUESTIONS_UNIT_1", u1)
    export_to_ts("src/data/questionsUnit2.ts", "QUESTIONS_UNIT_2", u2)
    export_to_ts("src/data/questionsUnit3.ts", "QUESTIONS_UNIT_3", u3)

    print("Successfully built all 3 database files!")

if __name__ == "__main__":
    main()
