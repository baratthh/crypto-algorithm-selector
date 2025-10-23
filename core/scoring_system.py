def calculate_score(algorithm_key, algorithm_data, requirements, compliance_data):
    """
    Calculates a recommendation score for a given algorithm based on user requirements.
    """
    score = 0.0

    # Data type match
    if requirements.get("dataType") and requirements["dataType"] in algorithm_data.get("dataTypes", []):
        score += 20

    # Weighted scores for security and performance
    security_weight = requirements.get("securityPriority", 5) / 5.0
    performance_weight = requirements.get("performancePriority", 5) / 5.0

    score += algorithm_data.get("securityLevel", 0) * security_weight * 4
    score += algorithm_data.get("performanceScore", 0) * performance_weight * 4

    # Use case bonus
    if requirements.get("useCase") and requirements["useCase"] in algorithm_data.get("useCases", []):
        score += 15

    # Compliance checks
    for comp in requirements.get("compliance", []):
        standard = compliance_data.get(comp)
        if standard:

            if algorithm_key in standard.get("recommendedAlgorithms", []):
                score += 10
            if algorithm_key in standard.get("prohibitedAlgorithms", []):
                return 0

    if algorithm_data.get("securityLevel", 0) < 3:
        return 0
    
    # Quantum concern penalty
    if requirements.get("quantumConcern") and not algorithm_data.get("quantumResistant", False):
        score *= 0.5

    return round(score)