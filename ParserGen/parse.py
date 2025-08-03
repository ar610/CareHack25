import json
from typing import Dict, Any

def parse_medical_record(text: str) -> Dict[str, Any]:
    try:
        # Find the first JSON object in the text
        json_start = text.find('{')
        json_end = text.rfind('}') + 1
        json_str = text[json_start:json_end]

        record = json.loads(json_str)

        # Extract only the desired fields
        result = {
            "medications": record.get("medications", []),
            "vaccinations": record.get("vaccinations", []),
            "medical_conditions": record.get("medical_conditions", []),
            "allergies": record.get("allergies", [])
        }

        return result

    except Exception as e:
        print("Parsing failed:", e)
        return {
            "medications": [],
            "vaccinations": [],
            "medical_conditions": [],
            "allergies": []
        }
