# Recommendation Logic

The Cryptographic Algorithm Selector uses a rule-based scoring system to recommend algorithms based on user-provided requirements. The logic is implemented in Python (`core/scoring_system.py`) for testing and mirrored in JavaScript (`static/main.js`) for client-side execution.

## Scoring Process

For each algorithm in the knowledge base (`knowledge_base/algorithms.json`), a score is calculated based on how well it matches the user's input from the recommendation wizard.

The final score is the sum of points awarded (or penalties applied) based on the following criteria:

1.  **Data Type Match (Max +20 points):**
    * If the user specifies a `dataType` (e.g., "text", "binary") and the algorithm lists that type in its `dataTypes` array, +20 points are awarded.

2.  **Security Priority (Weighted Score):**
    * The user provides a `securityPriority` (1-10).
    * This is converted to a weight: `security_weight = securityPriority / 5.0`.
    * The algorithm's `securityLevel` (1-10) is multiplied by this weight and a factor of 4: `score += securityLevel * security_weight * 4`.
    * This means an algorithm's security contributes more to the score if the user prioritizes security highly.

3.  **Performance Priority (Weighted Score):**
    * The user provides a `performancePriority` (1-10).
    * This is converted to a weight: `performance_weight = performancePriority / 5.0`.
    * The algorithm's `performanceScore` (1-10) is multiplied by this weight and a factor of 4: `score += performanceScore * performance_weight * 4`.
    * This means an algorithm's performance contributes more to the score if the user prioritizes performance highly.

4.  **Use Case Match (Max +15 points):**
    * If the user selects a `useCase` (e.g., "iot-devices", "database-encryption") and the algorithm lists that use case in its `useCases` array, +15 points are awarded.

5.  **Compliance Requirements:**
    * The user can select multiple `compliance` standards (e.g., "FIPS-140-2", "PCI-DSS").
    * For each standard selected by the user:
        * The system checks the `knowledge_base/compliance_standards.json` file for that standard.
        * **Recommendation Bonus (+10 points):** If the algorithm is listed in the standard's `recommendedAlgorithms`, +10 points are added.
        * **Prohibition Penalty (Score = 0):** If the algorithm is listed in the standard's `prohibitedAlgorithms`, the score for this algorithm is immediately set to `0`, and no further compliance checks are needed for it.

6.  **Base Security Cutoff:**
    * If an algorithm's `securityLevel` is less than 3, its score is automatically set to `0`.This disqualifies fundamentally insecure algorithms like DES or RC4.

7.  **Quantum Concern Penalty (Score Halved):**
    * If the user checks the `quantumConcern` box *and* the algorithm's `quantumResistant` property is `false`, the *current total score* is multiplied by 0.5 (halved).This penalizes algorithms like RSA  or ECC when future quantum resistance is a concern.

## Final Calculation & Ranking

* After applying all the above rules, the final score is rounded to the nearest integer.
* Algorithms are then filtered: only those with a score greater than 30 are considered potential recommendations.
* The filtered list is sorted in descending order based on the calculated score.
* The top 5 algorithms are presented to the user as recommendations. If no algorithms score above 30, a "No suitable algorithm found" message is displayed.

*Note: The score can theoretically exceed 100 during calculation but is capped at 100 for display purposes in the results view.*
