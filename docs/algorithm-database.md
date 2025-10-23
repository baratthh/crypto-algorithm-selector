# Algorithm Database (`knowledge_base/algorithms.json`)

The core of the expert system's knowledge resides in the `knowledge_base/algorithms.json` file. This file provides detailed, structured information about various cryptographic algorithms.

## Schema Overview

Each entry in the JSON file is a key-value pair, where the key is the common abbreviation or name of the algorithm (e.g., "AES", "RSA") and the value is an object containing the following fields:

* **`name`** (String): The full name of the algorithm (e.g., "Advanced Encryption Standard").
* **`type`** (String): The category, typically "symmetric" or "asymmetric".
* **`dataTypes`** (Array of Strings): Types of data the algorithm is generally suitable for (e.g., "text", "binary", "streaming", "keys").
* **`securityLevel`** (Integer): A numerical score (1-10) representing the relative security strength based on current cryptographic analysis. Higher is better.
* **`performanceScore`** (Integer): A numerical score (1-10) representing relative performance (speed/efficiency). Higher is faster/more efficient.
* **`useCases`** (Array of Strings): Common application scenarios (e.g., "general-purpose", "data-at-rest", "key-exchange", "digital-signatures", "iot").
* **`keyLengths`** (Array of Integers): Typical or standard key lengths supported, in bits.
* **`blockSize`** (Integer | null): The block size in bits for block ciphers, or `null` for stream ciphers or non-applicable algorithms.
* **`yearIntroduced`** (Integer): The approximate year the algorithm was introduced or published.
* **`description`** (String): A brief explanation of the algorithm and its purpose.
* **`strengths`** (Array of Strings): Key advantages or positive attributes.
* **`weaknesses`** (Array of Strings): Key disadvantages, limitations, or known vulnerabilities.
* **`complexity`** (String): A brief note on computational complexity if relevant.
* **`quantumResistant`** (Boolean): Indicates if the algorithm is believed to be resistant to attacks from quantum computers (`true` or `false`).
* **`compliance`** (Array of Strings): List of compliance standards (keys from `compliance_standards.json`) that often recommend or mandate this algorithm.
* **`realWorldUse`** (String): Examples of where the algorithm is commonly used.
* **`implementation`** (String): Notes on where implementations can typically be found (libraries, platforms).

## Adding or Updating Algorithms

To add a new algorithm or update an existing one:

1.  Edit the `knowledge_base/algorithms.json` file.
2.  Add a new key (e.g., `"NEW_ALGO"`) or modify an existing one.
3.  Fill in the corresponding value object with accurate information according to the schema above.
4.  Ensure all strings are properly quoted and arrays/booleans/numbers are correctly formatted according to JSON rules.
5.  After saving changes, run `python build.py` locally to regenerate the `dist` directory and test the application to ensure the new data is loaded and displayed correctly.

*Note: The accuracy of the recommendation engine depends heavily on the quality and correctness of the data in this file.*
