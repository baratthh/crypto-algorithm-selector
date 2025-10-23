import json
from pathlib import Path

def load_knowledge_base():
    """Loads algorithm, compliance, and use case data from JSON files."""
    base_path = Path(__file__).parent.parent / "knowledge_base"
    
    with open(base_path / "algorithms.json", "r", encoding="utf-8") as f:
        algorithms = json.load(f)
        
    with open(base_path / "compliance_standards.json", "r", encoding="utf-8") as f:
        compliance_standards = json.load(f)
        
    with open(base_path / "use_cases.json", "r", encoding="utf-8") as f:
        use_cases = json.load(f)
        
    return algorithms, compliance_standards, use_cases
