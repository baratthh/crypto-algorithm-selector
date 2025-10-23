import unittest
import json
from pathlib import Path

import sys
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from core.knowledge_loader import load_knowledge_base
from core.scoring_system import calculate_score

class TestScoringSystem(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Load knowledge base and test cases once for all tests."""
        base_path = Path(__file__).resolve().parent.parent
        try:
            cls.algorithms, cls.compliance, _ = load_knowledge_base()
        except FileNotFoundError:
             print(f"Error: Could not load knowledge base files from expected location relative to core/knowledge_loader.py.")
             cls.algorithms, cls.compliance = {}, {} 

        test_cases_path = base_path / "tests" / "test_cases.json"

        try:
            with open(test_cases_path, "r", encoding="utf-8") as f:
                cls.test_cases = json.load(f)
        except FileNotFoundError:
            print(f"Error: Test cases file not found at {test_cases_path}")
            cls.test_cases = [] 
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {test_cases_path}")
            cls.test_cases = []


    def find_case(self, name):
        """Helper function to find a test case by its name."""
        return next((c for c in self.test_cases if c.get('case_name') == name), None)

    def _run_test_case(self, case_name, expected_top_key=None, min_score_key=None, min_score_value=None,
                        should_be_zero_key=None, score_should_be_halved_key=None, max_score_overall=None):
        """Helper method to run common test logic."""
        case = self.find_case(case_name) 
        self.assertIsNotNone(case, f"Test case '{case_name}' not found in test_cases.json")
        requirements = case.get("requirements", {})

        self.assertTrue(self.algorithms, "Algorithms knowledge base failed to load.")
        self.assertTrue(self.compliance, "Compliance knowledge base failed to load.")

        scores = {
            key: calculate_score(key, data, requirements, self.compliance)
            for key, data in self.algorithms.items()
        }

        if expected_top_key:
            self.assertTrue(scores, "Scores dictionary is empty, cannot find top algorithm.")
            eligible_scores = {k: v for k, v in scores.items() if v > 30}
            if not eligible_scores:
                 top_algo = f"No algorithm scored > 30 (Max was {max(scores.values()) if scores else 'N/A'})"
                 self.fail(f"Expected {expected_top_key} to be top, but no algorithm scored > 30. Max score: {max(scores.values()) if scores else 'N/A'}")
            else:
                 top_algo = max(eligible_scores, key=eligible_scores.get)
                 self.assertEqual(top_algo, expected_top_key, f"Expected {expected_top_key} to be top among those > 30, but got {top_algo}")
            print(f"\nCase '{case_name}': Top (>30): {top_algo} (Score: {scores.get(top_algo, 'N/A')})")

        if min_score_key and min_score_value is not None:
            self.assertIn(min_score_key, scores, f"Algorithm {min_score_key} not found in scores.")
            self.assertGreaterEqual(scores[min_score_key], min_score_value, f"Score for {min_score_key} ({scores[min_score_key]}) is less than minimum {min_score_value}")
            print(f"  - Score check for {min_score_key}: {scores[min_score_key]} >= {min_score_value} (Passed)")

        if should_be_zero_key:
            score_to_check = scores.get(should_be_zero_key, None)
            self.assertIsNotNone(score_to_check, f"Algorithm {should_be_zero_key} not found in scores.")
            self.assertEqual(score_to_check, 0, f"Score for {should_be_zero_key} should be 0, but got {score_to_check}")
            print(f"\nCase '{case_name}': Zero score check for {should_be_zero_key}: {score_to_check} (Passed)")

        if score_should_be_halved_key:
            self.assertIn(score_should_be_halved_key, self.algorithms, f"Algorithm {score_should_be_halved_key} not in knowledge base.")
            algo_data = self.algorithms[score_should_be_halved_key]

            req_no_quantum = requirements.copy(); req_no_quantum["quantumConcern"] = False
            score_no_quantum = calculate_score(score_should_be_halved_key, algo_data, req_no_quantum, self.compliance)

            score_with_quantum = scores.get(score_should_be_halved_key, None)
            self.assertIsNotNone(score_with_quantum, f"Could not get quantum score for {score_should_be_halved_key}")

            if score_no_quantum > 1: 
                 self.assertAlmostEqual(score_with_quantum, score_no_quantum / 2, delta=1,
                                         msg=f"Quantum penalty failed for {score_should_be_halved_key}: Expected ~{round(score_no_quantum / 2)}, got {score_with_quantum}")
            else:
                 self.assertLessEqual(score_with_quantum, score_no_quantum,
                                      msg=f"Quantum penalty failed for low base score on {score_should_be_halved_key}")

            print(f"\nCase '{case_name}': Quantum check for {score_should_be_halved_key}: NoQ={score_no_quantum}, WithQ={score_with_quantum} (Passed)")

        if max_score_overall is not None:
             self.assertTrue(scores, "Scores dictionary is empty, cannot check max score.")
             max_score = max(scores.values()) if scores else 0
             self.assertLessEqual(max_score, max_score_overall, f"Maximum score ({max_score}) exceeded threshold {max_score_overall}")
             print(f"  - Max score check: {max_score} <= {max_score_overall} (Passed)")


    def test_high_security_database(self):
        case_data = self.find_case("High-Security Database Encryption")
        self.assertIsNotNone(case_data, "Case data missing for 'High-Security Database Encryption'")
        self._run_test_case(
            case_name="High-Security Database Encryption",
            expected_top_key=case_data.get("expected_top"),
            min_score_key="AES",
            min_score_value=case_data.get("min_score_for_aes")
        )

    def test_fast_iot_streaming(self):
        case_data = self.find_case("Fast IoT Streaming")
        self.assertIsNotNone(case_data, "Case data missing for 'Fast IoT Streaming'")
        self._run_test_case(
            case_name="Fast IoT Streaming",
            expected_top_key=case_data.get("expected_top"),
            min_score_key="ChaCha20",
            min_score_value=case_data.get("min_score_for_chacha20")
        )

    def test_compliance_prohibition(self):
        case_data = self.find_case("Legacy Financial System with PCI Compliance")
        self.assertIsNotNone(case_data, "Case data missing for 'Legacy Financial System with PCI Compliance'")
        self._run_test_case(
            case_name="Legacy Financial System with PCI Compliance",
            should_be_zero_key=case_data.get("should_be_zero")
        )

    def test_quantum_concern_penalty_rsa(self):
        case_data = self.find_case("Key Exchange with Quantum Concern")
        self.assertIsNotNone(case_data, "Case data missing for 'Key Exchange with Quantum Concern'")
        self._run_test_case(
            case_name="Key Exchange with Quantum Concern",
            score_should_be_halved_key=case_data.get("score_should_be_halved")
        )

    def test_general_purpose_high_perf_sec(self):
        case_data = self.find_case("General Purpose High Security & Performance")
        self.assertIsNotNone(case_data, "Case data missing for 'General Purpose High Security & Performance'")
        self._run_test_case(
            case_name="General Purpose High Security & Performance",
            expected_top_key=case_data.get("expected_top"),
            min_score_key="AES",
            min_score_value=case_data.get("min_score_for_aes")
        )

    def test_mobile_key_exchange_gdpr(self):
            case_data = self.find_case("Mobile Key Exchange, GDPR Compliant")
            self.assertIsNotNone(case_data, "Case data missing for 'Mobile Key Exchange, GDPR Compliant'")
            self._run_test_case(
                case_name="Mobile Key Exchange, GDPR Compliant",
                expected_top_key=case_data.get("expected_top"), 
                min_score_key="ChaCha20",
                min_score_value=case_data.get("min_score_for_chacha20") 
            )

    def test_streaming_low_sec_high_perf(self):
        case_data = self.find_case("Streaming Data, Low Security, High Performance")
        self.assertIsNotNone(case_data, "Case data missing for 'Streaming Data, Low Security, High Performance'")
        self._run_test_case(
            case_name="Streaming Data, Low Security, High Performance",
            expected_top_key=case_data.get("expected_top"),
            min_score_key="ChaCha20",
            min_score_value=case_data.get("min_score_for_chacha20")
        )

    def test_legacy_pci_no_match_corrected(self): 
        case_data = self.find_case("Legacy System needing PCI - Expect No Good Match")
        self.assertIsNotNone(case_data, "Case data missing for 'Legacy System needing PCI - Expect No Good Match'")
        self._run_test_case(
            case_name="Legacy System needing PCI - Expect No Good Match",
            should_be_zero_key=case_data.get("should_be_zero")
        )

    def test_quantum_concern_penalty_aes(self):
        case_data = self.find_case("High Security Data at Rest with Quantum Concern")
        self.assertIsNotNone(case_data, "Case data missing for 'High Security Data at Rest with Quantum Concern'")
        self._run_test_case(
            case_name="High Security Data at Rest with Quantum Concern",
            score_should_be_halved_key=case_data.get("score_should_be_halved")
        )

if __name__ == '__main__':
    unittest.main(verbosity=2)
