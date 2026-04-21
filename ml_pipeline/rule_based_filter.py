"""
Rule-Based Eligibility Filter Module
======================================
Filters government schemes based on hard eligibility rules including
income thresholds, age limits, gender restrictions, geographic scope,
education requirements, and occupation constraints.

This module acts as the second stage of the pipeline, pruning schemes
that the user is clearly ineligible for before semantic matching.
"""

from typing import Dict, Any, List, Optional


class RuleBasedFilter:
    """
    Applies deterministic eligibility rules to filter schemes.

    Pipeline Stage: 2 (Rule-Based Filtering)

    Filtering Rules:
    1. Age Range: user.age must be within [scheme.min_age, scheme.max_age]
    2. Income Limit: user.income must be <= scheme.income_limit
    3. Gender: scheme.gender must be "All" or match user.gender
    4. State: scheme.state must be "All India" or match user.state
    5. Education: scheme.education_level must match or be unspecified
    6. Occupation: scheme.occupation must match or be unspecified
    7. Target Group: scheme.target_group must be "All" or include user.category

    A scheme passes the filter if it violates at most `max_violations` rules.
    """

    def __init__(self, max_violations: int = 3):
        """
        Args:
            max_violations: Maximum number of rule violations before
                           a scheme is filtered out entirely.
        """
        self.max_violations = max_violations

    def filter_schemes(
        self, user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Filter schemes based on user profile against eligibility rules.

        Args:
            user_profile: Extracted user demographic profile.
            schemes: List of scheme dictionaries from the database.

        Returns:
            List of schemes that pass the filter, each annotated with:
            - matched_rules: list of rules that matched
            - violated_rules: list of rules that failed
            - rule_score: percentage of rules matched
        """
        results = []

        for scheme in schemes:
            matched, violated = self._evaluate_rules(user_profile, scheme)
            total_rules = len(matched) + len(violated)

            if len(violated) <= self.max_violations and total_rules > 0:
                scheme_result = {
                    **scheme,
                    "matched_rules": matched,
                    "violated_rules": violated,
                    "rule_score": round((len(matched) / total_rules) * 100, 1)
                        if total_rules > 0 else 0,
                }
                results.append(scheme_result)

        return results

    def _evaluate_rules(
        self, profile: Dict[str, Any], scheme: Dict[str, Any]
    ) -> tuple:
        """
        Evaluate all eligibility rules for a user-scheme pair.

        Returns:
            Tuple of (matched_rules: List[str], violated_rules: List[str])
        """
        matched = []
        violated = []

        # Rule 1: Age Range
        age = profile.get("age")
        min_age = scheme.get("min_age", 0) or 0
        max_age = scheme.get("max_age", 100) or 100
        if age is not None:
            if min_age <= age <= max_age:
                matched.append("age_eligible")
            else:
                violated.append(f"Age must be {min_age}-{max_age}")
        else:
            matched.append("age_not_specified")

        # Rule 2: Income Limit
        income = profile.get("income")
        income_limit = scheme.get("income_limit")
        if income is not None and income_limit is not None:
            if income <= income_limit:
                matched.append("income_eligible")
            else:
                violated.append(
                    f"Income must be under ₹{income_limit:,}"
                )
        else:
            matched.append("income_not_restricted")

        # Rule 3: Gender
        user_gender = profile.get("gender")
        scheme_gender = scheme.get("gender", "All") or "All"
        if scheme_gender == "All" or user_gender is None:
            matched.append("gender_eligible")
        elif user_gender == scheme_gender:
            matched.append("gender_eligible")
        else:
            violated.append(f"{scheme_gender} applicants only")

        # Rule 4: State / Geographic Scope
        user_state = profile.get("state")
        scheme_state = scheme.get("state", "All India") or "All India"
        if scheme_state == "All India" or user_state is None:
            matched.append("state_eligible")
        elif user_state == scheme_state:
            matched.append("state_eligible")
        else:
            violated.append(f"Must be from {scheme_state}")

        # Rule 5: Education Level
        user_edu = profile.get("education_level")
        scheme_edu = scheme.get("education_level")
        if scheme_edu is None or user_edu is None:
            matched.append("education_not_restricted")
        elif user_edu == scheme_edu:
            matched.append("education_eligible")
        else:
            violated.append(f"Requires {scheme_edu} education")

        # Rule 6: Occupation
        user_occ = profile.get("occupation")
        scheme_occ = scheme.get("occupation")
        if scheme_occ is None or user_occ is None:
            matched.append("occupation_not_restricted")
        elif user_occ.lower() == scheme_occ.lower():
            matched.append("occupation_eligible")
        else:
            violated.append(f"Requires {scheme_occ} occupation")

        # Rule 7: Target Group / Category
        user_cat = profile.get("category", "")
        target = scheme.get("target_group", "All") or "All"
        if target == "All" or not user_cat:
            matched.append("category_eligible")
        elif user_cat.lower() in target.lower():
            matched.append("category_eligible")
        else:
            violated.append(f"Target group: {target}")

        return matched, violated


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    filter_engine = RuleBasedFilter(max_violations=3)

    sample_profile = {
        "age": 22,
        "gender": "Female",
        "income": 150000,
        "occupation": "student",
        "education_level": "Graduate",
        "state": "Karnataka",
        "category": "General",
    }

    sample_schemes = [
        {
            "id": "1",
            "scheme_name": "PM Scholarship for Students",
            "min_age": 18,
            "max_age": 30,
            "income_limit": 200000,
            "gender": "All",
            "state": "All India",
            "education_level": "Graduate",
            "occupation": None,
            "target_group": "All",
            "category": "Education",
            "benefits": "₹20,000 scholarship per year",
        },
        {
            "id": "2",
            "scheme_name": "Rajasthan Farmer Aid",
            "min_age": 21,
            "max_age": 60,
            "income_limit": 100000,
            "gender": "Male",
            "state": "Rajasthan",
            "education_level": None,
            "occupation": "farmer",
            "target_group": "Farmers",
            "category": "Agriculture",
            "benefits": "₹6,000 per year",
        },
    ]

    results = filter_engine.filter_schemes(sample_profile, sample_schemes)
    for r in results:
        print(f"\n{r['scheme_name']}")
        print(f"  Rule Score: {r['rule_score']}%")
        print(f"  Matched: {r['matched_rules']}")
        print(f"  Violated: {r['violated_rules']}")
